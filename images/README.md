# images/

Put real photographs here when you are ready to replace the built-in SVG illustrations.

The course currently ships with hand-built SVG artwork, so it works with nothing installed.
To swap one for a real photo, open `shared/art.js`, find the scene you want (for example
`openBible`), and replace its body with:

```js
openBible: function () {
  return '<img src="images/open-bible.jpg" alt="" style="width:100%;height:100%;object-fit:cover">';
}
```

Then rebuild:

```bash
node build.js
```

## Scene keys you can replace

creation, seeking, openBible, hands, crossroad, cross, sunrise, anchor, path, lamp,
prayer, dove, shield, world, together, city, baptism, peace

## Image tips

- Landscape, roughly **800 × 420** (a 1.9:1 ratio) fills the frame without cropping badly.
- Keep each file under ~200 KB so the single HTML file stays small and the APK stays light.
- Use photos you have the right to use — your own, or properly licensed stock.
- Name files with no spaces, e.g. `open-bible.jpg`.
