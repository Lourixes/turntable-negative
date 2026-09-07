// browse-calm-cards.js
// Beruhigt die Kategorie-Kacheln unter "Browse all" auf der Suchseite:
// keine 27 bunten Flaechen mehr, kein schraeg liegendes Artwork - nur Beschriftung
// auf ruhiger Theme-Flaeche. Akzent nur dort, wo der Zeiger steht.
//
// Raster und Kachelgroesse (270x152) bleiben unveraendert; es aendert sich nur die
// Farbe und das Artwork faellt weg.
//
// Warum !important:
// Spotify faerbt jede der 69 Kacheln einzeln ein und schreibt die Farbe als
// Inline-Style ans Element (style="background-color: rgb(220, 20, 140)").
// Ein Inline-Wert schlaegt jede normale Regel - nur !important kommt daran vorbei.
//
// Warum die Struktursignatur als Anker und nicht der Link oder das Raster:
// Die Klassen der Kachel sind Hashes (Wz3dEPV2mIQW7nLE, iaaQKMqcyZQBT9bn) und
// aendern sich bei Spotify-Updates. Zwei naheliegende Alternativen fielen im Test
// durch:
//   a[href^="/genre/"]      - trifft 69 der 70 Kacheln. "Live Events" zeigt auf
//                             /concerts und blieb bunt stehen.
//   .main-shelf-shelfGrid a - trifft auf der Suchseite alle 70, auf der Startseite
//                             aber auch 45 gewoehnliche Playlist-Karten.
// Was diese Kacheln eindeutig ausmacht, ist ihre Bauform: ein Link, dessen direktes
// Kind ein <div> mit inline gesetzter Hintergrundfarbe ist. Gemessen trifft das
// app-weit genau 70 Elemente - 0 auf der Startseite, 0 in Liked Songs, 70 unter
// "Browse all". Und weil genau diese Inline-Farbe das ist, was wir entfernen,
// beschreibt der Selektor exakt das Ziel.
//
// Warum der Text beim Hover dunkel wird:
// Der Akzent #bc8ead ist ein heller Mauve; weisse Schrift darauf waere schlecht
// lesbar. Und angesprochen wird die Beschriftung ueber den Nachfahren-Selektor,
// weil der Text in einem <span> steckt und seine eigene Farbe mitbringt -
// Vererbung allein reicht dort nicht.

(function browseCalmCards() {
  const STYLE_ID = "browse-calm-cards-style";
  // Die Farbflaeche selbst - kein :has() noetig, wir treffen sie direkt.
  const FLAECHE = 'a > div[style*="background-color"]';

  function build() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
/* --- Flaeche entfaerben --------------------------------------------------- */
${FLAECHE} {
  background-color: var(--spice-card, #181825) !important;
  transition: background-color .15s ease;
}

/* --- Artwork entfernen ---------------------------------------------------
   Die Bilder liegen absolut positioniert in der Kachel, ihr Wegfall aendert
   das Raster nicht. Nebeneffekt: 70 Bilder weniger, die der Duotone-Filter
   rastern muss. */
${FLAECHE} img {
  display: none !important;
}

/* --- Hover: Akzent -------------------------------------------------------- */
a:hover > div[style*="background-color"] {
  background-color: var(--spice-button, #bc8ead) !important;
}

a:hover > div[style*="background-color"] span {
  color: #11111b !important;
  transition: color .15s ease;
}`;
    document.head.appendChild(style);
  }

  if (document.head) build();
  else document.addEventListener("DOMContentLoaded", build, { once: true });
})();
