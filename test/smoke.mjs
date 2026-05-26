import assert from 'node:assert';
import {
  GAME_COMMAND_SET_COMPONENT,
  applyGameCommand,
  createGameCommandSource,
  createGameRoomModel,
  createGameWorld,
  createReplicationView,
  getComponent,
  mergeComponent,
  setComponent,
  spawnEntity,
  upsertPlayer,
  validateGameCommand
} from '../dist/index.js';
import { createGameCommandSource as createGameCommandSourceSubpath } from '../dist/commands.js';
import { createReplicationView as createReplicationViewSubpath } from '../dist/replication.js';
import { createGameRoomModel as createGameRoomModelSubpath } from '../dist/room.js';
import { createGameWorld as createGameWorldSubpath } from '../dist/world.js';

assert.strictEqual(createGameCommandSourceSubpath, createGameCommandSource);
assert.strictEqual(createReplicationViewSubpath, createReplicationView);
assert.strictEqual(createGameRoomModelSubpath, createGameRoomModel);
assert.strictEqual(createGameWorldSubpath, createGameWorld);

{
  let world = createGameWorld();
  world = upsertPlayer(world, { id: 'alice', entityId: 'player:alice' });
  world = spawnEntity(world, {
    id: 'player:alice',
    ownerId: 'alice',
    tags: ['player'],
    components: { position: { x: 0, y: 0 }, visibility: { public: true } }
  });
  world = setComponent(world, 'player:alice', 'health', { hp: 10 });
  world = mergeComponent(world, 'player:alice', 'health', { max: 12 });

  assert.deepStrictEqual(getComponent(world, 'player:alice', 'health'), { hp: 10, max: 12 });

  const source = createGameCommandSource({ clientId: 'alice', roomId: 'room-1', now: () => 1 });
  const command = source.setComponent('player:alice', 'position', { x: 2, y: 3 });
  assert.strictEqual(command.type, GAME_COMMAND_SET_COMPONENT);
  assert.strictEqual(validateGameCommand(world, command), true);
  world = applyGameCommand(world, command);
  assert.deepStrictEqual(getComponent(world, 'player:alice', 'position'), { x: 2, y: 3 });
}

{
  let world = createGameWorld({
    players: { alice: { id: 'alice' }, bob: { id: 'bob' } }
  });
  world = spawnEntity(world, {
    id: 'secret',
    ownerId: 'alice',
    tags: ['private'],
    components: { position: { x: 1 }, serverOnly: true }
  });
  world = spawnEntity(world, {
    id: 'public',
    components: { position: { x: 2 }, visibility: { public: true } }
  });

  const alice = createReplicationView(world, { playerId: 'alice', excludeComponents: ['serverOnly'] });
  const bob = createReplicationView(world, { playerId: 'bob' });
  assert.ok(alice.entities.secret);
  assert.strictEqual(alice.entities.secret.components.serverOnly, undefined);
  assert.strictEqual(bob.entities.secret, undefined);
  assert.ok(bob.entities.public);
}

{
  const model = createGameRoomModel({
    initialWorld: {
      players: { alice: { id: 'alice' } }
    }
  });
  const source = createGameCommandSource({ clientId: 'alice', roomId: 'room-1', now: () => 1 });
  const spawn = source.spawn({ id: 'player:alice', ownerId: 'alice', components: { position: { x: 0 } } });
  let world = model.initialState;
  assert.strictEqual(model.validateCommand(world, spawn, {}), true);
  world = model.applyCommand(world, spawn, { tick: 7, nowMs: 100 });
  assert.strictEqual(world.tick, 7);
  assert.strictEqual(world.timeMs, 100);
  assert.ok(model.selectSnapshot(world, { clientId: 'alice' }).entities['player:alice']);
}

console.log('frontier game smoke passed');
