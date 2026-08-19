# TINY ARCADE — Design Doc & Work Queue

The plan: keep making original titles, and alongside them build a floor of
clean-room takes on the classics. Our names, our art, our sounds, our code.

This file is the checklist. Tick boxes as they land. Every entry is written to
be picked up cold, so a game can be built in one sitting without re-deciding
anything.

**Status key** — ☐ queued · ◐ in progress · ☑ shipped · ⊘ parked

---

## 1. House rules

Every machine on this floor obeys the same contract. This is what makes a new
game a drop-in rather than a project.

### The arcade contract

- Lives at `games/<id>.html`, self-contained, one file.
- `<head>` carries:
  ```html
  <meta name="arcade-title"  content="Ribbit">
  <meta name="arcade-accent" content="#5bd66c">
  <script src="../audio.js"></script>
  <script src="../arcade.js"></script>
  ```
- Root markup is `#stage` (absolute, `inset:0`) wrapping `#frame`.
- `#frame` sized from `var(--stage-h, 100dvh)`, never raw `100dvh`.
- Top safe-area padding written `var(--safe-top, env(safe-area-inset-top,0px))`.
- A `resize` listener that fully recomputes layout — `arcade.js` fires one after
  it installs the title bar.
- Opens fine on its own, with no launcher and no bar.

### Definition of done

A game is not shipped until all of these are true.

- [ ] Plays with **touch**, **keyboard**, and **gamepad**. No mode is second-class.
- [ ] Music bed on `bus:'music'`. Drones and pads too — not just sequenced notes.
- [ ] SFX on `bus:'sfx'`. Continuous voices use `hold` / `holdNoise`.
- [ ] Pause hushes it; resume restores it; mute toggles are independent.
- [ ] Audio starts on the **first gesture** with no mute-toggle dance.
- [ ] `Arcade.save` slot with a `label` for the cabinet card.
- [ ] Title screen, game-over screen, and a way back to the arcade.
- [ ] Clean console — zero errors on load, play, pause, death, restart.
- [ ] Fits 375×667, 390×844, and iPad portrait and landscape.
- [ ] Holds 60fps on a mid phone.
- [ ] Entry in `games.js`: `file, id, name, accent, genre, hook, attract`.
- [ ] **Attract animation moves the same direction the real game moves.**
      (Deep shipped scrolling backwards. Check this every time.)
- [ ] Balance sanity-checked — headless sim or a scripted bot where the genre allows.

### Naming and look

Game *rules* are not copyrightable; the *presentation* is. Tetris has won cases
against clones that kept the familiar playfield proportions, piece colours and
block styling under a different name. So for every title here:

- Our name, our palette, our typography, our sound.
- No lifted sprite shapes, colour schemes, level layouts or character designs.
- Where a mechanic needs a familiar read, express it in our own visual language.
- Each game gets a distinct accent so the launcher never shows two of a colour.

### Accent register

Claimed so far, keep new ones clear of these:

| Accent | Game | | Accent | Game |
|---|---|---|---|---|
| `#4de0c8` | Deep | | `#ffd23c` | Pellet |
| `#7fd8ff` | Derelict | | `#ff4f6d` | Soviet Blocks |
| `#ff8a3d` | Highway | | `#5bd66c` | Ribbit |
| `#00e5ff` | Ricochet | | `#c3ff4a` | Phalanx |
| `#b06cff` | Swarm | | `#ff6b2c` | Girder |
| `#ff3b5c` | Aegis | | `#7cf5a0` | Coil |
| `#ff9ecd` | Popshot | | `#e0a458` | Burrow |
| `#ffb347` | Ziggurat | | `#cfd8e3` | Feather |
| `#9fb4ff` | Shards | | `#8cff6a` | Myriapod |
| `#ff2d95` | The Well | | `#ff5d3a` | Grid Riot |
| `#f2c14e` | Lance | | `#ff7a45` | Fuse |
| `#ffe066` | Southpaw | | `#4ec9d6` | Plumb |
| `#a8e10c` | Tilt | | `#c99bff` | Horde |

---

## 2. Shared engine backlog

Things several games need. Build them **when the first game that needs one
arrives**, not before — but design them for the second and third.

- [ ] **`Arcade.gesture`** — swipe / flick recognition with direction and
      velocity. Needed by Pellet, Ribbit, Coil, Soviet Blocks.
- [ ] **`Arcade.grid`** — tile map helper: draw, collide, A* pathfind.
      Needed by Pellet, Fuse, Horde. Derelict has a private version worth lifting.
- [ ] **`Arcade.fx`** — particle burst / float-text helper. Every game has
      re-implemented this; consolidate on the third repeat.
- [ ] **`Arcade.scores`** — local top-ten table with initials entry, and a
      shared results screen. Very arcade, and it makes the save layer earn its keep.
- [ ] **`Arcade.haptics`** — `navigator.vibrate` with a no-op fallback.
- [ ] **`Arcade.sticks`** — on-screen twin-stick overlay. Grid Riot needs it;
      Shards may want it.
- [ ] **`Arcade.tilt`** — device orientation, including the iOS
      `requestPermission()` gesture dance. Only Tilt needs it, and Tilt is held
      for last, so this is the final piece of engine work.
- [ ] **Landscape support** in `arcade.js` — a few of these want a wide board.
      Currently the shell assumes portrait.
- [ ] **Attract-loop kit** — the launcher's cabinet animations are hand-written
      per game. A tiny shared helper would stop them drifting out of sync with
      their games.

---

## 3. The queue

### Tier 1 — drops straight into the cabinet

Portrait, one thumb, no new engine work beyond the shared backlog.

---

#### 01 · PELLET — *maze chase*
**Status:** ☑ shipped **Size:** L **Accent:** `#ffd23c`

**The idea.** Four hunters, and the only thing that makes them prey is a
resource you have four of.

**Controls.** Swipe or drag a direction; input is *buffered* so a turn taken
slightly early still registers at the junction. D-pad / left stick / arrows.

**Build**
- [ ] Tall maze, roughly 19×23, hand-authored not generated — a good maze is a
      designed object. Side tunnels that wrap.
- [ ] Movement locked to corridors, cornering that forgives an early input.
- [x] Four hunters with genuinely different target rules: one chases your tile,
      one aims where you're heading, one pincers with the first, and one
      **guards the power pellets** rather than chasing at all. The classic
      "loses its nerve up close" rule is tuned for a 28-wide maze; at 15 wide
      the scared radius covers the board and it just looks broken.
      Two rules keep guarding fair: it stands *beside* the pellet rather than
      on it, and it rotates its post every twelve seconds or so. A guard that
      camps the tile denies the resource outright, which is a lock, not a
      threat — the same trap applies to any future guard behaviour.
