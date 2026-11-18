/* EMMAUS course engine (v2).
 *
 * A course is a plain object (see the bottom of each file in courses/):
 *   { key, brand, tagline, lang, vers, intro:{...}, lessons:[...], closing:{...} }
 *
 * The engine renders it one page at a time, keeps progress and notes in
 * localStorage, puts a "talk to someone" block on every page, and needs no
 * network. It also exposes exportCourse() so a course can be written out to a
 * single self-contained file.
 */

/* ---- shared UI strings (fall back to English if a language is missing) ---- */
function courseStrings(lang) {
  var base = (typeof STRINGS !== "undefined" && STRINGS.en) ? STRINGS.en : {};
  var loc = (typeof STRINGS !== "undefined" && STRINGS[lang]) ? STRINGS[lang] : {};
  var out = {};
  for (var k in base) out[k] = (loc[k] !== undefined) ? loc[k] : base[k];
  for (var k2 in loc) if (out[k2] === undefined) out[k2] = loc[k2];
  return out;
}

/* ---- scripture lookup, with a safe fallback if a verse is missing ---- */
function courseVerseStore(vers) {
  if (vers === "lug" && typeof VERSES_LUG !== "undefined") return VERSES_LUG;
  return (typeof VERSES !== "undefined") ? VERSES : {};
}

