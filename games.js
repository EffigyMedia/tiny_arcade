/* =====================================================================
   TINY ARCADE — games.js

   The whole catalogue. To add a machine:
     1. drop its .html into games/
     2. put <script src="../arcade.js"></script> plus the two arcade
        meta tags in its <head>
     3. add one object to this list

   attract: which little idle animation the card plays.
            'dive' | 'grid' | 'road' | 'none'
   ===================================================================== */
window.TINY_ARCADE = [
  {
    file:  'games/sounding.html',
    name:  'Sounding',
    accent:'#4de0c8',
    genre: 'ARCADE \u00B7 ONE THUMB',
    hook:  'A one-thumb dive into the abyss. Thread the ledges and mind what swims across your line.',
    attract:'dive'
  },
  {
    file:  'games/derelict.html',
    name:  'Derelict',
    accent:'#7fd8ff',
    genre: 'ROGUELIKE \u00B7 TURN-BASED',
    hook:  'Sealed compartments, keycards, and an apex sitting on the only salvage worth having.',
    attract:'grid'
  },
  {
    file:  'games/sodium.html',
    name:  'Sodium',
    accent:'#ff8a3d',
    genre: 'DRIVING \u00B7 ENDLESS',
    hook:  'Thread traffic at 280km/h with the county behind you. Cruisers meet semi-trailers too.',
    attract:'road'
  }
];
