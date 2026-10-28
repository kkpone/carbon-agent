import fs from 'node:fs/promises';
import path from 'node:path';
import * as OpenCC from 'opencc-js';

const ROOT = process.cwd();
const SRC_DIR = path.join(ROOT, 'src/lang/zh-CN');
const DIST_DIR = path.join(ROOT, 'src/lang/zh-TW');

const convert = OpenCC.Converter({ from: 'cn', to: 'tw' });

async function* walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walk(full);
      continue;
    }
    if (entry.isFile() && full.endsWith('.ts')) {
      yield full;
    }
  }
}

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function main() {
  await ensureDir(DIST_DIR);

  let count = 0;
  for await (const file of walk(SRC_DIR)) {
    const rel = path.relative(SRC_DIR, file);
    const out = path.join(DIST_DIR, rel);
    await ensureDir(path.dirname(out));

    const content = await fs.readFile(file, 'utf8');
    const converted = convert(content);
    await fs.writeFile(out, converted, 'utf8');
    count += 1;
  }

  // eslint-disable-next-line no-console
  console.log(`Generated zh-TW from zh-CN: ${count} files`);
}

main().catch(err => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exitCode = 1;
});

