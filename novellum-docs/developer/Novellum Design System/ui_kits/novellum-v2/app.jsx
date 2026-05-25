/* eslint-disable */
// Novellum v2 — App composition.
// Single-page click-through with route + project state.
// Per-book mood theming is applied via useMood at each project-scoped surface
// (Hub, Page, Room, Muse), and projected into the sidebar/header via the
// activeProject prop.

function App() {
	const [route, setRoute] = useState({ name: 'study' });
	const [museOpen, setMuseOpen] = useState(false);
	const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

	const activeProject = useMemo(() => {
		if (!route.projectId) return null;
		return PROJECTS.find((p) => p.id === route.projectId);
	}, [route.projectId]);

	// In immersive surfaces (Room, Page) the chrome auto-recedes
	const immersive = route.name === 'reader' || route.name === 'editor';
	useEffect(() => {
		setSidebarCollapsed(immersive);
	}, [immersive]);

	function go(name, projectId = route.projectId) {
		setRoute({ name, projectId });
	}

	function openProject(projectId, dest = 'hub') {
		setRoute({ name: dest, projectId });
	}

	function onSidebarSelect(id) {
		switch (id) {
			case 'study':      return go('study');
			case 'reader':     return activeProject ? go('reader') : null;
			case 'muse':       return setMuseOpen(true);
			case 'hub':        return activeProject ? go('hub') : null;
			case 'editor':     return activeProject ? go('editor') : null;
			case 'outline':    return activeProject ? go('hub') : null;     // placeholder
			case 'world':      return activeProject ? go('hub') : null;     // placeholder
			case 'continuity': return activeProject ? go('hub') : null;     // placeholder
			case 'settings':   return null;
		}
	}

	// Sidebar's idea of "active"
	const sbActive = (() => {
		if (route.name === 'study') return 'study';
		if (route.name === 'reader') return 'reader';
		if (route.name === 'editor') return 'editor';
		if (route.name === 'hub') return 'hub';
		return null;
	})();

	// Header content per route
	let headerProps = {};
	if (route.name === 'study') {
		headerProps = { eyebrow: 'Library', titleSerif: 'Novellum' };
	} else if (route.name === 'hub' && activeProject) {
		headerProps = { eyebrow: 'Overview', titleSerif: activeProject.title, project: activeProject };
	} else if (route.name === 'editor' && activeProject) {
		headerProps = { eyebrow: 'The Page', titleSerif: activeProject.title, project: activeProject };
	} else if (route.name === 'reader' && activeProject) {
		headerProps = { eyebrow: 'Reading Room', titleSerif: activeProject.title, project: activeProject };
	}

	return (
		<Shell
			sidebar={
				<Sidebar
					collapsed={sidebarCollapsed}
					onToggle={() => setSidebarCollapsed((c) => !c)}
					activeId={sbActive}
					onSelect={onSidebarSelect}
					activeProject={activeProject}
				/>
			}
			header={
				<Header
					{...headerProps}
					onToggleMuse={() => setMuseOpen((o) => !o)}
					museOpen={museOpen}
					onToggleTheme={() => {}}
				/>
			}
			overlay={
				<Muse
					mode="overlay"
					open={museOpen}
					project={activeProject || PROJECTS[0]}
					onClose={() => setMuseOpen(false)}
				/>
			}
		>
			<div className={`stage stage--${route.name}`} key={route.name + (route.projectId || '')}>
				{route.name === 'study' && (
					<Study onOpenProject={(id, dest) => openProject(id, dest || 'hub')} />
				)}
				{route.name === 'hub' && activeProject && (
					<Hub
						project={activeProject}
						onOpen={(dest) => go(dest, activeProject.id)}
					/>
				)}
				{route.name === 'editor' && activeProject && (
					<Page project={activeProject} onAskMuse={() => setMuseOpen(true)} />
				)}
				{route.name === 'reader' && activeProject && (
					<Room project={activeProject} onClose={() => go('hub', activeProject.id)} />
				)}
			</div>
		</Shell>
	);
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
