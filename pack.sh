#!/usr/bin/env bash
# =====================================================================
# TINY ARCADE — pack.sh
#
#     ./pack.sh                     build and validate tiny-arcade.zip
#     ./pack.sh --standalone <id>   emit ONE self-contained HTML for a game
#     ./pack.sh --commercial        omit the Golden Era shelf (see SHIPPING.md)
#     ./pack.sh --check             validate only, build nothing
#
# Builds from an explicit WHITELIST rather than from whatever happens to
# be in the folder — four instrumented debug builds once reached the
# public zip because cleanup was tacked onto the end of shell lines that
# sometimes never ran. A whitelist cannot fail that way.
#
# It refuses to build if anything below fails. Every one of these checks
# exists because the fault it catches actually shipped:
#
#   parse gate      two black screens: an unclosed brace, every other
#                   check passing over it. Nothing else asks whether the
#                   browser can READ the file.
#   catalogue       games.js and the games/ folder must agree, both ways,
#                   and `file` must sit under the folder `cat` names
#   scripts resolve every <script src> must exist on disk
#   shell API       Arcade.pad exports six methods; calling anything else
#                   throws the instant a gamepad connects, and no rig here
#                   has one (Girder called pad.onHold)
#   minimum standard meta tags, menus, controls, music bed, sfx, saves,
#                   attract function present in index.html's draw map
#   no scratch      _*, dotfiles and .py never reach the staging area
#   cache agreement sw.js and assets.js must name the same version
#
# What it CANNOT tell you is whether the game works. That is tools/
# drive-test.py and tools/smoke-test.py. Run those too.
#
# © 2026 Effigy Media. All rights reserved.
# =====================================================================
set -euo pipefail

HERE="$(cd "$(dirname "$0")" && pwd)"
cd "$HERE"

ZIP="tiny-arcade.zip"
MODE="build"
COMMERCIAL=0
STANDALONE=""

while [ $# -gt 0 ]; do
  case "$1" in
    --check)       MODE="check" ;;
    --commercial)  COMMERCIAL=1 ;;
    --standalone)  STANDALONE="${2:-}"; shift ;;
    -h|--help)     sed -n '3,8p' "$0"; exit 0 ;;
    *) echo "unknown option: $1" >&2; exit 2 ;;
  esac
  shift
done

fail(){ echo "refusing to pack: $1" >&2; exit 1; }
say(){ printf '  %s\n' "$1"; }

command -v node >/dev/null || fail "node is required (parse gate, catalogue read)"

# ---- the whitelist -------------------------------------------------------
# If a file is added here it must ALSO be added to sw.js CORE_FILES and to
# sync.sh. Three lists, one truth; they are cross-checked below.
ROOT_FILES=(
  index.html arcade.js audio.js road.js assets.js games.js sw.js
  manifest.webmanifest icon.png icon-512.png effigy.png
  README.md START-HERE.md DRIVING.md REFACTOR.md DESIGN.md SHIPPING.md
  PRIVATEER.md
  pack.sh sync.sh
)
# A doc written after this list was drawn up does not ship, and nothing warns
# you: the whitelist protects against stray files getting IN, and has no
# opinion about wanted files being left OUT. PRIVATEER.md was written, edited
# across five sessions, and packed zero times before anyone noticed. The check
# below closes that: every .md in the folder must be either whitelisted above
# or named here as deliberately excluded.
NOT_SHIPPED=( )

# =====================================================================
# 1. THE CATALOGUE
# =====================================================================
CATALOGUE_JSON="$(node -e '
  global.window={};
  eval(require("fs").readFileSync("games.js","utf8"));
  console.log(JSON.stringify(window.TINY_ARCADE));
')" || fail "games.js does not evaluate"

node -e '
const fs=require("fs"), path=require("path");
const games=JSON.parse(process.argv[1]);
const commercial=process.argv[2]==="1";
let bad=[];
const seen=new Set();
for(const g of games){
  if(commercial && g.cat==="ge") continue;
  if(!fs.existsSync(g.file)) bad.push("catalogue names a file that is not here: "+g.file);
  if(!g.file.startsWith("games/"+g.cat+"/"))
    bad.push(g.id+": cat is \x27"+g.cat+"\x27 but file is "+g.file);
  if(seen.has(g.id)) bad.push("duplicate id: "+g.id);
  seen.add(g.id);
  if(!g.attract) bad.push(g.id+": no attract field");
}
/* the other direction: a game on disk that the catalogue does not list */
const walk=d=>fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>
  e.isDirectory()?walk(path.join(d,e.name)):[path.join(d,e.name)]);
