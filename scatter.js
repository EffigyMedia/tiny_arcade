/* Thrown-object scatter, with reflection.
   A failed placement check throws 1d8 for a direction and 1d4 for distance.
   If the path meets a bulkhead the object bounces: a square-on hit comes
   straight back, a diagonal mirrors only the blocked component, and an inside
   corner reverses both. It keeps whatever distance it had left. */

const DIRS8 = [
  [ 0,-1], [ 1,-1], [ 1, 0], [ 1, 1],
  [ 0, 1], [-1, 1], [-1, 0], [-1,-1]
];
const NAME8 = ['N','NE','E','SE','S','SW','W','NW'];

function scatter(map, W, H, sx, sy, dirIdx, dist, MAXBOUNCE = 4){
  const solid = (x, y) => x < 0 || y < 0 || x >= W || y >= H || map[y][x] === '#';
  let [dx, dy] = DIRS8[dirIdx];
  let x = sx, y = sy, left = dist, bounces = 0;
  const path = [[x, y]];

  while(left > 0){
    const nx = x + dx, ny = y + dy;
    if(!solid(nx, ny)){                      // clear, take the step
      x = nx; y = ny; left--;
      path.push([x, y]);
      continue;
    }
    if(bounces >= MAXBOUNCE) break;          // trapped in a pocket, drop it here
    bounces++;

    if(dx !== 0 && dy !== 0){
      // diagonal: mirror only the component that is actually blocked
      const blockedX = solid(x + dx, y);
      const blockedY = solid(x, y + dy);
      if(blockedX && blockedY){ dx = -dx; dy = -dy; }        // inside corner
      else if(blockedX)        { dx = -dx; }                  // flat wall to the side
      else if(blockedY)        { dy = -dy; }                  // flat wall ahead
      else                     { dx = -dx; dy = -dy; }        // only the corner tile
    } else {
      // square on: straight back the way it came
      dx = -dx; dy = -dy;
    }
  }
  return { x, y, path, bounces, stranded: left > 0 };
}

/* ---------------- verification ---------------- */
function makeRoom(){
  // a chamber with a pillar and a notch, so we get flat walls and corners
  const W = 15, H = 15;
  const m = [];
  for(let y=0;y<H;y++){
    let row = '';
    for(let x=0;x<W;x++){
      const edge = x===0 || y===0 || x===W-1 || y===H-1;
      const pillar = x>=6 && x<=8 && y>=6 && y<=8;
      const notch  = x>=11 && y>=2 && y<=4;
      row += (edge || pillar || notch) ? '#' : '.';
    }
    m.push(row);
  }
  return { m, W, H };
}

const { m, W, H } = makeRoom();
const solid = (x,y) => x<0||y<0||x>=W||y>=H||m[y][x]==='#';

let bad = 0, landedInWall = 0, offBoard = 0, bounced = 0, trials = 0;
for(let sy=1; sy<H-1; sy++){
  for(let sx=1; sx<W-1; sx++){
    if(solid(sx,sy)) continue;
    for(let d=0; d<8; d++){
      for(let dist=1; dist<=4; dist++){
        const r = scatter(m, W, H, sx, sy, d, dist);
        trials++;
        if(r.bounces) bounced++;
        if(solid(r.x, r.y)){ landedInWall++; bad++; }
        if(r.x<0||r.y<0||r.x>=W||r.y>=H){ offBoard++; bad++; }
        for(const [px,py] of r.path) if(solid(px,py)) bad++;
      }
    }
  }
}
console.log('scatter trials              :', trials);
console.log('  ended inside a bulkhead   :', landedInWall);
console.log('  ended off the board       :', offBoard);
console.log('  any path tile inside wall :', bad - landedInWall - offBoard);
console.log('  throws that bounced       :', bounced, '(' + Math.round(100*bounced/trials) + '%)');
console.log();

/* a few worked examples, to eyeball the reflection */
function show(sx, sy, d, dist){
  const r = scatter(m, W, H, sx, sy, d, dist);
  console.log('  from ' + sx + ',' + sy + ' heading ' + NAME8[d].padEnd(2) +
              ' ' + dist + ' sq -> ' + r.x + ',' + r.y +
              (r.bounces ? '  (' + r.bounces + ' bounce' + (r.bounces>1?'s':'') + ')' : '') +
              '   path ' + r.path.map(p=>p.join(',')).join(' -> '));
}
console.log('worked examples:');
show(5, 1, 0, 3);    // north into the ceiling, square on
show(5, 5, 3, 4);    // south-east into the pillar corner
show(10, 3, 2, 4);   // east into the notch
show(2, 2, 7, 3);    // north-west into the corner of the room
show(5, 7, 2, 4);    // east square on into the pillar

/* and the corrected odds, with the penalty applied the right way round */
console.log();
console.log('placement check: ATK + 1d20 vs 10, penalty applied as a penalty');
const land = (atk, pen) => {
  const need = 10 - atk + pen;          // d20 must beat this
  const ways = Math.max(0, Math.min(20, 20 - need + 1));
  return Math.round(100 * ways / 20);
};
for(const [nm, heft] of [['Charge / Incendiary', 10], ['Chem Light', 6]]){
  const pen = 12 - heft;
  console.log('  ' + nm + '  (heft d' + heft + ', past-optimal \u2212' + pen + ')');
  for(const [lvl, atk] of [[1,4],[5,8],[10,13]]){
    console.log('     level ' + String(lvl).padStart(2) + '  within optimal ' +
      String(land(atk,0)).padStart(3) + '%   past optimal ' + String(land(atk,pen)).padStart(3) + '%');
  }
}
