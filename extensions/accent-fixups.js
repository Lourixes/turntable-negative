// accent-fixups.js
// Kleinkram, den Spicetifys Farbschema und die Themes nicht abdecken:
// Gruenreste in Zustandsfarben, dynamische Toenungen und ein schiefes Icon.
//
// Spicetify bildet nur die Grundfarbe eines Knopfes ab (--background-base).
// Die Encore-Primaerknoepfe definieren ihre Zustandsfarben aber lokal neu:
//   --background-highlight   #3be477  (Hover)
//   --background-press       #1abc54  (gedrueckt)
//   --background-elevated-*  #3be477
// Deshalb sprang der Play-Knopf beim Hover auf Spotify-Gruen zurueck.
//
// Die Hover-/Druckfarben sind aus #bc8ead abgeleitet: heller beim Hover,
// dunkler beim Druecken - dasselbe Verhaeltnis, das Spotify bei Gruen nutzt.

(function accentFixups() {
  const STYLE_ID = "accent-fixups-style";

  function build() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
[class*="button-primary__inner"],
[class*="legacy-chip__inner"] {
  --background-highlight: #d3a0c2 !important;
  --background-press: #a57d98 !important;
  --background-elevated-base: #d3a0c2 !important;
  --background-elevated-highlight: #d3a0c2 !important;
}

/* Spotify faerbt den Startseiten-Header aus Inhaltsfarben ein und schreibt das
   als Inline-Style ans Element; die eingeblendete Filterleiste spiegelt denselben
   Wert. Der Ton wechselt je nach Inhalt und passt zu keiner Palette.
   !important schlaegt den Inline-Wert, unabhaengig davon welcher es gerade ist. */
.main-home-homeHeader,
[class*="main-home-filterChipsSection"] {
  background-color: var(--spice-main, #1e1e2e) !important;
}

/* Der Full-App-Display-Knopf kommt aus fullAppDisplay.js und bringt eigene
   Masse mit: 16x40 statt 24x48, Icon 16x16 statt 24x24. Dadurch sass sein
   Icon 4px hoeher als die Pfeile daneben. Hier auf die Nachbarn angeglichen. */
button[aria-label="Full App Display"] {
  width: 24px !important;
  height: 48px !important;
  padding: 12px 0 !important;
}
button[aria-label="Full App Display"] svg {
  width: 24px !important;
  height: 24px !important;
}

/* Der Marketplace-Knopf sitzt in einem eigenen Flex-Kind neben der Gruppe aus
   Zurueck/Vor/Full App Display. Dadurch kamen 24px Wrapper-Gap und 12px
   Innenabstand oben drauf: Icon-Abstaende 28/28/64 statt gleichmaessig.
   Beides aufgehoben, damit er in denselben 28px-Rhythmus faellt. */
.main-globalNav-historyButtons { gap: 8px !important; }

.custom-navlinks-scrollable_container { margin-left: -20px !important; }

.custom-navlinks-scrollable_container button[aria-label="Marketplace"] {
  width: 24px !important;
  padding: 12px 0 !important;
}

/* Regal- und Abschnittsueberschriften der Startseite in der Akzentfarbe.
   Bewusst ueber --spice-button statt eines festen Werts: aendert sich der
   Akzent, ziehen die Ueberschriften mit. Auf [data-testid="home-page"]
   begrenzt, damit Ueberschriften in Suche und Bibliothek unberuehrt bleiben.
   Der Nachfahren-Selektor ist noetig: Der Text steckt in einem <a> im h2,
   und der Link setzt seine eigene Farbe - Vererbung allein reicht nicht. */
[data-testid="home-page"] h2,
[data-testid="home-page"] h2 * {
  color: var(--spice-button, #bc8ead) !important;
}

/* Platzhalterflaeche hinter Coverbildern - blitzt beim Laden gruen auf */
.main-cardImage-imageWrapper,
.x-entityImage-imageContainer {
  background-color: #1e1e2e !important;
}`;
    document.head.appendChild(style);
  }

  if (document.head) build();
  else document.addEventListener("DOMContentLoaded", build, { once: true });
})();
