import type {
  GameComponentMap,
  GameComponentName,
  GameEntity,
  GameEntityId,
  GamePlayerId,
  GameTag,
  GameWorld
} from './types.js';

export interface GameEcsIndex<TComponents extends GameComponentMap = GameComponentMap> {
  readonly entities: ReadonlyMap<GameEntityId, GameEntity<TComponents>>;
  readonly byComponent: ReadonlyMap<GameComponentName, readonly GameEntityId[]>;
  readonly byOwner: ReadonlyMap<GamePlayerId, readonly GameEntityId[]>;
  readonly byTag: ReadonlyMap<GameTag, readonly GameEntityId[]>;
  withComponents(...components: GameComponentName[]): GameEntity<TComponents>[];
  ownedBy(ownerId: GamePlayerId): GameEntity<TComponents>[];
  tagged(tag: GameTag): GameEntity<TComponents>[];
}

export function createGameEcsIndex<TComponents extends GameComponentMap>(
  world: GameWorld<TComponents, unknown, unknown>
): GameEcsIndex<TComponents> {
  const entities = new Map<GameEntityId, GameEntity<TComponents>>();
  const byComponent = new Map<GameComponentName, GameEntityId[]>();
  const byOwner = new Map<GamePlayerId, GameEntityId[]>();
  const byTag = new Map<GameTag, GameEntityId[]>();

  for (const entity of Object.values(world.entities)) {
    entities.set(entity.id, entity);
    for (const component of Object.keys(entity.components)) pushIndex(byComponent, component, entity.id);
    if (entity.ownerId) pushIndex(byOwner, entity.ownerId, entity.id);
    for (const tag of entity.tags ?? []) pushIndex(byTag, tag, entity.id);
  }

  const index: GameEcsIndex<TComponents> = {
    entities,
    byComponent,
    byOwner,
    byTag,
    withComponents(...components) {
      if (components.length === 0) return Array.from(entities.values());
      const ids = smallestComponentSet(byComponent, components);
      if (!ids) return [];
      const out: GameEntity<TComponents>[] = [];
      for (const id of ids) {
        const entity = entities.get(id);
        if (entity && components.every((component) => component in entity.components)) out.push(entity);
      }
      return out;
    },
    ownedBy(ownerId) {
      return resolveIds(entities, byOwner.get(ownerId));
    },
    tagged(tag) {
      return resolveIds(entities, byTag.get(tag));
    }
  };
  return index;
}

function pushIndex(map: Map<string, string[]>, key: string, id: string): void {
  let ids = map.get(key);
  if (!ids) {
    ids = [];
    map.set(key, ids);
  }
  ids.push(id);
}

function smallestComponentSet(
  byComponent: ReadonlyMap<GameComponentName, readonly GameEntityId[]>,
  components: readonly GameComponentName[]
): readonly GameEntityId[] | null {
  let smallest: readonly GameEntityId[] | null = null;
  for (const component of components) {
    const ids = byComponent.get(component);
    if (!ids) return null;
    if (!smallest || ids.length < smallest.length) smallest = ids;
  }
  return smallest;
}

function resolveIds<TComponents extends GameComponentMap>(
  entities: ReadonlyMap<GameEntityId, GameEntity<TComponents>>,
  ids: readonly GameEntityId[] | undefined
): GameEntity<TComponents>[] {
  if (!ids) return [];
  const out: GameEntity<TComponents>[] = [];
  for (const id of ids) {
    const entity = entities.get(id);
    if (entity) out.push(entity);
  }
  return out;
}