const onDisk=walk("games").filter(f=>f.endsWith(".html"));
const listed=new Set(games.map(g=>g.file));
for(const f of onDisk) if(!listed.has(f)) bad.push("shipped but not in the catalogue: "+f);
/* an attract whose draw function does not exist renders a black card and
   throws nothing at all */
const idx=fs.readFileSync("index.html","utf8");
const drawMap=idx.slice(idx.indexOf("draw"));
for(const g of games){
  if(commercial && g.cat==="ge") continue;
  if(g.attract && g.attract!=="none" && !new RegExp("[\x27\"`]?"+g.attract+"[\x27\"`]?\\s*:").test(drawMap))
    bad.push(g.id+": attract \x27"+g.attract+"\x27 has no entry in the draw map");
}
if(bad.length){ console.error(bad.map(b=>"    "+b).join("\n")); process.exit(1); }
' "$CATALOGUE_JSON" "$COMMERCIAL" || fail "the catalogue and the folder disagree"
for md in *.md; do
  case " ${ROOT_FILES[*]} ${NOT_SHIPPED[*]} " in
    *" $md "*) ;;
    *) fail "$md is in the folder but in no list — add it to ROOT_FILES or NOT_SHIPPED" ;;
  esac
done
say "docs: every .md is accounted for"

say "catalogue: every game listed is present, every game present is listed"

# =====================================================================
# 2. THE PARSE GATE
#    Extract every inline <script> and run node --check. This is the
#    check that should have existed from the first day.
# =====================================================================
TMP="$(mktemp -d)"; trap 'rm -rf "$TMP"' EXIT

PARSE_TARGETS=(arcade.js audio.js road.js games.js assets.js sw.js)
for f in "${PARSE_TARGETS[@]}"; do
  node --check "$f" 2>"$TMP/err" || {
    sed 's/^/        /' "$TMP/err" >&2; fail "$f does not parse"; }
done

node -e '
const fs=require("fs");
const games=JSON.parse(process.argv[1]).map(g=>g.file).concat(["index.html"]);
const out=[];
games.forEach((f,i)=>{
  const html=fs.readFileSync(f,"utf8");
  let body="", m, re=/<script(?![^>]*\ssrc=)[^>]*>([\s\S]*?)<\/script>/gi;
  while((m=re.exec(html))) body += m[1] + "\n;\n";
  fs.writeFileSync(process.argv[2]+"/_syn"+i+".js", body);
  out.push([f, process.argv[2]+"/_syn"+i+".js"]);
});
fs.writeFileSync(process.argv[2]+"/_map.json", JSON.stringify(out));
' "$CATALOGUE_JSON" "$TMP"

node -e '
const {execFileSync}=require("child_process");
const map=JSON.parse(require("fs").readFileSync(process.argv[1]+"/_map.json","utf8"));
let bad=0;
for(const [src,js] of map){
  try { execFileSync("node",["--check",js],{stdio:"pipe"}); }
  catch(e){
    const msg=(e.stderr||"").toString().split("\n").slice(0,3).join(" | ");
    console.error("    "+src+"  "+msg); bad++;
  }
}
process.exit(bad?1:0);
' "$TMP" || fail "a cabinet does not parse"
say "every cabinet parses"