- [ ] Scatter / hunt phase timer — they periodically break off, which is what
      gives the maze its rhythm.
- [ ] Power pellet → vulnerable phase, escalating chain score, flashing warning
      before it ends.
- [ ] Bonus item appearing mid-maze at two dot thresholds.
- [ ] Death animation, life counter, level advance with tighter timings.

**Audio.** Bed: a rising interval loop that ratchets up a semitone per level.
The classic "siren" idea, ours. SFX: dot bite (alternating two-note), pellet
power (descending arpeggio), hunter eaten (rising sweep), death (long fall).

**Save.** `{best, label:'BEST 12,400', level}`

**Look.** Shipped as **blueprint**: pale cyan maze lines on dark drafting
paper. The specific things kept clear of the original, because the first build
drifted straight back into them:
- player is a **drafting nib**, not a disc with a chomping mouth
- hunters have **no faces** — a survey tick on the leading edge carries heading
- frightened is **voided**: hollow, dashed, drained. Not blue.
- eaten is a **dashed wireframe** being redrawn. Not a pair of eyes.
- power marks are **survey stations** on the mid-flanks, not fat dots in the
  four corners
- cleared squares **ink in**, so the sheet fills up as you survey it rather
  than emptying out

**Watch out.** The hunter AI *is* the game. Budget most of the time there.
Uniform-random hunters feel terrible; the personalities are the point.

---

#### 02 · SOVIET BLOCKS — *stacker*
**Status:** ☐ **Size:** M **Accent:** `#ff4f6d`

**The idea.** Your name, and it's the right one.

**Controls.** Drag left/right to move, tap to rotate, swipe down to soft drop,
flick down to hard drop, swipe up to hold. Keys: arrows + Z/X + space + C.
Pad: d-pad, A/B rotate, LB hold, RT hard drop.

**Build**
- [ ] Seven-bag randomiser — never the drought of a pure random bag.
- [ ] Rotation system with wall kicks. Without kicks it feels broken.
- [ ] Ghost piece, hold slot, next-three preview.
- [ ] Lock delay with a move-reset cap, so you can slide a piece home.
- [ ] Line clear scoring with back-to-back and combo bonuses.
- [ ] Gravity curve by level; level up per ten lines.
- [ ] Top-out detection and a proper game-over stack fill.

**Audio.** Bed: a driving minor folk-ish loop in 4/4 that adds voices as the
level climbs — do **not** use the actual folk tune everyone expects. SFX:
move tick, rotate, soft lock, hard drop thud, line clear (pitch by lines
cleared), tetris fanfare, top-out collapse.

**Save.** `{best, lines, label:'BEST 88,200'}`

**Look.** This is the one with real legal history. **No** familiar piece
colours, no 10×20 well proportions, no glossy bevelled blocks. Proposal:
**riveted steel plate** — pieces are single-colour stamped metal with a bolt in
each cell, well is 8 wide and deep, palette rust/oxide/gunmetal on concrete.

**Watch out.** Feel is everything and it lives in the details: lock delay,
kick tables, input repeat rate. Budget a tuning pass as long as the build.

---

#### 03 · RIBBIT — *lane crosser*
**Status:** ☐ **Size:** S **Accent:** `#5bd66c`

**The idea.** Two halves that fail in opposite ways — the road kills you if you
touch anything, the river kills you if you touch nothing.

**Controls.** Swipe in a direction = one hop. Tap ahead = hop forward.
Arrows / d-pad.

**Build**
- [ ] Grid of lanes; hop is a discrete animated step, not free movement.
- [ ] Road lanes: vehicles of different widths and speeds, alternating direction.
- [ ] River lanes: floating platforms, some that submerge on a timer, some that
      carry you off the edge if you ride too far.
- [ ] Five home slots at the top; filling all five clears the level.
- [ ] Per-life timer, bonus for time remaining.
- [ ] Occupied-slot collision, drowning, squash — three distinct deaths.

**Audio.** Bed: bright pentatonic hop-along, sparse, gets a percussion layer per
level. SFX: hop (short pitch-up blip), splash, squash, home (chime), timer
warning, level clear jingle.

**Save.** `{best, label:'BEST 9,340'}`

**Look.** Not a green frog on grey asphalt. Proposal: **night storm drain** —
you're something small and pale crossing a wet road under sodium lights, then a
culvert. Reflections on the road surface.

**Watch out.** Riding a platform to the screen edge must kill you, or the river
half has no tension.

---

#### 04 · RICOCHET — *paddle breaker*
**Status:** ☐ **Size:** S **Accent:** `#00e5ff`

**The idea.** The ball's angle is a function of *where* on the paddle it lands,
which quietly turns a reflex game into an aiming game.

**Controls.** Drag anywhere to slide the paddle (relative drag, so the thumb
never covers it). Arrows / left stick. Tap or A to launch.

**Build**
- [ ] Paddle with positional English; ball speed steps up over rally length.
- [ ] Brick grid with multi-hit bricks and a few indestructible ones.
- [ ] Power-ups that fall and must be caught: widen, multiball, sticky catch,
      slow, laser. Catching a bad one is a real risk — include one.
- [ ] Ten-plus hand-authored layouts, then procedural beyond.
- [ ] Ball-stuck detection with a nudge, or a horizontal rally can loop forever.

**Audio.** Bed: minimal pulse that adds layers as bricks clear, so the room
empties out audibly. SFX: paddle hit (pitch by position), brick (pitch by row),
wall, power-up chime, ball lost.

**Save.** `{best, level, label:'BEST 21,900'}`

**Look.** Not rainbow rows. Proposal: **oscilloscope** — phosphor green vector
lines on black, bricks as hollow rectangles that flare and decay when hit,
paddle a bright segment, subtle beam persistence trail.

**Watch out.** The slow, steep, near-horizontal ball is the classic frustration.
Clamp the angle away from horizontal on every bounce.

---

#### 05 · PHALANX — *ranked shooter*
**Status:** ☐ **Size:** S **Accent:** `#c3ff4a`

**The idea.** The formation speeds up as you thin it, so killing them is what
makes them dangerous. One shot on screen at a time — every trigger pull is a
decision.

**Controls.** Drag to move, tap to fire. Arrows + space. Stick + A.

**Build**
- [ ] 5×11 formation, step-march with the sideways-then-down cadence.
- [ ] Speed scales inversely with survivors; the last one is frantic.
- [ ] **One player shot in flight at a time.** Non-negotiable, it's the design.
- [ ] Shields that erode pixel-blockwise from both sides.
- [ ] Bonus craft crossing the top on a timer.
- [ ] Formation reaching the shield line = game over.

