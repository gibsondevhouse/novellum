import sys

with open('src/routes/projects/[id]/workspace/+page.svelte', 'r') as f:
    lines = f.readlines()

new_lines = []
skip = False
for line in lines:
    new_lines.append(line)

if new_lines[-1].strip() != '</style>':
    new_lines.append('</style>\n')

with open('src/routes/projects/[id]/workspace/+page.svelte', 'w') as f:
    f.writelines(new_lines)
