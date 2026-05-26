import type {
  GameComponentMap,
  GameEntity,
  GameEntityId,
  GameReplicationOptions,
  GameWorld
} from './types.js';
import { createReplicationView } from './replication.js';

export interface GamePoint {
  readonly x: number;
  readonly y: number;
}

export interface GameBounds {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export interface GameSpatialIndex<TComponents extends GameComponentMap = GameComponentMap> {
  readonly cells: ReadonlyMap<string, readonly GameEntityId[]>;
  queryBounds(bounds: GameBounds): GameEntity<TComponents>[];
  queryRadius(center: GamePoint, radius: number): GameEntity<TComponents>[];
}

export interface GameSpatialIndexOptions {
  readonly cellSize?: number;
  readonly positionComponent?: string;
  readonly boundsComponent?: string;
}

export interface GameSpatialReplicationOptions<
  TComponents extends GameComponentMap = GameComponentMap,
  TPlayerMetadata = unknown,
  TResources = unknown
> extends GameReplicationOptions<TComponents, TPlayerMetadata, TResources> {
  readonly center: GamePoint;
  readonly radius: number;
  readonly spatial?: GameSpatialIndexOptions;
}

export function createSpatialIndex<TComponents extends GameComponentMap>(
  world: GameWorld<TComponents, unknown, unknown>,
  options: GameSpatialIndexOptions = {}
): GameSpatialIndex<TComponents> {
  const cellSize = readPositive(options.cellSize, 64);
  const positionComponent = options.positionComponent ?? 'position';
  const boundsComponent = options.boundsComponent ?? 'bounds';
  const cells = new Map<string, GameEntityId[]>();

  for (const entity of Object.values(world.entities)) {
    const bounds = readEntityBounds(entity, positionComponent, boundsComponent);
    if (!bounds) continue;
    const minX = Math.floor(bounds.x / cellSize);
    const maxX = Math.floor((bounds.x + bounds.width) / cellSize);
    const minY = Math.floor(bounds.y / cellSize);
    const maxY = Math.floor((bounds.y + bounds.height) / cellSize);
    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) pushCell(cells, x, y, entity.id);
    }
  }

  return {
    cells,
    queryBounds(bounds) {
      const seen = new Set<GameEntityId>();
      const out: GameEntity<TComponents>[] = [];
      const minX = Math.floor(bounds.x / cellSize);
      const maxX = Math.floor((bounds.x + bounds.width) / cellSize);
      const minY = Math.floor(bounds.y / cellSize);
      const maxY = Math.floor((bounds.y + bounds.height) / cellSize);
      for (let y = minY; y <= maxY; y++) {
        for (let x = minX; x <= maxX; x++) {
          for (const id of cells.get(cellKey(x, y)) ?? []) {
            if (seen.has(id)) continue;
            seen.add(id);
            const entity = world.entities[id];
            const entityBounds = entity && readEntityBounds(entity, positionComponent, boundsComponent);
            if (entity && entityBounds && intersects(bounds, entityBounds)) out.push(entity);
          }
        }
      }
      return out;
    },
    queryRadius(center, radius) {
      const bounds = { x: center.x - radius, y: center.y - radius, width: radius * 2, height: radius * 2 };
      const radiusSq = radius * radius;
      return this.queryBounds(bounds).filter((entity) => {
        const point = readPoint(entity.components[positionComponent]);
        return point ? distanceSq(point, center) <= radiusSq : true;
      });
    }
  };
}

export function createSpatialReplicationView<
  TComponents extends GameComponentMap,
  TPlayerMetadata,
  TResources
>(
  world: GameWorld<TComponents, TPlayerMetadata, TResources>,
  options: GameSpatialReplicationOptions<TComponents, TPlayerMetadata, TResources>
): GameWorld<TComponents, TPlayerMetadata, TResources> {
  const spatial = createSpatialIndex(world, options.spatial);
  const visibleIds = spatial.queryRadius(options.center, options.radius).map((entity) => entity.id);
  return createReplicationView(world, { ...options, entityIds: visibleIds });
}

export function readEntityBounds<TComponents extends GameComponentMap>(
  entity: GameEntity<TComponents>,
  positionComponent = 'position',
  boundsComponent = 'bounds'
): GameBounds | null {
  const position = readPoint(entity.components[positionComponent]);
  if (!position) return null;
  const bounds = readBounds(entity.components[boundsComponent]);
  return bounds ? { x: position.x + bounds.x, y: position.y + bounds.y, width: bounds.width, height: bounds.height } : { x: position.x, y: position.y, width: 0, height: 0 };
}

function readPoint(value: unknown): GamePoint | null {
  if (!isRecord(value)) return null;
  return typeof value.x === 'number' && typeof value.y === 'number' ? { x: value.x, y: value.y } : null;
}

function readBounds(value: unknown): GameBounds | null {
  if (!isRecord(value)) return null;
  return typeof value.x === 'number' && typeof value.y === 'number' && typeof value.width === 'number' && typeof value.height === 'number'
    ? { x: value.x, y: value.y, width: value.width, height: value.height }
    : null;
}

function pushCell(cells: Map<string, GameEntityId[]>, x: number, y: number, id: GameEntityId): void {
  const key = cellKey(x, y);
  let ids = cells.get(key);
  if (!ids) {
    ids = [];
    cells.set(key, ids);
  }
  ids.push(id);
}

function cellKey(x: number, y: number): string {
  return x + ':' + y;
}

function intersects(left: GameBounds, right: GameBounds): boolean {
  return left.x <= right.x + right.width &&
    left.x + left.width >= right.x &&
    left.y <= right.y + right.height &&
    left.y + left.height >= right.y;
}

function distanceSq(left: GamePoint, right: GamePoint): number {
  const dx = left.x - right.x;
  const dy = left.y - right.y;
  return dx * dx + dy * dy;
}

function readPositive(value: number | undefined, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : fallback;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