**Audio.** Bed: the four-note descending march, ours, accelerating with the
formation — the tempo *is* the difficulty readout. SFX: fire, hit, player death,
bonus craft warble, shield chip.

**Save.** `{best, wave, label:'BEST 14,700'}`

**Look.** Not green pixel aliens. Proposal: **x-ray plate** — white silhouettes
on a grey-black wash, forms that read as unpleasant marine life, faint bone
structure visible inside them.

---

#### 06 · SWARM — *formation dive shooter*
**Status:** ☐ **Size:** M **Accent:** `#b06cff`

**The idea.** They arrive along paths, sit in ranks, then peel off and come at
you individually. And one of them can steal your ship — which you can steal back
for double the firepower.

**Controls.** Drag to move, tap or hold to fire. Arrows + space. Stick + A/RT.

**Build**
- [ ] Entry patterns — bezier or spline flights into formation slots.
- [ ] Formation breathing, then timed dive runs along curved paths.
- [ ] Capture beam: lose a life, ship held above; destroy the captor to get it
      back and fly doubled — wider guns, wider hitbox. The trade is the hook.
- [ ] Bonus stage: a wave that never shoots, scored on hit percentage.
- [ ] Two-shot limit and a hit-rate stat on the results screen.

**Audio.** Bed: arpeggiated, urgent, with a distinct capture motif. SFX: fire,
enemy hit, dive whoosh, tractor beam (rising shimmer), rescue fanfare.

**Save.** `{best, hitRate, label:'BEST 46,100'}`

**Look.** Not insects. Proposal: **origami** — folded paper craft, flat colour,
crease lines, they unfold as they die.

**Watch out.** Path authoring is the bulk of the work. Build a tiny path editor
or define them mathematically from the start.

---

#### 07 · GIRDER — *climb and dodge*
**Status:** ☐ **Size:** M **Accent:** `#ff6b2c`

**The idea.** Everything the antagonist throws obeys gravity and slopes, so the
hazards are readable and the route is a puzzle.

**Controls.** Drag left/right to run, tap to jump, drag up on a ladder to climb.
Arrows + space. D-pad + A.

**Build**
- [ ] Sloped girders, ladders, gaps. Platform collision that handles slopes.
- [ ] Barrels that roll downhill, choose ladders sometimes, and speed with slope.
- [ ] Jump arc with a fixed shape — jumping is committal, not steerable.
- [ ] Hammer power-up: temporary, destroys hazards, disables climbing.
- [ ] Three or four distinct stage layouts that cycle with rising speed.
- [ ] Bonus timer that drains and pays out on completion.

**Audio.** Bed: short looping stage themes, one per layout, plus a "hurry" tempo
lift when the timer gets low. SFX: jump, land, climb step, barrel roll (looping,
panned by position), hammer swings, stage clear.

**Save.** `{best, stage, label:'BEST 32,400'}`

**Look.** Not a construction-site ape. Proposal: **scaffolded cathedral** —
you're a small figure climbing restoration scaffolding, the antagonist is a
gargoyle throwing masonry. Stone, rust, tarpaulin.

---

#### 08 · AEGIS — *point defence*
**Status:** ☐ **Size:** S **Accent:** `#ff3b5c`

**The idea.** You cannot win. You can only be slow to lose, and the game is
honest about that at the end.

**Controls.** Tap where you want the interceptor to burst — the natural touch
game on this list. Cursor + click, or stick + A.

**Build**
- [ ] Three batteries with separate ammo; nearest-battery auto-select.
- [ ] Interceptors travel to the tapped point *then* detonate — leading the
      target is the skill.
- [ ] Expanding blast spheres that destroy anything entering them, chaining.
- [ ] Six cities; incoming splits mid-flight at higher waves.
- [ ] Smart bombs that dodge nearby blasts; bomber and satellite craft.
- [ ] Wave bonus for unused ammo and surviving cities.
- [ ] Ending: when the last city falls, everything stops and the screen says so.

**Audio.** Bed: slow dread pulse, tempo rising with the number of tracks in
flight — so a busy sky *sounds* busy. SFX: launch, blast bloom, incoming
whistle, city loss (heavy, low), the final one long and terminal.

**Save.** `{best, wave, label:'BEST 51,200'}`

**Look.** Not vector cities on black. Proposal: **weather radar** — everything
is a returned signal, sweeping phosphor, cities as clustered light, incoming as
tracked contacts with faint prediction lines.

---

#### 09 · COIL — *snake*
**Status:** ☐ **Size:** S **Accent:** `#7cf5a0`

**The idea.** Winning is the losing condition. The better you do, the less room
you have.

**Controls.** Swipe. Arrows / d-pad. Buffer one queued turn so fast double-turns
around a corner work.

**Build**
- [ ] Grid, discrete steps on a tick, speed rising with length.
- [ ] Self and wall collision; reversal blocked.
- [ ] Food, plus an occasional timed bonus worth a chunk that spawns awkwardly.
- [ ] Optional obstacle layouts unlocked by score.
- [ ] Tail flash so you can see where the end is about to leave.

**Audio.** Bed: sparse tick-based pulse that quantises to the movement tick, so
music and motion lock together and speed up as one. SFX: eat (rising by length),
turn (soft tick), death (sharp cut then silence).

**Save.** `{best, length, label:'BEST 214'}`

**Look.** Not a green snake on black. Proposal: **fibre optic** — a light pulse
travelling a dark bundle, head bright, body a fading glow, food as junction nodes.

---

#### 10 · POPSHOT — *aim and match*
**Status:** ☐ **Size:** M **Accent:** `#ff9ecd`

**The idea.** Match-three where the wall comes down to meet you and bank shots
are the expert move.

**Controls.** Drag to aim with a dotted trajectory including wall bounces,
release to fire. Stick to aim, A to fire.

**Build**
- [ ] Hex-offset grid, snap-to-nearest attachment.
- [ ] Aim line with reflection preview off the side walls.
- [ ] Flood-fill match of three or more, then **orphan detection** — anything no
      longer connected to the ceiling drops, and that's where the big scores are.
- [ ] Ceiling descends every N shots; a shot counter warning.
- [ ] Colour set shrinking to only what remains on the board.
- [ ] Level layouts plus endless mode.

**Audio.** Bed: light, bouncy, in a major key — the one cheerful machine on the
floor. SFX: shoot, stick, pop (pitch rising through a chain), drop cascade,
ceiling descent clunk, level clear.

**Save.** `{best, level, label:'BEST 74,300'}`