function initCourse(COURSE) {
  var S = courseStrings(COURSE.lang || "en");
  var V = courseVerseStore(COURSE.vers || "kjv");
  var KEY = COURSE.key;
  var DB = load();
  var idx = 0;
  var welcome = true;
  var done = false;

  var view, navIn, progEl, whoEl, floatEl;

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
  function verseText(ref) {
    if (V[ref]) return V[ref];
    var m = ref.match(/^(.+?)\s+(\d+):(\d+)-(\d+)$/);
    if (m) {
      var parts = [];
      for (var i = +m[3]; i <= +m[4]; i++) {
        var t = V[m[1] + " " + m[2] + ":" + i];
        if (t) parts.push(t);
      }
      if (parts.length) return parts.join(" ");
    }
    return "";
  }

  /* ---- the message someone sends you, written for them in advance ---- */
  function fill(tpl, topic) {
    var where = COURSE.brand + (COURSE.tagline ? " - " + COURSE.tagline : "");
    return String(tpl || "")
      .replace("{name}", DB.name || "...")
      .replace("{where}", where)
      .replace("{topic}", topic || currentTitle() || "");
  }
  function prefill(kind) {
    if (kind === "prayer") return fill(S.msgPrayer);
    if (kind === "question") return fill(S.msgQuestion);
    if (kind === "jesus") return fill(S.msgJesus);
    return fill(S.msgTalk);
  }
  function currentTitle() {
    if (welcome) return (COURSE.intro || {}).title || "";
    if (done) return (COURSE.closing || {}).title || "";
    var L = COURSE.lessons[idx];
    return L ? L.title : "";
  }
  function shareMessage() {
    return (currentTitle() ? currentTitle() + " - " : "") + COURSE.brand +
      (COURSE.tagline ? " - " + COURSE.tagline : "") + ".\nBw'olina omuntu eyeetaaga, mumuweereze kino.";
  }

  /* ---- pieces ---- */
  function verseBlock(ref, minor) {
    var t = verseText(ref);
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

  /* The box that puts a person in front of them on every single page. */
  function contactBox() {
    return '<div class="box talk">'
      + '<h3>' + esc(S.talkTitle) + '</h3>'
      + '<p>' + esc(S.talkBody) + '</p>'
      + '<div class="chips big">'
      + '<a class="chip call" href="' + esc(CONTACT.telLink()) + '">&#9742; ' + esc(S.call) + '</a>'
      + '<a class="chip wa" href="' + esc(CONTACT.waLink(prefill("talk"))) + '" target="_blank" rel="noopener">WhatsApp</a>'
      + '<a class="chip tg" href="' + esc(CONTACT.tgLink()) + '" target="_blank" rel="noopener">Telegram</a>'
      + '</div>'
      + '<div class="chips">'
      + '<a class="chip" href="' + esc(CONTACT.waLink(prefill("prayer"))) + '" target="_blank" rel="noopener">' + esc(S.askPrayer) + '</a>'
      + '<a class="chip" href="' + esc(CONTACT.waLink(prefill("question"))) + '" target="_blank" rel="noopener">' + esc(S.askQuestion) + '</a>'
      + '<a class="chip gold" href="' + esc(CONTACT.waLink(prefill("jesus"))) + '" target="_blank" rel="noopener">' + esc(S.askJesus) + '</a>'
      + '</div>'
      + '<p class="small muted">' + esc(CONTACT.showName()) + '</p>'
      + '</div>';
  }

  /* Send this page to a friend - the whole point of the series. */
  function shareBox() {
    return '<div class="box share">'
      + '<h3>' + esc(S.shareTitle) + '</h3>'
      + '<p class="small">' + esc(S.shareBody) + '</p>'
      + '<div class="chips">'
      + '<button class="chip wa" id="shareBtn">' + esc(S.shareWhatsapp) + '</button>'
      + '<button class="chip" id="copyBtn">' + esc(S.shareCopy) + '</button>'
      + '</div></div>';
  }

  /* ---- screens ---- */
  function screenWelcome() {
    var i = COURSE.intro || {};
    return '<div class="page">'
      + hero(i.art || "creation", COURSE.brand, i.title, i.lead)
      + '<div class="box">'
      + '<h3>' + esc(i.noteTitle || S.before) + '</h3>'
      + '<p class="small">' + esc(i.note || "") + '</p>'
      + '<label>' + esc(S.yourName) + '</label>'
      + '<input id="nm" placeholder="' + esc(S.namePlaceholder) + '" value="' + esc(DB.name) + '" autocomplete="off">'
      + '</div>'
      + (i.prayer ? '<div class="box pray"><h3>' + esc(S.prayerStart) + '</h3><p class="big">' + esc(i.prayer) + '</p></div>' : '')
      + '<div class="box"><h3>' + esc(S.whatThis) + '</h3><ul>'
      + (i.points || []).map(function (p) { return '<li>' + esc(p) + '</li>'; }).join("")
      + '</ul></div>'
      + contactBox()
      + shareBox()
      + '</div>';
  }

  function screenLesson(L) {
    var n = idx + 1;
    return '<div class="page">'
      + '<div class="hero"><div class="art">' + ((typeof ART !== "undefined" && ART[L.art]) ? ART[L.art]() : "") + '</div></div>'
      + '<div class="kicker">' + esc(L.kicker) + '</div>'
      + '<h1>' + esc(L.title) + '</h1>'
      + '<p class="lead">' + esc(L.lead) + '</p>'
      + verseBlock(L.verse, false)
      + '<div class="box"><h3>' + esc(S.whatMeans) + '</h3><p>' + esc(L.meaning) + '</p></div>'
      + ((L.verses2 && L.verses2.length)
        ? '<div class="box"><h3>' + esc(S.readAlso) + '</h3>' + L.verses2.map(function (r) { return verseBlock(r, true); }).join("") + '</div>'
        : '')
      + (L.prayer ? '<div class="box pray"><h3>' + esc(S.prayThis) + '</h3><div class="prayer">' + esc(L.prayer) + '</div></div>' : '')
      + '<div class="box think"><h3>' + esc(S.think) + '</h3><p>' + esc(L.think) + '</p></div>'
      + '<div class="box do"><h3>' + esc(S.doToday) + '</h3><p>' + esc(L.action) + '</p></div>'
      + ((L.deeper && L.deeper.length)
        ? '<div class="box"><h3>' + esc(S.deeper) + '</h3>'
          + L.deeper.map(function (d) {
              return '<p style="margin-top:.6em"><b>' + esc(d.title) + '</b></p><p>' + esc(d.body) + '</p>';
            }).join("")
          + '</div>'
        : '')
      + '<div class="box"><h3>' + esc(S.notes) + '</h3>'
      + '<label>' + esc(S.notesLabel) + '</label>'
      + '<textarea id="note" placeholder="' + esc(S.notesPlaceholder) + '">' + esc(DB.notes[n] || "") + '</textarea>'
      + '<button class="btn gold" id="saveNote" style="margin-top:10px">' + esc(S.saveNote) + '</button>'
      + '</div>'
      + contactBox()
      + shareBox()
      + dots()
      + '</div>';
  }

  function screenClosing() {
    var c = COURSE.closing || {};
    return '<div class="page">'
      + hero(c.art || "city", c.kicker || S.madeIt, c.title, c.lead)
      + (c.boxes || []).map(function (b) {
          return '<div class="box ' + (b.cls || "") + '"><h3>' + esc(b.title) + '</h3>' + b.html + '</div>';
        }).join("")
      + contactBox()
      + shareBox()
      + '<div class="box"><h3>' + esc(S.notesSoFar) + '</h3>'
      + (function () {
          var ks = Object.keys(DB.notes).filter(function (k) { return DB.notes[k]; })
            .sort(function (a, b) { return a - b; });
          return ks.length
            ? ks.map(function (k) {
                return '<p class="small"><b>' + esc(S.page) + ' ' + esc(k) + ':</b> ' + esc(DB.notes[k]) + '</p>';
              }).join("")
            : '<p class="small muted">' + esc(S.noNotes) + '</p>';
        })()
      + '</div>'
      + '<div class="box center"><h3>' + esc(S.about) + '</h3>'
      + '<p class="small">' + esc(COURSE.brand) + (COURSE.tagline ? ' - ' + esc(COURSE.tagline) : '') + '</p>'
      + '<p class="small">' + esc(CONTACT.showName()) + '</p>'
      + '<p class="small muted">' + esc(S.offline) + '</p>'
      + '<p class="small" style="margin-top:10px">'
      + '<button class="btn ghost" id="restart">' + esc(S.restart) + '</button></p>'
      + '</div></div>';
  }

  /* ---- render ---- */
  function render() {
    var pos = welcome ? 0 : (done ? COURSE.lessons.length : idx + 1);
    progEl.style.width = Math.round(100 * pos / COURSE.lessons.length) + "%";
    whoEl.textContent = DB.name || "";

    if (welcome) { view.innerHTML = screenWelcome(); wireWelcome(); }
    else if (done) { view.innerHTML = screenClosing(); wireClosing(); }
    else { view.innerHTML = screenLesson(COURSE.lessons[idx]); wireLesson(); }
    wireCommon();
    window.scrollTo(0, 0);
    drawNav();
  }

  function wireCommon() {
    var sb = document.getElementById("shareBtn");
    if (sb) sb.onclick = function () {
      var msg = shareMessage();
      if (navigator.share) { navigator.share({ text: msg }).catch(function () {}); return; }
      window.open(CONTACT.shareLink(msg), "_blank");
    };
    var cb = document.getElementById("copyBtn");
    if (cb) cb.onclick = function () {
      var msg = shareMessage() + " " + location.href;
      var done = function () { toast(S.copied); };
      if (navigator.clipboard) navigator.clipboard.writeText(msg).then(done, done);
      else { window.prompt("Copy:", msg); }
    };
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
      DB.seen[idx] = true; save(); toast(S.saved);
    };
  }
  function wireClosing() {
    var r = document.getElementById("restart");
    if (r) r.onclick = function () { welcome = true; done = false; idx = 0; render(); };
  }

  /* ---- nav ---- */
  function drawNav() {
    if (welcome) {
      navIn.innerHTML = '<button class="btn gold" id="beginBtn">' + esc(S.begin) + ' &rarr;</button>';
      document.getElementById("beginBtn").onclick = function () { welcome = false; idx = 0; render(); };
      return;
    }
    if (done) {
      navIn.innerHTML = '<button class="btn ghost" id="backL">&larr; ' + esc(S.backLessons) + '</button>';
      document.getElementById("backL").onclick = function () { done = false; idx = COURSE.lessons.length - 1; render(); };
      return;
    }
    var back = '<button class="btn ghost" id="bBack">&larr; ' + esc(S.back) + '</button>';
    var next;
    if (idx < COURSE.lessons.length - 1) next = '<button class="btn" id="bNext">' + esc(S.next) + ' &rarr;</button>';
    else next = '<button class="btn gold" id="bNext">' + esc(S.finish) + ' &rarr;</button>';
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
    clearTimeout(toastT); toastT = setTimeout(function () { el.classList.remove("show"); }, 1900);
  }

  /* ---- the always-there buttons to reach you ---- */
  function drawFloat() {
    var f = document.getElementById("float");
    if (!f) return;
    f.innerHTML =
      '<a class="fab fab-call" href="' + esc(CONTACT.telLink()) + '" title="' + esc(S.call) + '">'
      + '<span class="fab-ic">&#9742;</span><span class="fab-tx">' + esc(S.call) + '</span></a>'
      + '<a class="fab fab-wa" href="' + esc(CONTACT.waLink(prefill("talk"))) + '" target="_blank" rel="noopener" title="' + esc(S.whatsapp) + '">'
      + '<span class="fab-ic">&#128172;</span><span class="fab-tx">' + esc(S.whatsapp) + '</span></a>';
  }

  /* ---- boot ---- */
  view = document.getElementById("view");
  navIn = document.getElementById("navIn");
  progEl = document.getElementById("prog");
  whoEl = document.getElementById("whoName");
  floatEl = document.getElementById("float");
  document.getElementById("brandName").textContent = COURSE.brand;
  document.getElementById("brandTag").textContent = COURSE.tagline || "";
  document.title = COURSE.brand + (COURSE.tagline ? " - " + COURSE.tagline : "");
  render();
  drawFloat();
}

