// npv-collapse.js
// Blendet die rechte Leiste komplett aus, solange sie nur die Now-Playing-Ansicht zeigt.
//
// Zeigt sie etwas anderes - Warteschlange, Geraete, Freundesaktivitaet -, fehlt das
// Panel [data-testid="NPV_Panel_OpenDiv"], die Regel greift nicht und die Leiste ist
// in voller Breite da. Schliesst man die Warteschlange wieder, faellt Spotify auf die
// Now-Playing-Ansicht zurueck und sie verschwindet von selbst.
//
// Reines CSS ueber :has() - kein Beobachter, kein Polling.
//
// Die Klasse npv-expanded auf <html> hebt das voruebergehend auf; umgeschaltet wird
// sie per Rechtsklick auf den Optionen-Knopf in der Player-Leiste (playbar-track-options.js).

(function npvCollapse() {
  const STYLE_ID = "npv-collapse-style";

  function build() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
html:not(.npv-expanded) .Root__right-sidebar:has([data-testid="NPV_Panel_OpenDiv"]) {
  display: none !important;
}`;
    document.head.appendChild(style);
  }

  if (document.head) build();
  else document.addEventListener("DOMContentLoaded", build, { once: true });
})();
