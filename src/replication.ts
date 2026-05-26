import type {
  GameComponentMap,
  GameComponentName,
  GameEntity,
  GameReplicationOptions,
  GameVisibility,
  GameWorld
} from './types.js';

export function createReplicationView<
  TComponents extends GameComponentMap,
  TPlayerMetadata,
  TResources
>(
  world: GameWorld<TComponents, TPlayerMetadata, TResources>,
  options: GameReplicationOptions<TComponents, TPlayerMetadata, TResources> = {}
): GameWorld<TComponents, TPlayerMetadata, TResources> {
  const entities: Record<string, GameEntity<TComponents>> = {};
  const entityIds = options.entityIds ? new Set(options.entityIds) : null;
  for (const entity of Object.values(world.entities)) {
    if (entityIds && !entityIds.has(entity.id)) continue;
    if (!isEntityVisible(entity, world, options)) continue;
    entities[entity.id] = filterEntityComponents(entity, options);
  }
  return {
    ...world,
    entities,
    players: filterPlayers(world, options)
  };
}

export function isEntityVisible<
  TComponents extends GameComponentMap,
  TPlayerMetadata,
  TResources
>(
  entity: GameEntity<TComponents>,
  world: GameWorld<TComponents, TPlayerMetadata, TResources>,
  options: GameReplicationOptions<TComponents, TPlayerMetadata, TResources> = {}
): boolean {
  if (options.canSeeEntity) return options.canSeeEntity(entity, world, options);
  if (options.includePrivate) return matchesTags(entity, options);
  if (options.playerId && entity.ownerId === options.playerId) return matchesTags(entity, options);
  const visibility = entity.components.visibility as GameVisibility | undefined;
  if (visibility?.public === true) return matchesTags(entity, options);
  if (options.playerId && visibility?.players?.includes(options.playerId)) return matchesTags(entity, options);
  return !entity.tags?.includes('private') && matchesTags(entity, options);
}

export function filterEntityComponents<TComponents extends GameComponentMap>(
  entity: GameEntity<TComponents>,
  options: Pick<GameReplicationOptions<TComponents, unknown, unknown>, 'includeComponents' | 'excludeComponents'> = {}
): GameEntity<TComponents> {
  const include = options.includeComponents ? new Set(options.includeComponents) : null;
  const exclude = options.excludeComponents ? new Set(options.excludeComponents) : null;
  if (!include && !exclude) return entity;
  const components: GameComponentMap = {};
  for (const [name, value] of Object.entries(entity.components)) {
    if (include && !include.has(name as GameComponentName)) continue;
    if (exclude?.has(name as GameComponentName)) continue;
    components[name] = value;
  }
  return { ...entity, components: components as TComponents };
}

function filterPlayers<TComponents extends GameComponentMap, TPlayerMetadata, TResources>(
  world: GameWorld<TComponents, TPlayerMetadata, TResources>,
  options: GameReplicationOptions<TComponents, TPlayerMetadata, TResources>
): GameWorld<TComponents, TPlayerMetadata, TResources>['players'] {
  if (!options.playerId) return world.players;
  const player = world.players[options.playerId];
  return player ? { [options.playerId]: player } : {};
}

function matchesTags<TComponents extends GameComponentMap>(
  entity: GameEntity<TComponents>,
  options: Pick<GameReplicationOptions<TComponents, unknown, unknown>, 'includeTags'>
): boolean {
  if (!options.includeTags || options.includeTags.length === 0) return true;
  const tags = new Set(entity.tags ?? []);
  return options.includeTags.some((tag) => tags.has(tag));
}
