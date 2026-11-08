// Zentrale Kategorie-Definition. Neue Kategorien oder Unterkategorien werden hier ergänzt –
// Navigation, Startseite, Kategorieseiten und Sitemap passen sich automatisch an.
// In Phase 2 wandert diese Liste in die Inhaltsverwaltung (Dateien im Repository).

export interface Subcategory {
  slug: string;
  title: string;
}

export interface Category {
  slug: string;
  title: string;
  short: string; // Kurzbeschreibung für Karten
  description: string; // Einleitung auf der Kategorieseite
  metaDescription: string;
  icon: 'coin' | 'sprout' | 'pot' | 'jar' | 'tools';
  subcategories: Subcategory[];
  // Geplante Ratgeber (Entwürfe folgen in Phase 2). Erscheinen NICHT als eigene Seiten.
  plannedArticles: string[];
}

export const categories: Category[] = [
  {
    slug: 'geld-sparen',
    title: 'Geld sparen',
    short: 'Laufende Kosten senken und Ausgaben besser im Blick behalten.',
    description:
      'Wer seine festen und laufenden Kosten kennt, kann gezielt dort ansetzen, wo es sich lohnt. Hier geht es um Strom, Heizung, Wasser, Haushaltsbudget und bewusstes Einkaufen.',
    metaDescription:
      'Ratgeber zum Geldsparen im Alltag: Strom, Heizung und Wasser, Haushaltsbudget und bewusstes Einkaufen – verständlich und praxisnah.',
    icon: 'coin',
    subcategories: [
      { slug: 'strom-und-heizkosten', title: 'Strom und Heizkosten reduzieren' },
      { slug: 'wasser-sparen', title: 'Wasser sparen' },
      { slug: 'haushaltsbudget', title: 'Haushaltsbudget' },
      { slug: 'bewusst-einkaufen', title: 'Bewusst einkaufen' },
      { slug: 'laufende-kosten', title: 'Laufende Kosten reduzieren' },
    ],
    plannedArticles: ['Stromverbrauch im Haushalt richtig messen'],
  },
  {
    slug: 'selbstversorgung',
    title: 'Selbstversorgung',
    short: 'Gemüse, Obst und Kräuter selbst anbauen – auch auf kleinem Raum.',
    description:
      'Selbst anbauen geht auch ohne großen Garten: auf dem Balkon, im Gewächshaus oder in Pflanzgefäßen. Hier finden Sie Anleitungen von der Anzucht bis zur Bewässerung.',
    metaDescription:
      'Ratgeber zur Selbstversorgung: Gemüse und Obst anbauen, Gewächshaus, Balkon und Garten, Kräuter, Anzucht und Bewässerung.',
    icon: 'sprout',
    subcategories: [
      { slug: 'gemuese-und-obst', title: 'Gemüse und Obst anbauen' },
      { slug: 'gewaechshaus', title: 'Gewächshaus' },
      { slug: 'balkon-und-garten', title: 'Balkon und Garten' },
      { slug: 'kraeuter', title: 'Kräuter' },
      { slug: 'anzucht-und-bewaesserung', title: 'Anzucht und Bewässerung' },
    ],
    plannedArticles: [
      'Gemüse anbauen ohne eigenen Garten',
      'Kartoffeln in Pflanzsäcken anbauen',
      'Automatische Bewässerung im Gewächshaus',
      'Regenwasser im Garten sinnvoll nutzen',
    ],
  },
  {
    slug: 'ernaehrung-guenstig-kochen',
    title: 'Ernährung & günstig kochen',
    short: 'Abwechslungsreich essen, ohne das Budget zu sprengen.',
    description:
      'Gute Ernährung muss nicht teuer sein. Mit Planung, richtiger Lagerung und Resteverwertung lassen sich Kosten und Lebensmittelabfälle spürbar verringern.',
    metaDescription:
      'Günstig und ausgewogen kochen: preiswerte Rezepte, Wochenplanung, richtige Lagerung und Resteverwertung.',
    icon: 'pot',
    subcategories: [
      { slug: 'preiswerte-rezepte', title: 'Preiswerte Rezepte' },
      { slug: 'wochenplanung', title: 'Wochenplanung' },
      { slug: 'lebensmittel-lagern', title: 'Lebensmittel richtig lagern' },
      { slug: 'resteverwertung', title: 'Resteverwertung' },
      { slug: 'ausgewogene-ernaehrung', title: 'Günstige und ausgewogene Ernährung' },
    ],
    plannedArticles: [
      'Mit wenig Geld abwechslungsreich kochen',
      'Lebensmittel länger frisch halten',
      'Lebensmittelverschwendung reduzieren',
    ],
  },
  {
    slug: 'vorratshaltung',
    title: 'Vorratshaltung & Haltbarmachen',
    short: 'Ernte und Einkäufe sicher haltbar machen und Vorräte ordnen.',
    description:
      'Einkochen, Einfrieren, Dörren und Fermentieren: Hier lernen Sie bewährte Methoden kennen – mit besonderem Augenmerk auf Hygiene und Lebensmittelsicherheit.',
    metaDescription:
      'Lebensmittel haltbar machen: Einkochen, Einfrieren, Dörren, Fermentieren und Vorräte sinnvoll organisieren.',
    icon: 'jar',
    subcategories: [
      { slug: 'einkochen', title: 'Einkochen' },
      { slug: 'einfrieren', title: 'Einfrieren' },
      { slug: 'doerren', title: 'Dörren' },
      { slug: 'fermentieren', title: 'Fermentieren' },
      { slug: 'vorraete-organisieren', title: 'Vorräte organisieren' },
    ],
    plannedArticles: ['Gurken richtig haltbar machen'],
  },
  {
    slug: 'selbermachen-reparieren',
    title: 'Selbermachen & Reparieren',
    short: 'Reparieren statt neu kaufen und praktische Lösungen selbst bauen.',
    description:
      'Vieles lässt sich mit etwas Werkzeug und Anleitung selbst reparieren oder bauen. Wir zeigen, wo sich der Aufwand finanziell lohnt und wo Fachleute die bessere Wahl sind.',
    metaDescription:
      'Selbermachen und Reparieren: einfache Reparaturen, Wiederverwenden, DIY-Projekte und praktische Eigenbauideen für den Haushalt.',
    icon: 'tools',
    subcategories: [
      { slug: 'einfache-reparaturen', title: 'Einfache Reparaturen' },
      { slug: 'wiederverwenden', title: 'Wiederverwenden' },
      { slug: 'diy-projekte', title: 'DIY-Projekte' },
      { slug: 'haushaltsloesungen', title: 'Haushaltslösungen' },
      { slug: 'eigenbauideen', title: 'Praktische Eigenbauideen' },
    ],
    plannedArticles: ['Kleine Reparaturen, die sich finanziell lohnen'],
  },
];

export const site = {
  name: 'Sparwurzeln',
  url: 'https://sparwurzeln.de',
  slogan: 'Weniger ausgeben. Mehr selber machen. Besser leben.',
  email: 'Sparwurzeln@gmail.com',
};

export const getCategory = (slug: string) => categories.find((c) => c.slug === slug);
