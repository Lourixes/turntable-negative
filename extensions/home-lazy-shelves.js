// home-lazy-shelves.js
// Rendert auf der Startseite zunaechst nur die obersten Regale und holt den Rest
// nach, sobald man sich ihm naehert.
//
// Warum ueberhaupt: Die Startseite haelt 12 Regale zu je ~375 Elementen gleichzeitig
// im Layout - rund 6.500 Elemente und ~140 Cover, waehrend nur ~4 Regale ins Fenster
// passen. Gemessen kostete das 58-77ms je vollem Style-Recalc + Layout gegenueber
// 24ms auf einer Playlist, dazu ein Rastersturm von 70-134% Renderer-CPU beim Oeffnen.
// Mit nur 4 gerenderten Regalen fiel der Recalc auf 30ms (-60%).
//
// Warum content-visibility: hidden und nicht display: none:
// "display: none" nimmt dem Regal auch seinen Platz - die Scrollhoehe fiel dadurch
// von 3419px auf 1238px und man kam nicht mehr nach unten. "content-visibility:
// hidden" ueberspringt nur den Inhalt, die Box bleibt (Groesse aus
// contain-intrinsic-size). Gemessen: Scrollhoehe unveraendert 3419px, Layout 76,5ms
// -> 30,8ms, Scrollen bis ans Ende funktioniert.
//
// Warum nicht einfach "content-visibility: auto":
// Das ueberlaesst dem Browser die Entscheidung, und Chromium rechnet 50% Viewporthoehe
// als Puffer dazu. Bei 1390px Fensterhoehe und 3419px Seitenhoehe liegt damit alles
// im Puffer - die Regel war auf allen 12 Regalen aktiv und uebersprang genau eines
// (das leere). Wir muessen also selbst entscheiden, was versteckt bleibt.
//
// Kein MutationObserver: Zum Aufdecken reicht ein IntersectionObserver, und die
// Regale trudeln nach einem Routenwechsel gestaffelt ein - dafuer genuegen ein paar
// begrenzte Nachfassungen statt eines dauerhaften Beobachters.

(function homeLazyShelves() {
  const STYLE_ID = "home-lazy-shelves-style";
  const KLASSE = "hls-verzoegert";

  // So viele Regale von oben bleiben immer gerendert. Vier ist bewusst niedrig:
  // Bei 12 Regalen insgesamt und ~4 gleichzeitig sichtbaren brachte ein hoeherer
  // Wert nichts mehr - ab 10 waere der Effekt praktisch weg.
  const SOFORT = 4;

  // Platzhalterhoehe fuer noch nie gerendertes Regal. Der Median der gemessenen
  // Regalhoehen; "auto" davor laesst den Browser die echte Hoehe merken, sobald ein
  // Regal einmal gerendert war - dann springt beim Verstecken nichts mehr.
  const PLATZHALTER = "auto 352px";

  // Vorlauf, mit dem ein Regal aufgedeckt wird, bevor es ins Bild kommt. Grosszuegig,
  // damit beim Scrollen nichts nachpoppt.
  const VORLAUF = "1500px";

  const REGALE = '[data-testid="home-page"] .main-home-content > section';

  function build() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
.${KLASSE} {
  content-visibility: hidden;
  contain-intrinsic-size: ${PLATZHALTER};
}`;
    document.head.appendChild(style);
  }

  // Ein einziger Beobachter fuer alle Regale. Er feuert beim Beobachten sofort mit
  // dem aktuellen Zustand - Regale, die trotz Verzoegerung schon im Bild stehen,
  // decken sich damit von selbst wieder auf.
  const beobachter = new IntersectionObserver((eintraege) => {
    for (const e of eintraege) {
      if (!e.isIntersecting) continue;
      e.target.classList.remove(KLASSE);
      beobachter.unobserve(e.target);
    }
  }, { rootMargin: `${VORLAUF} 0px` });

  function anwenden() {
    const regale = document.querySelectorAll(REGALE);
    if (!regale.length) return;

    regale.forEach((regal, i) => {
      // Einmal angefasste Regale nicht erneut verstecken - sonst klappt beim
      // Nachfassen wieder zu, was der Nutzer gerade aufgedeckt hat.
      if (regal.dataset.hls) return;
      regal.dataset.hls = "1";
      if (i < SOFORT) return;
      regal.classList.add(KLASSE);
      beobachter.observe(regal);
    });
  }

  // Die Regale kommen nach einem Routenwechsel nacheinander an. Statt eines
  // dauerhaften Beobachters ein paar begrenzte Nachfassungen.
  const NACHFASSEN = [0, 300, 900, 2000, 4000];
  let laufende = [];

  function starten() {
    laufende.forEach(clearTimeout);
    laufende = NACHFASSEN.map((ms) => setTimeout(anwenden, ms));
  }

  function aufHome() {
    return Spicetify?.Platform?.History?.location?.pathname === "/";
  }

  function start() {
    if (!window.Spicetify?.Platform?.History) {
      setTimeout(start, 300);
      return;
    }
    build();
    if (aufHome()) starten();
    Spicetify.Platform.History.listen(({ pathname }) => {
      if (pathname === "/") starten();
    });
  }

  start();
})();