**Look.** Not glossy coloured bubbles. Proposal: **soap and light** — thin-film
iridescent spheres, colour from interference rather than fill, they burst into
droplets.

---

#### 11 · BURROW — *dig and pop*
**Status:** ☐ **Size:** M **Accent:** `#e0a458`

**The idea.** You author the terrain by moving through it, which means you're
building your own escape routes and your own traps.

**Controls.** Drag a direction to dig. Arrows, tap-and-hold to pump. D-pad + A.

**Build**
- [ ] Destructible soil with distinct strata; tunnels are permanent and shape
      everything after.
- [ ] Pump mechanic: hold to inflate, release lets it deflate — commitment under
      pressure, and interruptible.
- [ ] Two enemy types: one that follows tunnels, one that can pass through soil
      when frustrated. The second is what stops turtling.
- [ ] Rocks that fall when undermined, crushing anything below, worth more.
- [ ] Score bonus for depth of the kill.

**Audio.** Bed: a walking loop that only plays *while you are moving* — silence
when you stop is the signature, and it makes the game feel alive. SFX: dig
scrape, pump (rising per stage), pop, rock rumble and impact, ghosting hum.

**Save.** `{best, depth, label:'BEST 38,600'}`

**Look.** Not a cartoon digger. Proposal: **archaeological section** — a
cutaway of stratified earth, you're a surveyor's drill, the things down there are
rendered like specimen illustrations.

---

#### 12 · ZIGGURAT — *isometric hopper*
**Status:** ☐ **Size:** M **Accent:** `#ffb347`

**The idea.** Diagonal-only movement on an isometric pyramid, which makes your
own controls the primary obstacle. Lean into it.

**Controls.** Swipe diagonally — four directions only. Rotate the d-pad 45° so
the mapping is honest. Show a small control diagram on the title screen.

**Build**
- [ ] Isometric pyramid, 7 rows, correct draw order.
- [ ] Tile state flipping on landing; some levels need two visits per tile.
- [ ] Falling off the edge as a real, frequent death.
- [ ] Enemies: one that bounces down the pyramid, one that chases, one that
      reverts tiles behind you.
- [ ] Escape discs at the edges that lift you back to the top.
- [ ] Level complete when every tile is flipped.

**Audio.** Bed: odd-meter, slightly wrong-footed — 7/8, matching how the controls
feel. SFX: hop (two-tone), land, tile flip (pitch by progress), fall (long
descending), disc lift, curse-word bubble on death (gibberish, ours).

**Save.** `{best, level, label:'BEST 26,800'}`

**Look.** Not orange cubes. Proposal: **paper model** — folded card ziggurat with
visible tabs and creases, tiles flipping like turned pages.

**Watch out.** Isometric input mapping is where players bounce off. Consider a
brief on-screen hint the first few times they move.

---

#### 13 · FEATHER — *lander*
**Status:** ☐ **Size:** S **Accent:** `#cfd8e3`

**The idea.** A game about arriving slowly. Everything else is fuel arithmetic.

**Controls.** Left/right screen halves for rotation, bottom-centre or a second
finger for thrust. Arrows + up. Stick + RT.

**Build**
- [ ] Newtonian thrust, rotation, constant gravity, no drag.
- [ ] Procedural terrain with flat pads at score multipliers — smaller pad, more
      points.
- [ ] Landing check on vertical speed, horizontal speed, *and* attitude. Fail any
      and it's a crash.
- [ ] Fuel as the real clock; a fuel bonus carried into the next site.
- [ ] Camera zoom on final approach — the moment that sells the whole game.
- [ ] Crash debris and a slow-motion beat before the screen resets.

**Audio.** Bed: near-ambient, a slow pad and a distant beacon ping; goes almost
silent on approach. SFX: thruster (continuous `hold`, pitch/level by throttle),
low-fuel alarm, touchdown (soft double thump), crash, pad bonus chime.

**Save.** `{best, landings, label:'BEST 4,120'}`

**Look.** Not white vector lines. Proposal: **instrument glass** — the terrain
drawn as a radar altimeter profile with overlaid HUD figures, the craft a
schematic. All information, barely any scenery.

---

### Tier 2 — need a control rethink for touch

---

#### 14 · SHARDS — *inertia shooter*
**Status:** ☐ **Size:** M **Accent:** `#9fb4ff`

**The idea.** Momentum you cannot cancel. Every shot fired is a course you're
now committed to.

**Controls.** The problem to solve. Proposal: **drag to aim and thrust** — drag
from the ship, direction sets heading, distance sets throttle, release to stop
thrusting; tap anywhere to fire. Keys keep classic rotate/thrust. Pad: left stick
aims, RT thrusts, A fires.
- [ ] Prototype the touch scheme *first*; if it isn't fun in ten minutes, park it.

**Build**
- [ ] Screen wrap for everything, including bullets.
- [ ] Rocks splitting large → medium → small, each faster.
- [ ] Hyperspace: escape that might kill you.
- [ ] Two saucer types, one that aims properly.
- [ ] Wave escalation and a thrust flame that reads as acceleration.

**Audio.** Bed: two alternating bass notes accelerating with wave count — pure
tension, no melody. SFX: thrust (continuous filtered noise), fire, rock break
(pitch by size), saucer siren, hyperspace tear.

**Save.** `{best, wave, label:'BEST 33,700'}`

**Look.** Not white outlines. Proposal: **ice** — rocks as fractured translucent
crystal that spall along fault lines, ship a dark wedge, blue-white on deep navy.

---

#### 15 · MYRIAPOD — *field shooter*
**Status:** ☐ **Size:** M **Accent:** `#8cff6a`

**The idea.** The playfield is destructible and the destruction is what makes the
enemy dangerous — mushrooms you leave up are the walls that steer the centipede
into your lap.

**Controls.** Drag to move within the bottom band, auto-fire. Trackball
originally, so drag is the honest translation. Stick + RT.

**Build**
- [ ] Centipede that splits into independent segments when shot mid-body.
- [ ] Mushroom field, damaged in stages, that redirects descent.
- [ ] Spider bouncing through the player band, worth more the closer it dies.
- [ ] Flea dropping new mushrooms straight down when the field thins.
- [ ] Scorpion poisoning mushrooms, making the centipede dive straight at you.
- [ ] Field partially regrows between waves.

**Audio.** Bed: skittering percussive loop that thickens with the number of live
segments. SFX: shot, segment hit, mushroom chip, spider bounce, poison dive
(pitch bend down), death.

**Save.** `{best, wave, label:'BEST 62,900'}`

**Look.** Not a garden. Proposal: **circuit board** — mushrooms as components,
the myriapod a fault propagating along traces, everything green-gold on dark
substrate.

