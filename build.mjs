import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const packageDir = path.dirname(fileURLToPath(import.meta.url));
const realtimeDir = path.join(path.dirname(packageDir), 'frontier-realtime');
const queryDir = path.join(path.dirname(packageDir), 'frontier-query-standalone');

linkLocalPackage('@shapeshift-labs/frontier-realtime', realtimeDir);
linkLocalPackage('@shapeshift-labs/frontier-query', queryDir);
if (fs.existsSync(path.join(realtimeDir, 'package.json'))) {
  execFileSync('npm', ['--prefix', realtimeDir, 'run', 'build'], { stdio: 'inherit' });
}
if (fs.existsSync(path.join(queryDir, 'package.json'))) {
  execFileSync('npm', ['--prefix', queryDir, 'run', 'build'], { stdio: 'inherit' });
}

fs.rmSync(path.join(packageDir, 'dist'), { recursive: true, force: true });
execFileSync(resolveTsc(), ['-b', path.join(packageDir, 'tsconfig.json'), '--force'], { stdio: 'inherit' });

function linkLocalPackage(name, targetDir) {
  if (!fs.existsSync(path.join(targetDir, 'package.json'))) return;
  const parts = name.split('/');
  const scopeDir = path.join(packageDir, 'node_modules', ...parts.slice(0, -1));
  const linkPath = path.join(packageDir, 'node_modules', ...parts);
  fs.mkdirSync(scopeDir, { recursive: true });
  try {
    const stat = fs.lstatSync(linkPath);
    if (!stat.isSymbolicLink()) return;
    fs.unlinkSync(linkPath);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  fs.symlinkSync(path.relative(path.dirname(linkPath), targetDir), linkPath, 'dir');
}

function resolveTsc() {
  const command = process.platform === 'win32' ? 'tsc.cmd' : 'tsc';
  const candidates = [
    path.join(packageDir, 'node_modules', '.bin', command),
    path.join(realtimeDir, 'node_modules', '.bin', command),
    path.join(queryDir, 'node_modules', '.bin', command)
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate;
  }
  return command;
}
