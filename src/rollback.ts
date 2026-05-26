import {
  createRollbackInputSource,
  createRollbackSession,
  type RollbackAdvanceResult,
  type RollbackCorrectionResult,
  type RollbackFrameInputs,
  type RollbackInput,
  type RollbackInputEquals,
  type RollbackInputPredictor,
  type RollbackInputSource,
  type RollbackInputSourceOptions,
  type RollbackSession,
  type RollbackStepContext
} from '@shapeshift-labs/frontier-realtime/rollback';
import type {
  GameComponentMap,
  GameWorld
} from './types.js';
import {
  stepGamePhysics,
  type GamePhysicsOptions
} from './physics.js';

export type GameRollbackInput<TPayload = unknown> = RollbackInput<TPayload>;

export type GameRollbackSystem<
  TWorld extends GameWorld<GameComponentMap, unknown, unknown>,
  TInput = unknown,
  TEffect = unknown
> = (
  world: TWorld,
  inputs: RollbackFrameInputs<TInput>,
  context: RollbackStepContext<TEffect>
) => TWorld;

export interface GameRollbackRunnerOptions<
  TWorld extends GameWorld<GameComponentMap, unknown, unknown>,
  TInput = unknown,
  TEffect = unknown
> {
  readonly initialWorld: TWorld;
  readonly players: readonly string[];
  readonly systems?: readonly GameRollbackSystem<TWorld, TInput, TEffect>[];
  readonly stepWorld?: GameRollbackSystem<TWorld, TInput, TEffect>;
  readonly initialFrame?: number;
  readonly inputDelay?: number;
  readonly checkpointInterval?: number;
  readonly maxRollbackFrames?: number;
  readonly maxPredictionFrames?: number;
  readonly cloneWorld?: (world: TWorld) => TWorld;
  readonly checksum?: (world: TWorld) => string | number;
  readonly predictInput?: RollbackInputPredictor<TInput>;
  readonly inputEquals?: RollbackInputEquals<TInput>;
}

export interface GameRollbackRunner<
  TWorld extends GameWorld<GameComponentMap, unknown, unknown>,
  TInput = unknown,
  TEffect = unknown
> {
  readonly session: RollbackSession<TWorld, TInput, TEffect>;
  readonly world: TWorld;
  readonly frame: number;
  readonly confirmedFrame: number;
  readonly predictedFrames: readonly number[];
  createInputSource(options: RollbackInputSourceOptions): RollbackInputSource<TInput>;
  addLocalInput(input: TInput, currentFrame?: number): RollbackInput<TInput>;
  addRemoteInput(input: RollbackInput<TInput>): RollbackCorrectionResult<TWorld, TInput>;
  advance(count?: number): RollbackAdvanceResult<TWorld, TInput, TEffect>[];
}

export function createGameRollbackRunner<
  TWorld extends GameWorld<GameComponentMap, unknown, unknown>,
  TInput = unknown,
  TEffect = unknown
>(
  options: GameRollbackRunnerOptions<TWorld, TInput, TEffect>
): GameRollbackRunner<TWorld, TInput, TEffect> {
  const systems = options.systems ?? [];
  const cloneWorld = options.cloneWorld ?? cloneGameWorld;
  const session = createRollbackSession<TWorld, TInput, TEffect>({
    initialState: options.initialWorld,
    players: options.players,
    initialFrame: options.initialFrame,
    inputDelay: options.inputDelay,
    checkpointInterval: options.checkpointInterval,
    maxRollbackFrames: options.maxRollbackFrames,
    maxPredictionFrames: options.maxPredictionFrames,
    cloneState: cloneWorld,
    checksum: options.checksum,
    predictInput: options.predictInput,
    inputEquals: options.inputEquals,
    stepFrame(world, inputs, context) {
      let next = options.stepWorld ? options.stepWorld(world, inputs, context) : world;
      for (const system of systems) next = system(next, inputs, context);
      return next;
    }
  });

  return {
    session,
    get world() {
      return session.state;
    },
    get frame() {
      return session.frame;
    },
    get confirmedFrame() {
      return session.confirmedFrame;
    },
    get predictedFrames() {
      return session.predictedFrames;
    },
    createInputSource(sourceOptions) {
      return createRollbackInputSource<TInput>(sourceOptions);
    },
    addLocalInput(input, currentFrame) {
      return session.addLocalInput(input, currentFrame);
    },
    addRemoteInput(input) {
      return session.addRemoteInput(input);
    },
    advance(count) {
      return session.advance(count);
    }
  };
}

export function createGameRollbackPhysicsSystem<
  TWorld extends GameWorld<GameComponentMap, unknown, unknown>,
  TInput = unknown,
  TEffect = unknown
>(
  options: GamePhysicsOptions
): GameRollbackSystem<TWorld, TInput, TEffect> {
  return (world) => stepGamePhysics(world, options);
}

function cloneGameWorld<TWorld extends GameWorld<GameComponentMap, unknown, unknown>>(world: TWorld): TWorld {
  const structuredCloneFn = (globalThis as { structuredClone?: <TValue>(value: TValue) => TValue }).structuredClone;
  if (structuredCloneFn) return structuredCloneFn(world);
  return JSON.parse(JSON.stringify(world)) as TWorld;
}
