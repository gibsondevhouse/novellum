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
		let spawn_start = Instant::now();
		let port = pick_port()?;
		let node_bin = resolve_node_binary(app)?;
		let server_entry = resolve_server_entry(app)?;

		let mut cmd = Command::new(&node_bin);
		cmd.arg(&server_entry)
			.env("PORT", port.to_string())
			.env("HOST", "127.0.0.1")
			.env("NODE_ENV", "production")
			.env("NOVELLUM_DESKTOP", "1")
			// Inherit stdio so SvelteKit's runtime errors surface in
			// the terminal (when launched from `open -a Novellum`)
			// and in macOS Console.app under the Novellum process.
			// Without this, 500s from `/api/db/*` show no stack
			// trace anywhere and are impossible to diagnose.
			.stdout(Stdio::inherit())
			.stderr(Stdio::inherit());

		let child = cmd.spawn().map_err(SidecarError::SpawnFailed)?;
		let sidecar = Sidecar { child, port };
		sidecar.wait_until_ready(Duration::from_secs(15))?;
		// Boot timestamp for Task 05 measurement capture. Use
		// `eprintln!` (not `log::info!`) so it works in release
		// builds, where `tauri-plugin-log` is not registered. The
		// sidecar inherits stderr, so this surfaces in the launching
		// terminal and Console.app.
		eprintln!(
			"sidecar: ready on {} after {} ms (node={})",
			sidecar.url(),
			spawn_start.elapsed().as_millis(),
			node_bin.display(),
		);
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

/// Build target triple, captured at compile time by `build.rs` so
/// the runtime can locate the bundled `node-<triple>` sidecar that
/// `scripts/fetch-node.mjs` stages and Tauri's bundler ships next
/// to the main executable.
const TARGET_TRIPLE: &str = env!("NOVELLUM_TARGET_TRIPLE");

/// Resolve the Node binary path. Production builds bundle Node as a
/// Tauri sidecar binary declared via `tauri.conf.json#bundle.externalBin`.
/// At runtime that binary lives next to the main executable, named
/// `node-<target-triple>` (with a `.exe` suffix on Windows). We look
/// for it there first, then fall back to `node` on PATH so dev mode
/// and contributor machines without a fetched bundle still work.
fn resolve_node_binary(_app: &AppHandle) -> Result<PathBuf, SidecarError> {
	if let Some(bundled) = bundled_node_binary() {
		return Ok(bundled);
	}
	if which_on_path("node").is_some() {
		return Ok(PathBuf::from("node"));
	}
	Err(SidecarError::NodeBinaryNotFound)
}

/// Look for the bundled `node-<target-triple>` next to the running
/// executable. Returns `None` if the binary is not present (dev mode,
/// or the fetch-node script has not run yet).
fn bundled_node_binary() -> Option<PathBuf> {
	let exe = std::env::current_exe().ok()?;
	let exe_dir = exe.parent()?;
	let ext = if cfg!(windows) { ".exe" } else { "" };
	let candidate = exe_dir.join(format!("node-{TARGET_TRIPLE}{ext}"));
	if candidate.is_file() {
		return Some(candidate);
	}
	// Tauri may strip the triple suffix in some bundle targets; try
	// the bare names too as a defensive fallback.
	for name in ["node", "node.exe"] {
		let alt = exe_dir.join(name);
		if alt.is_file() {
			return Some(alt);
		}
	}
	None
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
