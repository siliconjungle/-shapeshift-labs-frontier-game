# Frontier Game

Game-facing entity, component, player, replication, and command helpers for Frontier realtime.

This package sits above [`@shapeshift-labs/frontier-realtime`](https://www.npmjs.com/package/@shapeshift-labs/frontier-realtime). It provides a small JSON-shaped world model and command vocabulary for multiplayer games without owning rendering, physics, editor UI, persistence, WebSocket transport, or authoritative server loops.

- npm: [`@shapeshift-labs/frontier-game`](https://www.npmjs.com/package/@shapeshift-labs/frontier-game)
- source: [`siliconjungle/-shapeshift-labs-frontier-game`](https://github.com/siliconjungle/-shapeshift-labs-frontier-game)
- license: MIT

## Related Packages

The published Frontier package family is generated from one shared package catalog so READMEs stay in sync across packages:

- [`@shapeshift-labs/frontier`](https://www.npmjs.com/package/@shapeshift-labs/frontier): Core JSON diff/apply, compact patch tuples, JSON Pointer, equality, clone, validation, Unicode helpers.
- [`@shapeshift-labs/frontier-query`](https://www.npmjs.com/package/@shapeshift-labs/frontier-query): Shared query-key, selector path, condition, entity identity, and table-shape primitives.
- [`@shapeshift-labs/frontier-codec`](https://www.npmjs.com/package/@shapeshift-labs/frontier-codec): Patch serialization, binary frames, canonical JSON, and patch-history codecs.
- [`@shapeshift-labs/frontier-engine`](https://www.npmjs.com/package/@shapeshift-labs/frontier-engine): Stateful planned diff engine, adaptive profiles, schema plans, and engine-level history helpers.
- [`@shapeshift-labs/frontier-state`](https://www.npmjs.com/package/@shapeshift-labs/frontier-state): Patch-routed app-state subscriptions, owned commits, maintained views, and path mapping.
- [`@shapeshift-labs/frontier-state-cache`](https://www.npmjs.com/package/@shapeshift-labs/frontier-state-cache): Normalized query-result cache with entity/query watchers, persistence, change logs, optimistic layers, and mutation bridge.
- [`@shapeshift-labs/frontier-state-cache-idb`](https://www.npmjs.com/package/@shapeshift-labs/frontier-state-cache-idb): IndexedDB persistence adapter for Frontier state-cache snapshots.
- [`@shapeshift-labs/frontier-state-cache-file`](https://www.npmjs.com/package/@shapeshift-labs/frontier-state-cache-file): Structured file persistence adapter for Frontier state-cache snapshots and change logs.
- [`@shapeshift-labs/frontier-state-cache-sql`](https://www.npmjs.com/package/@shapeshift-labs/frontier-state-cache-sql): SQL persistence adapter for Frontier state-cache snapshots and change logs.
- [`@shapeshift-labs/frontier-schema`](https://www.npmjs.com/package/@shapeshift-labs/frontier-schema): JSON Schema validation, Frontier profile generation, CloudEvent envelopes, and query/table schema helpers.
- [`@shapeshift-labs/frontier-event-log`](https://www.npmjs.com/package/@shapeshift-labs/frontier-event-log): Bounded event logs, replay cursors, consumer acknowledgements, keyed compaction, checkpoints, and Frontier patch event records.
- [`@shapeshift-labs/frontier-logging`](https://www.npmjs.com/package/@shapeshift-labs/frontier-logging): Opt-in structured logging, browser telemetry, file sinks, exporters, benchmark traces, and Frontier patch/update summaries.
- [`@shapeshift-labs/frontier-mutation`](https://www.npmjs.com/package/@shapeshift-labs/frontier-mutation): Explicit mutation and selector plans compiled to Frontier patches or CRDT operations.
- [`@shapeshift-labs/frontier-crdt`](https://www.npmjs.com/package/@shapeshift-labs/frontier-crdt): Native CRDT documents, update tooling, awareness, branches, conflict introspection, version frames, and undo.
- [`@shapeshift-labs/frontier-crdt-sync`](https://www.npmjs.com/package/@shapeshift-labs/frontier-crdt-sync): CRDT sync endpoints, repo/storage/provider contracts, document URLs, local networks, model checking, forensics, and text binding contracts.
- [`@shapeshift-labs/frontier-crdt-websocket`](https://www.npmjs.com/package/@shapeshift-labs/frontier-crdt-websocket): WebSocket client/server transports for Frontier CRDT sync providers.
- [`@shapeshift-labs/frontier-react`](https://www.npmjs.com/package/@shapeshift-labs/frontier-react): React external-store hooks and adapters for Frontier state, cache, and CRDT surfaces.
- [`@shapeshift-labs/frontier-richtext`](https://www.npmjs.com/package/@shapeshift-labs/frontier-richtext): Rich text Delta normalization/application, marks, embeds, ranges, and cursor/selection transforms for local editor integrations.
- [`@shapeshift-labs/frontier-realtime`](https://www.npmjs.com/package/@shapeshift-labs/frontier-realtime): Shared realtime command, tick, snapshot, prediction, reconciliation, interpolation, rollback, message, and delta primitives.
- [`@shapeshift-labs/frontier-realtime-server`](https://www.npmjs.com/package/@shapeshift-labs/frontier-realtime-server): Authoritative realtime room, tick, command validation, rate-limit, session, and snapshot-history runtime.
- [`@shapeshift-labs/frontier-realtime-websocket`](https://www.npmjs.com/package/@shapeshift-labs/frontier-realtime-websocket): WebSocket client, wire, and Node room-server transport for Frontier realtime.

Package source repositories:

- [`siliconjungle/-shapeshift-labs-frontier`](https://github.com/siliconjungle/-shapeshift-labs-frontier)
- [`siliconjungle/-shapeshift-labs-frontier-query`](https://github.com/siliconjungle/-shapeshift-labs-frontier-query)
- [`siliconjungle/-shapeshift-labs-frontier-codec`](https://github.com/siliconjungle/-shapeshift-labs-frontier-codec)
- [`siliconjungle/-shapeshift-labs-frontier-engine`](https://github.com/siliconjungle/-shapeshift-labs-frontier-engine)
- [`siliconjungle/-shapeshift-labs-frontier-state`](https://github.com/siliconjungle/-shapeshift-labs-frontier-state)
- [`siliconjungle/-shapeshift-labs-frontier-state-cache`](https://github.com/siliconjungle/-shapeshift-labs-frontier-state-cache)
- [`siliconjungle/-shapeshift-labs-frontier-state-cache-idb`](https://github.com/siliconjungle/-shapeshift-labs-frontier-state-cache-idb)
- [`siliconjungle/-shapeshift-labs-frontier-state-cache-file`](https://github.com/siliconjungle/-shapeshift-labs-frontier-state-cache-file)
- [`siliconjungle/-shapeshift-labs-frontier-state-cache-sql`](https://github.com/siliconjungle/-shapeshift-labs-frontier-state-cache-sql)
- [`siliconjungle/-shapeshift-labs-frontier-schema`](https://github.com/siliconjungle/-shapeshift-labs-frontier-schema)
- [`siliconjungle/-shapeshift-labs-frontier-event-log`](https://github.com/siliconjungle/-shapeshift-labs-frontier-event-log)
- [`siliconjungle/-shapeshift-labs-frontier-logging`](https://github.com/siliconjungle/-shapeshift-labs-frontier-logging)
- [`siliconjungle/-shapeshift-labs-frontier-mutation`](https://github.com/siliconjungle/-shapeshift-labs-frontier-mutation)
- [`siliconjungle/-shapeshift-labs-frontier-crdt`](https://github.com/siliconjungle/-shapeshift-labs-frontier-crdt)
- [`siliconjungle/-shapeshift-labs-frontier-crdt-sync`](https://github.com/siliconjungle/-shapeshift-labs-frontier-crdt-sync)
- [`siliconjungle/-shapeshift-labs-frontier-crdt-websocket`](https://github.com/siliconjungle/-shapeshift-labs-frontier-crdt-websocket)
- [`siliconjungle/-shapeshift-labs-frontier-react`](https://github.com/siliconjungle/-shapeshift-labs-frontier-react)
- [`siliconjungle/-shapeshift-labs-frontier-richtext`](https://github.com/siliconjungle/-shapeshift-labs-frontier-richtext)
- [`siliconjungle/-shapeshift-labs-frontier-realtime`](https://github.com/siliconjungle/-shapeshift-labs-frontier-realtime)
- [`siliconjungle/-shapeshift-labs-frontier-realtime-server`](https://github.com/siliconjungle/-shapeshift-labs-frontier-realtime-server)
- [`siliconjungle/-shapeshift-labs-frontier-realtime-websocket`](https://github.com/siliconjungle/-shapeshift-labs-frontier-realtime-websocket)
- [`siliconjungle/-shapeshift-labs-frontier-game`](https://github.com/siliconjungle/-shapeshift-labs-frontier-game)

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
