export const STYLE_PRESETS = [
  {
    id: "literary-fiction",
    name: "Literary Fiction",
    description:
      "Lyrical, restrained prose focused on interiority, subtext, and quiet observation.",
    rules: `
Write with controlled, intentional rhythm. Vary sentence length naturally but avoid decorative phrasing.

Prioritize internal experience over external action. Focus on perception, memory, and subtle emotional shifts.

Use specific, concrete details sparingly. Let objects and environments carry meaning without explanation.

Dialogue should be minimal and indirect. Characters rarely say exactly what they mean.

Allow scenes to breathe, but maintain quiet forward movement. Avoid stagnation.

Avoid dramatic language, genre tropes, or obvious tension devices.

Use metaphor rarely. When used, it should feel precise and grounded.

Do not over-explain. Trust the reader to infer meaning.
    `.trim(),
  },

  {
    id: "thriller",
    name: "Thriller",
    description:
      "Tight, fast-moving prose built around urgency, clarity, and escalating stakes.",
    rules: `
Keep sentences lean and direct. Favor short to medium length.

Prioritize action and cause-effect. Every moment should lead to a consequence.

Minimize internal monologue. Stay anchored in present action.

Use concrete physical detail to ground scenes, especially during tension.

Dialogue should be direct and functional. Avoid filler.

Escalate stakes consistently. Each scene should increase pressure, risk, or urgency.

Avoid reflective or lyrical passages that slow pacing.

End scenes with tension, new information, or unresolved outcomes.
    `.trim(),
  },

  {
    id: "young-adult",
    name: "Young Adult",
    description:
      "Clear, emotionally immediate prose with strong character voice and accessibility.",
    rules: `
Write close to the character’s perspective. Prioritize emotional immediacy.

Use simple, readable language. Avoid complex or abstract phrasing.

Internal thoughts should be direct, honest, and sometimes messy.

Dialogue should feel natural and current without relying heavily on slang.

Focus on relationships, identity, and emotional stakes.

Balance introspection with action. Avoid long stretches of either.

Avoid formal tone, heavy exposition, or detached narration.

Keep pacing steady with frequent emotional or situational shifts.
    `.trim(),
  },

  {
    id: "romance",
    name: "Romance",
    description:
      "Emotion-driven prose centered on connection, tension, and vulnerability between characters.",
    rules: `
Prioritize character interaction. The relationship is the primary driver.

Track emotional shifts closely: attraction, hesitation, misinterpretation, risk.

Use sensory detail to support emotional moments, not replace them.

Dialogue should carry subtext. What is unsaid matters.

Build tension through proximity, timing, and emotional stakes.

Avoid generic or exaggerated romantic language. Keep emotions specific.

Alternate between tension and release. Do not resolve too quickly.

Physical description should serve emotional context, not exist on its own.
    `.trim(),
  },
];

export const getPreset = (id: string) => STYLE_PRESETS.find(p => p.id === id);
