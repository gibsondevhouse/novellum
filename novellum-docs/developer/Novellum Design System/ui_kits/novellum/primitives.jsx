/* eslint-disable */
// Novellum UI kit — primitives.
// All components are attached to window at the bottom so other Babel scripts
// can use them as if they were imported.

const { useState, useEffect, useRef } = React;

// ─── Icon set (Lucide / Feather visual family — 24×24, 2px, round caps) ─────
const ICONS = {
	home: <><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></>,
	book: <><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></>,
	star: <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>,
	image: <><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></>,
	droplet: <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path>,
	grid: <><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></>,
	menu: <><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></>,
	plus: <><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></>,
	sun: <><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></>,
	settings: <><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></>,
	search: <><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></>,
	send: <><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></>,
	chevLeft: <polyline points="15 18 9 12 15 6"></polyline>,
	chevRight: <polyline points="9 18 15 12 9 6"></polyline>,
	x: <><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></>,
	pen: <><path d="M12 19l7-7 3 3-7 7-3-3z"></path><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path><path d="M2 2l7.586 7.586"></path><circle cx="11" cy="11" r="2"></circle></>,
	globe: <><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></>,
	folder: <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>,
};

function Icon({ name, size = 16, className, style }) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={size} height={size} viewBox="0 0 24 24"
			fill="none" stroke="currentColor" strokeWidth="2"
			strokeLinecap="round" strokeLinejoin="round"
			className={className} style={style}
		>
			{ICONS[name]}
		</svg>
	);
}

// ─── Button ─────────────────────────────────────────────────────────────────
function Button({ variant = 'primary', size = 'md', children, onClick, disabled, leftIcon, className = '', ...rest }) {
	const cls = `nv-btn nv-btn--${variant} nv-btn--${size} ${className}`;
	return (
		<button className={cls} onClick={onClick} disabled={disabled} {...rest}>
			{leftIcon && <Icon name={leftIcon} size={14} />}
			{children}
		</button>
	);
}

// ─── Input ──────────────────────────────────────────────────────────────────
function Input({ label, value, onChange, placeholder, error, className = '', leadingIcon, ...rest }) {
	return (
		<label className={`nv-field ${className}`}>
			{label && <span className="nv-field__label">{label}</span>}
			<span className={`nv-field__shell ${error ? 'is-error' : ''}`}>
				{leadingIcon && <Icon name={leadingIcon} size={14} className="nv-field__icon" />}
				<input
					className="nv-field__input"
					value={value ?? ''}
					onChange={(e) => onChange?.(e.target.value)}
					placeholder={placeholder}
					{...rest}
				/>
			</span>
			{error && <span className="nv-field__error">{error}</span>}
		</label>
	);
}

// ─── Status / genre badges ──────────────────────────────────────────────────
function StatusBadge({ status = 'neutral', children }) {
	return <span className={`nv-status nv-status--${status}`}>{children}</span>;
}

function GenrePill({ children, muted = false }) {
	return <span className={`nv-genre ${muted ? 'is-muted' : ''}`}>{children}</span>;
}

// ─── PillNav (chapter selector etc.) ────────────────────────────────────────
function PillNav({ items, activeId, onSelect }) {
	return (
		<div className="nv-pillnav">
			{items.map((item) => (
				<button
					key={item.id}
					className={`nv-pill ${item.id === activeId ? 'is-active' : ''}`}
					onClick={() => onSelect?.(item.id)}
				>
					{item.label}
				</button>
			))}
		</div>
	);
}

// ─── EmptyState (calm, invitational) ────────────────────────────────────────
function EmptyState({ title, description, action }) {
	return (
		<div className="nv-empty">
			<div className="nv-empty__title">{title}</div>
			{description && <div className="nv-empty__desc">{description}</div>}
			{action && <div className="nv-empty__action">{action}</div>}
		</div>
	);
}

// ─── SurfaceCard ────────────────────────────────────────────────────────────
function SurfaceCard({ children, className = '', as: Tag = 'div', ...rest }) {
	return <Tag className={`nv-card ${className}`} {...rest}>{children}</Tag>;
}

// ─── Cover (gradient + foil + serif initial) ────────────────────────────────
const COVER_PALETTES = [
	['#1f2937', '#4f46e5'],
	['#3f2a1d', '#b45309'],
	['#102a43', '#0ea5e9'],
	['#2b1a3a', '#9333ea'],
	['#1f3a2e', '#10b981'],
	['#3a1f2a', '#fb7185'],
];

function hashSeed(s) {
	let h = 0;
	for (let i = 0; i < s.length; i++) { h = (h << 5) - h + s.charCodeAt(i); h |= 0; }
	return Math.abs(h);
}

function BookCover({ title, palette, spine = true, size = 'md' }) {
	const seed = palette ?? COVER_PALETTES[hashSeed(title) % COVER_PALETTES.length];
	const initial = (title || '?').trim().charAt(0).toUpperCase();
	return (
		<div className={`nv-cover nv-cover--${size}`} style={{ background: `linear-gradient(160deg, ${seed[0]}, ${seed[1]})` }}>
			<div className="nv-cover__foil"></div>
			<span className="nv-cover__initial">{initial}</span>
			{spine && <span className="nv-cover__spine">{title}</span>}
		</div>
	);
}

// Export to window for cross-file use
Object.assign(window, {
	Icon,
	Button,
	Input,
	StatusBadge,
	GenrePill,
	PillNav,
	EmptyState,
	SurfaceCard,
	BookCover,
	COVER_PALETTES,
	hashSeed,
});