/* Write a course out as one self-contained HTML file (used by build.js).
   Everything it needs is inlined, so the file opens offline with no server. */
function exportCourse(COURSE, parts) {
  var css = parts.css || "";
  var js = [parts.contact || "", parts.strings || "", parts.art || "",
            parts.verses || "", parts.versesLug || "",
            parts.engine || "", parts.course || ""].join("\n");
  /* a literal "</script" inside any of these would close the page's script
     tag early, so break it up. It is only ever inside a string. */
  js = js.replace(/<\/script/gi, "<\\/script");
  return '<!DOCTYPE html>\n<html lang="' + (COURSE.lang === "lg" ? "lg" : "en") + '">\n<head>\n'
    + '<meta charset="utf-8">\n'
    + '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n'
    + '<meta name="theme-color" content="#0e1015">\n'
    + '<title>' + COURSE.brand + (COURSE.tagline ? " - " + COURSE.tagline : "") + '</title>\n'
    + '<style>\n' + css + '\n</style>\n</head>\n<body>\n'
    + '<div class="topbar"><div class="in"><div class="row">'
    + '<div class="brand"><span id="brandName">' + COURSE.brand + '</span><small id="brandTag"></small></div>'
    + '<div class="who"><span>' + (COURSE.lang === "lg" ? "Omutambuzi" : "Pilgrim") + '</span><b id="whoName"></b></div>'
    + '</div><div class="track"><i id="prog"></i></div></div></div>\n'
    + '<main class="wrap" id="view"></main>\n'
    + '<div id="float"></div>\n'
    + '<div class="navbar"><div class="in" id="navIn"></div></div>\n'
    + '<div class="toast" id="toast"></div>\n'
    + '<script>\n' + js + '\ninitCourse(COURSE);\n</script>\n</body>\n</html>\n';
}
