/* eslint-disable */
// Novellum UI kit — Reader screen.
// Mirrors src/modules/reader/components/BookReaderView.svelte: two-page spread,
// 3:2 aspect, gutter, `‹ 5 / 142 ›` pagination, DM Serif Display prose.

const READER_PAGES = [
	{
		id: 'p1',
		chapter: 'Chapter One',
		heading: 'The Letter',
		paragraphs: [
			"Halia received the letter on a Tuesday, which is how she would later remember the year — by the day of the week she stopped being retired.",
			"The envelope had no postmark. It had travelled, somehow, from a port that had been quietly removed from the maps eleven years before, and it carried her name in handwriting she had once known intimately.",
			"She set it on the kitchen table next to the half-drunk tea and watched it for the better part of an hour. The morning slid into noon. The cat investigated, found nothing of interest, and left. Outside, the harbour bell rang twelve, and Halia did not move.",
		],
	},
	{
		id: 'p2',
		paragraphs: [
			"When she finally opened it, the paper unfolded with the soft, almost living quality of vellum that has been kept dry for a long time. Three lines.",
			"The first asked whether she still remembered the western anchorage.",
			"The second told her she was needed.",
			"The third was a date — five weeks out — and the name of a ship she had been certain was lost.",
			"She read it twice, then a third time. Then she walked to the back of the house, took down the brass key she had not used in over a decade, and unlocked the room where she had kept her instruments.",
		],
	},
];

function ReaderScreen({ project, onClose }) {
	const [pageIndex, setPageIndex] = React.useState(0);
	const totalPages = 142;
	const leftPage = READER_PAGES[pageIndex] ?? READER_PAGES[0];
	const rightPage = READER_PAGES[pageIndex + 1] ?? READER_PAGES[1];

	function goNext() {
		setPageIndex((i) => Math.min(i + 2, READER_PAGES.length - 2));
	}
	function goPrev() {
		setPageIndex((i) => Math.max(i - 2, 0));
	}

	return (
		<div className="nv-reader">
			<div className="nv-reader__modebar">
				<PillNav
					items={[
						{ id: 'classic', label: 'Classic' },
						{ id: 'book', label: 'Book' },
						{ id: 'fullscreen', label: 'Full Screen' },
					]}
					activeId="book"
					onSelect={() => {}}
				/>
			</div>

			<div className="nv-reader__stage">
				<div className="nv-reader__spread">
					<ReaderPage page={leftPage} side="left" />
					<div className="nv-reader__gutter" aria-hidden="true"></div>
					<ReaderPage page={rightPage} side="right" />
				</div>
			</div>

			<div className="nv-reader__controls">
				<div className="nv-reader__nav-group">
					<button className="nv-reader__nav" onClick={goPrev} disabled={pageIndex === 0} aria-label="Previous page">‹</button>
					<span className="nv-reader__counter">{(pageIndex + 1)} / {totalPages}</span>
					<button className="nv-reader__nav" onClick={goNext} aria-label="Next page">›</button>
				</div>
			</div>
		</div>
	);
}

function ReaderPage({ page, side }) {
	if (!page) return <div className="nv-reader__page nv-reader__page--blank"></div>;
	return (
		<article className={`nv-reader__page nv-reader__page--${side}`}>
			{page.chapter && (
				<header className="nv-reader__chapter-head">
					<div className="nv-reader__chapter-eyebrow">{page.chapter}</div>
					<h1 className="nv-reader__chapter-title">{page.heading}</h1>
				</header>
			)}
			{page.paragraphs.map((p, i) => (
				<p key={i} className="nv-reader__para">{p}</p>
			))}
		</article>
	);
}

Object.assign(window, { ReaderScreen });
