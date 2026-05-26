import type { RealtimeTick, RealtimeTimestampMs } from '@shapeshift-labs/frontier-realtime';
import {
  GAME_COMMAND_DESPAWN,
  GAME_COMMAND_MERGE_COMPONENT,
  GAME_COMMAND_REMOVE_COMPONENT,
  GAME_COMMAND_REMOVE_PLAYER,
  GAME_COMMAND_SET_COMPONENT,
  GAME_COMMAND_SET_OWNER,
  GAME_COMMAND_SET_PLAYER,
  GAME_COMMAND_SPAWN
} from './commands.js';
import { createReplicationView } from './replication.js';
import type {
  GameCommand,
  GameComponentMap,
  GameDespawnPayload,
  GameMergeComponentPayload,
  GameRemoveComponentPayload,
  GameRemovePlayerPayload,
  GameRoomModel,
  GameRoomModelOptions,
  GameSetComponentPayload,
  GameSetOwnerPayload,
  GameSetPlayerPayload,
  GameSpawnPayload,
  GameWorld
} from './types.js';
import {
  advanceWorldTick,
  createGameWorld,
  despawnEntity,
  mergeComponent,
  removeComponent,
  removePlayer,
  setComponent,
  setEntityOwner,
  spawnEntity,
  upsertPlayer
} from './world.js';

export function applyGameCommand<
  TComponents extends GameComponentMap = GameComponentMap,
  TPlayerMetadata = unknown,
  TResources = unknown
>(
  world: GameWorld<TComponents, TPlayerMetadata, TResources>,
  command: GameCommand
): GameWorld<TComponents, TPlayerMetadata, TResources> {
  switch (command.type) {
    case GAME_COMMAND_SPAWN: {
      const payload = command.payload as GameSpawnPayload;
      return spawnEntity(world, {
        id: payload.entityId,
        components: payload.components,
        ownerId: payload.ownerId,
        tags: payload.tags,
        prefab: payload.prefab
      });
    }
    case GAME_COMMAND_DESPAWN:
      return despawnEntity(world, (command.payload as GameDespawnPayload).entityId);
    case GAME_COMMAND_SET_COMPONENT: {
      const payload = command.payload as GameSetComponentPayload;
      return setComponent(world, payload.entityId, payload.component, payload.value);
    }
    case GAME_COMMAND_MERGE_COMPONENT: {
      const payload = command.payload as GameMergeComponentPayload;
      return mergeComponent(world, payload.entityId, payload.component, payload.value);
    }
    case GAME_COMMAND_REMOVE_COMPONENT: {
      const payload = command.payload as GameRemoveComponentPayload;
      return removeComponent(world, payload.entityId, payload.component);
    }
    case GAME_COMMAND_SET_OWNER: {
      const payload = command.payload as GameSetOwnerPayload;
      return setEntityOwner(world, payload.entityId, payload.ownerId);
    }
    case GAME_COMMAND_SET_PLAYER:
      return upsertPlayer(world, command.payload as GameSetPlayerPayload);
    case GAME_COMMAND_REMOVE_PLAYER:
      return removePlayer(world, (command.payload as GameRemovePlayerPayload).playerId);
    default:
      return world;
  }
}

export function validateGameCommand<
  TComponents extends GameComponentMap = GameComponentMap,
  TPlayerMetadata = unknown,
  TResources = unknown
>(
  world: GameWorld<TComponents, TPlayerMetadata, TResources>,
  command: GameCommand,
  allowUnknownPlayers = false
): true | string {
  if (!command.type.startsWith('game/')) return true;
  if (!allowUnknownPlayers && !world.players[command.clientId]) return 'unknown player';
  const payload = command.payload as Record<string, unknown>;
  if ('entityId' in payload && typeof payload.entityId === 'string') {
    if (command.type !== GAME_COMMAND_SPAWN && !world.entities[payload.entityId]) return 'unknown entity';
    const entity = world.entities[payload.entityId];
    if (entity?.ownerId && entity.ownerId !== command.clientId && command.type !== GAME_COMMAND_SET_PLAYER) return 'not entity owner';
  }
  return true;
}

export function createGameRoomModel<
  TComponents extends GameComponentMap = GameComponentMap,
  TPlayerMetadata = unknown,
  TResources = Record<string, unknown>
>(
  options: GameRoomModelOptions<TComponents, TPlayerMetadata, TResources> = {}
): GameRoomModel<TComponents, TPlayerMetadata, TResources> {
  const initialState = createGameWorld(options.initialWorld);
  return {
    initialState,
    applyCommand(state, command, context) {
      const next = applyGameCommand(state, command) as GameWorld<TComponents, TPlayerMetadata, TResources>;
      const tick = readContextNumber(context, 'tick', next.tick);
      const nowMs = readContextNumber(context, 'nowMs', next.timeMs);
      return advanceWorldTick(next, tick as RealtimeTick, nowMs as RealtimeTimestampMs | undefined);
    },
    validateCommand(state, command, context) {
      const base = validateGameCommand(state, command, options.allowUnknownPlayers ?? false);
      if (base !== true) return base;
      const authorized = options.authorizeCommand?.(state, command, context) ?? true;
      return authorized === true ? true : authorized || 'unauthorized';
    },
    selectSnapshot(state, context) {
      return createReplicationView(state, {
        ...options.replication,
        playerId: context.clientId ?? options.replication?.playerId
      }) as GameWorld<TComponents, TPlayerMetadata, TResources>;
    }
  };
}

function readContextNumber(context: unknown, key: 'tick' | 'nowMs', fallback: number | undefined): number | undefined {
  if (typeof context === 'object' && context !== null && key in context) {
    const value = (context as Record<string, unknown>)[key];
    if (typeof value === 'number' && Number.isFinite(value)) return value;
  }
  return fallback;
}
