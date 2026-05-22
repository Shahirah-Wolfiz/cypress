import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

function loadJson(name) {
  return JSON.parse(readFileSync(join(root, 'fixtures', name), 'utf-8'));
}

export const i18n = loadJson('i18n.json');
export const login = loadJson('login.json');
