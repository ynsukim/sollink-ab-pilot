import { readFileSync, writeFileSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const configPath = join(root, 'js', 'config.js');

const envUrl = process.env.SUPABASE_URL || '';
const envKey = process.env.SUPABASE_ANON_KEY || '';

let supabaseUrl = envUrl;
let supabaseAnonKey = envKey;

if (!supabaseUrl || !supabaseAnonKey) {
  if (existsSync(configPath)) {
    const current = readFileSync(configPath, 'utf8');
    const urlMatch = current.match(/supabaseUrl:\s*'([^']*)'/);
    const keyMatch = current.match(/supabaseAnonKey:\s*'([^']*)'/);
    if (!supabaseUrl && urlMatch) supabaseUrl = urlMatch[1];
    if (!supabaseAnonKey && keyMatch) supabaseAnonKey = keyMatch[1];
  }
}

const content = `window.SOLLINK_CONFIG = {
  supabaseUrl: '${supabaseUrl}',
  supabaseAnonKey: '${supabaseAnonKey}',
};
`;

writeFileSync(configPath, content);
console.log(`config.js ready${envUrl ? ' (Supabase from env)' : ''}`);
