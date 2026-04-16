const fs = require('fs');
let code = fs.readFileSync('src/modules/project/components/LibraryHeroCard.svelte', 'utf8');

// replace destination type
code = code.replace(
  "type LibraryCardDestination = 'reader' | 'workspace';",
  ""
);

// replace destination prop
const propsMatch = `        let {
                project,
                cardIndex = 0,
                destination = 'reader',
        } = $props<{
                project: Project;
                cardIndex?: number;
                destination?: LibraryCardDestination;
        }>();`;

const newProps = `        let {
                project,
                cardIndex = 0,
        } = $props<{
                project: Project;
                cardIndex?: number;
        }>();`;

code = code.replace(propsMatch, newProps);

// replace cardHref
const derivedHref = `        const cardHref = $derived(
                destination === 'workspace' ? \`/projects/\${project.id}/workspace\` : \`/books/\${project.id}\`,
        );`;
const newHref = `        const cardHref = \`/projects/\${project.id}/hub\`;`;
code = code.replace(derivedHref, newHref);

// replace cardActionLabel
const derivedLabel = `        const cardActionLabel = $derived(
                destination === 'workspace' ? 'Open workspace for' : 'Open reader for',
        );`;
const newLabel = `        const cardActionLabel = 'Open project hub for';`;
code = code.replace(derivedLabel, newLabel);

fs.writeFileSync('src/modules/project/components/LibraryHeroCard.svelte', code);
