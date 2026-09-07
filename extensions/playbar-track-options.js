// playbar-track-options.js
// Setzt den Optionen-Knopf des laufenden Titels (drei Punkte) in die Player-Leiste,
// damit er unabhaengig von der rechten Leiste erreichbar bleibt.
//
// Linksklick  -> Kontextmenue des laufenden Titels
// Rechtsklick -> Now-Playing-Ansicht ein-/ausblenden (siehe npv-collapse.js)
//
// Nutzt Spicetify.Playbar.Button, also die vorgesehene API - es wird nichts
// von Hand ins React-DOM eingehaengt.

(function playbarTrackOptions() {
  function start() {
    if (!window.Spicetify?.Playbar?.Button || !Spicetify.SVGIcons?.more) {
      setTimeout(start, 300);
      return;
    }
    if (window.__playbarTrackOptions) return;

    // Das contextmenu-Ereignis wird am Track-Link der Player-Leiste ausgewertet,
    // nicht am umgebenden Container - dort verpufft es.
    const trackLink = () =>
      document.querySelector(".main-trackInfo-container a") ||
      document.querySelector(".main-nowPlayingWidget-trackInfo a");

    const button = new Spicetify.Playbar.Button(
      "Options for current track",
      "more",
      (self) => {
        const link = trackLink();
        if (!link) return;
        const r = self.element.getBoundingClientRect();
        link.dispatchEvent(new MouseEvent("contextmenu", {
          bubbles: true, cancelable: true, composed: true, view: window,
          button: 2, buttons: 2,
          clientX: Math.round(r.left), clientY: Math.round(r.top)
        }));
      },
      false,
      false
    );

    button.element?.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      e.stopPropagation();
      document.documentElement.classList.toggle("npv-expanded");
    });

    window.__playbarTrackOptions = button;
  }

  start();
})();
