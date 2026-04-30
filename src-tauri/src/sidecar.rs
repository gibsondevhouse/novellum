//! Sidecar process management for the SvelteKit Node adapter server.
//!
//! Strategy (a): ship Node + `build/` as Tauri resources and spawn
//! `node build/index.js` as a child process bound to an ephemeral
//! local port. The Tauri WebView then navigates to
//! `http://127.0.0.1:<port>` so `/api/db/*` and the static client
//! are both served by the SvelteKit server, exactly like in dev.
//!
//! Lifecycle:
//!   - `Sidecar::spawn` picks a free port, resolves the Node binary
//!     and the server entry path, spawns the child with PORT/HOST
//!     env vars, and polls readiness via TCP connect.
//!   - `Sidecar` owns the `Child`; `Drop` kills it. The Tauri
//!     `RunEvent::ExitRequested` handler in `lib.rs` drops the
//!     state to guarantee no orphaned Node processes.
//!
//! Empirical measurements (cold-start, sidecar-boot, /api/db p50,
//! idle memory, release-binary size) promised in
//! `evidence/packaging-decision-2026-04-29.md` are captured by
//! running `pnpm desktop:build` and recording results in
//! `evidence/measurements-2026-MM-DD.md`. Deferred to a follow-up
//! turn because `tauri build` pulls multi-GB Cargo crates on first
//! run.

use std::io;
use std::net::{Ipv4Addr, SocketAddr, SocketAddrV4, TcpListener, TcpStream};
use std::path::{Path, PathBuf};
use std::process::{Child, Command, Stdio};
use std::time::{Duration, Instant};

use tauri::AppHandle;

#[derive(Debug)]
pub enum SidecarError {
	NodeBinaryNotFound,
	ServerEntryNotFound(PathBuf),
	PortAllocFailed(io::Error),
	SpawnFailed(io::Error),
	ReadinessTimeout,
}

impl std::fmt::Display for SidecarError {
	fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
		match self {
			SidecarError::NodeBinaryNotFound => write!(f, "node binary not found on PATH or in resources"),
			SidecarError::ServerEntryNotFound(p) => write!(f, "server entry not found at {}", p.display()),
			SidecarError::PortAllocFailed(e) => write!(f, "could not allocate ephemeral port: {e}"),
			SidecarError::SpawnFailed(e) => write!(f, "could not spawn node sidecar: {e}"),
			SidecarError::ReadinessTimeout => write!(f, "node sidecar did not become ready in time"),
		}
	}
}

impl std::error::Error for SidecarError {}

pub struct Sidecar {
	child: Child,
	port: u16,
}

impl Sidecar {
	pub fn url(&self) -> String {
		format!("http://127.0.0.1:{}", self.port)
	}

	/// Spawn the SvelteKit Node server. Resolves paths from the
	/// Tauri AppHandle so the same code works in dev and in
	/// packaged builds.
	pub fn spawn(app: &AppHandle) -> Result<Self, SidecarError> {
		let port = pick_port()?;
		let node_bin = resolve_node_binary(app)?;
		let server_entry = resolve_server_entry(app)?;

		let mut cmd = Command::new(&node_bin);
		cmd.arg(&server_entry)
			.env("PORT", port.to_string())
			.env("HOST", "127.0.0.1")
			.env("NODE_ENV", "production")
			.env("NOVELLUM_DESKTOP", "1")
			.stdout(Stdio::piped())
			.stderr(Stdio::piped());

		let child = cmd.spawn().map_err(SidecarError::SpawnFailed)?;
		let sidecar = Sidecar { child, port };
		sidecar.wait_until_ready(Duration::from_secs(15))?;
		Ok(sidecar)
	}

	fn wait_until_ready(&self, timeout: Duration) -> Result<(), SidecarError> {
		let addr = SocketAddr::V4(SocketAddrV4::new(Ipv4Addr::LOCALHOST, self.port));
		let started = Instant::now();
		while started.elapsed() < timeout {
			if TcpStream::connect_timeout(&addr, Duration::from_millis(200)).is_ok() {
				return Ok(());
			}
			std::thread::sleep(Duration::from_millis(100));
		}
		Err(SidecarError::ReadinessTimeout)
	}
}

impl Drop for Sidecar {
	fn drop(&mut self) {
		// Best-effort kill; log but never panic in Drop.
		if let Err(e) = self.child.kill() {
			eprintln!("sidecar: failed to kill child process: {e}");
		}
		let _ = self.child.wait();
	}
}

fn pick_port() -> Result<u16, SidecarError> {
	let listener = TcpListener::bind((Ipv4Addr::LOCALHOST, 0)).map_err(SidecarError::PortAllocFailed)?;
	let port = listener
		.local_addr()
		.map_err(SidecarError::PortAllocFailed)?
		.port();
	drop(listener);
	Ok(port)
}

/// Resolve the Node binary path. Production builds bundle Node as a
/// Tauri sidecar binary at `binaries/node-<target-triple>` (added in
/// a follow-up turn via `scripts/fetch-node.mjs`). Dev falls back to
/// `node` on PATH so contributors do not need a packaged Node.
fn resolve_node_binary(_app: &AppHandle) -> Result<PathBuf, SidecarError> {
	// TODO(phase-003-followup): once `scripts/fetch-node.mjs` lands
	// and the `binaries/node-<target-triple>` artifact is bundled
	// via tauri.conf.json `bundle.externalBin`, prefer the
	// resolved path from `app.path().resolve(...)`. For now, rely
	// on `node` from PATH which works in dev and on developer
	// machines that have Node installed.
	if which_on_path("node").is_some() {
		return Ok(PathBuf::from("node"));
	}
	Err(SidecarError::NodeBinaryNotFound)
}

/// Resolve the SvelteKit Node server entry point. In dev it lives
/// at `<project>/build/index.js`. In packaged builds it is bundled
/// as a Tauri resource and resolved relative to the resource dir.
fn resolve_server_entry(app: &AppHandle) -> Result<PathBuf, SidecarError> {
	use tauri::Manager;
	// Try resource dir first (packaged build).
	if let Ok(resource_dir) = app.path().resource_dir() {
		// Tauri prefixes paths that escape `src-tauri/` with `_up_`.
		let candidate = resource_dir.join("_up_").join("build").join("index.js");
		if candidate.exists() {
			return Ok(candidate);
		}
	}
	// Dev fallback: walk up from CARGO_MANIFEST_DIR to the project root.
	let manifest_dir = PathBuf::from(env!("CARGO_MANIFEST_DIR"));
	let project_root = manifest_dir
		.parent()
		.map(Path::to_path_buf)
		.unwrap_or(manifest_dir);
	let candidate = project_root.join("build").join("index.js");
	if candidate.exists() {
		return Ok(candidate);
	}
	Err(SidecarError::ServerEntryNotFound(candidate))
}

fn which_on_path(bin: &str) -> Option<PathBuf> {
	let path_env = std::env::var_os("PATH")?;
	for dir in std::env::split_paths(&path_env) {
		let candidate = dir.join(bin);
		if candidate.is_file() {
			return Some(candidate);
		}
		// Windows: also try .exe suffix.
		#[cfg(windows)]
		{
			let exe = dir.join(format!("{bin}.exe"));
			if exe.is_file() {
				return Some(exe);
			}
		}
	}
	None
}
