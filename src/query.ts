import {
  matchesQueryConditions,
  type QueryCondition
} from '@shapeshift-labs/frontier-query';
import type {
  GameComponentMap,
  GameEntity,
  GameWorld
} from './types.js';

export interface GameQuerySelectorOptions {
  readonly conditions: readonly QueryCondition[];
}

export function selectGameEntitiesByQuery<TComponents extends GameComponentMap>(
  world: GameWorld<TComponents, unknown, unknown>,
  options: GameQuerySelectorOptions
): GameEntity<TComponents>[] {
  const out: GameEntity<TComponents>[] = [];
  for (const entity of Object.values(world.entities)) {
    if (matchesQueryConditions(entity.components as never, options.conditions)) out.push(entity);
  }
  return out;
}
