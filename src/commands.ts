import { createCommandSource } from '@shapeshift-labs/frontier-realtime';
import type {
  GameCommand,
  GameCommandSource,
  GameCommandSourceOptions,
  GameDespawnPayload,
  GameMergeComponentPayload,
  GameRemoveComponentPayload,
  GameRemovePlayerPayload,
  GameSetComponentPayload,
  GameSetOwnerPayload,
  GameSetPlayerPayload,
  GameSpawnPayload,
  SpawnEntityOptions
} from './types.js';

export const GAME_COMMAND_SPAWN = 'game/spawn';
export const GAME_COMMAND_DESPAWN = 'game/despawn';
export const GAME_COMMAND_SET_COMPONENT = 'game/set-component';
export const GAME_COMMAND_MERGE_COMPONENT = 'game/merge-component';
export const GAME_COMMAND_REMOVE_COMPONENT = 'game/remove-component';
export const GAME_COMMAND_SET_OWNER = 'game/set-owner';
export const GAME_COMMAND_SET_PLAYER = 'game/set-player';
export const GAME_COMMAND_REMOVE_PLAYER = 'game/remove-player';

export function createGameCommandSource(options: GameCommandSourceOptions): GameCommandSource {
  const source = createCommandSource({ clientId: options.clientId, now: options.now });
  const room = (roomId?: string) => roomId ?? options.roomId;
  return {
    get clientId() {
      return source.clientId;
    },
    get nextSeq() {
      return source.nextSeq;
    },
    spawn(spawn, roomId) {
      return source.create(GAME_COMMAND_SPAWN, {
        entityId: spawn.id,
        components: spawn.components,
        ownerId: spawn.ownerId,
        tags: spawn.tags,
        prefab: spawn.prefab
      }, { roomId: room(roomId) });
    },
    despawn(entityId, roomId) {
      return source.create(GAME_COMMAND_DESPAWN, { entityId }, { roomId: room(roomId) });
    },
    setComponent(entityId, component, value, roomId) {
      return source.create(GAME_COMMAND_SET_COMPONENT, { entityId, component, value }, { roomId: room(roomId) });
    },
    mergeComponent(entityId, component, value, roomId) {
      return source.create(GAME_COMMAND_MERGE_COMPONENT, { entityId, component, value }, { roomId: room(roomId) });
    },
    removeComponent(entityId, component, roomId) {
      return source.create(GAME_COMMAND_REMOVE_COMPONENT, { entityId, component }, { roomId: room(roomId) });
    },
    setOwner(entityId, ownerId, roomId) {
      return source.create(GAME_COMMAND_SET_OWNER, { entityId, ownerId }, { roomId: room(roomId) });
    },
    setPlayer(player, roomId) {
      return source.create(GAME_COMMAND_SET_PLAYER, player, { roomId: room(roomId) });
    },
    removePlayer(playerId, roomId) {
      return source.create(GAME_COMMAND_REMOVE_PLAYER, { playerId }, { roomId: room(roomId) });
    }
  };
}

export function isGameCommand(command: GameCommand): boolean {
  return command.type.startsWith('game/');
}

export type {
  GameCommand,
  GameDespawnPayload,
  GameMergeComponentPayload,
  GameRemoveComponentPayload,
  GameRemovePlayerPayload,
  GameSetComponentPayload,
  GameSetOwnerPayload,
  GameSetPlayerPayload,
  GameSpawnPayload,
  SpawnEntityOptions
};