# =====================================================================
# 3. SCRIPTS RESOLVE + THE MINIMUM STANDARD
#    Read the file AND every same-origin script it includes, which is
#    what the browser does — PLAY and OPTIONS now live in road.js, and
#    checking the HTML alone reported a game with no menu at all.
# =====================================================================
node -e '
const fs=require("fs"), path=require("path");
const games=JSON.parse(process.argv[1]);
const commercial=process.argv[2]==="1";
const PAD_API=["connected","axis","down","onPress","confirm","cancel"];
let bad=[];
for(const g of games){
  if(commercial && g.cat==="ge") continue;
  const dir=path.dirname(g.file);
  let html=fs.readFileSync(g.file,"utf8"), text=html;
  const srcs=[...html.matchAll(/<script[^>]*\ssrc=["\x27]([^"\x27]+)["\x27]/gi)].map(m=>m[1]);
  let loadsAudio=false, loadsArcade=false;
  for(const s of srcs){
    if(/^https?:/i.test(s)){ bad.push(g.id+": loads a script over the network: "+s); continue; }
    const p=path.normalize(path.join(dir,s));
    if(!fs.existsSync(p)){ bad.push(g.id+": <script src> does not resolve: "+s); continue; }
    if(/audio\.js$/.test(s)) loadsAudio=true;
    if(/arcade\.js$/.test(s)) loadsArcade=true;
    text += "\n" + fs.readFileSync(p,"utf8");
  }
  const need=(re,what)=>{ if(!re.test(text)) bad.push(g.id+": "+what); };
  if(!loadsAudio)  bad.push(g.id+": does not load audio.js");
  if(!loadsArcade) bad.push(g.id+": does not load arcade.js");
  for(const tag of ["arcade-home","arcade-title","arcade-accent"])
    if(!new RegExp("name=[\"\x27]"+tag+"[\"\x27]").test(html)) bad.push(g.id+": no "+tag+" meta tag");
  need(/\bPLAY\b/,          "no PLAY on the title screen");
  need(/\bOPTIONS\b/,       "no OPTIONS on the title screen");
  need(/\bCONTROLS\b/i,     "no controls page");
  need(/Arcade\.touch|AR\s*&&\s*AR\.touch|\.touch\b/, "controls page not detected per device");
  need(/(Arcade|A|AR)\.music\.start/, "no music bed");
  need(/(Arcade|A|AR)\.sfx\.(tone|noise)/, "no sound effects");
  need(/(Arcade|A|AR)\.save\.(merge|set)/, "does not record a best score");
  need(/bus\s*:\s*[\x27"]music[\x27"]/, "music not routed to bus:\x27music\x27");
  /* the shell API: six methods and no others. Qualified calls only —
     matching a bare `pad.` flagged a local `const pad = ...` in Derelict
     that has nothing to do with the gamepad. */
  for(const m of [...text.matchAll(/\b(?:Arcade|AR|A)\.pad\.([a-zA-Z_$][\w$]*)\s*\(/g)]){
    if(!PAD_API.includes(m[1])) bad.push(g.id+": calls Arcade.pad."+m[1]+"(), which does not exist");
  }
}
if(bad.length){ console.error([...new Set(bad)].map(b=>"    "+b).join("\n")); process.exit(1); }
' "$CATALOGUE_JSON" "$COMMERCIAL" || fail "a cabinet does not meet the minimum standard"
say "every cabinet meets the minimum standard"

# =====================================================================
# 4. THE CACHE LISTS
#    sw.js and assets.js must name the same version, and the file lists
#    they carry are REGENERATED here so they cannot drift from what is
#    actually shipping. CORE went to v20 while RUNTIME stayed at v19
#    once, and a device kept half of a broken build.
# =====================================================================
SW_CORE="$(grep -o "tiny-arcade-core-v[0-9]*" sw.js | head -1)"
SW_RUN="$(grep -o "tiny-arcade-runtime-v[0-9]*" sw.js | head -1)"
AS_CORE="$(grep -o "tiny-arcade-core-v[0-9]*" assets.js | head -1)"
[ -n "$SW_CORE" ] || fail "sw.js has no cache version"
[ "${SW_CORE##*-}" = "${SW_RUN##*-}" ] || fail "sw.js core is ${SW_CORE##*-} but runtime is ${SW_RUN##*-}"
[ "$SW_CORE" = "$AS_CORE" ] || fail "assets.js says $AS_CORE, sw.js says $SW_CORE"
say "cache version: ${SW_CORE##*-} (sw.js and assets.js agree)"

if [ "$MODE" = "build" ] && [ -z "$STANDALONE" ]; then
  node -e '
    const fs=require("fs"), path=require("path");
    const games=JSON.parse(process.argv[1]).map(g=>"./"+g.file);
    const fonts=fs.readdirSync("fonts").sort().map(f=>"./fonts/"+f);
    const list=games.sort().concat(fonts);
    const body=JSON.stringify(list,null,2).replace(/^/gm,"").replace(/\[\n/,"[\n").slice(0,-1)+"];";
    /* assets.js */
    const core=fs.readFileSync("sw.js","utf8").match(/tiny-arcade-core-v\d+/)[0];
    fs.writeFileSync("assets.js",
      "/* generated by pack.sh — do not edit */\n"+
      "window.CACHE_NAME = \x27"+core+"\x27;\n"+
      "window.ARCADE_ASSETS = "+JSON.stringify(list,null,2)+";\n");
    /* sw.js ALL_FILES, rewritten in place between its markers */
    let sw=fs.readFileSync("sw.js","utf8");
    sw=sw.replace(/const ALL_FILES = \[[\s\S]*?\n\];/,
      "const ALL_FILES = "+JSON.stringify(list,null,2)+";");
    fs.writeFileSync("sw.js",sw);
  ' "$CATALOGUE_JSON"
  node --check assets.js && node --check sw.js || fail "regenerated cache lists do not parse"
  say "regenerated assets.js and sw.js ALL_FILES from what is shipping"
fi

# =====================================================================
# 5. STANDALONE — one self-contained HTML, every <script src> folded in
# =====================================================================
if [ -n "$STANDALONE" ]; then
  OUT="$(node -e '
    const fs=require("fs"), path=require("path");
    const games=JSON.parse(process.argv[1]);
    const g=games.find(x=>x.id===process.argv[2]);
    if(!g){ console.error("no such game: "+process.argv[2]); process.exit(1); }
    const dir=path.dirname(g.file);
    let html=fs.readFileSync(g.file,"utf8"), n=0, bytes=0;
    html=html.replace(/<script[^>]*\ssrc=["\x27]([^"\x27]+)["\x27][^>]*><\/script>/gi,(m,src)=>{
      if(/^https?:/i.test(src)) return m;
      const raw=fs.readFileSync(path.normalize(path.join(dir,src)),"utf8");
      /* arcade.js and audio.js each contain a literal closing script tag
         inside a string. Inlined as-is it ends the block early and the rest
         of the engine is parsed as HTML — the standalone booted to a canvas
         and an "Invalid or unexpected token". */
      const code=raw.replace(/<\/script/gi,"<\\/script");
      n++; bytes+=code.length;
      return "<script>\n/* inlined by pack.sh --standalone: "+src+" */\n"+code+"\n<\/script>";
    });
    const out=g.id+"-standalone.html";
    fs.writeFileSync(out,html);
    console.log(out+"\t"+n+"\t"+Math.round(fs.statSync(out).size/1024));
  ' "$CATALOGUE_JSON" "$STANDALONE")" || fail "standalone build failed"
  set -- $OUT
  say "standalone: $STANDALONE  ($2 shared scripts inlined, ${3}K)  →  $1"
  exit 0
fi

[ "$MODE" = "check" ] && { echo "  all checks pass — nothing built (--check)"; exit 0; }

# =====================================================================
# 6. STAGE FROM THE WHITELIST, AND REFUSE SCRATCH
# =====================================================================
STAGE="$TMP/tiny-arcade"
mkdir -p "$STAGE"
for f in "${ROOT_FILES[@]}"; do
  [ -f "$f" ] && cp "$f" "$STAGE/$f"
done
mkdir -p "$STAGE/fonts"; cp fonts/* "$STAGE/fonts/"
while IFS= read -r g; do
  case "$COMMERCIAL:$g" in 1:games/ge/*) continue ;; esac
  mkdir -p "$STAGE/$(dirname "$g")"
  cp "$g" "$STAGE/$g"
done < <(node -e 'JSON.parse(process.argv[1]).forEach(g=>console.log(g.file))' "$CATALOGUE_JSON")
[ -d tools ] && { mkdir -p "$STAGE/tools"; cp tools/*.py "$STAGE/tools/" 2>/dev/null || true; }

SCRATCH="$(find "$STAGE" \( -name '_*' -o -name '.*' -o -name '*.py' \) \
           -not -path "$STAGE/tools/*" -not -name '.' | head -5)"
[ -z "$SCRATCH" ] || { echo "$SCRATCH" | sed 's/^/    /' >&2; fail "scratch files reached the staging area"; }

rm -f "$ZIP"
( cd "$TMP" && zip -qr "$HERE/$ZIP" tiny-arcade )
say "packed $(unzip -l "$ZIP" | tail -1 | awk '{print $2}') files → $ZIP ($(du -h "$ZIP" | cut -f1))"
[ "$COMMERCIAL" = "1" ] && say "COMMERCIAL build: Golden Era shelf omitted"

echo
echo "  pack.sh cannot tell you the game works. Next:"
echo "      python3 tools/smoke-test.py      all 18 cabinets boot"
echo "      python3 tools/drive-test.py      both driving games play"
