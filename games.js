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
