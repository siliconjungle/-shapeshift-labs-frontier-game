import type {
  RealtimeClientId,
  RealtimeCommand,
  RealtimeRoomId,
  RealtimeTick,
  RealtimeTimestampMs
} from '@shapeshift-labs/frontier-realtime';

export type GameEntityId = string;
export type GamePlayerId = RealtimeClientId;
export type GameComponentName = string;
export type GameTag = string;
export type GameComponentValue = unknown;
export type GameComponentMap = Record<GameComponentName, GameComponentValue>;

export interface GameEntity<TComponents extends GameComponentMap = GameComponentMap> {
  readonly id: GameEntityId;
  readonly components: TComponents;
  readonly ownerId?: GamePlayerId;
  readonly tags?: readonly GameTag[];
  readonly prefab?: string;
  readonly revision?: number;
}

export interface GamePlayer<TMetadata = unknown> {
  readonly id: GamePlayerId;
  readonly entityId?: GameEntityId;
  readonly name?: string;
  readonly connected?: boolean;
  readonly metadata?: TMetadata;
}

export interface GameWorld<
  TComponents extends GameComponentMap = GameComponentMap,
  TPlayerMetadata = unknown,
  TResources = Record<string, unknown>
> {
  readonly tick: RealtimeTick;
  readonly timeMs?: RealtimeTimestampMs;
  readonly entities: Readonly<Record<GameEntityId, GameEntity<TComponents>>>;
  readonly players: Readonly<Record<GamePlayerId, GamePlayer<TPlayerMetadata>>>;
  readonly resources?: TResources;
}

export interface GameWorldInput<
  TComponents extends GameComponentMap = GameComponentMap,
  TPlayerMetadata = unknown,
  TResources = Record<string, unknown>
> {
  readonly tick?: RealtimeTick;
  readonly timeMs?: RealtimeTimestampMs;
  readonly entities?: Readonly<Record<GameEntityId, GameEntity<TComponents>>>;
  readonly players?: Readonly<Record<GamePlayerId, GamePlayer<TPlayerMetadata>>>;
  readonly resources?: TResources;
}

export interface SpawnEntityOptions<TComponents extends GameComponentMap = GameComponentMap> {
  readonly id: GameEntityId;
  readonly components?: TComponents;
  readonly ownerId?: GamePlayerId;
  readonly tags?: readonly GameTag[];
  readonly prefab?: string;
}

export interface GameVisibility {
  readonly public?: boolean;
  readonly players?: readonly GamePlayerId[];
  readonly tags?: readonly GameTag[];
}

export type GameSpawnPayload<TComponents extends GameComponentMap = GameComponentMap> = {
  readonly entityId: GameEntityId;
  readonly components?: TComponents;
  readonly ownerId?: GamePlayerId;
  readonly tags?: readonly GameTag[];
  readonly prefab?: string;
};

export type GameDespawnPayload = {
  readonly entityId: GameEntityId;
};

export type GameSetComponentPayload = {
  readonly entityId: GameEntityId;
  readonly component: GameComponentName;
  readonly value: GameComponentValue;
};

export type GameMergeComponentPayload = {
  readonly entityId: GameEntityId;
  readonly component: GameComponentName;
  readonly value: Record<string, unknown>;
};

export type GameRemoveComponentPayload = {
  readonly entityId: GameEntityId;
  readonly component: GameComponentName;
};

export type GameSetOwnerPayload = {
  readonly entityId: GameEntityId;
  readonly ownerId?: GamePlayerId;
};

export type GameSetPlayerPayload<TMetadata = unknown> = GamePlayer<TMetadata>;

export type GameRemovePlayerPayload = {
  readonly playerId: GamePlayerId;
};

export type GameCommandPayload<TComponents extends GameComponentMap = GameComponentMap, TMetadata = unknown> =
  | GameSpawnPayload<TComponents>
  | GameDespawnPayload
  | GameSetComponentPayload
  | GameMergeComponentPayload
  | GameRemoveComponentPayload
  | GameSetOwnerPayload
  | GameSetPlayerPayload<TMetadata>
  | GameRemovePlayerPayload;

