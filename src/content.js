// Veškerý text a fotky webu. Fotky (originály) dejte do složky photos/ v kořeni projektu a u položky
// nastavte photo: '/photos/nazev.jpg'. Zmenšené verze (AVIF, WebP, JPEG) se vyrobí samy při
// npm run dev / npm run build. Dokud je photo null, ukáže se zástupný rámeček.

// placeholder: true vypne odkaz na Instagram (dokud tam není skutečný účet) a schová web před
// vyhledávači (noindex). Po vyplnění skutečného e-mailu a Instagramu nastavte false.
// Po vyplnění skutečných údajů nastavte na false.
export const contact = {
  email: 'kocky.hledaji.domov@example.cz',
  instagram: 'kocky.z.velebitu',
  placeholder: true,
};

export const cats = [
  {
    id: 'velik',
    name: 'Velík',
    sex: 'kluk',
    age: '6–7 měsíců',
    // na visačce „Jméno po“: krátký text a ikonka (mountains | pin)
    namedAfter: 'Velebit',
    namedIcon: 'mountains',
    // čtvrtá visačka „Kastrace“ (u koček, které už jsou vykastrované)
    neutered: 'vykastrován',
    photo: '/photos/velik.jpg',
    photoHint: 'Velík zblízka',
    // fotka hlavy pro kreslené postavičky (hero, auto, obývák…). Nejlépe PNG/WebP s průhledným
    // pozadím, jen hlava s ušima, např. '/photos/velik-hlava.png'. Jiná fotka se ořízne do kruhu.
    // headFrame říká, kde na fotce je obličej, aby seděl na místo kresleného:
    //   x, y = střed obličeje (0–1 zleva a shora), w = šířka obličeje (0–1 šířky fotky),
    //   ratio = šířka / výška celé fotky
    head: '/photos/velik-hlava-3.webp',
    headFrame: { x: 0.5, y: 0.67, w: 0.88, ratio: 582 / 633 },
    says: 'Jsem Velík, celým jménem Velebit, podle hor, kde nás lidi našli. Jsem kocourek, je mi 6–7 měsíců, jsem ten silnější a průbojnější brácha. Polly je moje menší ségra. Nejradši jsem u lidí – na klíně, u nohou, prostě všude, kde jsou. Jsem moc hravý, hrajeme si často se ségrou, ale nejradši mám, když si se mnou hrajou lidi. Jo, a psů se nebojím.',
  },
  {
    id: 'polly',
    name: 'Polly',
    sex: 'holka',
    age: '6–7 měsíců',
    namedAfter: 'Poljana',
    namedIcon: 'pin',
    photo: '/photos/polly.jpg',
    photoHint: 'Polly zblízka',
    head: '/photos/polly-hlava.webp',
    headFrame: { x: 0.53, y: 0.58, w: 0.76, ratio: 645 / 669 },
    says: 'Já jsem Polly, podle místa Poljana ve Slovinsku, kde jsme si na cestě poprvé protáhli tlapky. Jsem kočka a je mi taky 6–7 měsíců. Velík je můj bratr. Ale nenechte se zmást, já jsem ta chytřejší. Kam jdou lidi, tam jdu já, ale radši svět pozoruji z bezpečné vzdálenosti nebo z okna. Lidi se mnou začali trénovat i různé triky a to mě moc baví. Jsem sice malá, ale statečná – ani psi si na mě nedovolí.',
  },
];

