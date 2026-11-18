/* EMMAUS artwork — self-contained SVG illustrations.
   Each scene is a function returning an <svg> string (viewBox 800x420).
   To swap in a real photo later, replace a scene's body with:
     '<img src="images/NAME.jpg" alt="..." style="width:100%;height:100%;object-fit:cover">'
   and drop the file in an images/ folder. Nothing else changes. */

var ART = (function () {
  function defs(id, from, to) {
    return '<defs><linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1">'
      + '<stop offset="0" stop-color="' + from + '"/><stop offset="1" stop-color="' + to + '"/></linearGradient></defs>';
  }
  function wrap(inner, skyFrom, skyTo) {
    return '<svg viewBox="0 0 800 420" preserveAspectRatio="xMidYMid slice" '
      + 'style="width:100%;height:100%;display:block" role="img">'
      + defs("g", skyFrom, skyTo)
      + '<rect width="800" height="420" fill="url(#g)"/>'
      + inner + '</svg>';
  }
  function stars(n) {
    var s = "", seed = 7;
    for (var i = 0; i < n; i++) {
      seed = (seed * 9301 + 49297) % 233280;
      var x = Math.round((seed / 233280) * 800);
      seed = (seed * 9301 + 49297) % 233280;
      var y = Math.round((seed / 233280) * 230);
      var r = (i % 5 === 0) ? 2 : 1.2;
      s += '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="#ffeec2" opacity="' + (0.35 + (i % 3) * 0.2) + '"/>';
    }
    return s;
  }
  function hills(colors) {
    var out = "";
    colors.forEach(function (c, i) {
      var y = 300 + i * 26;
      out += '<path d="M0 ' + y + ' Q200 ' + (y - 60) + ' 400 ' + (y - 10) + ' T800 ' + (y - 30)
        + ' L800 420 L0 420 Z" fill="' + c + '"/>';
    });
    return out;
  }
  function rays(cx, cy, color, op) {
    var out = "";
    for (var a = 0; a < 360; a += 22.5) {
      var r1 = 60, r2 = 340, rad = a * Math.PI / 180;
      out += '<line x1="' + (cx + Math.cos(rad) * r1) + '" y1="' + (cy + Math.sin(rad) * r1)
        + '" x2="' + (cx + Math.cos(rad) * r2) + '" y2="' + (cy + Math.sin(rad) * r2)
        + '" stroke="' + color + '" stroke-width="6" opacity="' + op + '" stroke-linecap="round"/>';
    }
    return out;
  }

  return {
    creation: function () {
      return wrap(stars(46)
        + '<circle cx="640" cy="92" r="52" fill="#ffe9b0"/><circle cx="640" cy="92" r="78" fill="#ffe9b0" opacity=".16"/>'
        + '<circle cx="150" cy="110" r="34" fill="#eef2ff" opacity=".9"/><circle cx="168" cy="100" r="34" fill="#1e2748"/>'
        + hills(["#3d6b52", "#2f4f3e", "#22392e"]), "#1b2545", "#3a3560");
    },
    seeking: function () {
      return wrap(stars(30)
        + '<circle cx="400" cy="120" r="90" fill="#ffe9b0" opacity=".12"/>'
        + '<circle cx="400" cy="120" r="46" fill="#ffe9b0" opacity=".8"/>'
        + hills(["#2f4f3e", "#22392e"])
        + '<circle cx="400" cy="300" r="26" fill="#0f1424"/>'
        + '<path d="M400 322 q-30 6 -40 78 h80 q-10 -72 -40 -78 Z" fill="#0f1424"/>', "#16203c", "#3a3560");
    },
    openBible: function () {
      return wrap('<circle cx="400" cy="180" r="150" fill="#ffe9b0" opacity=".1"/>'
        + '<path d="M150 300 q120 -40 250 0 v-140 q-130 -40 -250 0 Z" fill="#f6efe0"/>'
        + '<path d="M400 300 q130 -40 250 0 v-140 q-120 -40 -250 0 Z" fill="#efe6d2"/>'
        + '<path d="M400 160 v140" stroke="#c9b48c" stroke-width="4"/>'
        + '<line x1="190" y1="210" x2="350" y2="200" stroke="#c9b48c" stroke-width="3" opacity=".7"/>'
        + '<line x1="190" y1="240" x2="350" y2="232" stroke="#c9b48c" stroke-width="3" opacity=".7"/>'
        + '<line x1="450" y1="200" x2="610" y2="210" stroke="#c9b48c" stroke-width="3" opacity=".7"/>'
        + '<line x1="450" y1="232" x2="610" y2="240" stroke="#c9b48c" stroke-width="3" opacity=".7"/>', "#241f3d", "#4a3f6b");
    },
    hands: function () {
      return wrap(rays(400, 150, "#ffe9b0", ".07")
        + '<circle cx="400" cy="150" r="46" fill="#ffe9b0" opacity=".95"/>'
        + '<path d="M250 400 q-10 -110 60 -150 q40 -22 90 -22 q50 0 90 22 q70 40 60 150 Z" fill="#c98d63"/>'
        + '<path d="M400 228 v60" stroke="#a9744d" stroke-width="6"/>'
        + '<path d="M320 300 q80 -30 160 0" stroke="#a9744d" stroke-width="6" fill="none"/>', "#2a2138", "#553f52");
    },
    crossroad: function () {
      return wrap(hills(["#2f4f3e", "#22392e"])
        + '<path d="M400 420 L400 240" stroke="#c9b48c" stroke-width="10"/>'
        + '<path d="M400 300 L250 230" stroke="#c9b48c" stroke-width="8"/>'
        + '<path d="M400 300 L560 220" stroke="#c9b48c" stroke-width="8"/>'
        + '<rect x="205" y="180" width="90" height="34" rx="5" fill="#8a6a3a"/>'
        + '<rect x="520" y="170" width="90" height="34" rx="5" fill="#8a6a3a"/>'
        + '<circle cx="400" cy="330" r="20" fill="#12172a"/>'
        + '<path d="M400 348 q-24 6 -30 62 h60 q-6 -56 -30 -62 Z" fill="#12172a"/>', "#2a2740", "#5a4a6b");
    },
    cross: function () {
      return wrap('<circle cx="400" cy="150" r="120" fill="#ffd98a" opacity=".22"/>'
        + '<circle cx="400" cy="150" r="70" fill="#ffe9b0" opacity=".5"/>'
        + hills(["#6b4a5a", "#4a3346", "#2e2033"])
        + '<rect x="392" y="70" width="16" height="200" fill="#3a2a1f"/>'
        + '<rect x="336" y="120" width="128" height="16" fill="#3a2a1f"/>', "#3a2b52", "#c96a4a");
    },
    sunrise: function () {
      return wrap('<circle cx="400" cy="250" r="66" fill="#fff0c2"/>'
        + rays(400, 250, "#ffd98a", ".1")
        + hills(["#3d6b52", "#2f4f3e", "#22392e"])
        + '<path d="M120 90 q30 -26 60 0 M180 70 q26 -22 52 0" stroke="#2a2a3a" stroke-width="5" fill="none" opacity=".6"/>', "#2b2a55", "#f0a45e");
    },
    anchor: function () {
      return wrap('<circle cx="400" cy="150" r="110" fill="#ffe9b0" opacity=".08"/>'
        + '<path d="M400 110 v170" stroke="#cfd8ea" stroke-width="12"/>'
        + '<circle cx="400" cy="104" r="18" fill="none" stroke="#cfd8ea" stroke-width="12"/>'
        + '<path d="M330 170 h140" stroke="#cfd8ea" stroke-width="12"/>'
        + '<path d="M320 230 q80 70 160 0" stroke="#cfd8ea" stroke-width="12" fill="none"/>'
        + '<path d="M320 230 l-20 22 M480 230 l20 22" stroke="#cfd8ea" stroke-width="10"/>'
        + '<path d="M0 350 q100 -26 200 0 t200 0 t200 0 t200 0 v70 H0 Z" fill="#2b4a6b" opacity=".85"/>', "#1b2545", "#2f4a6b");
    },
    path: function () {
      return wrap('<circle cx="400" cy="120" r="70" fill="#ffe9b0" opacity=".3"/>'
        + hills(["#3d6b52", "#2f4f3e"])
        + '<path d="M300 420 Q360 300 380 240 Q392 190 400 150 L400 420 Z" fill="#c9b48c" opacity=".85"/>'
        + '<path d="M500 420 Q440 300 420 240 Q408 190 400 150 L400 420 Z" fill="#b8a377" opacity=".85"/>', "#2a2740", "#6b5a7a");
    },
    lamp: function () {
      return wrap(rays(400, 170, "#ffe9b0", ".09")
        + '<ellipse cx="400" cy="150" rx="26" ry="44" fill="#ffd98a" opacity=".95"/>'
        + '<ellipse cx="400" cy="150" rx="14" ry="30" fill="#fff3cf"/>'
        + '<path d="M330 250 h140 q10 0 10 12 q0 40 -30 52 h-100 q-30 -12 -30 -52 q0 -12 10 -12 Z" fill="#c98d63"/>'
        + '<path d="M400 250 v-46" stroke="#8a6a3a" stroke-width="8"/>'
        + '<path d="M320 250 q-30 6 -34 34" stroke="#c98d63" stroke-width="10" fill="none"/>', "#241f3d", "#4a3f6b");
    },
    prayer: function () {
      return wrap(rays(400, 130, "#ffe9b0", ".08")
        + '<circle cx="400" cy="120" r="54" fill="#ffe9b0" opacity=".55"/>'
        + '<circle cx="400" cy="262" r="24" fill="#12172a"/>'
        + '<path d="M400 284 q-34 8 -40 74 h80 q-6 -66 -40 -74 Z" fill="#12172a"/>'
        + '<path d="M362 300 q38 -26 76 0" stroke="#12172a" stroke-width="14" fill="none"/>'
        + '<rect x="300" y="358" width="200" height="14" rx="7" fill="#2a3044"/>', "#1e2140", "#4a3f6b");
    },
    dove: function () {
      return wrap(rays(400, 190, "#ffe9b0", ".07")
        + '<path d="M300 200 q60 -60 140 -40 q40 8 70 -10 q-16 34 -50 46 q20 30 -10 62 q-40 40 -110 20 q-60 -18 -70 -46 q-6 -22 30 -32 Z" fill="#f4f7ff"/>'
        + '<path d="M420 168 q26 -6 42 6 q-20 6 -34 20 Z" fill="#cfd8ea"/>'
        + '<circle cx="352" cy="196" r="6" fill="#2a3044"/>'
        + '<path d="M340 206 l-22 8 l20 6 Z" fill="#e9bf63"/>', "#1b2545", "#3a4a7a");
    },
    shield: function () {
      return wrap('<circle cx="400" cy="200" r="140" fill="#ffe9b0" opacity=".07"/>'
        + '<path d="M400 70 L560 120 v110 q0 110 -160 160 q-160 -50 -160 -160 V120 Z" fill="#3a4a70"/>'
        + '<path d="M400 92 L538 134 v96 q0 96 -138 140 q-138 -44 -138 -140 v-96 Z" fill="#2b3a5c"/>'
        + '<ellipse cx="400" cy="216" rx="22" ry="38" fill="#ffd98a"/>'
        + '<ellipse cx="400" cy="216" rx="11" ry="24" fill="#fff3cf"/>', "#1b2036", "#33406b");
    },
    world: function () {
      return wrap(rays(400, 200, "#ffe9b0", ".06")
        + '<circle cx="400" cy="200" r="120" fill="#2f5a7a"/>'
        + '<path d="M330 120 q50 30 30 70 q-20 40 30 60 q40 16 20 60 q-30 30 -80 10 q-50 -24 -40 -80 q10 -60 40 -120 Z" fill="#4a8a6a"/>'
        + '<path d="M470 140 q40 20 30 60 q-8 30 20 46 q-30 10 -60 -20 q-20 -40 10 -86 Z" fill="#4a8a6a"/>'
        + '<circle cx="400" cy="200" r="120" fill="none" stroke="#8fc0e0" stroke-width="6"/>'
        + '<ellipse cx="400" cy="200" rx="120" ry="42" fill="none" stroke="#8fc0e0" stroke-width="4" opacity=".6"/>', "#16203c", "#2f4a7a");
    },
    together: function () {
      return wrap('<circle cx="400" cy="150" r="90" fill="#ffe9b0" opacity=".14"/>'
        + '<circle cx="280" cy="250" r="26" fill="#1a2036"/><path d="M280 272 q-32 8 -38 76 h76 q-6 -68 -38 -76 Z" fill="#1a2036"/>'
        + '<circle cx="400" cy="228" r="30" fill="#12172a"/><path d="M400 254 q-36 8 -42 94 h84 q-6 -86 -42 -94 Z" fill="#12172a"/>'
        + '<circle cx="520" cy="250" r="26" fill="#1a2036"/><path d="M520 272 q-32 8 -38 76 h76 q-6 -68 -38 -76 Z" fill="#1a2036"/>'
        + '<path d="M300 300 q100 -40 200 0" stroke="#c9b48c" stroke-width="5" fill="none" opacity=".5"/>', "#22284a", "#4a4a7a");
    },
    city: function () {
      return wrap(stars(24)
        + '<circle cx="400" cy="150" r="120" fill="#ffe9b0" opacity=".12"/>'
        + '<path d="M220 420 v-120 h40 v-60 h60 v60 h40 v120 Z" fill="#2a3358"/>'
        + '<path d="M360 420 v-170 h50 v-70 h60 v70 h50 v170 Z" fill="#34406b"/>'
        + '<path d="M540 420 v-100 h50 v-50 h50 v50 h40 v100 Z" fill="#2a3358"/>'
        + '<rect x="300" y="330" width="16" height="24" fill="#ffe9b0" opacity=".8"/>'
        + '<rect x="392" y="300" width="16" height="24" fill="#ffe9b0" opacity=".8"/>'
        + '<rect x="440" y="300" width="16" height="24" fill="#ffe9b0" opacity=".8"/>'
        + '<rect x="580" y="350" width="16" height="24" fill="#ffe9b0" opacity=".8"/>', "#151d3a", "#3a3a6b");
    },
    baptism: function () {
      return wrap('<circle cx="400" cy="140" r="80" fill="#ffe9b0" opacity=".22"/>'
        + '<path d="M0 300 q100 -24 200 0 t200 0 t200 0 t200 0 v120 H0 Z" fill="#2b4a6b"/>'
        + '<path d="M0 340 q100 -24 200 0 t200 0 t200 0 t200 0 v80 H0 Z" fill="#20395a" opacity=".8"/>'
        + '<circle cx="400" cy="250" r="24" fill="#12172a"/>'
        + '<path d="M400 272 q-30 6 -36 60 h72 q-6 -54 -36 -60 Z" fill="#12172a"/>'
        + '<path d="M360 250 q40 -50 80 0" stroke="#ffe9b0" stroke-width="5" fill="none" opacity=".6"/>', "#1e2140", "#4a6a9a");
    },
    peace: function () {
      return wrap('<circle cx="400" cy="150" r="100" fill="#ffe9b0" opacity=".12"/>'
        + '<circle cx="400" cy="130" r="40" fill="#ffe9b0" opacity=".5"/>'
        + hills(["#3d6b52", "#2f4f3e"])
        + '<circle cx="400" cy="290" r="22" fill="#12172a"/>'
        + '<path d="M400 310 q-30 6 -36 66 h72 q-6 -60 -36 -66 Z" fill="#12172a"/>', "#22304a", "#6b7a9a");
    }
  };
})();

/* Emoji glyph per scene, used as a small badge in the UI */
var ART_GLYPH = {
  creation: "\u2728", seeking: "\uD83D\uDD0D", openBible: "\uD83D\uDCD6", hands: "\uD83E\uDD32",
  crossroad: "\uD83E\uDDED", cross: "\u271D\uFE0F", sunrise: "\uD83C\uDF05", anchor: "\u2693",
  path: "\uD83D\uDEE4", lamp: "\uD83E\uDE94", prayer: "\uD83D\uDE4F", dove: "\uD83D\uDD4A",
  shield: "\uD83D\uDEE1\uFE0F", world: "\uD83C\uDF0D", together: "\uD83D\uDC65", city: "\uD83C\uDFD9\uFE0F",
  baptism: "\uD83D\uDCA7", peace: "\uD83D\uDD4A\uFE0F"
};
