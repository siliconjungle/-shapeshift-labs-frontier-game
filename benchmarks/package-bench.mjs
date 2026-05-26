import fs from 'node:fs';
import path from 'node:path';
import { performance } from 'node:perf_hooks';
import { fileURLToPath } from 'node:url';
import {
  applyGameCommand,
  createGameCommandSource,
  createGameRoomModel,
  createGameWorld,
  createReplicationView,
  spawnEntity,
  upsertPlayer
} from '../dist/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const args = parseArgs(process.argv.slice(2));
const rounds = readPositiveInt(args.rounds, 9);
const outPath = args.out ? path.resolve(rootDir, args.out) : null;
let sink = 0;

const seededWorld = makeWorld(1024);
const source = createGameCommandSource({ clientId: 'bench', roomId: 'bench-room', now: () => 1 });
const componentCommands = new Array(128);
for (let i = 0; i < componentCommands.length; i++) {
  componentCommands[i] = source.setComponent('entity-' + i, 'position', { x: i, y: i });
}

const rows = [
  runRow('Spawn 128 entities', 500, () => {
    let world = createGameWorld();
    for (let i = 0; i < 128; i++) {
      world = spawnEntity(world, { id: 'entity-' + i, ownerId: 'bench', components: { position: { x: i } } });
    }
    sink += Object.keys(world.entities).length;
  }),
  runRow('Apply 128 component commands', 40, () => {
    let world = seededWorld;
    for (let i = 0; i < componentCommands.length; i++) world = applyGameCommand(world, componentCommands[i]);
    sink += Object.keys(world.entities).length;
  }),
  runRow('Replication view, 1k entities', 1000, () => {
    const view = createReplicationView(seededWorld, { playerId: 'bench', excludeComponents: ['serverOnly'] });
    sink += Object.keys(view.entities).length;
  }),
  runRow('Room model apply/select', 200, () => {
    const model = createGameRoomModel({ initialWorld: seededWorld });
    let world = model.initialState;
    for (let i = 0; i < 16; i++) world = model.applyCommand(world, componentCommands[i], { tick: i });
    sink += Object.keys(model.selectSnapshot(world, { clientId: 'bench' }).entities).length;
  })
];

finish('@shapeshift-labs/frontier-game', rows);

function makeWorld(count) {
  let world = createGameWorld();
  world = upsertPlayer(world, { id: 'bench' });
  for (let i = 0; i < count; i++) {
    world = spawnEntity(world, {
      id: 'entity-' + i,
      ownerId: i % 4 === 0 ? 'bench' : undefined,
      tags: i % 5 === 0 ? ['private'] : ['mob'],
      components: {
        position: { x: i, y: i },
        serverOnly: i,
        visibility: { public: i % 5 !== 0 }
      }
    });
  }
  return world;
}

function measure(fn, inner) {
  for (let i = 0; i < inner; i++) fn();
  const samples = new Array(rounds);
  for (let roundIndex = 0; roundIndex < rounds; roundIndex++) {
    const start = performance.now();
    for (let i = 0; i < inner; i++) fn();
    samples[roundIndex] = ((performance.now() - start) * 1000) / inner;
  }
  samples.sort((left, right) => left - right);
  return { median: percentile(samples, 0.5), p95: percentile(samples, 0.95) };
}

function runRow(name, inner, fn, extra = {}) {
  const timing = measure(fn, inner);
  return { fixture: name, medianUs: round(timing.median), p95Us: round(timing.p95), ...extra };
}

function finish(packageName, rows) {
  const report = {
    package: packageName,
    version: readPackageVersion(),
    generatedAt: new Date().toISOString(),
    node: process.version,
    platform: process.platform + ' ' + process.arch,
    rounds,
    rows
  };
  if (outPath) {
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, JSON.stringify(report, null, 2) + '\n');
  }
  printReport(report);
  if (sink === 42) console.log('sink=' + sink);
}

function printReport(report) {
  console.log(report.package + ' package benchmark');
  console.log('Node ' + report.node + ' on ' + report.platform + ', rounds=' + rounds);
  console.log('These are Frontier-only package measurements, not competitor comparisons.');
  console.log('');
  console.log(padRight('Fixture', 36) + padLeft('Median', 12) + padLeft('p95', 11));
  for (const row of report.rows) {
    console.log(padRight(row.fixture, 36) + padLeft(formatUs(row.medianUs), 12) + padLeft(formatUs(row.p95Us), 11));
  }
  if (outPath) console.log('\nwrote ' + path.relative(rootDir, outPath));
}

function percentile(sorted, fraction) {
  return sorted[Math.min(sorted.length - 1, Math.max(0, Math.ceil(sorted.length * fraction) - 1))];
}

function readPackageVersion() {
  return JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8')).version;
}

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--rounds') out.rounds = argv[++i];
    else if (arg === '--out') out.out = argv[++i];
    else if (arg === '--help' || arg === '-h') {
      console.log('Usage: npm run bench -- [--rounds 9] [--out benchmarks/results/package-bench.json]');
      process.exit(0);
    } else {
      throw new Error('unknown argument: ' + arg);
    }
  }
  return out;
}

function readPositiveInt(value, fallback) {
  if (value === undefined) return fallback;
  const number = Number(value);
  if (!Number.isInteger(number) || number <= 0) throw new Error('expected positive integer, got ' + value);
  return number;
}

function round(value) {
  return Math.round(value * 100) / 100;
}

function formatUs(value) {
  return value >= 1000 ? (value / 1000).toFixed(2) + ' ms' : value.toFixed(2) + ' us';
}

function padRight(value, width) {
  return String(value).padEnd(width);
}

function padLeft(value, width) {
  return String(value).padStart(width);
}
