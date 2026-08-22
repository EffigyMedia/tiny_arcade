/* =====================================================================
   TINY ARCADE — games.js

   The whole catalogue. To add a machine:
     1. drop its .html into games/
     2. put <script src="../arcade.js"></script> plus the two arcade
        meta tags in its <head>
     3. add one object to this list

   attract: which little idle animation the card plays.
            'dive' | 'grid' | 'road' | 'maze' | 'none'

   Files live in games/<cat>/, one folder per shelf. `file` must match the
   folder its `cat` names — pack.sh fails the build if they disagree.

   cat:     which shelf it lives on.
            'ge'   \u2014 clean-room takes on the 1970s\u201380s cabinets
            'sw'   \u2014 the 1990s floor: fighters, shmups, light-gun
            'em' \u2014 ours outright, descended from nothing

   hook: write it like cabinet glass, not like a store listing. One or two
         short sentences, concrete, and no two cards built the same way —
         if every line is two clauses of the same length the rack reads as
         filler however good the games are.
   ===================================================================== */
window.TINY_ARCADE = [
  {
    file:  'games/ge/ribbit.html',
    id:    'ribbit',
    cat:   'ge',
    name:  'Ribbit',
    accent:'#5bd66c',
    genre: 'ARCADE \u00B7 LANE CROSSER',
    hook:  'The road kills you if you touch anything. The water, if you touch nothing.',
    attract:'drain'
  },
  {
    file:  'games/ge/swarm.html',
    id:    'swarm',
    cat:   'ge',
    name:  'Swarm',
    accent:'#b06cff',
    genre: 'ARCADE \u00B7 DIVE SHOOTER',
    hook:  'One of them will take your ship. Take it back and fly doubled.',
    attract:'fold'
  },
  {
    file:  'games/ge/popshot.html',
    id:    'popshot',
    cat:   'ge',
    name:  'Popshot',
    accent:'#ff9ecd',
    genre: 'PUZZLE \u00B7 AIM AND MATCH',
    hook:  'Cut the support and the whole lot comes down. That is the shot.',
    attract:'soap'
  },
  {
    file:  'games/ge/phalanx.html',
    id:    'phalanx',
    cat:   'ge',
    name:  'Phalanx',
    accent:'#c3ff4a',
    genre: 'ARCADE \u00B7 RANKED SHOOTER',
    hook:  'Thinning them is what makes them fast. The last one is the worst.',
    attract:'ranks'
  },
  {
    file:  'games/ge/ricochet.html',
    id:    'ricochet',
    cat:   'ge',
    name:  'Ricochet',
    accent:'#00e5ff',
    genre: 'ARCADE \u00B7 PADDLE',
    hook:  'Where it hits the bat decides where it goes. Aim, do not react.',
    attract:'scope'
  },
  {
    file:  'games/ge/blocks.html',
    id:    'blocks',
    cat:   'ge',
    name:  'Soviet Blocks',
    accent:'#c8102e',
    genre: 'PUZZLE \u00B7 FALLING',
    hook:  'The wall builds itself. You only choose where the gaps go.',
    attract:'blocks'
  },
  {
    file:  'games/ge/ziggurat.html',
    id:    'ziggurat',
    cat:   'ge',
    name:  'Ziggurat',
    accent:'#ffb347',
    genre: 'ARCADE \u00B7 ISOMETRIC HOPPER',
    hook:  'Four diagonals and no sideways. Your own hands are the obstacle.',
    attract:'fold2'
  },
  {
    file:  'games/ge/vector.html',
    id:    'vector',
    cat:   'ge',
    name:  'Vector',
    accent:'#9fb4ff',
    genre: 'ARCADE \u00B7 INERTIA SHOOTER',
    hook:  'Nothing here slows you down. Every shot commits you to a course.',
    attract:'ice'
  },
  {
    file:  'games/ge/aegis.html',
    id:    'aegis',
    cat:   'ge',
    name:  'Aegis',
    accent:'#ff3b5c',
    genre: 'ARCADE \u00B7 POINT DEFENCE',
    hook:  'You cannot win. You can only be slow to lose.',
    attract:'radar'
  },
  {
    file:  'games/ge/burrow.html',
    id:    'burrow',
    cat:   'ge',
    name:  'Burrow',
    accent:'#e0a458',
    genre: 'ARCADE \u00B7 DIG AND POP',
    hook:  'Every tunnel you cut is an escape route. It is also a trap.',
    attract:'strata'
  },
  {
    file:  'games/ge/coil.html',
    id:    'coil',
    cat:   'ge',
    name:  'Coil',
    accent:'#7cf5a0',
    genre: 'ARCADE \u00B7 SNAKE',
    hook:  'Winning is the losing condition. Every node leaves you less room.',
    attract:'fibre'
  },
  {
    file:  'games/ge/feather.html',
    id:    'feather',
    cat:   'ge',
    name:  'Feather',
    accent:'#cfd8e3',
    genre: 'ARCADE \u00B7 LANDER',
    hook:  'A game about arriving slowly. Everything else is fuel arithmetic.',
    attract:'profile'
  },
  {
    file:  'games/ge/girder.html',
    id:    'girder',
    cat:   'ge',
    name:  'Girder',
    accent:'#ff6b2c',
    genre: 'ARCADE \u00B7 CLIMB AND DODGE',
    hook:  'The masonry rolls downhill. Read the slope and you can read the stage.',
    attract:'scaffold'
  },
  {
    file:  'games/ge/penboy.html',
    id:    'penboy',
    cat:   'ge',
    name:  'Penboy',
    accent:'#ffd23c',
    genre: 'ARCADE \u00B7 MAZE CHASE',
    hook:  'Four hunters, and no two of them think alike.',
    attract:'maze'
  },
  {
    file:  'games/em/deep.html',
    id:    'deep',
    cat:   'em',
    name:  'Deep',
    accent:'#4de0c8',
    genre: 'ARCADE \u00B7 ONE THUMB',
    hook:  'One thumb. Straight down. Something already knows you are coming.',
    attract:'dive'
  },
  {
    file:  'games/em/derelict.html',
    id:    'derelict',
    cat:   'em',
    name:  'Derelict',
    accent:'#7fd8ff',
    genre: 'ROGUELIKE \u00B7 TURN-BASED',
    hook:  'Nothing aboard is alive. Plenty of it still moves.',
    attract:'grid'
  },
  {
    file:  'games/sw/highway.html',
    id:    'highway',
    cat:   'sw',
    name:  'Highway',
    accent:'#ff8a3d',
    /* The genre line says what KIND of game this is — three words, the way
       every other card reads, not a list of menu items. The hook had been
       describing a build that no longer exists: it claimed sixteen bodies of
       traffic when there were never more than seven. */
    genre: 'DRIVING \u00B7 RACE \u00B7 ENDLESS',
    hook:  'Four races, a clock that only checkpoints reset, and the law behind you.',
    attract:'road'
  }
];
