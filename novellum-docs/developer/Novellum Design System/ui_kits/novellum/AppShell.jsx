/* eslint-disable */
// Novellum UI kit — AppShell.
// Composes Sidebar + Header + main scroll region. The Nova panel docks
// over the right edge — main does NOT reflow around it (matches production:
// it's a fixed overlay).

function AppShell({ sidebar, header, children, novaPanel }) {
	return (
		<div className="nv-shell">
			{sidebar}
			<div className="nv-shell__column">
				{header}
				<main className="nv-shell__main" id="main-content">
					{children}
				</main>
			</div>
			{novaPanel}
		</div>
	);
}

Object.assign(window, { AppShell });
