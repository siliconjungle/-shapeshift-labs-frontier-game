import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pkg = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8'));

const expectedExports = [
  '.',
  './commands',
  './ecs',
  './lag',
  './physics',
  './query',
  './replication',
  './room',
  './rollback',
  './spatial',
  './world',
  './package.json'
];
assert.deepStrictEqual(Object.keys(pkg.exports).sort(), expectedExports.sort());
assert.strictEqual(pkg.sideEffects, false);
assert.deepStrictEqual(Object.keys(pkg.dependencies), ['@shapeshift-labs/frontier-realtime']);
assert.deepStrictEqual(Object.keys(pkg.peerDependencies), ['@shapeshift-labs/frontier-query']);

const rootJs = fs.readFileSync(path.join(rootDir, 'dist/index.js'), 'utf8');
assert.strictEqual(rootJs.includes('frontier-realtime-server'), false);
assert.strictEqual(rootJs.includes('frontier-realtime-websocket'), false);
assert.strictEqual(rootJs.includes('frontier-query'), false);

for (const [key, value] of Object.entries(pkg.exports)) {
  if (key === './package.json') continue;
  assert.ok(fs.existsSync(path.join(rootDir, value.import)), key + ' import target exists');
  assert.ok(fs.existsSync(path.join(rootDir, value.types)), key + ' types target exists');
  const mod = await import(path.join(rootDir, value.import));
  assert.ok(Object.keys(mod).length > 0, key + ' exports values');
}

console.log('frontier game package boundaries passed');
