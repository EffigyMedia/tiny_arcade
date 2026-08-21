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
            'golden'   \u2014 clean-room takes on the 1970s\u201380s cabinets
            'second'   \u2014 the 1990s floor: fighters, shmups, light-gun
            'original' \u2014 ours outright, descended from nothing

   hook: write it like cabinet glass, not like a store listing. One or two
         short sentences, concrete, and no two cards built the same way —
         if every line is two clauses of the same length the rack reads as
         filler however good the games are.
   ===================================================================== */
window.TINY_ARCADE = [
  {
    file:  'games/golden/ribbit.html',
    id:    'ribbit',
    cat:   'golden',
    name:  'Ribbit',
    accent:'#5bd66c',
    genre: 'ARCADE \u00B7 LANE CROSSER',
    hook:  'The road kills you if you touch anything. The water, if you touch nothing.',
    attract:'drain'
  },
  {
    file:  'games/golden/swarm.html',
    id:    'swarm',
    cat:   'golden',
    name:  'Swarm',
    accent:'#b06cff',
    genre: 'ARCADE \u00B7 DIVE SHOOTER',
    hook:  'One of them will take your ship. Take it back and fly doubled.',
    attract:'fold'
  },
  {
    file:  'games/golden/popshot.html',
    id:    'popshot',
    cat:   'golden',
    name:  'Popshot',
    accent:'#ff9ecd',
    genre: 'PUZZLE \u00B7 AIM AND MATCH',
    hook:  'Cut the support and the whole lot comes down. That is the shot.',
    attract:'soap'
  },
  {
    file:  'games/golden/phalanx.html',
    id:    'phalanx',
    cat:   'golden',
    name:  'Phalanx',
    accent:'#c3ff4a',
    genre: 'ARCADE \u00B7 RANKED SHOOTER',
    hook:  'Thinning them is what makes them fast. The last one is the worst.',
    attract:'ranks'
  },
  {
    file:  'games/golden/ricochet.html',
    id:    'ricochet',
    cat:   'golden',
    name:  'Ricochet',
    accent:'#00e5ff',
    genre: 'ARCADE \u00B7 PADDLE',
    hook:  'Where it hits the bat decides where it goes. Aim, do not react.',
    attract:'scope'
  },
  {
    file:  'games/golden/blocks.html',
    id:    'blocks',
    cat:   'golden',
    name:  'Soviet Blocks',
    accent:'#c8102e',
    genre: 'PUZZLE \u00B7 FALLING',
    hook:  'The wall builds itself. You only choose where the gaps go.',
    attract:'blocks'
  },
  {
    file:  'games/golden/ziggurat.html',
    id:    'ziggurat',
    cat:   'golden',
    name:  'Ziggurat',
    accent:'#ffb347',
    genre: 'ARCADE \u00B7 ISOMETRIC HOPPER',
    hook:  'Four diagonals and no sideways. Your own hands are the obstacle.',
    attract:'fold2'
  },
  {
    file:  'games/golden/vector.html',
    id:    'vector',
    cat:   'golden',
    name:  'Vector',
    accent:'#9fb4ff',
    genre: 'ARCADE \u00B7 INERTIA SHOOTER',
    hook:  'Nothing here slows you down. Every shot commits you to a course.',
    attract:'ice'
  },
  {
    file:  'games/golden/aegis.html',
    id:    'aegis',
    cat:   'golden',
    name:  'Aegis',
    accent:'#ff3b5c',
    genre: 'ARCADE \u00B7 POINT DEFENCE',
    hook:  'You cannot win. You can only be slow to lose.',
    attract:'radar'
  },
  {
    file:  'games/golden/burrow.html',
    id:    'burrow',
    cat:   'golden',
    name:  'Burrow',
    accent:'#e0a458',
    genre: 'ARCADE \u00B7 DIG AND POP',
    hook:  'Every tunnel you cut is an escape route. It is also a trap.',
    attract:'strata'
  },
  {
    file:  'games/golden/coil.html',
    id:    'coil',
    cat:   'golden',
    name:  'Coil',
    accent:'#7cf5a0',
    genre: 'ARCADE \u00B7 SNAKE',
    hook:  'Winning is the losing condition. Every node leaves you less room.',
    attract:'fibre'
  },
  {
    file:  'games/golden/feather.html',
    id:    'feather',
    cat:   'golden',
    name:  'Feather',
    accent:'#cfd8e3',
    genre: 'ARCADE \u00B7 LANDER',
    hook:  'A game about arriving slowly. Everything else is fuel arithmetic.',
    attract:'profile'
  },
  {
    file:  'games/golden/girder.html',
    id:    'girder',
    cat:   'golden',
    name:  'Girder',
    accent:'#ff6b2c',
    genre: 'ARCADE \u00B7 CLIMB AND DODGE',
    hook:  'The masonry rolls downhill. Read the slope and you can read the stage.',
    attract:'scaffold'
  },
  {
    file:  'games/golden/penboy.html',
    id:    'penboy',
    cat:   'golden',
    name:  'Penboy',
    accent:'#ffd23c',
    genre: 'ARCADE \u00B7 MAZE CHASE',
    hook:  'Four hunters, and no two of them think alike.',
    attract:'maze'
  },
  {
    file:  'games/original/deep.html',
    id:    'deep',
    cat:   'original',
    name:  'Deep',
    accent:'#4de0c8',
    genre: 'ARCADE \u00B7 ONE THUMB',
    hook:  'One thumb. Straight down. Something already knows you are coming.',
    attract:'dive'
  },
  {
    file:  'games/original/derelict.html',
    id:    'derelict',
    cat:   'original',
    name:  'Derelict',
    accent:'#7fd8ff',
    genre: 'ROGUELIKE \u00B7 TURN-BASED',
    hook:  'Nothing aboard is alive. Plenty of it still moves.',
    attract:'grid'
  },
  {
    file:  'games/original/highway.html',
    id:    'highway',
    cat:   'original',
    name:  'Highway',
    accent:'#ff8a3d',
    genre: 'DRIVING \u00B7 ENDLESS',
    hook:  '180 with the county behind you.',
    attract:'road'
  }
];
