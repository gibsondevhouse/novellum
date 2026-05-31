## 2026-05-30

Created /api/worldbuilding/domain-counts/+server.ts with parallel COUNT queries for characters, factions, character_relationships, locations, lore_entries, themes, glossary_terms, plot_threads, timeline_events. Updated +page.ts load function to fetch /api/worldbuilding/domain-counts?projectId=... and expose data.domainCounts. Rendered "N records" / "No records yet" on each domain tile.
