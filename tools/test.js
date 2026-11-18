#!/usr/bin/env node
/* Verify every built course, without a browser.
 *
 *   node tools/test.js
 *
 * For each course it loads the built file, runs the real engine against a
 * minimal DOM shim, and checks that:
 *   - the page renders at all (welcome screen is not empty)
 *   - every lesson renders with a resolved Scripture verse
 *   - every art key exists
 *   - no required field is missing (no "undefined" in the output)
 *   - the contact links use the configured number
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const DIST = path.join(ROOT, "dist");

/* a tiny DOM the engine can talk to */
function makeDom() {
  const nodes = {};
  function el(id) {
    if (!nodes[id]) {
      nodes[id] = {
        id, innerHTML: "", textContent: "", style: {}, value: "",
        classList: { add() {}, remove() {} },
        addEventListener() {}, onclick: null,
      };
    }
    return nodes[id];
  }
  return {
    nodes,
    document: { getElementById: el, title: "" },
    window: { scrollTo() {} },
    localStorage: { getItem() { return null; }, setItem() {} },
    navigator: {},
  };
}

/* pull one course's variables out of a built file */
function loadBuilt(file) {
  const html = fs.readFileSync(file, "utf8");
  const script = html.slice(html.indexOf("<script>") + 8, html.lastIndexOf("</script>"));
  const dom = makeDom();
  const api = new Function(
    "document", "window", "localStorage", "navigator", "location",
    script + "\nreturn { COURSE: COURSE, ART: typeof ART!=='undefined'?ART:{}, "
      + "VERSES: typeof VERSES!=='undefined'?VERSES:{}, "
      + "VERSES_LUG: typeof VERSES_LUG!=='undefined'?VERSES_LUG:{}, "
      + "CONTACT: typeof CONTACT!=='undefined'?CONTACT:{} };"
  )(dom.document, dom.window, dom.localStorage, dom.navigator, { href: "file://x" });
  return { api, dom };
}

/* drive the engine through every screen by clicking the real nav buttons,
   so the test sees exactly what the reader sees */
function walkAllPages(dom) {
  const pages = [];
  const click = (id) => {
    const n = dom.nodes[id];
    if (!n || typeof n.onclick !== "function") return false;
    n.onclick();
    return true;
  };
  pages.push(dom.nodes.view.innerHTML);
  if (!click("beginBtn")) return pages;
  let guard = 0;
  while (guard++ < 100) {
    pages.push(dom.nodes.view.innerHTML);
    if (!click("bNext")) break;
  }
  return pages;
}

/* the engine's own range logic, so the test checks what the reader sees */
function verseText(V, ref) {
  if (V[ref]) return V[ref];
  const m = ref.match(/^(.+?)\s+(\d+):(\d+)-(\d+)$/);
  if (m) {
    const parts = [];
    for (let i = +m[3]; i <= +m[4]; i++) {
      const t = V[m[1] + " " + m[2] + ":" + i];
      if (t) parts.push(t);
    }
    if (parts.length) return parts.join(" ");
  }
  return "";
}

let failures = 0;
function check(cond, msg) {
  if (!cond) { console.log("    FAIL: " + msg); failures++; }
}

const files = fs.readdirSync(DIST).filter((f) => f.endsWith(".html"));
let totalLessons = 0;

for (const f of files) {
  const { api, dom } = loadBuilt(path.join(DIST, f));
  const C = api.COURSE;
  const V = (C.vers === "lug") ? api.VERSES_LUG : api.VERSES;
  console.log(`\n${f}  [${C.brand} - ${C.tagline}] lang=${C.lang} vers=${C.vers}`);

  // the welcome screen rendered
  check(dom.nodes.view && dom.nodes.view.innerHTML.length > 200, "welcome screen rendered");
  check(/Type your name|Wandiika erinnya/.test(dom.nodes.view.innerHTML), "name input rendered");

  // walk every screen the way a reader does, and check what is rendered
  const pages = walkAllPages(dom);
  check(pages.length >= C.lessons.length + 1,
    `walked ${pages.length} screens (expected >= ${C.lessons.length + 1})`);
  pages.forEach((html, i) => {
    check(!/\bundefined\b/.test(html.replace(/typeof[^;]*undefined[^;]*/g, "")),
      `${f}: screen ${i + 1} has no "undefined" text`);
    check(html.includes(String(api.CONTACT.whatsapp || "")) || i === 0,
      `${f}: screen ${i + 1} offers contact`);
    check(/wa\.me|tel:/.test(html) || i === 0, `${f}: screen ${i + 1} has call/message links`);
  });

  // every lesson
  C.lessons.forEach((L, i) => {
    totalLessons++;
    const where = `${f} lesson ${i + 1} (${L.title || "?"})`;
    check(!!L.kicker, `${where}: kicker`);
    check(!!L.title, `${where}: title`);
    check(!!L.lead, `${where}: lead`);
    check(!!L.meaning, `${where}: meaning`);
    check(!!L.think, `${where}: think`);
    check(!!L.action, `${where}: action`);
    check(!!api.ART[L.art], `${where}: art key "${L.art}" exists`);
    const v = verseText(V, L.verse);
    check(!!v, `${where}: verse "${L.verse}" resolves`);
    (L.verses2 || []).forEach((r) => {
      check(!!verseText(V, r), `${where}: verses2 "${r}" resolves`);
    });
  });

  // contact links use the configured number
  const digits = String(api.CONTACT.whatsapp || "");
  check(digits.length >= 9, `${f}: contact number configured`);

  // the Luganda course must actually be Luganda
  if (C.lang === "lg") {
    check(/[a-z]/.test(C.intro.title) && C.intro.title.length > 5, `${f}: intro is text`);
    check(api.VERSES_LUG["yokaana 3:16"] !== undefined || Object.keys(api.VERSES_LUG).length > 10,
      `${f}: Luganda scripture embedded`);
  }
}

console.log(`\n${files.length} courses, ${totalLessons} lessons checked.`);
console.log(failures ? `${failures} FAILURES` : "ALL PASS");
process.exit(failures ? 1 : 0);
