import type { RealtimeSnapshot, RealtimeTick } from '@shapeshift-labs/frontier-realtime';
import type {
  GameComponentMap,
  GameEntity,
  GameEntityId,
  GameWorld
} from './types.js';

export interface GameLagBuffer<TWorld extends GameWorld<GameComponentMap, unknown, unknown> = GameWorld<GameComponentMap, unknown, unknown>> {
  readonly capacity: number;
  readonly snapshots: readonly RealtimeSnapshot<TWorld>[];
  push(snapshot: RealtimeSnapshot<TWorld>): void;
  atOrBefore(tick: RealtimeTick): RealtimeSnapshot<TWorld> | null;
  entityAt(entityId: GameEntityId, tick: RealtimeTick): GameEntity | null;
  clear(): void;
}

export function createGameLagBuffer<TWorld extends GameWorld<GameComponentMap, unknown, unknown> = GameWorld<GameComponentMap, unknown, unknown>>(
  capacity = 128
): GameLagBuffer<TWorld> {
  if (!Number.isSafeInteger(capacity) || capacity < 1) throw new TypeError('capacity must be a positive safe integer');
  let snapshots: RealtimeSnapshot<TWorld>[] = [];
  return {
    capacity,
    get snapshots() {
      return snapshots;
    },
    push(snapshot) {
      snapshots = insertSnapshot(snapshots, snapshot, capacity);
    },
    atOrBefore(tick) {
      const index = findAtOrBefore(snapshots, tick);
      return index < 0 ? null : snapshots[index];
    },
    entityAt(entityId, tick) {
      return this.atOrBefore(tick)?.state.entities[entityId] ?? null;
    },
    clear() {
      snapshots = [];
    }
  };
}

export function queryLagCompensatedEntity<TWorld extends GameWorld<GameComponentMap, unknown, unknown>>(
  snapshots: readonly RealtimeSnapshot<TWorld>[],
  entityId: GameEntityId,
  tick: RealtimeTick
): GameEntity | null {
  const index = findAtOrBefore(snapshots, tick);
  return index < 0 ? null : snapshots[index].state.entities[entityId] ?? null;
}

function insertSnapshot<TWorld extends GameWorld<GameComponentMap, unknown, unknown>>(
  snapshots: readonly RealtimeSnapshot<TWorld>[],
  snapshot: RealtimeSnapshot<TWorld>,
  capacity: number
): RealtimeSnapshot<TWorld>[] {
  const next = snapshots.slice();
  const exact = next.findIndex((entry) => entry.tick === snapshot.tick);
  if (exact >= 0) next[exact] = snapshot;
  else {
    const at = findAtOrBefore(next, snapshot.tick);
    next.splice(at + 1, 0, snapshot);
  }
  if (next.length > capacity) next.splice(0, next.length - capacity);
  return next;
}

function findAtOrBefore<TWorld extends GameWorld<GameComponentMap, unknown, unknown>>(
  snapshots: readonly RealtimeSnapshot<TWorld>[],
  tick: RealtimeTick
): number {
  let low = 0;
  let high = snapshots.length - 1;
  let found = -1;
  while (low <= high) {
    const mid = (low + high) >>> 1;
    if (snapshots[mid].tick <= tick) {
      found = mid;
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }
  return found;
}
