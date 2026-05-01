fn main() {
  // Expose the Cargo build target triple to the crate so the
  // sidecar resolver can locate the bundled `node-<triple>`
  // binary next to the main executable in packaged builds.
  let target = std::env::var("TARGET").unwrap_or_default();
  println!("cargo:rustc-env=NOVELLUM_TARGET_TRIPLE={target}");
  println!("cargo:rerun-if-env-changed=TARGET");

  tauri_build::build()
}
