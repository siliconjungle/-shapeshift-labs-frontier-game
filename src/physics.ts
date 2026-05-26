import type {
  GameComponentMap,
  GameWorld
} from './types.js';
import { setComponent } from './world.js';

export interface GamePhysicsOptions {
  readonly dtMs: number;
  readonly positionComponent?: string;
  readonly velocityComponent?: string;
  readonly accelerationComponent?: string;
  readonly damping?: number;
}

export interface GameVector2 {
  readonly x: number;
  readonly y: number;
}

export function stepGamePhysics<TWorld extends GameWorld<GameComponentMap, unknown, unknown>>(
  world: TWorld,
  options: GamePhysicsOptions
): TWorld {
  const dt = Math.max(0, options.dtMs) / 1000;
  const positionName = options.positionComponent ?? 'position';
  const velocityName = options.velocityComponent ?? 'velocity';
  const accelerationName = options.accelerationComponent ?? 'acceleration';
  const damping = options.damping ?? 1;
  let next = world;

  for (const entity of Object.values(world.entities)) {
    const position = readVector(entity.components[positionName]);
    const velocity = readVector(entity.components[velocityName]);
    if (!position || !velocity) continue;
    const acceleration = readVector(entity.components[accelerationName]) ?? { x: 0, y: 0 };
    const nextVelocity = {
      x: (velocity.x + acceleration.x * dt) * damping,
      y: (velocity.y + acceleration.y * dt) * damping
    };
    const nextPosition = {
      x: position.x + nextVelocity.x * dt,
      y: position.y + nextVelocity.y * dt
    };
    next = setComponent(next, entity.id, velocityName, nextVelocity);
    next = setComponent(next, entity.id, positionName, nextPosition);
  }

  return next;
}

function readVector(value: unknown): GameVector2 | null {
  if (typeof value !== 'object' || value === null) return null;
  const record = value as { x?: unknown; y?: unknown };
  return typeof record.x === 'number' && typeof record.y === 'number' ? { x: record.x, y: record.y } : null;
}
