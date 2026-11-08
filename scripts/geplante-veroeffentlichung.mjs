// Gibt "due=true" aus, wenn heute (UTC) ein freigegebener Ratgeber mit Veröffentlichungsdatum fällig ist.
// Wird vom täglichen GitHub-Workflow genutzt, um dann einen neuen Build anzustoßen.
import { readdirSync, readFileSync, existsSync } from 'node:fs';

const dir = 'src/content/artikel';
const today = new Date().toISOString().slice(0, 10);
let due = false;

if (existsSync(dir)) {
  for (const f of readdirSync(dir).filter((x) => x.endsWith('.md'))) {
    const fm = readFileSync(`${dir}/${f}`, 'utf8').split('---')[1] ?? '';
    const status = (fm.match(/^status:\s*["']?([\w-]+)/m) || [])[1];
    const date = (fm.match(/^publishDate:\s*["']?(\d{4}-\d{2}-\d{2})/m) || [])[1];
    if (status === 'freigegeben' && date === today) {
      due = true;
      console.error(`Fällig: ${f} (${date})`);
    }
  }
}
console.log(`due=${due}`);
