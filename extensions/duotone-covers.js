// duotone-covers.js
// Stellt Album- und Playlist-Artwork als Duotone dar; beim Hover erscheint das Original.
// Umsetzung: ein SVG-Filter (Graustufen via Luminanz, dann Abbildung des
// Helligkeitsverlaufs auf zwei Zielfarben). Reines CSS ab da - kein MutationObserver,
// also keine Last pro Bild und nichts, was bei Spotify-Updates haengen bleiben kann.

(function duotoneCovers() {
  const FILTER_ID = "ct-duotone";

  // ---- Farbparameter -----------------------------------------------
  // Bequemer per Befehl:  spotify-duotone '#d9c8d3'
  //                       spotify-duotone --dark '#11111b'
  // Alternativ hier direkt aendern, danach: spicetify apply + Neustart.
  // Eine CSS-Variable auf :root (--ct-duotone-light / --ct-duotone-dark)
  // hat Vorrang vor diesen Werten, falls gesetzt.
  // --------------------------------------------------------------------
  const FALLBACK_DARK = "#837f95";  // Catppuccin Crust - dunkler als Base fuer mehr Kontrast
  const FALLBACK_LIGHT = "#000000";  // helle Seite: zwischen Weiss und dem Akzent, entsaettigt

  function readVar(name, fallback) {
    try {
      const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
      return /^#[0-9a-fA-F]{6}$/.test(v) ? v : fallback;
    } catch {
      return fallback;
    }
  }

  function toUnit(hex) {
    return [1, 3, 5].map(i => (parseInt(hex.slice(i, i + 2), 16) / 255).toFixed(6));
  }

  function build() {
    if (document.getElementById(FILTER_ID)) return;

    const dark = toUnit(readVar("--ct-duotone-dark", FALLBACK_DARK));
    const light = toUnit(readVar("--ct-duotone-light", FALLBACK_LIGHT));

    // Eine einzige feColorMatrix statt feColorMatrix + feComponentTransfer.
    // Luminanz L = 0.2126R + 0.7152G + 0.0722B, dann linear auf die beiden
    // Zielfarben abgebildet:  out = dunkel + L * (hell - dunkel)
    // Das ist als affine Abbildung direkt in der Matrix darstellbar - eine
    // Filterstufe weniger, bei identischem Ergebnis (L=0 -> dunkel, L=1 -> hell).
    const LUM = [0.2126, 0.7152, 0.0722];
    const zeile = (i) => {
      const d = +dark[i], spanne = +light[i] - d;
      return LUM.map(k => (k * spanne).toFixed(6)).join(" ") + " 0 " + d.toFixed(6);
    };

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("width", "0");
    svg.setAttribute("height", "0");
    svg.style.cssText = "position:absolute;width:0;height:0;pointer-events:none";
    svg.innerHTML = `
      <filter id="${FILTER_ID}" color-interpolation-filters="sRGB">
        <feColorMatrix type="matrix" values="
          ${zeile(0)}
          ${zeile(1)}
          ${zeile(2)}
          0 0 0 1 0"/>
      </filter>
      <filter id="${FILTER_ID}-off" color-interpolation-filters="sRGB">
        <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0"/>
      </filter>`;
    document.body.appendChild(svg);

    const style = document.createElement("style");
    style.id = FILTER_ID + "-style";
    style.textContent = `
/* --- Duotone ------------------------------------------------------------
   Runde Kuenstlerbilder sind eingeschlossen (Karten wie Avatare in
   Regal-Kopfzeilen). Der Substring-Selektor umgeht die Versionsnummer in
   den encore-Klassen, die sich bei Spotify-Updates aendern kann.
   NICHT erfasst bleiben Video-Thumbnails (16:9 / hochformatig) - das sind
   keine Cover.                                                            */
.main-cardImage-imageWrapper img.main-image-image,
img[class*="legacy-image--circle"],
.x-entityImage-imageContainer img.main-image-image,
.view-homeShortcutsGrid-imageWrapper img.main-image-image,
img.main-trackList-rowImage,
img.main-entityHeader-image,
img.cover-art-image,
[class*="PromotionDefaultNativeImage-module_image__"] {
  filter: url(#ct-duotone);
}

/* --- Hover: Originalcover ---------------------------------------------- */
.main-card-cardContainer:hover .main-cardImage-imageWrapper img.main-image-image,
.main-cardImage-imageWrapper:hover img.main-image-image,
img[class*="legacy-image--circle"]:hover,
/* Sidebar- und Listenzeilen: Bild und Container haben pointer-events:none und
   koennen :hover gar nicht empfangen - der Hover muss an der Zeile haengen. */
[class*="legacy-list-row"]:hover img,
.x-entityImage-imageContainer:hover img.main-image-image,
.view-homeShortcutsGrid-imageContainer:hover img.main-image-image,
.main-trackList-trackListRow:hover img.main-trackList-rowImage,
img.main-trackList-rowImage:hover,
.main-entityHeader-imageContainer:hover img.main-entityHeader-image,
img.main-entityHeader-image:hover,
.cover-art:hover img.cover-art-image,
img.cover-art-image:hover,
[class*="PromotionDefaultNativeImage-module_image-container__"]:hover [class*="PromotionDefaultNativeImage-module_image__"],
[class*="PromotionDefaultNativeImage-module_image__"]:hover {
  /* Bewusst nicht "none": Wird der Filter entfernt, wechselt das Element den
     Renderpfad und muss neu gerastert werden - das kostete Aussetzer bis 150ms.
     Bleibt ein Filter aktiv und aendert nur seine Werte, laeuft es mit 60fps
     durch. Gemessen: 8 Aussetzer pro 84 Frames gegenueber 0. */
  filter: url(#${FILTER_ID}-off);
}`;
    document.head.appendChild(style);
  }

  // body/head existieren beim Injizieren der Extension nicht zwingend schon
  if (document.body && document.head) build();
  else document.addEventListener("DOMContentLoaded", build, { once: true });
})();