---

#### 16 · THE WELL — *tube shooter*
**Status:** ☐ **Size:** M **Accent:** `#ff2d95`

**The idea.** You run the rim of a hole and everything climbs toward you.

**Controls.** Drag around the rim, tap to fire, two-finger tap for the panic
weapon. Stick + A + LB.
- [ ] Reuse the pseudo-3D projection from Highway rather than writing another.

**Build**
- [ ] A set of tube cross-sections — closed rings and open troughs.
- [ ] Enemies climbing segment by segment; one that reaches the rim and hunts
      you along it.
- [ ] Spikes left behind that kill you on the dive between levels.
- [ ] One-per-level panic weapon that clears the tube.
- [ ] The dive down the tube between levels, in control.

**Audio.** Bed: hard, metallic, tempo lifting per level; near-silence during the
dive so the arrival hits. SFX: fire (pitch by rim position), enemy destroyed,
enemy reaching the rim (alarm), panic weapon (huge descending sweep), dive rush.

**Save.** `{best, level, label:'BEST 88,400'}`

**Look.** Not neon vector. Proposal: **industrial shaft** — riveted metal
segments in perspective, enemies as machinery climbing the walls, sparks.

---

#### 17 · GRID RIOT — *twin-stick survival*
**Status:** ☐ **Size:** M **Accent:** `#ff5d3a`

**The idea.** Move and shoot in different directions, and the thing worth points
is fragile and not you.

**Controls.** Needs `Arcade.sticks` — two virtual sticks, floating, anchored
where each thumb lands. Physical pad is the ideal here; keyboard WASD + arrows.
- [ ] Landscape mode may suit this better. Requires the shell to support it.

**Build**
- [ ] Wave-based arena, everything spawning at the edges.
- [ ] Enemy types: a slow shambler, a fast seeker, a shooter, and an
      indestructible hulk that only crushes.
- [ ] Rescuable humans worth escalating points, killable by anything including you.
- [ ] Waves with authored spawn compositions, not random soup.
- [ ] Screen-edge spawn telegraphs so deaths feel fair.

**Audio.** Bed: relentless driving loop, one layer per active enemy type — the
mix tells you what's on screen. SFX: fire, enemy pop by type, human rescued
(rising chime), human lost (sour), player death.

**Save.** `{best, wave, saved, label:'BEST 121,000'}`

**Look.** Not chrome robots. Proposal: **security feed** — top-down monochrome
camera view with timecode, enemies as tracked blobs with ID boxes, humans as
green outlines that turn red.

---

#### 18 · LANCE — *flap duel*
**Status:** ☐ **Size:** M **Accent:** `#f2c14e`

**The idea.** Altitude decides collisions. Two things meet, the higher one wins,
and both of you are fighting the same terrible physics.

**Controls.** Tap to flap, drag left/right for lateral drift. A to flap, stick to
steer.

**Build**
- [ ] Flap physics: each tap an impulse, gravity constant, momentum preserved.
      Getting this feel right *is* the game.
- [ ] Platform layout with wrap-around sides.
- [ ] Enemy riders with the same physics and three aggression tiers.
- [ ] Defeated riders drop an egg — collect it or it hatches into a tougher one.
- [ ] A lava layer and something in it that grabs you if you fly too low.
- [ ] A pterodactyl-equivalent to end camping.

**Audio.** Bed: sparse, tense, mostly percussion, rising with wave. SFX: flap
(air push, pitch by velocity), joust impact (metal clash), egg drop, egg hatch,
lava grab.

**Save.** `{best, wave, label:'BEST 43,500'}`

**Look.** Not knights on ostriches. Proposal: **deep sea** — you ride something
finned in a black trench, "flapping" is a swim stroke, the lava layer is a vent.

---

### Tier 3 — bigger builds

---

#### 19 · FUSE — *grid bomber*
**Status:** ☐ **Size:** L **Accent:** `#ff7a45`

**The idea.** Your weapon is on a timer and doesn't care whose side you're on.

**Controls.** D-pad style movement — swipe or an on-screen pad — plus a bomb
button. This one may want a persistent on-screen control cluster.

**Build**
- [ ] Tile grid: solid pillars, destructible crates, open floor.
- [ ] Bombs with a fuse, cross-shaped blast, chain detonation.
- [ ] Power-ups from crates: more bombs, longer blast, kick, remote trigger.
- [ ] Enemy AI with distinct movement rules; some pass through crates late on.
- [ ] Self-damage — always.
- [ ] Level timer that spawns something unpleasant when it expires.
- [ ] Reuse the grid + pathfind helper.

**Audio.** Bed: jaunty and mechanical, tempo lift when the level timer gets low.
SFX: bomb place (clunk), fuse tick (audible, positional), blast, crate break,
power-up, enemy death, self-death (comic and sad).

**Save.** `{best, level, label:'BEST 55,000'}`

**Look.** Not cute. Proposal: **demolition site** — you're a controlled-demolition
engineer, bombs are charge packs, crates are masonry, the "enemies" are
malfunctioning site drones.

---

#### 20 · SOUTHPAW — *timing boxer*
**Status:** ☐ **Size:** L **Accent:** `#ffe066`

**The idea.** Every opponent is a pattern with a tell. The game is learning to
read, and it plays beautifully on touch because it's all timing, not dexterity.

**Controls.** Swipe left/right to dodge, down to duck, tap left/right to punch,
hold to block, tap the star meter to throw the big one.

**Build**
- [ ] Opponent behaviour trees: idle → tell → attack → recovery window.
      The tell must be readable and honest.
- [ ] Punish window on recovery — this is the whole reward loop.
- [ ] Stamina: whiffing costs you, so spamming is punished.
- [ ] Knockdown, count, and getting back up.
- [ ] Six opponents with escalating and *distinct* patterns, plus a rematch mode
      where the patterns shift.
- [ ] Big readable animation. Most of the art budget goes here.

**Audio.** Bed: crowd ambience plus a per-opponent motif; the crowd reacts to
the fight. SFX: jab, hook, block, dodge whoosh, stagger, knockdown, bell, count.

**Save.** `{best, opponent, label:'REACHED SOUTHPAW'}` — progression, not score.

**Look.** Not a boxing ring pastiche. Proposal: **wireframe sparring** — the
opponent rendered as a motion-capture skeleton with the tell highlighted in the
accent colour, so reading the tell is diegetic.

**Watch out.** The only title here that's about *learning* rather than reflex.
Needs the most animation and the most patient tuning. Worth it — it's the most
distinctive thing on the list.

---