export type GameCommand<TPayload = GameCommandPayload> = RealtimeCommand<TPayload>;

export interface GameCommandSourceOptions {
  readonly clientId: GamePlayerId;
  readonly roomId?: RealtimeRoomId;
  readonly now?: () => RealtimeTimestampMs;
}

export interface GameCommandSource {
  readonly clientId: GamePlayerId;
  readonly nextSeq: number;
  spawn(options: SpawnEntityOptions, roomId?: RealtimeRoomId): GameCommand<GameSpawnPayload>;
  despawn(entityId: GameEntityId, roomId?: RealtimeRoomId): GameCommand<GameDespawnPayload>;
  setComponent(entityId: GameEntityId, component: GameComponentName, value: GameComponentValue, roomId?: RealtimeRoomId): GameCommand<GameSetComponentPayload>;
  mergeComponent(entityId: GameEntityId, component: GameComponentName, value: Record<string, unknown>, roomId?: RealtimeRoomId): GameCommand<GameMergeComponentPayload>;
  removeComponent(entityId: GameEntityId, component: GameComponentName, roomId?: RealtimeRoomId): GameCommand<GameRemoveComponentPayload>;
  setOwner(entityId: GameEntityId, ownerId?: GamePlayerId, roomId?: RealtimeRoomId): GameCommand<GameSetOwnerPayload>;
  setPlayer(player: GamePlayer, roomId?: RealtimeRoomId): GameCommand<GameSetPlayerPayload>;
  removePlayer(playerId: GamePlayerId, roomId?: RealtimeRoomId): GameCommand<GameRemovePlayerPayload>;
}

export interface GameReplicationOptions<
  TComponents extends GameComponentMap = GameComponentMap,
  TPlayerMetadata = unknown,
  TResources = Record<string, unknown>
> {
  readonly playerId?: GamePlayerId;
  readonly includePrivate?: boolean;
  readonly includeComponents?: readonly GameComponentName[];
  readonly excludeComponents?: readonly GameComponentName[];
  readonly includeTags?: readonly GameTag[];
  readonly entityIds?: readonly GameEntityId[];
  readonly canSeeEntity?: (
    entity: GameEntity<TComponents>,
    world: GameWorld<TComponents, TPlayerMetadata, TResources>,
    options: GameReplicationOptions<TComponents, TPlayerMetadata, TResources>
  ) => boolean;
}

export interface GameRoomModelOptions<
  TComponents extends GameComponentMap = GameComponentMap,
  TPlayerMetadata = unknown,
  TResources = Record<string, unknown>
> {
  readonly initialWorld?: GameWorldInput<TComponents, TPlayerMetadata, TResources>;
  readonly allowUnknownPlayers?: boolean;
  readonly authorizeCommand?: (
    world: GameWorld<TComponents, TPlayerMetadata, TResources>,
    command: GameCommand,
    context: unknown
  ) => true | false | string;
  readonly replication?: GameReplicationOptions<TComponents, TPlayerMetadata, TResources>;
}

export interface GameRoomModel<
  TComponents extends GameComponentMap = GameComponentMap,
  TPlayerMetadata = unknown,
  TResources = Record<string, unknown>
> {
  readonly initialState: GameWorld<TComponents, TPlayerMetadata, TResources>;
  applyCommand(
    state: GameWorld<TComponents, TPlayerMetadata, TResources>,
    command: GameCommand,
    context: unknown
  ): GameWorld<TComponents, TPlayerMetadata, TResources>;
  validateCommand(
    state: GameWorld<TComponents, TPlayerMetadata, TResources>,
    command: GameCommand,
    context: unknown
  ): true | string;
  selectSnapshot(
    state: GameWorld<TComponents, TPlayerMetadata, TResources>,
    context: { readonly clientId?: GamePlayerId; readonly tick?: RealtimeTick; readonly nowMs?: RealtimeTimestampMs }
  ): GameWorld<TComponents, TPlayerMetadata, TResources>;
}
