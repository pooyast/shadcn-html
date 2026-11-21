import { cpSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const output = join(root, '.pages-stage');
const preview = process.argv.includes('--preview');

rmSync(output, { recursive: true, force: true });
mkdirSync(output, { recursive: true });
cpSync(join(root, 'dist'), output, { recursive: true });
if (preview) cpSync(join(root, '.pages-reference'), output, { recursive: true });

const origin = 'https://madcn.pages.dev';
for (const entry of readdirSync(output, { recursive: true, withFileTypes: true })) {
  if (!entry.isFile() || !['.html', '.txt', '.xml'].includes(extname(entry.name))) continue;
  const path = join(entry.parentPath, entry.name);
  const source = readFileSync(path, 'utf8');
  const updated = source.replaceAll('https://shadcn-html.netlify.app', origin);
  if (source !== updated) writeFileSync(path, updated);
}
