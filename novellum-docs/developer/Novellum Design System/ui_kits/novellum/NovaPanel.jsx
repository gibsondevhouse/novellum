/* eslint-disable */
// Novellum UI kit — Nova copilot panel.
// Mirrors src/modules/nova/components/NovaPanel.svelte (right-docked, ~360px,
// ground surface, hairline left-border, lg shadow). Includes greeting state
// and a chat log state.

function NovaPanel({ open, onClose, project }) {
	const [messages, setMessages] = React.useState([
		{ id: 1, role: 'assistant', content: "Hi, I'm Nova. Ask me anything about your project." },
	]);
	const [draft, setDraft] = React.useState('');
	const logRef = React.useRef(null);

	function send() {
		const text = draft.trim();
		if (!text) return;
		setDraft('');
		const userMsg = { id: Date.now(), role: 'user', content: text };
		setMessages((m) => [...m, userMsg]);
		setTimeout(() => {
			setMessages((m) => [...m, {
				id: Date.now() + 1,
				role: 'assistant',
				content: scriptedReply(text, project),
			}]);
		}, 600);
	}

	React.useEffect(() => {
		logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: 'smooth' });
	}, [messages]);

	if (!open) return null;

	return (
		<aside className="nv-nova" aria-label="Nova copilot">
			<button className="nv-nova__resize" aria-label="Resize Nova panel"></button>

			<header className="nv-nova__header">
				<div className="nv-nova__title">
					<Icon name="star" size={14} />
					<span>Nova</span>
				</div>
				<button className="nv-nova__close" onClick={onClose} aria-label="Close Nova">
					<Icon name="x" size={14} />
				</button>
			</header>

			<div className="nv-nova__session-tray">
				<button className="nv-nova__chip">
					<span className="nv-nova__chip-dot"></span>
					<span>Context: Chapter 3</span>
				</button>
				<button className="nv-nova__chip">
					<span>Claude 3.5 Sonnet</span>
					<Icon name="chevRight" size={11} />
				</button>
			</div>

			<div className="nv-nova__body" ref={logRef}>
				{messages.length === 1 && messages[0].role === 'assistant' ? (
					<div className="nv-nova__greeting">
						<p className="nv-nova__greeting-title">Hi, I'm Nova.</p>
						<p className="nv-nova__greeting-body">Ask me anything about your project.</p>
						<button className="nv-nova__quick-prompt" onClick={() => setDraft('Summarize what we know so far.')}>
							Summarize what we know so far
						</button>
					</div>
				) : (
					<ul className="nv-nova__log">
						{messages.map((m) => (
							<li key={m.id} className={`nv-nova__msg nv-nova__msg--${m.role}`}>
								{m.role === 'assistant' && (
									<span className="nv-nova__msg-author">
										<Icon name="star" size={11} />
										<span>Nova</span>
									</span>
								)}
								<div className="nv-nova__msg-body">{m.content}</div>
							</li>
						))}
					</ul>
				)}
			</div>

			<footer className="nv-nova__footer">
				<div className="nv-nova__composer">
					<textarea
						className="nv-nova__textarea"
						placeholder="Ask Nova about your project…"
						value={draft}
						onChange={(e) => setDraft(e.target.value)}
						onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
						rows={2}
					/>
					<button className="nv-nova__send" onClick={send} disabled={!draft.trim()} aria-label="Send">
						<Icon name="send" size={14} />
					</button>
				</div>
				<div className="nv-nova__hint">Enter to send · Shift+Enter for newline · Nova reads only the scope you choose.</div>
			</footer>
		</aside>
	);
}

function scriptedReply(input, project) {
	const lc = input.toLowerCase();
	if (lc.includes('summari')) {
		return "So far: Halia, a retired cartographer, has received a letter from a port that was struck from the maps eleven years ago. She has retrieved her old instruments and copied a new chart back to its truthful soundings. Quint suspects the letter is genuine. Open thread: who sent it, and how it bypassed her port's mail intercept.";
	}
	if (lc.includes('continuity') || lc.includes('check')) {
		return "Two potential continuity issues. (1) Chapter 1 places the western anchorage 'eleven years' ago; Chapter 4 calls it 'a decade'. Pick one. (2) The brass weights on Halia's chart table are introduced in Scene 3.2 but referenced earlier in 3.1.";
	}
	if (lc.includes('character') || lc.includes('halia')) {
		return "Halia Marrowfen — retired cartographer, late 50s. Lives alone with one cat (unnamed in current draft). Threaded pencil through her hair is a recurring tic; consider seeding it in Chapter 1 if you want the gesture to land in Scene 3.2.";
	}
	return "I can sketch a scene, surface continuity questions, or recall context from your outline. Try: 'Summarize what we know so far' or 'Continuity check for Chapter 3'.";
}

Object.assign(window, { NovaPanel });
