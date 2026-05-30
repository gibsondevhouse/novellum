## 2026-05-30

Created worldbuilding-generate-actions.ts with generatePersonaeWithNova, generateAtlasWithNova, generateArchiveWithNova, generateThreadsWithNova, generateChroniclesWithNova and the generic generateDomainWithNova. Each function reads its promptSeedKey from WORLDBUILDING_DOMAIN_SEQUENCE, retrieves the seed from PROMPT_SEEDS, calls novaMode.loadForProject(), novaMode.setMode('write'), and novaPanel.openWithPrompt(). No DB writes.
