import type {
  GameComponentMap,
  GameComponentName,
  GameComponentValue,
  GameEntity,
  GameEntityId,
  GamePlayer,
  GamePlayerId,
  GameTag,
  GameWorld,
  GameWorldInput,
  SpawnEntityOptions
} from './types.js';

export function createGameWorld<
  TComponents extends GameComponentMap = GameComponentMap,
  TPlayerMetadata = unknown,
  TResources = Record<string, unknown>
>(input: GameWorldInput<TComponents, TPlayerMetadata, TResources> = {}): GameWorld<TComponents, TPlayerMetadata, TResources> {
  return {
    tick: input.tick ?? 0,
    timeMs: input.timeMs,
    entities: { ...(input.entities ?? {}) },
    players: { ...(input.players ?? {}) },
    resources: input.resources
  };
}

export function spawnEntity<TWorld extends GameWorld<GameComponentMap, unknown, unknown>>(
  world: TWorld,
  options: SpawnEntityOptions
): TWorld {
  if (!isNonEmptyString(options.id)) throw new TypeError('entity id must be a non-empty string');
  const existing = world.entities[options.id];
  const entity: GameEntity = {
    id: options.id,
    components: { ...(existing?.components ?? {}), ...(options.components ?? {}) },
    ownerId: options.ownerId ?? existing?.ownerId,
    tags: options.tags ?? existing?.tags,
    prefab: options.prefab ?? existing?.prefab,
    revision: (existing?.revision ?? 0) + 1
  };
  return withEntity(world, entity);
}

export function despawnEntity<TWorld extends GameWorld<GameComponentMap, unknown, unknown>>(world: TWorld, entityId: GameEntityId): TWorld {
  if (!world.entities[entityId]) return world;
  const entities = { ...world.entities };
  delete entities[entityId];
  return { ...world, entities } as TWorld;
}

export function setComponent<TWorld extends GameWorld<GameComponentMap, unknown, unknown>>(
  world: TWorld,
  entityId: GameEntityId,
  component: GameComponentName,
  value: GameComponentValue
): TWorld {
  const entity = requireEntity(world, entityId);
  return withEntity(world, {
    ...entity,
    components: { ...entity.components, [component]: value },
    revision: (entity.revision ?? 0) + 1
  });
}

export function mergeComponent<TWorld extends GameWorld<GameComponentMap, unknown, unknown>>(
  world: TWorld,
  entityId: GameEntityId,
  component: GameComponentName,
  value: Record<string, unknown>
): TWorld {
  const entity = requireEntity(world, entityId);
  const current = entity.components[component];
  const merged = isRecord(current) ? { ...current, ...value } : { ...value };
  return setComponent(world, entityId, component, merged);
}

export function removeComponent<TWorld extends GameWorld<GameComponentMap, unknown, unknown>>(
  world: TWorld,
  entityId: GameEntityId,
  component: GameComponentName
): TWorld {
  const entity = requireEntity(world, entityId);
  if (!(component in entity.components)) return world;
  const components = { ...entity.components };
  delete components[component];
  return withEntity(world, { ...entity, components, revision: (entity.revision ?? 0) + 1 });
}

export function setEntityOwner<TWorld extends GameWorld<GameComponentMap, unknown, unknown>>(
  world: TWorld,
  entityId: GameEntityId,
  ownerId?: GamePlayerId
): TWorld {
  const entity = requireEntity(world, entityId);
  return withEntity(world, { ...entity, ownerId, revision: (entity.revision ?? 0) + 1 });
}

export function upsertPlayer<TWorld extends GameWorld<GameComponentMap, unknown, unknown>>(world: TWorld, player: GamePlayer): TWorld {
  if (!isNonEmptyString(player.id)) throw new TypeError('player id must be a non-empty string');
  return {
    ...world,
    players: {
      ...world.players,
      [player.id]: { ...world.players[player.id], ...player }
    }
  } as TWorld;
}

export function removePlayer<TWorld extends GameWorld<GameComponentMap, unknown, unknown>>(world: TWorld, playerId: GamePlayerId): TWorld {
  if (!world.players[playerId]) return world;
  const players = { ...world.players };
  delete players[playerId];
  return { ...world, players } as TWorld;
}

export function advanceWorldTick<TWorld extends GameWorld<GameComponentMap, unknown, unknown>>(world: TWorld, tick: number, timeMs?: number): TWorld {
  return { ...world, tick, timeMs } as TWorld;
}

export function hasTag(entity: GameEntity, tag: GameTag): boolean {
  return entity.tags?.includes(tag) ?? false;
}

export function getComponent<TValue = unknown>(
  world: GameWorld<GameComponentMap, unknown, unknown>,
  entityId: GameEntityId,
  component: GameComponentName
): TValue | undefined {
  return world.entities[entityId]?.components[component] as TValue | undefined;
}

function withEntity<TWorld extends GameWorld<GameComponentMap, unknown, unknown>>(world: TWorld, entity: GameEntity): TWorld {
  return {
    ...world,
    entities: {
      ...world.entities,
      [entity.id]: entity
    }
  } as TWorld;
}

function requireEntity(world: GameWorld<GameComponentMap, unknown, unknown>, entityId: GameEntityId): GameEntity {
  const entity = world.entities[entityId];
  if (!entity) throw new RangeError('unknown entity: ' + entityId);
  return entity;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0;
}
