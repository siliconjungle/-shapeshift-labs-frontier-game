import assert from 'node:assert';
import {
  applyGameCommand,
  createGameCommandSource,
  createGameWorld,
  createReplicationView,
  upsertPlayer,
  validateGameCommand
} from '../dist/index.js';

const args = parseArgs(process.argv.slice(2));
const cases = readPositiveInt(args.cases, 500);
const steps = readPositiveInt(args.steps, 64);
const seed = readPositiveInt(args.seed, 0x9a7e);
const rng = mulberry32(seed);

for (let caseId = 0; caseId < cases; caseId++) {
  runCase(caseId, mulberry32((rng() * 0xffffffff) >>> 0));
}

console.log('frontier game fuzz passed cases=' + cases + ' steps=' + steps + ' seed=' + seed);

function runCase(caseId, rng) {
  const playerId = 'player-' + caseId;
  const source = createGameCommandSource({ clientId: playerId, roomId: 'room-' + caseId, now: () => 1 });
  let world = upsertPlayer(createGameWorld(), { id: playerId });
  const live = new Set();

  for (let step = 0; step < steps; step++) {
    let command;
    const choice = randomInt(rng, 5);
    if (choice === 0 || live.size === 0) {
      const id = 'entity-' + caseId + '-' + step;
      live.add(id);
      command = source.spawn({
        id,
        ownerId: playerId,
        tags: randomInt(rng, 3) === 0 ? ['private'] : ['mob'],
        components: { position: { x: randomInt(rng, 100), y: randomInt(rng, 100) } }
      });
    } else {
      const id = Array.from(live)[randomInt(rng, live.size)];
      if (choice === 1) command = source.setComponent(id, 'position', { x: randomInt(rng, 100), y: randomInt(rng, 100) });
      else if (choice === 2) command = source.mergeComponent(id, 'stats', { hp: randomInt(rng, 100) });
      else if (choice === 3) command = source.removeComponent(id, 'stats');
      else {
        live.delete(id);
        command = source.despawn(id);
      }
    }

    const valid = validateGameCommand(world, command);
    if (valid === true) world = applyGameCommand(world, command);
    assert.strictEqual(typeof world.tick, 'number');
    assert.strictEqual(Object.keys(world.entities).every((id) => world.entities[id].id === id), true);
    const view = createReplicationView(world, { playerId });
    assert.ok(Object.keys(view.entities).length <= Object.keys(world.entities).length);
  }
}

function randomInt(rng, max) {
  return Math.floor(rng() * max);
}

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--cases') out.cases = argv[++i];
    else if (arg === '--steps') out.steps = argv[++i];
    else if (arg === '--seed') out.seed = argv[++i];
    else throw new Error('unknown argument: ' + arg);
  }
  return out;
}

function readPositiveInt(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? Math.floor(number) : fallback;
}

function mulberry32(seed) {
  let value = seed >>> 0;
  return function next() {
    value += 0x6d2b79f5;
    let t = value;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
