// hide-videos.js
// Blendet Videoinhalte aus: Video-Podcast-Folgen, die zugehoerigen Regale und
// den Abschnitt "Aehnliche Musikvideos" in der Now-Playing-Ansicht.
//
// Videokarten tragen einen _Video-Marker in der Klasse (BigCard_episode_<id>_Video).
// Ein Regal wird nur dann komplett ausgeblendet, wenn darin keine regulaeren
// Karten stehen - gemischte Regale verlieren so nur ihre Videos, nicht alles.

(function hideVideos() {
  const STYLE_ID = "hide-videos-style";

  function build() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
/* Einzelne Videokarten */
[class*="_Video"] { display: none !important; }

/* Regale, in denen ausser Videos nichts uebrig bliebe - sonst steht dort
   eine Ueberschrift ueber einem leeren Streifen. */
section.main-shelf-shelf:has([class*="_Video"]):not(:has(.main-card-cardContainer)) {
  display: none !important;
}

/* "Aehnliche Musikvideos" in der Now-Playing-Ansicht */
.main-nowPlayingView-section:has(.search-searchCategory-contentArea) {
  display: none !important;
}`;
    document.head.appendChild(style);
  }

  if (document.head) build();
  else document.addEventListener("DOMContentLoaded", build, { once: true });
})();