#### 21 · PLUMB — *flow builder*
**Status:** ☐ **Size:** M **Accent:** `#4ec9d6`

**The idea.** You're always building ahead of a problem that's already moving.

**Controls.** Tap a cell to place the next piece from the queue. Tap an existing
piece to overwrite it at a cost. Cursor + A.

**Build**
- [ ] Grid, piece queue of five, no rotation — you take what you're given.
- [ ] Flow that starts on a timer and never stops.
- [ ] Distance scoring; crossover pieces; overwrite penalty.
- [ ] One-way valves and pre-placed obstacles per level.
- [ ] Level target distance, with the flow accelerating each level.

**Audio.** Bed: a ticking industrial loop, and the flow itself is audible —
a moving trickle that speeds up. SFX: place, overwrite (metal wrench), flow
enters a pipe, leak (failure), level clear.

**Save.** `{best, level, label:'BEST 18,200'}`

**Look.** Not cartoon plumbing. Proposal: **schematic** — a technical drawing on
graph paper, flow as a spreading ink stain, leaks as blots.

---

#### 22 · TILT — *gyro roller*
**Status:** ⊘ parked — held for last **Size:** L **Accent:** `#a8e10c`

**The idea.** Tilt the phone, roll the ball. The physical one. Nothing else on
the floor uses the device this way.

**Controls.** Device orientation, with a drag fallback for desktop and a stick
fallback for pad.
- [ ] iOS needs `DeviceOrientationEvent.requestPermission()` from a gesture —
      an explicit "TILT TO PLAY / ALLOW" step on the title screen.
- [ ] Calibrate to whatever angle the player is holding at start. Non-negotiable.

**Build**
- [ ] Isometric course with ramps, gaps, narrow beams.
- [ ] Rolling physics with real momentum; falling off is the main failure.
- [ ] Course timer carried between stages.
- [ ] Hazards: things that push, things that eat the ball, moving sections.
- [ ] Six courses of rising cruelty.

**Audio.** Bed: light, curious, slightly anxious; tempo tied to the timer. SFX:
roll (continuous, pitch and level by speed — the signature sound), wall knock,
fall (doppler down), goal chime, timer warning.

**Save.** `{best, course, label:'BEST COURSE 4'}`

**Look.** Not a marble on wood. Proposal: **glass and mercury** — a bead of
liquid metal on frosted glass panels lit from beneath.

**Watch out.** Highest technical risk on the list: permissions, calibration,
motion sickness, and it's unplayable on a desktop without the fallback. Build the
fallback first.

---

#### 23 · HORDE — *arena crawler*
**Status:** ⊘ parked — held for last **Size:** L **Accent:** `#c99bff`

**The idea.** Spawners, not enemies, are the problem. Kill the source or drown.

**Deliberately parked.** Derelict already owns turn-based dungeon crawling on
this floor. Revisit only with a clear separation: **real-time**, arena-shaped,
no fog, no keycards, health as a constantly draining clock you buy back with
food. If that separation doesn't hold, cut it.

**Build (if revived)**
- [ ] Real-time movement and auto-fire in the facing direction.
- [ ] Spawners that emit until destroyed.
- [ ] Health draining on a timer; food and potions on the floor.
- [ ] Four classes with genuinely different ranges and speeds.
- [ ] Keys and doors — reuse Derelict's colour-lock generator.

---

## 4. Suggested batches

Three at a time, always mixed so no two consecutive builds feel the same.

- **Batch A** — ☑ Pellet · ☐ Soviet Blocks · ☐ Ricochet
  *A chase, a stacker, a paddle game. Three different muscles, all one-thumb,
  none overlapping anything on the floor. Ships the `gesture` helper.*

- **Batch B** — ☐ Ribbit · ☐ Phalanx · ☐ Coil
  *All small. A fast batch to build momentum and prove the pipeline.*

- **Batch C** — ☐ Aegis · ☐ Feather · ☐ Popshot
  *Tap-precision, physics, and aim. Ships `Arcade.scores`.*

- **Batch D** — ☐ Swarm · ☐ Girder · ☐ Burrow
  *The three medium arcade classics. Ships `Arcade.fx`.*

- **Batch E** — ☐ Ziggurat · ☐ Myriapod · ☐ Shards
  *Awkward-controls tier. Prototype each control scheme before committing.*

- **Batch F** — ☐ The Well · ☐ Lance · ☐ Plumb
  *Reuses the pseudo-3D work; two physics games and a puzzler.*

- **Batch G** — ☐ Fuse · ☐ Southpaw
  *The two biggest. Southpaw is the flagship — give it room.*

- **Batch H** — ☐ Grid Riot
  *Needs the twin-stick overlay, and possibly landscape support in the shell.*

- **Batch I — last, by decision** — ⊘ Tilt · ⊘ Horde
  *Both parked until everything else is on the floor. Tilt carries the most
  technical risk on the list and Horde has to prove it is not just Derelict
  in real time. Revisit only when the rest is done.*

---

## 5. Original titles — ongoing

The clones are the floor. These are the reason for the arcade.

- ☑ **Deep** — one-thumb descent
- ☑ **Derelict** — turn-based ship crawler: line-of-sight pursuit, patrols, fast
  pack hunters, a twenty-piece armoury with four ammunition types, consumables,
  a gear screen, drawn sprites, and a headlamp that stops at bulkheads
- ☑ **Highway** — pseudo-3D pursuit
- ☑ **Pellet** — maze chase (first of the clone floor)
- ☐ *next original* — no brief yet. Keep a slot open in every other batch so
  the floor never becomes only clones.

Ideas parked for later:
- A tide-based puzzler where the board floods and drains on a fixed clock.
- Something using the microphone.
- A one-button rhythm game built on the existing synth engine.
- A courier game across a procedural city, scored on route choice not reflex.

---

## 6. Housekeeping

- [ ] Move Derelict's grid/pathfind code into `Arcade.grid` when Pellet needs it.
- [ ] Consolidate the three private particle systems into `Arcade.fx`.
- [ ] `games.js` grows long — consider grouping by tier in the launcher once
      there are more than about a dozen cabinets.
- [ ] Launcher: filter or search once the rack exceeds roughly fifteen machines.
- [ ] Consider a service worker so the arcade genuinely runs offline including
      fonts. Currently fonts fall back without a network.
- [ ] Per-game credits line on the game-over screen.

---

---

## 7. Derelict — combat rework (BUILT — melee, ranged, corner rule)

Nothing below is built yet. Sign it off or mark it up and it goes in.

### Resolution

    ATKR = ATK + 1d20        DEFR = DEF + 1d20
    hit if ATKR > DEFR, otherwise a miss

