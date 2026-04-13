// Outliner module public types
import type { Chapter, Scene } from '$lib/db/types.js';

export type OutlineNodeId = number;

export type ChapterWithScenes = Chapter & { scenes: Scene[] };
