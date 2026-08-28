# START HERE

If you are picking this up in a fresh conversation, read this file and nothing
else first. It is short on purpose.

## What this is

Tiny Arcade: 18 browser games, no server, no build step, no network call at
launch. `./pack.sh` builds and validates; it refuses to pack if anything is
broken.

## Where the work is

Two driving games sharing one engine:

    road.js          9,838 lines   the shared engine
    games/sw/highway.html    750   an endless road
    games/sw/raceway.html  1,875   a circuit racer

Anything in `road.js` is in BOTH games automatically. A fork changes behaviour
by passing callbacks (`CFG.curvature`, `CFG.onStep`, `CFG.titleArt` and about
ten others); Highway passes almost none of them, which is the design.

## The other documents, in the order worth reading

    DRIVING.md    what is built and what is not, for both games. Start here
                  after this file.
    REFACTOR.md   the state of the code, what is worth changing, and what is
                  load-bearing but invisible. Read before touching road.js.
    DESIGN.md     the full decision log, newest first. 277KB \u2014 do not read it
                  end to end, search it.
    README.md     how to run, pack, and add a game. The minimum standard every
                  cabinet must meet.
    SHIPPING.md   wrapping it as a real app.

## The one thing to know before changing anything

**`pack.sh` cannot tell you the game works.** It checks that files parse, that
scripts resolve, that the catalogue matches. It has passed while shipping a
syntax error, a missing file, and two games that booted to a black screen.

**The harness now exists.** Two of them, in `tools/`, both Playwright, both
run against a local server, no game file modified:

    python3 tools/drive-test.py     boots both driving games, drives 30s with
                                    an autopilot, asserts speed, lap count,
                                    fuel, tyres, damage, HUD, page errors
    python3 tools/smoke-test.py     boots ALL 18 cabinets, asserts no errors
                                    and that the canvas actually has paint on
                                    it (a black screen has a canvas too)

Run both before shipping anything. The autopilot reads the engine through
three read-only getters added to the API surface (`playerX`, `dmg`,
`traffic`) — the comments at the definitions say why.

## Immediate next steps

    1  CORNERS THAT MATTER: drive-test measured 194mph sustained, zero
       braking, 100% on-road for 30s of Raceway. DRIVING.md calls this the
       thing that makes it a racing game or not. The harness is the
       measuring stick: it can report brake-time as a share of the lap.
    2  the END CARD: the game records qualifying, sector bests, lap times and
       grid position, then throws all of it away
    3  menus — the garage does eleven jobs on one screen
    4  curate seeded tracks: buildCircuit(league, seed) is deterministic, so
       generate thousands offline and ship a list of the good ones

## The next cabinet

**Privateer is BUILT and shipping** as an Effigy original (`games/em/privateer.html`,
19 cabinets now). It is builds 1 and 2 of PRIVATEER.md joined at the seam:
hold a ship in your rear cone, laser its engines dark, dock, walk aboard,
take the cargo, then survive the bounty hunter who comes for you. All eight builds in that document are done; what is left is depth, not scope — the locker,
stations, contracts, and §5b BEING HUNTED, which is nearly free now that
docking and boarding exist.

The two halves were prototyped separately in `proto/` and are merged as
CLOSURES, not by renaming: two 300-line prototypes sharing one global scope is
how you get a bug that only shows up in one of them.

Superseded by the above:
PRIVATEER.md specs a 19th machine: a first-person ship you fly from the
bridge, walk around, and use to board and loot other ships, with stations to
sell at and contracts to take. It is specified, not started — no entry in
games.js, no file in games/. It would be the biggest thing in the arcade and
the first that should probably be a shared engine (`void.js`) from day one.

Build the ONE CORRIDOR first. If ten seconds of shooting down a corridor on a
phone is not fun, nothing else in that document is worth writing.

## Deploying

`./sync.sh "message"` pushes to GitHub Pages and REFUSES to push a build
whose catalogue points at files missing from the staging area — dead links
were the site's chronic 404. Manual upload works but deletes nothing and
checks nothing; if you must, upload the WHOLE folder every time.

## Working style that has been paying

Measure before changing, and check the artefact rather than the source. Almost
every wrong turn in the last session came from adjusting a number by eye when
one probe would have given the answer, or from trusting a green build instead
of unzipping it and driving.