// Zastávky na cestě. Novou zastávku přidáte jedním objektem na správné místo,
// trasa s kličkami se překreslí sama.
// km = přibližná vzdálenost od Velebitu.
// doodle = místo na mapě před zastávkou: farm, city, forest, hills, lake, field, mountains.
// via = státy, kterými se cestou k zastávce projíždí (kvůli hranicím na mapě).
// detour = místo, kam jsme cestou odbočili (oblouk na mapě): { label, icon: 'lookout' | 'rest' }.
// Bez něj jede trasa jen v mírném oblouku.
export const stops = [
  {
    id: 'velebit',
    place: 'Velebit',
    country: 'Chorvatsko',
    km: 0,
    title: 'Les, zima a cizí dveře',
    story: [
      'Kde jsme se narodili, nevíme. Pan domácí říkal, že nás ve Velebitu nejspíš někdo vyhodil. Lidi to prý dělají.',
      'Noci byly studené a v břiše nám kručelo. Jednoho večera objevil Velík jediné dveře široko daleko. Byla to chata, kde byla na dovolené jedna rodina z Prahy. Polly přišla hned za ním. Dali nám jídlo a pocit domova, tak jsme zůstali.',
      'Pan domácí tam nebydlí a oni byli poslední hosti sezóny. Kdyby odjeli bez nás, nezůstal by tam nikdo, kdo by nám dal najíst. Tak jsme nastoupili do auta.',
    ],
    photo: '/photos/kotata-u-dveri.jpg',
    photoHint: 'Koťata u dveří chalupy',
  },
  {
    id: 'gospic',
    place: 'Chorvatsko – Gospić',
    country: 'Chorvatsko',
    km: 40,
    title: 'Stetoskop je studený',
    story: [
      'Než jsme vyrazili na dlouhou cestu, zastavili jsme v Gospići, kousek pod Velebitem, u veterináře. Prohlédl nás ze všech stran a dal nám lék proti parazitům. Byli jsme stateční. Skoro.',
      'Taky nám tady koupili přepravku, abychom v autě jeli v bezpečí.',
    ],
    photo: '/photos/kotata-v-aute.jpg',
    photoHint: 'Koťata v přepravce v kufru',
    doodle: 'field',
  },
  {
    id: 'poljana',
    place: 'Slovinsko – Poljana',
    country: 'Slovinsko',
    km: 330,
    title: 'Pár dní se psy',
    story: [
      'Ve Slovinsku, kousek od Poljany, jsme zůstali pár dní, i se psy našich záchranců. Ještě jsme se neznali, takže došlo i na pár malých šarvátek. My jsme ale nezalezli. Pořád jsme se motali kolem a už se nebojíme ani trochu.',
      'A hlavně jsme byli pořád u našich lidí, ať se pohnuli kamkoli.',
      'Jenže jednomu z našich lidí se tu začala zhoršovat alergie. Bohužel alergie na nás.',
      'Podle tohohle místa Polly později dostala své jméno.',
    ],
    photo: null,
    photoHint: 'Koťata se psy',
    doodle: 'farm',
  },
  // Příklad další zastávky – stačí odkomentovat a upravit:
  // {
  //   id: 'veterinar',
  //   place: 'Veterinář',
  //   country: 'Česko',
  //   km: 800,
  //   title: 'Stetoskop je studený',
  //   story: ['Prohlídka a odčervení. Byli jsme stateční. Skoro.'],
  //   photo: null,
  //   photoHint: 'koťata u veterináře',
  //   doodle: 'forest',
  // },
  {
    id: 'praha',
    place: 'Praha',
    country: 'Česko',
    km: 810,
    title: 'Konečná? Ne tak úplně',
    story: [
      'Po dlouhé cestě jsme dojeli do Prahy. Teplo, plné misky, měkká deka. Skoro jako v pohádce.',
      'Jenže tahle pohádka má háček. Vlastně dva háčky a jedno kýchnutí.',
    ],
    photo: '/photos/kotata-na-dece.jpg',
    photoHint: 'Koťata v Praze na dece',
    doodle: 'city',
    via: ['Rakousko'],
    detour: { label: 'odpočívadlo', icon: 'rest' },
  },
];

// Fotogalerie (fotky na šňůře). orientation: 'portrait' | 'landscape' | 'square'.
// Fotku dejte do photos/ a nastavte photo: '/photos/nazev.jpg'. Popisky jsou zatím zástupné.
export const gallery = [
  { photo: '/photos/kotata-na-terase.jpg', orientation: 'portrait', caption: 'Na terase pod Velebitem', hint: 'koťata u apartmánu' },
  { photo: '/photos/velik-za-oknem.jpg', orientation: 'portrait', caption: 'Tady jsme Velíka našli', hint: 'Velík' },
  { photo: '/photos/polly-za-oknem.jpg', orientation: 'portrait', caption: 'Tady jsme Polly našli', hint: 'Polly' },
  { photo: '/photos/prvni-cesta-autem.jpg', orientation: 'portrait', caption: 'První cesta autem', hint: 'koťata v autě' },
  { photo: '/photos/spolu-na-polstari.jpg', orientation: 'portrait', caption: 'Spolu na polštáři', hint: 'koťata spí' },
  { photo: null, orientation: 'landscape', caption: 'Přestávka ve Slovinsku', hint: 'Koťata na zastávce' },
  { photo: null, orientation: 'square', caption: 'Velík zblízka', hint: 'Velík' },
  { photo: '/photos/vecer-spolu.jpg', orientation: 'portrait', caption: 'Večer spolu', hint: 'oba spolu' },
  { photo: '/photos/kotata-u-veterinare.jpg', orientation: 'portrait', caption: 'U veterináře v Praze', hint: 'koťata v přepravce u veterináře' },
  { photo: '/photos/kotata-u-okna.jpg', orientation: 'portrait', caption: 'Koukáme z okna', hint: 'koťata na parapetu u okna' },
  { photo: '/photos/kotata-v-kresle.jpg', orientation: 'portrait', caption: 'Křeslo pro dva', hint: 'koťata spí stočená v křesle' },
];

// Návštěvy u veterináře, v pořadí, jak proběhly.
export const vet = {
  verdict: 'Vypadají moc zdravě.',
  // řádek pod hodnocením, u razítka ZAPLACENO
  paid: 'Všechno u veterinářů už je zaplacené: prohlídky, odčervení, odblešení a vyčištění uší. Uhradili to naši lidi, nic za to nechtějí.',
  visits: [
    {
      place: 'Chorvatsko',
      title: 'První odčervení',
      done: ['Odčervení'],
      who: 'Veterina v Chorvatsku',
      // posudek v původním jazyce
      quote: { text: 'Zdravi su kao riba.', lang: 'hr' },
    },
    {
      place: 'Praha',
      title: 'Kompletní prohlídka',
      done: ['Celková prohlídka', 'Odblešení', 'Vyčištění uší'],
      who: 'Veterina v Praze',
    },
  ],
};
