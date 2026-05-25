/* eslint-disable */
// Novellum v2 — Room (Reader).
// Two-page parchment spread with drop cap, ornament, ribbon bookmark, folios.

function Room({ project, onClose }) {
	const moodStyle = useMood(project);
	const [pageIndex, setPageIndex] = useState(0);

	return (
		<div className="room" style={moodStyle}>
			<div className="room__candle" aria-hidden="true" />
			<div className="room__vignette" aria-hidden="true" />

			<div className="room__chrome">
				<button className="room__chrome-btn" onClick={onClose}>
					<Icon name="chevLeft" size={12} /> Library
				</button>
				<div className="room__title">{project?.title || "The Mariner's Glass"}</div>
				<button className="room__chrome-btn">
					<Icon name="type" size={12} /> Reading appearance
				</button>
			</div>

			<div className="room__stage">
				<div className="room__book">
					<div className="room__bookmark" aria-hidden="true" />

					<article className="room__page room__page--left">
						<header className="room__chapter">
							<div className="room__chapter-num">Chapter One</div>
							<div className="room__ornament">❦</div>
							<h2 className="room__chapter-title">The Letter</h2>
						</header>
						<p className="room__para room__para--first">
							<span className="room__dropcap">H</span>alia received the letter on a Tuesday, which is how she would later remember the year — by the day of the week she stopped being retired.
						</p>
						<p className="room__para">The envelope had no postmark. It had travelled, somehow, from a port that had been quietly removed from the maps eleven years before, and it carried her name in handwriting she had once known intimately.</p>
						<p className="room__para">She set it on the kitchen table next to the half-drunk tea and watched it for the better part of an hour. The morning slid into noon. The cat investigated, found nothing of interest, and left. Outside, the harbour bell rang twelve, and Halia did not move.</p>
						<span className="room__folio">2</span>
					</article>

					<div className="room__gutter" aria-hidden="true" />

					<article className="room__page room__page--right">
						<p className="room__para">When she finally opened it, the paper unfolded with the soft, almost living quality of vellum that has been kept dry for a long time. Three lines.</p>
						<p className="room__para">The first asked whether she still remembered the western anchorage.</p>
						<p className="room__para">The second told her she was needed.</p>
						<p className="room__para">The third was a date — five weeks out — and the name of a ship she had been certain was lost.</p>
						<p className="room__para">She read it twice, then a third time. Then she walked to the back of the house, took down the brass key she had not used in over a decade, and unlocked the room where she had kept her instruments.</p>
						<span className="room__folio">3</span>
					</article>
				</div>
			</div>

			<div className="room__controls">
				<button className="room__nav" onClick={() => setPageIndex((i) => Math.max(0, i - 1))}>‹</button>
				<div className="room__progress">
					<div className="room__progress-bar">
						<div className="room__progress-fill" style={{ width: '21%' }} />
					</div>
					<div className="room__progress-label">page 2 of 142 · about 21 minutes left in this chapter</div>
				</div>
				<button className="room__nav" onClick={() => setPageIndex((i) => i + 1)}>›</button>
			</div>
		</div>
	);
}

Object.assign(window, { Room });
