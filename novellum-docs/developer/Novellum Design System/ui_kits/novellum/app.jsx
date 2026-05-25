/* eslint-disable */
// Novellum UI kit — top-level App.
// Click-through navigation: Library → Project Hub → Editor / Reader, with
// the Nova panel toggleable anywhere. State lives here.

function App() {
	const [route, setRoute] = React.useState({ name: 'library' });
	const [novaOpen, setNovaOpen] = React.useState(false);
	const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);

	const activeProject = React.useMemo(() => {
		if (!route.projectId) return null;
		return LIBRARY_PROJECTS.find((p) => p.id === route.projectId) ?? null;
	}, [route.projectId]);

	function go(name, projectId) {
		setRoute({ name, projectId: projectId ?? route.projectId });
	}

	// Header title + center contents are route-dependent.
	let headerTitle = 'Novellum';
	let headerContext = 'home';
	let centerSlot = null;

	if (route.name === 'library') {
		headerTitle = 'Library';
		headerContext = 'home';
	} else if (route.name === 'project-hub' && activeProject) {
		headerTitle = activeProject.title;
		headerContext = 'folder';
	} else if (route.name === 'editor' && activeProject) {
		headerTitle = activeProject.title;
		headerContext = 'pen';
		centerSlot = (
			<PillNav
				items={[
					{ id: 'ch1', label: 'CH 1' }, { id: 'ch2', label: 'CH 2' },
					{ id: 'ch3', label: 'CH 3' }, { id: 'ch4', label: 'CH 4' },
					{ id: 'ch5', label: 'CH 5' }, { id: 'ch6', label: 'CH 6' },
				]}
				activeId="ch3"
				onSelect={() => {}}
			/>
		);
	} else if (route.name === 'reader' && activeProject) {
		headerTitle = activeProject.title;
		headerContext = 'book';
	}

	const sidebarActive = (() => {
		if (route.name === 'library') return 'home';
		if (route.name === 'editor') return 'editor';
		if (route.name === 'reader') return 'reader';
		if (route.name === 'project-hub') return 'project-hub';
		return 'home';
	})();

	function handleSidebarSelect(id) {
		switch (id) {
			case 'home': return go('library');
			case 'projects': return go('library');
			case 'reader': return activeProject ? go('reader') : go('library');
			case 'nova': return setNovaOpen(true);
			case 'project-hub': return activeProject ? go('project-hub') : null;
			case 'editor': return activeProject ? go('editor') : null;
			default: return;
		}
	}

	return (
		<AppShell
			sidebar={
				<Sidebar
					collapsed={sidebarCollapsed}
					onToggle={() => setSidebarCollapsed((c) => !c)}
					activeId={sidebarActive}
					onSelect={handleSidebarSelect}
					activeProject={activeProject?.title}
				/>
			}
			header={
				<Header
					title={headerTitle}
					contextIcon={headerContext}
					centerSlot={centerSlot}
					onNew={() => {}}
					onToggleNova={() => setNovaOpen((o) => !o)}
					novaOpen={novaOpen}
				/>
			}
			novaPanel={<NovaPanel open={novaOpen} onClose={() => setNovaOpen(false)} project={activeProject} />}
		>
			{route.name === 'library' && (
				<LibraryScreen onOpenProject={(id) => go('project-hub', id)} />
			)}
			{route.name === 'project-hub' && (
				<ProjectHubScreen
					project={activeProject}
					onOpenEditor={() => go('editor')}
					onOpenReader={() => go('reader')}
				/>
			)}
			{route.name === 'editor' && (
				<EditorScreen project={activeProject} />
			)}
			{route.name === 'reader' && (
				<ReaderScreen project={activeProject} />
			)}
		</AppShell>
	);
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
