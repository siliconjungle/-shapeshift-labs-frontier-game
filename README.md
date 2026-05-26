# Frontier Game

Game-facing entity, component, player, replication, and command helpers for Frontier realtime.

This package sits above [`@shapeshift-labs/frontier-realtime`](https://www.npmjs.com/package/@shapeshift-labs/frontier-realtime). It provides a small JSON-shaped world model and command vocabulary for multiplayer games without owning rendering, physics, editor UI, persistence, WebSocket transport, or authoritative server loops.

- npm: [`@shapeshift-labs/frontier-game`](https://www.npmjs.com/package/@shapeshift-labs/frontier-game)
- source: [`siliconjungle/-shapeshift-labs-frontier-game`](https://github.com/siliconjungle/-shapeshift-labs-frontier-game)
- license: MIT

## Related Packages

- [`@shapeshift-labs/frontier-realtime`](https://www.npmjs.com/package/@shapeshift-labs/frontier-realtime): shared command, tick, snapshot, prediction, reconciliation, interpolation, and message contracts used by this package.
- [`@shapeshift-labs/frontier-realtime-server`](https://www.npmjs.com/package/@shapeshift-labs/frontier-realtime-server): authoritative room runtime that can use `createGameRoomModel()`.
- [`@shapeshift-labs/frontier-realtime-websocket`](https://www.npmjs.com/package/@shapeshift-labs/frontier-realtime-websocket): WebSocket transport for realtime rooms.
- [`@shapeshift-labs/frontier-state`](https://www.npmjs.com/package/@shapeshift-labs/frontier-state): patch-routed app-state projections for game/editor tooling.
- [`@shapeshift-labs/frontier-event-log`](https://www.npmjs.com/package/@shapeshift-labs/frontier-event-log): bounded event logs for durable command/snapshot replay.

## Install

```sh
npm install @shapeshift-labs/frontier-realtime @shapeshift-labs/frontier-game
```

## Usage

```ts
import {
  createGameCommandSource,
  createGameRoomModel,
  createGameWorld
} from '@shapeshift-labs/frontier-game';

const model = createGameRoomModel({
  initialWorld: createGameWorld({
    players: {
      alice: { id: 'alice', entityId: 'player:alice' }
    }
  })
});

const commands = createGameCommandSource({
  clientId: 'alice',
  roomId: 'arena-1'
});

let world = model.initialState;
world = model.applyCommand(world, commands.spawn({
  id: 'player:alice',
  ownerId: 'alice',
  components: {
    position: { x: 0, y: 0 },
    velocity: { x: 1, y: 0 }
  },
  tags: ['player']
}), { tick: 1, nowMs: 50 });
```

## API

```ts
import {
  applyGameCommand,
  createGameCommandSource,
  createGameRoomModel,
  createGameWorld,
  createReplicationView,
  spawnEntity,
  setComponent,
  type GameWorld
} from '@shapeshift-labs/frontier-game';
```

### World Helpers

`createGameWorld()` creates a JSON-shaped world with `entities`, `players`, optional `resources`, and a realtime `tick`.

Entities contain component records, owner ids, optional tags, prefab labels, and revisions. Helpers return new world objects:

```ts
world = spawnEntity(world, {
  id: 'crate:1',
  components: { position: { x: 4, y: 2 }, loot: { coins: 3 } },
  tags: ['pickup']
});

world = setComponent(world, 'crate:1', 'opened', true);
```

### Game Commands

`createGameCommandSource()` wraps Frontier realtime command sequencing with game-specific helpers:

- `game/spawn`
- `game/despawn`
- `game/set-component`
- `game/merge-component`
- `game/remove-component`
- `game/set-owner`
- `game/set-player`
- `game/remove-player`

`applyGameCommand(world, command)` applies those command types to a world.

### Replication

`createReplicationView(world, options)` filters entities and components for a player or transport edge. By default, private tagged entities are hidden unless owned by the player or made visible through a `visibility` component.

```ts
const playerView = createReplicationView(world, {
  playerId: 'alice',
  excludeComponents: ['serverOnly']
});
```

### Spatial, Physics, Lag, and ECS Helpers

The base package stays a JSON-shaped game vocabulary, while heavier game-engine helpers live behind subpaths:

- `./spatial`: grid-backed radius/bounds queries and spatial replication views for interest management.
- `./physics`: deterministic 2D position/velocity integration helpers.
- `./lag`: bounded snapshot buffers and entity rewind queries for lag-compensated checks.
- `./ecs`: component/owner/tag indexes over the normal `GameWorld` shape.
- `./query`: optional `frontier-query` selectors for component predicates.
- `./rollback`: deterministic fixed-frame game-world rollback runner over `frontier-realtime/rollback`.

### Room Model

`createGameRoomModel()` returns structural `initialState`, `applyCommand`, `validateCommand`, and `selectSnapshot` functions that can be passed to `@shapeshift-labs/frontier-realtime-server`.

```ts
import { createRealtimeRoom } from '@shapeshift-labs/frontier-realtime-server';

const game = createGameRoomModel();
const room = createRealtimeRoom({
  roomId: 'arena-1',
  initialState: game.initialState,
  applyCommand: game.applyCommand,
  validateCommand: game.validateCommand,
  selectSnapshot: game.selectSnapshot
});
```

## Subpath Imports

```ts
import { createGameCommandSource } from '@shapeshift-labs/frontier-game/commands';
import { createGameEcsIndex } from '@shapeshift-labs/frontier-game/ecs';
import { createGameLagBuffer } from '@shapeshift-labs/frontier-game/lag';
import { stepGamePhysics } from '@shapeshift-labs/frontier-game/physics';
import { selectGameEntitiesByQuery } from '@shapeshift-labs/frontier-game/query';
import { createReplicationView } from '@shapeshift-labs/frontier-game/replication';
import { createGameRoomModel } from '@shapeshift-labs/frontier-game/room';
import { createGameRollbackRunner } from '@shapeshift-labs/frontier-game/rollback';
import { createSpatialIndex } from '@shapeshift-labs/frontier-game/spatial';
import { createGameWorld } from '@shapeshift-labs/frontier-game/world';
```

## Package Scope

This package intentionally owns only game-facing state vocabulary:

- Entity, component, player, tag, owner, and world helpers.
- Game command helpers over Frontier realtime commands.
- Basic replication filtering.
- Room-model reducer/validator/snapshot helpers.
- Optional spatial, physics, lag-compensation, ECS-index, and query-selector helpers behind subpaths.
- Optional rollback runner for deterministic fixed-frame resimulation of game worlds.

It does not own rendering, a full physics engine, editor bindings, durable persistence, WebSocket transport, authoritative server loops, or anti-cheat policy beyond command validation hooks.

## TypeScript

The package ships ESM JavaScript plus `.d.ts` declarations for the root export and public subpaths.

## Validation

```sh
npm test
npm run fuzz
npm run bench
npm run pack:dry
```

The package test suite covers root and subpath imports, world helpers, command creation/application, ownership validation, replication filtering, room-model snapshots, TypeScript declarations, randomized command replay, and package export boundaries.

## Benchmarks

Run the package-local benchmark:

```sh
npm run bench
```

Latest local package benchmark on Node v26.1.0, darwin arm64, 9 rounds:

| Fixture | Median | p95 |
| --- | ---: | ---: |
| Spawn 128 entities | 219.34 us | 249.58 us |
| Apply 128 component commands | 17.68 ms | 18.40 ms |
| Replication view, 1k entities | 309.56 us | 316.86 us |
| Room model apply/select | 2.49 ms | 2.71 ms |

These are Frontier-only package measurements, not competitor comparisons.

## License

MIT. See [LICENSE](./LICENSE).