| roll | outcome |
|---|---|
| attacker nat 20, defender not nat 20 | damage **doubled** |
| defender nat 20, attacker not nat 20 | damage **halved** (a graze) |
| attacker nat 20 **and** defender nat 1 | **instant kill** |
| attacker nat 1 **and** defender nat 20 | full damage **reflected onto the attacker** |
| attacker nat 1 otherwise | clean miss, no damage |

Margin matters too: every 5 points of `ATKR − DEFR` above the hit adds **+1**
damage, so a big swing against something slow is worth more than a scrape past
something quick.

### Player

    ATK = 3 + level + weapon bonus
    DEF = 3 + level + plating

### Damage dice

**Melee** — costs stamina, invites a counterattack

| weapon | damage | ATK | notes |
|---|---|---|---|
| Fists | 1d4 | +0 | always available, never dropped |
| Bone Knife | 1d6 | +1 | quiet |
| Salvage Bar | 1d8 | +0 | +1d6 against PLATED |
| Shock Baton | 1d6+2 | +1 | stuns one turn |
| Bulkhead Sabre | 2d6 | +2 | |
| Tooth Saw | 3d6 | −1 | 1 fuel, cleaves everything adjacent |

**Tools** — repurposed, and it shows

| tool | damage | ATK | notes |
|---|---|---|---|
| Core Sampler | 1d6 | +0 | bleed 1d4 for 3 turns |
| Cutting Torch | 1d8 | +0 | 1 fuel, ignores plating, burn 1d6 ×2 |
| Arc Welder | 2d4 | +1 | 1 cell, stuns one turn |
| Rivet Gun | 1d6 | +1 | ranged 2 |

**Firearms** — no counterattack, but the lamp decides your reach

Every frame has a slug baseline. The other two feeds trade reach against power
in opposite directions, which is what makes carrying the right one a decision:

    laser   one die weaker  ·  +2 squares  ·  pierces plating
    plasma  one die harder  ·  −2 squares  ·  sets the target burning

For the multi-shot frames the die stays at d4 and the **shot count** steps
instead, since d4 has nothing below it.

| frame | slug | laser · +2 sq | plasma · −2 sq |
|---|---|---|---|
| Rivet Gun | 1d6 · 2 sq | — | — |
| Pistol | 1d6 · 4 sq | 1d4 · 6 sq | 1d8 · 2 sq |
| SMG | 3 × 1d4 · 4 sq | 2 × 1d4 · 6 sq | 4 × 1d4 · 2 sq |
| Shotgun | 2d6 · 3 sq | 2d4 · 5 sq | 2d8 · 2 sq |
| Rifle | 2d8 · 9 sq | 2d6 · 11 sq | 2d10 · 7 sq |
| LMG | 5 × 1d4 · 6 sq | 4 × 1d4 · 8 sq | 6 × 1d4 · 4 sq |

Optimal range floors at 2, so nothing ends up as a gun you must be standing on
top of. The **Rivet Gun is slug only** — it is a hull tool with a hopper, not a
weapons platform.

### Class traits

One per class, so the choice is never only about numbers. All of these are on
the **frame**, not the ammunition.

| class | trait | what it does |
|---|---|---|
| Rivet Gun | **SCRAP-FED** | out of slugs, it will chew cells or plasma as improvised slugs — same 1d6, no penalty. It never truly runs dry. |
| Pistol | **QUICKDRAW** | the only gun with no close-quarters penalty. Every other firearm takes **ATK −4** with a hostile adjacent; this one does not. That is why you keep it. |
| SMG | **SUPPRESSING** | each projectile that lands drops the target's ATK by 1 for its next turn. A full burst makes the thing in front of you much worse at hitting back. |
| Shotgun | **KNOCKBACK** | shoves the target one tile directly away. Into a wall, off a ledge, into fire — the placement is the weapon. |
| Rifle | **AIMED** | if you did not move on your previous turn, it ignores the range falloff entirely. Set up and it reaches eighteen squares at full accuracy. |
| LMG | **SPRAY** | splits its five shots across up to three targets in the beam, rather than dumping all of them into one. |
| Flamethrower | **FIRE** | cone, and everything it touches burns. See below. |

The adjacency penalty is new and load-bearing: it is what stops a rifle being
strictly better than everything, and it gives the pistol a permanent job as
your second slot.

### Range falloff

The listed range is the **optimal** range. You may fire out to **double** it and
no further.

    beyond optimal, up to 2× :  ATK penalty = 12 − (size of the damage die)
    beyond 2×                :  no shot

So the penalty falls straight out of the die, and big dice shoot long:

| die | d4 | d6 | d8 | d10 | d12 |
|---|---|---|---|---|---|
| **penalty past optimal** | −8 | −6 | −4 | −2 | **−0** |

Which means the feed choice moves your accuracy as well as your reach. A plasma
pistol is 1d10 at 2 squares but only −2 out to 4, so it stays usable past its
band; an SMG is −8 the moment you step outside four squares and turns into
noise. The rifle keeps −4 all the way to eighteen, where the lamp stops you long
before the barrel does.

### Incendiary

| weapon | feed | damage | optimal | max | falloff |
|---|---|---|---|---|---|
| Flamethrower | fuel | 1d6 **+ burn 1d6 × 3** | 3 sq | 6 sq | −6 |
| Charge (frag) | thrown | 3d12 centre / 1d12 splash, stuns | 4 sq | 8 sq | **−0** |
| Incendiary | thrown | 2d12 centre / 1d12 splash **+ burn 1d8 × 3** | 4 sq | 8 sq | **−0** |
| **Chem Light** | thrown | none — it is a light | 5 sq | 10 sq | −6 |

The flamethrower fires a **cone** — three tiles wide at full reach — and every
tile it sweeps catches fire for 2 turns. An incendiary sets its whole blast
radius alight for 4.

### Throwing

You are not throwing *at* a creature, you are throwing *at a tile* — nothing
dodges a grenade, it just goes off. So thrown objects roll a **placement check**
against a flat target rather than against DEF:

    ATK + 1d20  vs  10          (range falloff applies as a penalty)

Falloff uses a **heft die** in place of the damage die, because how an object
flies has nothing to do with what it does on landing. A charge is dense and
throws true; a light stick tumbles.

| thrown | heft | past-optimal penalty |
|---|---|---|
| Charge, Incendiary | d10 | −2 |
| Chem Light | d6 | −6 |

Landing odds, worked through:

| | within optimal | past optimal |
|---|---|---|
| Charge, level 1 / 5 / 10 | 75% / 95% / 100% | 65% / 85% / 100% |
| Chem Light, level 1 / 5 / 10 | 75% / 95% / 100% | **45% / 65% / 90%** |

