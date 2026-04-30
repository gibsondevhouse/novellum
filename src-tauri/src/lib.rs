mod sidecar;

use std::sync::Mutex;

use tauri::{Manager, RunEvent};

use crate::sidecar::Sidecar;

/// App-level state holding the live sidecar handle. Wrapped in a
/// `Mutex<Option<...>>` so the `RunEvent::ExitRequested` handler
/// can take ownership and drop it (which kills the child process).
struct SidecarState(Mutex<Option<Sidecar>>);

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  let app = tauri::Builder::default()
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }

      // In dev (`tauri dev`), Tauri loads `devUrl` (the Vite dev
      // server on :5173) directly. Skip the sidecar in that mode —
      // Vite already serves SvelteKit's API routes via its own
      // middleware.
      if cfg!(debug_assertions) {
        app.manage(SidecarState(Mutex::new(None)));
        return Ok(());
      }

      // Production: spawn the SvelteKit Node server and navigate
      // the (already-built) main window to it.
      let handle = app.handle().clone();
      let sidecar = Sidecar::spawn(&handle)
        .map_err(|e| Box::<dyn std::error::Error>::from(e.to_string()))?;

      if let Some(window) = app.get_webview_window("main") {
        let url = sidecar
          .url()
          .parse::<tauri::Url>()
          .map_err(|e| Box::<dyn std::error::Error>::from(e.to_string()))?;
        window
          .navigate(url)
          .map_err(|e| Box::<dyn std::error::Error>::from(e.to_string()))?;
      }

      app.manage(SidecarState(Mutex::new(Some(sidecar))));
      Ok(())
    })
    .build(tauri::generate_context!())
    .expect("error while building tauri application");

  app.run(|handle, event| {
    if matches!(event, RunEvent::ExitRequested { .. } | RunEvent::Exit) {
      if let Some(state) = handle.try_state::<SidecarState>() {
        if let Ok(mut guard) = state.0.lock() {
          guard.take();
        }
      }
    }
  });
}
