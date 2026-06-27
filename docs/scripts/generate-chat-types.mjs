// Script to generate types.md for types-*.ts files that the validate CLI doesn't discover.
// The validate CLI only looks for files named exactly "types.ts"; this covers the rest.
import { readFile, unlink } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
// eslint-disable-next-line import/no-relative-packages
import { parseCreateFactoryCall } from '../node_modules/@mui/internal-docs-infra/pipeline/parseCreateFactoryCall/parseCreateFactoryCall.mjs';
// eslint-disable-next-line import/no-relative-packages
import { syncTypes } from '../node_modules/@mui/internal-docs-infra/pipeline/syncTypes/syncTypes.mjs';

const dirname = path.dirname(fileURLToPath(import.meta.url));
const docsDir = path.resolve(dirname, '..');
const chatDir = path.join(docsDir, 'src/app/(docs)/react/components/chat');

const files = [
  'types-composer.ts',
  'types-conversation.ts',
  'types-conversation-list.ts',
  'types-message.ts',
  'types-message-group.ts',
  'types-message-list.ts',
  'types-suggestions.ts',
];

async function processFile(fileName) {
  const filePath = path.join(chatDir, fileName);
  const mdPath = filePath.replace(/\.ts$/, '.md');

  if (existsSync(mdPath)) {
    await unlink(mdPath);
  }

  const content = await readFile(filePath, 'utf-8');
  const typesMetaCall = await parseCreateFactoryCall(content, filePath, { allowExternalVariants: true });

  if (!typesMetaCall) {
    console.warn(`No factory call found in ${fileName}`);
    return;
  }

  console.warn(`Processing ${fileName}...`);
  const result = await syncTypes({
    typesMarkdownPath: mdPath,
    rootContext: docsDir,
    variants: typesMetaCall.variants,
    watchSourceDirectly: false,
    updateParentIndex: undefined,
  });

  console.warn(`  ${result.updated ? 'Written' : 'Unchanged'}: ${path.relative(docsDir, mdPath)}`);
}

for (const fileName of files) {
  // eslint-disable-next-line no-await-in-loop
  await processFile(fileName);
}
