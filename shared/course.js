/* EMMAUS course engine.
   A course is a plain object (see COURSE at the bottom of each course page):
     { key, brand, tagline, intro:{...}, lessons:[...], closing:{...}, community:[...] }
   The engine renders it page by page, remembers progress and notes in
   localStorage, and needs no network. */

function initCourse(COURSE) {
  var KEY = COURSE.key;
  var DB = load();
  var idx = 0;            // lesson index
  var welcome = true;
  var done = false;       // showing closing page

  var view, navIn, progEl, whoEl;

  function load() {
    try { var r = localStorage.getItem(KEY); if (r) return JSON.parse(r); } catch (e) {}
    return { name: "", seen: {}, notes: {} };
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(DB)); } catch (e) {} }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (m) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m];
    });
  }

  /* ---- pieces ---- */
  function verseBlock(ref, minor) {
    var t = (typeof VERSES !== "undefined") ? VERSES[ref] : null;
    if (!t) return "";
    return '<div class="verse' + (minor ? " minor" : "") + '">'
      + '<div class="ref">' + esc(ref.toUpperCase()) + '</div>'
      + '<div class="text">' + esc(t) + '</div></div>';
  }
  function hero(artKey, kicker, title, lead) {
    var art = (typeof ART !== "undefined" && ART[artKey]) ? ART[artKey]() : "";
    return '<div class="hero">'
      + '<div class="art">' + art + '</div>'
      + '<div class="cap">'
      + (kicker ? '<div class="kicker">' + esc(kicker) + '</div>' : '')
      + '<h1>' + esc(title) + '</h1>'
      + (lead ? '<p class="lead" style="margin-bottom:0">' + esc(lead) + '</p>' : '')
      + '</div></div>';
  }
  function dots() {
    var s = "";
    for (var i = 0; i < COURSE.lessons.length; i++) {
      s += '<b class="' + (i < idx ? "seen" : (i === idx ? "on" : "")) + '"></b>';
    }
    return '<div class="dots">' + s + '</div>';
  }

  /* ---- screens ---- */
  function screenWelcome() {
    var i = COURSE.intro || {};
    return '<div class="page">'
      + hero(i.art || "creation", COURSE.brand, i.title, i.lead)
      + '<div class="box">'
      + '<h3>' + esc(i.noteTitle || "Before you begin") + '</h3>'
      + '<p class="small">' + esc(i.note || "") + '</p>'
      + '<label>Your name (so your progress is kept on this device)</label>'
      + '<input id="nm" placeholder="Type your name" value="' + esc(DB.name) + '" autocomplete="off">'
      + '</div>'
      + (i.prayer ? '<div class="box pray"><h3>A prayer before we start</h3><p class="big">' + esc(i.prayer) + '</p></div>' : '')
      + '<div class="box"><h3>What this is</h3><ul>'
      + (i.points || []).map(function (p) { return '<li>' + esc(p) + '</li>'; }).join("")
      + '</ul></div>'
      + '</div>';
  }

  function screenLesson(L) {
    var n = idx + 1;
    var body = ""
      + '<div class="kicker">' + esc(L.kicker) + '</div>'
      + '<h1>' + esc(L.title) + '</h1>'
      + '<p class="lead">' + esc(L.lead) + '</p>'
      + verseBlock(L.verse, false)
      + '<div class="box"><h3>What this means</h3><p>' + esc(L.meaning) + '</p></div>'
      + ((L.verses2 && L.verses2.length)
        ? '<div class="box"><h3>Read also</h3>' + L.verses2.map(function (r) { return verseBlock(r, true); }).join("") + '</div>'
        : '')
      + (L.prayer ? '<div class="box pray"><h3>Pray this</h3><div class="prayer">' + esc(L.prayer) + '</div></div>' : '')
      + '<div class="box think"><h3>Think about it</h3><p>' + esc(L.think) + '</p></div>'
      + '<div class="box do"><h3>Do this today</h3><p>' + esc(L.action) + '</p></div>'
      + ((L.deeper && L.deeper.length)
        ? '<div class="box"><h3>Going deeper</h3>'
          + L.deeper.map(function (d) {
              return '<p style="margin-top:.6em"><b>' + esc(d.title) + '</b></p><p>' + esc(d.body) + '</p>';
            }).join("")
          + '</div>'
        : '')
      + '<div class="box"><h3>Your notes</h3>'
      + '<label>Write what God is showing you on this page</label>'
      + '<textarea id="note" placeholder="My thoughts...">' + esc(DB.notes[n] || "") + '</textarea>'
      + '<button class="btn gold" id="saveNote" style="margin-top:10px">Save my note</button>'
      + '</div>'
      + dots();
    return '<div class="page">'
      + '<div class="hero"><div class="art">' + ((typeof ART !== "undefined" && ART[L.art]) ? ART[L.art]() : "") + '</div></div>'
      + body + '</div>';
  }

  function screenClosing() {
    var c = COURSE.closing || {};
    return '<div class="page">'
      + hero(c.art || "city", c.kicker || "You made it", c.title, c.lead)
      + (c.boxes || []).map(function (b) {
          return '<div class="box ' + (b.cls || "") + '"><h3>' + esc(b.title) + '</h3>' + b.html + '</div>';
        }).join("")
      + '<div class="box"><h3>Walk with others</h3>'
      + '<p class="small">Faith grows in company. Ask your questions, share what you are learning, and encourage one another.</p>'
      + '<div class="chips">' + (COURSE.community || []).map(function (x) {
          return '<a href="' + x.u + '" target="_blank" rel="noopener">' + esc(x.n) + '</a>';
        }).join("") + '</div>'
      + '<p class="small muted" style="margin-top:8px">Replace these with your church\u2019s own group links (see the community list in this file).</p>'
      + '</div>'
      + '<div class="box"><h3>Your notes so far</h3>'
      + (function () {
          var ks = Object.keys(DB.notes).filter(function (k) { return DB.notes[k]; })
            .sort(function (a, b) { return a - b; });
          return ks.length
            ? ks.map(function (k) {
                return '<p class="small"><b>Page ' + esc(k) + ':</b> ' + esc(DB.notes[k]) + '</p>';
              }).join("")
            : '<p class="small muted">No notes yet \u2014 go back and write as you read.</p>';
        })()
      + '</div>'
      + '<div class="box center"><h3>About</h3>'
      + '<p class="small">' + esc(COURSE.brand) + ' \u2014 ' + esc(COURSE.tagline) + '</p>'
      + (COURSE.contact ? '<p class="small">' + COURSE.contact + '</p>' : '')
      + '<p class="small muted">Offline single file. No server. Nothing leaves your device.</p>'
      + '<p class="small" style="margin-top:10px">'
      + '<button class="btn ghost" id="restart">Start again from the beginning</button></p>'
      + '</div></div>';
  }

  /* ---- render ---- */
  function render() {
    var total = COURSE.lessons.length + 1; // welcome + lessons (closing is "after last")
    var pos = welcome ? 0 : (done ? COURSE.lessons.length : idx + 1);
    progEl.style.width = Math.round(100 * pos / COURSE.lessons.length) + "%";
    whoEl.textContent = DB.name || "";

    if (welcome) { view.innerHTML = screenWelcome(); wireWelcome(); }
    else if (done) { view.innerHTML = screenClosing(); wireClosing(); }
    else { view.innerHTML = screenLesson(COURSE.lessons[idx]); wireLesson(); }
    window.scrollTo(0, 0);
    drawNav();
  }

  function wireWelcome() {
    var i = document.getElementById("nm");
    i.addEventListener("input", function () {
      DB.name = i.value.trim(); save(); whoEl.textContent = DB.name;
    });
  }
  function wireLesson() {
    var t = document.getElementById("note");
    if (t) t.addEventListener("input", function () { DB.notes[idx + 1] = t.value; save(); });
    var b = document.getElementById("saveNote");
    if (b) b.onclick = function () {
      DB.notes[idx + 1] = document.getElementById("note").value;
      DB.seen[idx] = true; save(); toast("Saved. Keep going.");
    };
  }
  function wireClosing() {
    var r = document.getElementById("restart");
    if (r) r.onclick = function () { welcome = true; done = false; idx = 0; render(); };
  }

  /* ---- nav ---- */
  function drawNav() {
    if (welcome) {
      navIn.innerHTML = '<button class="btn gold" id="beginBtn">Begin \u2192</button>';
      document.getElementById("beginBtn").onclick = function () { welcome = false; idx = 0; render(); };
      return;
    }
    if (done) {
      navIn.innerHTML = '<button class="btn ghost" id="backL">\u2190 Back to the lessons</button>';
      document.getElementById("backL").onclick = function () { done = false; idx = COURSE.lessons.length - 1; render(); };
      return;
    }
    var back = '<button class="btn ghost" id="bBack">\u2190 Back</button>';
    var next;
    if (idx < COURSE.lessons.length - 1) next = '<button class="btn" id="bNext">Next \u2192</button>';
    else next = '<button class="btn gold" id="bNext">Finish \u2192</button>';
    navIn.innerHTML = back + next;
    document.getElementById("bBack").onclick = function () {
      if (idx === 0) { welcome = true; } else { idx--; }
      render();
    };
    document.getElementById("bNext").onclick = function () {
      DB.seen[idx] = true; save();
      if (idx === COURSE.lessons.length - 1) { done = true; } else { idx++; }
      render();
    };
  }

  var toastT;
  function toast(m) {
    var el = document.getElementById("toast");
    el.textContent = m; el.classList.add("show");
    clearTimeout(toastT); toastT = setTimeout(function () { el.classList.remove("show"); }, 1700);
  }

  /* ---- boot ---- */
  view = document.getElementById("view");
  navIn = document.getElementById("navIn");
  progEl = document.getElementById("prog");
  whoEl = document.getElementById("whoName");
  document.getElementById("brandName").textContent = COURSE.brand;
  document.getElementById("brandTag").textContent = COURSE.tagline;
  document.title = COURSE.brand + " \u2014 " + COURSE.tagline;
  render();
}
