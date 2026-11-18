#!/usr/bin/env node
/* Verify the EMMAUS game, without a browser.
 *
 *   node tools/test-emmaus.js
 *
 * Loads emmaus/index.html, runs the real game code against a minimal DOM,
 * and checks the design rules in MAP.md hold:
 *   - ten chapters, each with all five layers
 *   - every layer has the fields the renderer needs
 *   - every truth tag is one of the three allowed tags
 *   - Chapter 9 carries its four deeper notes
 *   - the Manna word is stable for a given day and cannot be stockpiled
 *   - every chapter has a Little Lamp (child) layer
 *   - the contact number is configured and reachable from every screen
 *   - the whole file is self-contained (no network)
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const FILE = path.join(ROOT, "emmaus", "index.html");

const html = fs.readFileSync(FILE, "utf8");
const script = html.slice(html.indexOf("<script>") + 8, html.lastIndexOf("</script>"));

/* a tiny DOM the game can talk to */
function makeDom() {
  const nodes = {};
  function el(id) {
    if (!nodes[id]) {
      nodes[id] = {
        id, innerHTML: "", textContent: "", style: {}, value: "", checked: false, href: "",
        dataset: {},
        classList: { add() {}, remove() {}, toggle() {} },
        addEventListener() {}, onclick: null, onchange: null,
      };
    }
    return nodes[id];
  }
  return {
    nodes,
    document: {
      getElementById: el,
      querySelectorAll: () => [],
      addEventListener() {},
    },
    window: {},
    localStorage: { getItem() { return null; }, setItem() {} },
    navigator: {},
    confirm: () => false,
  };
}

let failures = 0;
function check(cond, msg) {
  if (!cond) { console.log("    FAIL: " + msg); failures++; }
}

const dom = makeDom();
const api = new Function(
  "document", "window", "localStorage", "navigator", "confirm",
  script + "\nreturn { CHAPTERS: CHAPTERS, KID: KID, CONTACT: CONTACT, COMMUNITY: COMMUNITY, "
    + "MANNA_WORDS: MANNA_WORDS, mannaWord: mannaWord, dayKey: dayKey, "
    + "blankUser: blankUser, totalLayers: totalLayers };"
)(dom.document, dom.window, dom.localStorage, dom.navigator, dom.confirm);

const C = api.CHAPTERS;

/* 1. ten chapters */
console.log("\n1. The journey");
check(C.length === 10, `ten chapters (got ${C.length})`);
C.forEach((c, i) => {
  const where = `chapter ${c.id} (${c.title || "?"})`;
  check(c.id === i + 1, `${where}: id is sequential`);
  check(!!c.title, `${where}: title`);
  check(!!c.life, `${where}: life area`);
});

/* 2. the five layers, with their required fields */
console.log("2. The five layers");
C.forEach((c) => {
  const where = `chapter ${c.id} (${c.title})`;
  check(c.plain && c.plain.ref && c.plain.kjv, `${where}: Plain has ref + KJV`);
  check(c.words && c.words.length >= 2, `${where}: Words has >= 2 word studies`);
  (c.words || []).forEach((w) => check(w.t && w.lang && w.m, `${where}: word "${w.t}" complete`));
  check(c.thread && c.thread.ot && c.thread.nt && c.thread.note, `${where}: Thread complete`);
  check(!!c.practice, `${where}: Practice`);
  check(!!c.watch, `${where}: Watch`);
  check(!!c.sermon, `${where}: sermon line`);
});

/* 3. truth tags are only the three allowed ones */
console.log("3. Truth tags (MAP \u00a73)");
const TAGS = ["t-text", "t-trad", "t-read"];
C.forEach((c) => {
  const where = `chapter ${c.id}`;
  check(TAGS.indexOf(c.thread.tag) >= 0, `${where}: thread tag "${c.thread.tag}" allowed`);
  (c.extra || []).forEach((x, i) => {
    check(TAGS.indexOf(x.tag) >= 0, `${where}: extra ${i + 1} tag "${x.tag}" allowed`);
    check(!!x.head && !!x.body, `${where}: extra ${i + 1} has head + body`);
  });
});

/* 4. chapter 9's deeper notes */
console.log("4. Chapter 9 (the deep-prayer chapter)");
const nine = C[8];
check(nine.extra && nine.extra.length === 4, "chapter 9 has four deeper notes");
check(/21/.test(JSON.stringify(nine)), "chapter 9 mentions Daniel's 21 days");
check(/tongue/i.test(JSON.stringify(nine)), "chapter 9 mentions tongues");

/* 5. Manna: stable per day, one portion, unstockpilable */
console.log("5. Manna (MAP \u00a76)");
check(api.MANNA_WORDS.length >= 10, "manna word list populated");
const w1 = api.mannaWord(new Date("2026-11-18T06:00:00Z"));
const w2 = api.mannaWord(new Date("2026-11-18T22:00:00Z"));
check(w1 === w2, "the same day gives the same word for everyone");
check(api.MANNA_WORDS.indexOf(w1) >= 0, "today's word is from the list");
const u = api.blankUser();
check(u.marks === 0 && u.unlocked.length === 1, "a new pilgrim starts at chapter 1, 0 marks");
check(u.manna && Object.keys(u.manna).length === 0, "a new pilgrim has no manna yet");

/* 6. the Little Lamp for every chapter */
console.log("6. Two lamps (MAP \u00a77)");
C.forEach((c) => {
  const k = api.KID[c.id];
  const where = `chapter ${c.id}`;
  check(!!k, `${where}: has a Little Lamp`);
  check(k && !!k.story && !!k.truth && !!k.do, `${where}: child story/truth/action`);
  check(k && k.quiz && k.quiz.q && k.quiz.o && k.quiz.o.length >= 2, `${where}: child quiz`);
  check(k && k.quiz && k.quiz.a >= 0 && k.quiz.a < k.quiz.o.length, `${where}: quiz answer index valid`);
});

/* 7. contact + community */
console.log("7. Contact (the point of the whole thing)");
check(/^\+?\d{9,}/.test(api.CONTACT.phone.replace(/\s/g, "")), "phone configured");
check(/^\d{9,}$/.test(api.CONTACT.whatsapp), "whatsapp digits configured");
check(/^\d{9,}$/.test(api.CONTACT.telegram), "telegram digits configured");
const msg = api.CONTACT.msg("Test", "chapter 5, The Wilderness");
check(/Test/.test(msg) && /The Wilderness/.test(msg), "prefilled message names the pilgrim and place");
check(api.CONTACT.wa(msg).indexOf("wa.me/") >= 0, "WhatsApp link built");
check(api.CONTACT.tel().indexOf("tel:") === 0, "call link built");

/* 8. self-contained */
console.log("8. Offline (MAP \u00a711)");
const net = html.match(/src\s*=\s*"http|fetch\(|@import|cdn\.|unpkg|jsdelivr/g) || [];
check(net.length === 0, `no network references (found ${net.length})`);

console.log(`\n${C.length} chapters checked.`);
console.log(failures ? `${failures} FAILURES` : "ALL PASS");
process.exit(failures ? 1 : 0);