*(This supersedes the earlier note about d12 explosives having no falloff. That
was a tidy observation but it left max range doing nothing, which was the whole
problem — a range band with no roll attached is just an arbitrary cutoff.)*

### Scatter and bounce

A failed placement check does not fizzle. The object goes somewhere:

    1d8  direction   (N NE E SE S SW W NW)
    1d4  distance    in squares

If the path meets a bulkhead it **bounces**, keeping whatever distance it had
left. Three cases:

| it hits | what happens |
|---|---|
| a wall square on | straight back the way it came |
| a wall on one side of a diagonal | mirror **only the blocked component** — NE off a wall to the east becomes NW |
| an inside corner, both sides blocked | reverse both components, straight back along the diagonal |

A diagonal that clips only the corner tile — both orthogonal neighbours open —
also reverses, because there is nothing to deflect off.

After four bounces it stops caring and drops where it is, so a grenade cannot
ping-pong forever in a one-tile pocket.

**Verified** across 4,832 throws on a test chamber with flat walls, a pillar and
an inside corner: nothing ever ended inside a bulkhead, nothing left the board,
and no step of any path clipped a wall. 37% of throws bounced at least once.

Worked examples:

    from 5,1 heading N  3 sq  ->  5,4   ceiling, straight back
    from 10,3 heading E 4 sq  ->  6,3   notch wall, straight back
    from 5,5 heading SE 4 sq  ->  1,1   clipped the pillar corner, reversed

### Chem Light

A throwable that does nothing but see for you.

- Lands where you aim; no attack roll. A bad throw just rolls a tile.
- Lights a **radius 3** patch for **12 turns**, and the light is cast **from the
  stick**, not from you — so it sees round corners you cannot.
- Chem-lit tiles count as lit for everything: you see hostiles standing in them,
  and because `inShotRange` needs a lit target, **you can shoot into the patch**.
  Throw one down a corridor and the corridor becomes a firing lane.
- It reveals terrain permanently the way your own lamp does, so it doubles as a
  scout — and scanning new sectors is what repairs you.

This is the answer to the Filament Lamp being deliberately feeble. You are not
stuck with three squares; you are stuck with three squares **unless you spend
something**. It also gives the Arc Lantern a rival rather than an obsolescence:
lantern is passive and permanent, chem lights are burst and disposable.

### Burning

**Burn N** — the target takes the burn die at the end of each of its turns for
N turns. Re-applying does not stack the duration; it refreshes it and keeps the
larger die.

**Fire tiles** — a new board state, and it needs art:

- Anything **ending its turn on a burning tile** takes 1d6 and catches burn 1.
  That includes you. Incendiaries are a positioning decision, not a free nuke.
- Fire **lights the tile**. A burning square is visible through the fog even
  outside your lamp, so an incendiary is also a flare — it shows you the room
  it is cooking. This falls out of the lamp system for free and is worth having.
- Overlay: animated flicker under the actors, amber through to red, with the
  floor plating still readable underneath. Plus a small flame glyph so it reads
  at a glance on a phone. Burning **actors** get the same glyph pinned to their
  sprite, next to the health pip.

Blind fire at a heard contact rolls at **ATK −4** and halves the dice. It
**stacks** with the falloff penalty, so a long blind shot with an SMG is ATK −12
and half damage — technically legal, practically a waste of ammunition. That is
the correct answer for spraying into the dark.

**Thrown and carried**

| item | effect |
|---|---|
| Charge | 4d6 at the centre, 2d6 to everything adjacent, stuns |
| Med-gel | heals 2d6 |
| Trauma Kit | heals 4d8, purges corrosion |

### Hostiles

Scaled by deck tier: `ATK`, `DEF` and damage dice all step up every third deck.

| species | ATK | DEF | damage | trait |
|---|---|---|---|---|
| Crawler | 1 | 1 | 1d4 | — |
| Skitter | 1 | 4 | 1d3 | fast, packs of four |
| Husk | 2 | 1 | 1d6 | strikes first |
| Spitter | 2 | 0 | 1d6 | corrodes the suit |
| Gorger | 2 | 3 | 1d8 | regenerates |
| Warden | 2 | 6 | 1d8 | plated |
| Wraith | 3 | 2 | 1d6 | drains charge |
| Shrike | 3 | 3 | 1d6 | fast, pairs |
| Stalker | 4 | 2 | 1d8 | hunts across the deck |
| Apex | 5 | 5 | 2d8 | guards the hatch |

---

## 8. Derelict — queued, in order

0. ~~**Dice combat**~~ — built. Two things had to change from the paper design:
   the **execute is now a finisher** (a nat-20 against a nat-1 only kills a
   target already under half, otherwise it is a brutal crit) because at 1-in-400
   per swing and ~240 swings a run it would have ended 45% of runs out of
   nowhere; and **damage is multiplied by calibration level**, because flat dice
   go stale against hostiles that gain HP every deck and a flat per-level bonus
   would have made every weapon converge. All of section 7 is now built: throwing with the
   flat-10 placement check and bouncing scatter, fire tiles that burn and
   light, chem lights that see round corners, the flamethrower cone, and
   incendiaries that can catch you as well.
1. **Stamina** — green bar. Melee costs stamina in proportion to its dice;
   sprinting more than six tiles in one move costs stamina. Under six tiles is
   free and shown with a pale green tint, the way the firing envelope is shown
   in red. A REST action recovers it.
2. **Two weapon slots** — primary and secondary, either kind, fists always
   available. Picking something up means dropping something, with a prompt
   showing both slots. Needs drawn art for all twenty weapons.
3. **Corner rule** — no diagonal attack, by anyone, through a blocked corner.
4. **Dice combat** — section 7 above, once signed off.
5. **Zoned levels** — a level is a chain of restricted zones: the card for the
   next zone lives inside the previous one, and the hatch is always beyond the
   final zone. No two card doors adjacent. Four card colours.
6. **Bigger decks with a scrolling camera** — later decks larger, more zones,
   more cards, more and stronger hostiles.
7. **Bestiary ×4** — around forty species and several apex types, drawn from
   pools by difficulty tier.
8. **Bulkhead facing** — the lit edge of a hull tile faces the room, so a tile
   can carry an edge on two, three or four sides.
9. **Organic walls** — currently they do not read as organic. Redraw or animate,
   or cut them.
10. **Pathing** — better routes for long-distance clicks and for hostiles.

## 9. Highway — queued

- Always leave a legitimate line through traffic, without making it soft.


© 2026 Effigy Media. All rights reserved.
