import {
  createGameCommandSource,
  createGameRoomModel,
  createGameWorld,
  createReplicationView,
  spawnEntity,
  type GameCommand,
  type GameWorld
} from '../dist/index.js';
import { createGameCommandSource as createGameCommandSourceSubpath } from '../dist/commands.js';
import { createReplicationView as createReplicationViewSubpath } from '../dist/replication.js';
import { createGameRoomModel as createGameRoomModelSubpath } from '../dist/room.js';
import { createGameWorld as createGameWorldSubpath } from '../dist/world.js';

const world: GameWorld = createGameWorld();
const world2 = createGameWorldSubpath();
const next = spawnEntity(world, {
  id: 'entity:1',
  components: { position: { x: 0, y: 0 } }
});
createReplicationView(next, { includeComponents: ['position'] });
createReplicationViewSubpath(world2);

const source = createGameCommandSource({ clientId: 'player:1' });
const source2 = createGameCommandSourceSubpath({ clientId: 'player:2' });
const command: GameCommand = source.setComponent('entity:1', 'position', { x: 1 });
source2.removePlayer('player:2');

const model = createGameRoomModel();
const model2 = createGameRoomModelSubpath();
model.applyCommand(model.initialState, command, {});
model2.selectSnapshot(model2.initialState, {});
