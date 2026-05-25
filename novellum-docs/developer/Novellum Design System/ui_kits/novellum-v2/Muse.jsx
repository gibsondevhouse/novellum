/* eslint-disable */
// Novellum v2 — Muse (Nova).
// Either rendered as a slide-in overlay from the header, or as a full screen.

function Muse({ project, open, onClose, mode = 'overlay' }) {
	const [messages, setMessages] = useState(seedThread(project));
	const [draft, setDraft] = useState('');
	const threadRef = useRef(null);
	const moodStyle = useMood(project);

	function send() {
		const text = draft.trim();
		if (!text) return;
		setDraft('');
		setMessages((m) => [...m, { id: Date.now(), kind: 'you', body: text }]);
		setTimeout(() => {
			setMessages((m) => [...m, { id: Date.now() + 1, kind: 'nova', body: replyTo(text), timestamp: 'just now' }]);
		}, 700);
	}

	useEffect(() => {
		threadRef.current?.scrollTo({ top: threadRef.current.scrollHeight, behavior: 'smooth' });
	}, [messages]);

	if (mode === 'overlay' && !open) return null;

	return (
		<aside className={`muse muse--${mode}`} style={moodStyle}>
			{mode === 'overlay' && (
				<button className="muse__scrim" onClick={onClose} aria-label="Close Nova" />
			)}
			<div className="muse__panel">
				<header className="muse__head">
					<div>
						<div className="eyebrow">A conversation with</div>
						<h1 className="muse__title">Nova</h1>
					</div>
					{mode === 'overlay' && (
						<button className="muse__close" onClick={onClose} aria-label="Close">
							<Icon name="x" size={16} />
						</button>
					)}
				</header>

				<div className="muse__scope">
					<span className="muse__scope-dot" />
					<span>Reading</span>
					<button className="muse__scope-chip">Chapter 3</button>
					<span>of</span>
					<button className="muse__scope-chip">{project?.title || "your project"}</button>
				</div>

				<div className="muse__thread" ref={threadRef}>
					{messages.map((m) => (
						<NoteCard key={m.id} kind={m.kind} name={m.kind === 'nova' ? 'Nova' : null} timestamp={m.timestamp}>
							{m.kind === 'nova' && Array.isArray(m.body) ? m.body : <p>{m.body}</p>}
						</NoteCard>
					))}
				</div>

				<footer className="muse__composer">
					<div className="muse__write">
						<textarea
							value={draft}
							onChange={(e) => setDraft(e.target.value)}
							onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
							placeholder="Ask Nova about the book…"
							rows={2}
							className="muse__textarea"
						/>
						<button className="muse__send" disabled={!draft.trim()} onClick={send} aria-label="Send">
							<Icon name="send" size={14} />
						</button>
					</div>
					<div className="muse__hint">
						<span>Enter to send · Shift+Enter for newline.</span>
						<span>Nova reads only the scope you've chosen.</span>
					</div>
				</footer>
			</div>
		</aside>
	);
}

function NoteCard({ kind, name, timestamp, children }) {
	return (
		<div className={`note note--${kind}`}>
			{name && (
				<div className="note__head">
					<div className="note__nib">{name[0]}</div>
					<div className="note__author">{name}</div>
					{timestamp && <div className="note__time">{timestamp}</div>}
				</div>
			)}
			<div className="note__body">{children}</div>
		</div>
	);
}

function seedThread(project) {
	return [
		{ id: 1, kind: 'you', body: 'What do we know about Halia so far?' },
		{
			id: 2, kind: 'nova', timestamp: 'moments ago',
			body: [
				<p key="p1">A character study, drawn from the three chapters in your project:</p>,
				<ul key="ul" className="muse__list">
					<li><strong>Halia Marrowfen,</strong> a retired cartographer in her late fifties, living alone above a quiet harbour with one unnamed cat.</li>
					<li>She keeps a pencil <em>threaded through her hair</em> — a tic she returns to whenever she looks at a chart. (You introduce this in 3.2; it could pay off earlier.)</li>
					<li>Eleven years ago — or possibly a decade; <span className="muse__flag">your draft disagrees with itself</span> — she lost something at the western anchorage.</li>
					<li>The brass weights she uses to hold a chart down are introduced in 3.2 but referenced in 3.1. Worth a quick reorder.</li>
				</ul>,
				<div key="actions" className="muse__pill-row">
					<button className="muse__pill">Open the continuity issue</button>
					<button className="muse__pill">Add to her dossier</button>
				</div>,
			],
		},
	];
}

function replyTo(input) {
	const lc = input.toLowerCase();
	if (lc.includes('summari') || lc.includes('so far')) {
		return [<p key="p">So far: Halia, a retired cartographer, has received a letter from a port that was struck from the maps eleven years ago. She has retrieved her old instruments and copied a new chart back to its truthful soundings. Quint suspects the letter is genuine. The open question is who sent it, and how it bypassed her port's mail intercept.</p>];
	}
	if (lc.includes('continuity')) {
		return [<p key="p">Two open items in Chapter 3 alone: (1) the western anchorage is "eleven years" ago in Chapter 1 but "a decade" in Chapter 4 — pick one. (2) The brass weights are introduced in 3.2 but referenced in 3.1.</p>];
	}
	if (lc.includes('quint')) {
		return [<p key="p">Quint is currently a voice in a doorway. He doesn't have a body in your draft yet — no age, no posture, no relationship to Halia. If you'd like, I can draft two sentences of physical description that seed naturally in 3.1, before his first line in 3.2.</p>];
	}
	return [<p key="p">I can recall context from your outline, sketch a passage, surface continuity questions, or build out a dossier. Try: <em>"Summarize what we know so far"</em>, or <em>"Continuity check on Chapter 3"</em>.</p>];
}

Object.assign(window, { Muse });
