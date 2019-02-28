function nhg25 (rawCode)
{
	var r				= [];
	var hoeveelheid		= '';
	var hCodeVan		= '';
	var hCodeTot		= '';
	var pCodeVan		= '';
	var pCodeTot		= '';
	var omschrijving	= '';
	var dosis			= '';
	var per				= '';
	var vorm			= '';
	var b				= [];
	var j				= 0;
	var end				= 0;
	var i				= 0;
	var pVorm			= 0;
	var fVorm			= 0;
	var code			= '';
	var perMaal			= 1;
	var perPeriode		= 0;
	var tekst			= '';

	if (typeof rawCode == 'undefined' || !rawCode)
		return r;

	code = rawCode.toUpperCase ();
	var vormen = [
		[ "AE", "aerosol", "aerosols"],
		[ "AM", "ampul", "ampullen"],
		[ "AV", "applicatorvulling", "applicatorvullingen"],
		[ "AI", "autoinhaler", "autoinhalers"],
		[ "BR", "bruistabletbruistabletten", ""],
		[ "C", "capsule", "capsules"],
		[ "CA", "capsule mga", "capsules mga"],
		[ "CE", "capsule msr", "capsules msr"],
		[ "CM", "centimeter", "centimeters"],
		[ "CD", "collodium", "collodium"],
		[ "CR", "creme", "creme"],
		[ "DE", "depper", "deppers"],
		[ "DI", "disper", "dispers"],
		[ "DZ", "doos", "dozen"],
		[ "DO", "dosis", "doses"],
		[ "D", "dragee", "dragees"],
		[ "DK", "drank", "drank"],
		[ "DR", "druppel", "druppels"],
		[ "DV", "druppelvloeistof", "druppelvloeistof"],
		[ "DU", "durette", "durettes"],
		[ "EH", "eenheid", "eenheden"],
		[ "CO", "eetlepel (= 15ml)", "eetlepels (a 15 ml)"],
		[ "EL", "elixer", "elixer"],
		[ "EM", "emulsie", "emulsie"],
		[ "EX", "extract", "extract"],
		[ "FL", "fles", "flessen"],
		[ "FO", "foam", "foam"],
		[ "GZ", "gaas", "gazen"],
		[ "GA", "gas", "gas"],
		[ "GE", "gel", "gel"],
		[ "GR", "gram", "gram"],
		[ "GN", "granulaat", "granulaat"],
		[ "GI", "griepinjectie", "griepinjecties"],
		[ "IO", "incont.onderlegger", "incont.onderleggers"],
		[ "I", "inhalatie", "inhalaties"],
		[ "IH", "inhalator", "inhalators"],
		[ "IJ", "injectie", "injecties"],
		[ "IV", "injectievloeistof", "injectievloeistof"],
		[ "IL", "inlegluier", "inlegluiers"],
		[ "IT", "intertulle", "intertulles"],
		[ "IU", "IUD", "IUD"],
		[ "KW", "kauwgom", "kauwgoms"],
		[ "KG", "kilogram", "kilogram"],
		[ "KL", "klysma", "klysma's"],
		[ "KO", "korrel", "korrels"],
		[ "KR", "kraal", "kralen"],
		[ "L", "liter", "liter"],
		[ "LO", "lotion", "lotion"],
		[ "LU", "luier", "luiers"],
		[ "MA", "maatlepel", "maatlepels"],
		[ "M", "meter", "meter"],
		[ "UG", "microgram", "microgram"],
		[ "UL", "microliter", "microliter"],
		[ "MG", "milligram", "milligram"],
		[ "ML", "milliliter", "milliliter"],
		[ "MM", "millimeter", "millimeter"],
		[ "MI", "minim", "minims"],
		[ "MT", "mitis tablet", "mitis tabletten"],
		[ "MX", "mixtura", "mixtura"],
		[ "MU", "mucilago", "mucilago"],
		[ "NL", "naald", "naalden"],
		[ "NB", "nebulisator", "nebulisators"],
		[ "OL", "olie", "olie"],
		[ "QQ", "onbekend", "onbekend"],
		[ "ON", "onderlegger", "onderleggers"],
		[ "OG", "oogdruppel", "oogdruppels"],
		[ "OW", "oogwater", "oogwater"],
		[ "OZ", "oogzalf", "oogzalf"],
		[ "OR", "oordruppel", "oordruppels"],
		[ "O", "oplossing", "oplossing"],
		[ "XX", "overig", "overig"],
		[ "OV", "ovule", "ovules"],
		[ "CP", "paplepel (= 8 ml)", "paplepels (a 8 ml)"],
		[ "PA", "pasta", "pasta"],
		[ "PE", "penfill ampul", "penfill ampullen"],
		[ "PI", "pil", "pillen"],
		[ "PP", "pipet", "pipetten"],
		[ "PK", "plak", "plak"],
		[ "PL", "pleister", "pleisters"],
		[ "P", "poeder", "poeders"],
		[ "PF", "pufje", "pufjes"],
		[ "R", "rectiole", "rectioles"],
		[ "RP", "repetab", "repetabs"],
		[ "RC", "retard capsule", "retard capsules"],
		[ "RT", "retard tablet", "retard tabletten"],
		[ "RO", "rotacap", "rotacaps"],
		[ "SA", "sachet", "sachets"],
		[ "SH", "shampoo", "shampoo"],
		[ "SI", "siroop", "siroop"],
		[ "SF", "siroop forte", "siroop forte"],
		[ "SL", "slijm", "slijm"],
		[ "SM", "smeersel", "smeersel"],
		[ "SO", "solutio", "solutio"],
		[ "SR", "spacer", "spacers"],
		[ "SP", "spray", "spray"],
		[ "SN", "spuit en naald", "spuiten en naalden"],
		[ "ST", "strip", "strips"],
		[ "CS", "strooipoeder", "strooipoeder"],
		[ "SK", "stuk", "stuks"],
		[ "SU", "suspensie", "suspensies"],
		[ "T", "tablet", "tabletten"],
		[ "TA", "tablet mga", "tabletten mga"],
		[ "TE", "tablet msr", "tabletten msr"],
		[ "TP", "tampon", "tampons"],
		[ "CT", "theelepel (= 3 ml)", "theelepels (a 3 ml)"],
		[ "TI", "tinctuur", "tinctuur"],
		[ "TD", "transdermaalpleister", "transdermaalpleisters"],
		[ "TU", "tube", "tubes"],
		[ "TB", "turbuhaler", "turbuhalers"],
		[ "UR", "urotainer", "urotainers"],
		[ "VO", "vaginaalovule", "vaginaalovules"],
		[ "VS", "vaginaalspoeling", "vaginaalspoeling"],
		[ "VT", "vaginaaltablet", "vaginaaltabletten"],
		[ "VC", "vaginale creme", "vaginale creme"],
		[ "VB", "verband", "verbanden"],
		[ "VP", "verpakking", "verpakkingen"],
		[ "VE", "vetcreme", "vetcreme"],
		[ "VU", "verstuiving", "verstuivingen"],
		[ "VZ", "vetzalf", "vetzalf"],
		[ "WA", "wassing", "wassingen"],
		[ "WT", "wat", "watten"],
		[ "WW", "wegwerpspuit", "wegwerpspuiten"],
		[ "Z", "zakje", "zakjes"],
		[ "ZA", "zalf", "zalf"],
		[ "ZE", "zeep", "zeep"],
		[ "S", "zetpil", "zetpillen"],
		[ "ZU", "zuigtablet", "zuigtabletten"]
	];
	var aanvullend = [
		[ "HVE", "Ten minste een half uur VOOR het eten" ],
		[ "TNE", "TIJDENS of vlak NA het eten innemen" ],
		[ "TWM", "TIJDENS de warme maaltijd innemen" ],
		[ "HVEV", "Bij voorkeur een half uur VOOR het eten" ],
		[ "TE", "TIJDENS het eten innemen" ],
		[ "VVE", "Vlak VOOR het eten innemen" ],
		[ "AVI", "'s Avonds innemen" ],
		[ "AVT", "'s Avonds toedienen" ],
		[ "HVOI", "Ten minste half uur VOOR ontbijt innemen" ],
		[ "VTE", "Kort voor of tijdens het eten" ],
		[ "1VE", "Ten minste 1 uur VOOR het eten innemen" ],
		[ "1V2NE", "1 uur voor of 2 uur na het eten innemen" ],
		[ "15MVE", "Ten minste 15 minuten VOOR het eten" ],
		[ "TE1U", "TIJDENS het eten of binnen 1 uur erna" ],
		[ "T1UVO", "Ten minste 1 uur VOOR het ontbijt" ],
		[ "AVBM", "'s Avonds innemen bij de maaltijd" ],
		[ "NUCHT", "Innemen op nuchtere maag" ],
		[ "1VWM", "1 uur voor de warme maaltijd innemen" ],
		[ "BHNE", "Binnen 30 minuten na het eten innemen" ],
		[ "O2V2N", "Of 2 uur voor/na lunch/avondeten innemen" ],
		[ "OHVO", "Of ten minste een half uur voor ontbijt" ],
		[ "1VEV", "Bij voorkeur 1 uur voor het eten innemen" ],
		[ "B1UVE", "Binnen 1 uur voor het eten inspuiten" ],
		[ "KVKNE", "Kort voor of kort na het eten" ],
		[ "1V1NE", "1 uur voor of 1 uur na het eten innemen" ],
		[ "HNE", "Een half uur na het eten innemen" ],
		[ "HVO", "Een half uur voor het ontbijt" ],
		[ "NM", "Na de maaltijd" ],
		[ "NO", "Na het ontbijt" ],
		[ "VM", "Voor de maaltijd" ],
		[ "VS", "Voor het slapen" ],
		[ "TO", "Tijdens het ontbijt" ],
	// Sectie 102 - Toepassing
		[ "ABR", "Aanbrengen" ],
		[ "AST", "Aanstippen" ],
		[ "COL", "Met 1 druppel bedekken, laten drogen" ],
		[ "DEP", "Deppen" ],
		[ "IHB", "In het badwater" ],
		[ "IM", "Voor i.m. injectie" ],
		[ "INH", "Inhaleren" ],
		[ "INM", "Inmasseren" ],
		[ "INS", "Insmeren" ],
		[ "IV", "Intraveneus injecteren" ],
		[ "IVA", "In vernevelapparaat" ],
		[ "OT", "Onder de tong" ],
		[ "R", "Rectaal inbrengen" ],
		[ "UG", "Voor uitwendig gebruik" ],
		[ "SC", "Voor s.c. injectie" ],
	// Sectie 103 - Conditie
		[ "BAV", "Bij een aanval" ],
		[ "BB", "Bij benauwdheid" ],
		[ "BDI", "Bij diarree" ],
		[ "BP", "Bij pijn" ],
		[ "BJ", "Bij jeuk" ],
		[ "ZN", "Zo nodig" ],
		[ "BHP", "Bij hoofdpijn" ],
		[ "BK", "Bij koorts" ],
		[ "BHK", "Bij hoge koorts" ],
		[ "BKP", "Bij koorts en/of pijn" ],
		[ "BHST", "Bij hoest" ],
		[ "BMSP", "Bij menstruatiepijnen" ],
	// Sectie 104 - Locatie
		[ "IBOG", "In beide ogen" ],
		[ "IBOR", "In beide oren" ],
		[ "HAA", "In de haren en op de hoofdhuid" ],
		[ "HOO", "Op de hoofdhuid" ],
		[ "HUI", "Op de huid" ],
		[ "IBNO", "In beide neusgaten hoog opsnuiven" ],
		[ "IBN", "In beide neusgaten" ],
		[ "ILOG", "In het linker oog" ],
		[ "ILOR", "In het linker oor" ],
		[ "OPOL", "Op het ooglid aanbrengen" ],
		[ "IOG", "In het aangedane oog" ],
		[ "ONOL", "Onder het ooglid aanbrengen" ],
		[ "IOR", "In het aangedane oor" ],
		[ "IROG", "In het rechter oog" ],
		[ "IROR", "In het rechter oor" ],
		[ "IRN", "In het rechter neusgat" ],
		[ "ILN", "In het linker neusgat" ],
		[ "VAG", "Vaginaal aanbrengen" ],
		[ "VAGD", "Diep vaginaal inbrengen" ],
		[ "AOOR", "Achter het oor aanbrengen" ],
	// Sectie 105 - Gebeurtenis en ingreep
		[ "6VR", "6 uur voor de reis aanbrengen" ],
		[ "NDEF", "Na de ontlasting" ],
		[ "VEX", "Voor het examen" ],
		[ "VIN", "Voor de ingreep" ],
		[ "LUI", "Bij iedere luierwisseling" ],
		[ "HVZON", "Een half uur voor zonnebaden aanbrengen" ],
		[ "MAP", "zo spoedig mogelijk; max 72 uur na coitus" ],
		[ "NIDEF", "en na iedere ontlasting" ],
		[ "15MVI", "15 minuten voor de inspanning" ],
	// Sectie 106 - Cyclus
		[ "5-25", "5e tot 25e dag van de cyclus" ],
		[ "16-25", "16e tot 25e dag van de cyclus" ],
		[ "19-25", "19e tot 25e dag van de cyclus" ],
		[ "3DVME", "3 dagen voor de menstruatie beginnen" ],
	// Sectie 107 - Wisselend gebruik in de tijd
		[ "DOX", "1e dag 2, daarna 1 maal daags" ],
		[ "MWV", "Maandag, woensdag en vrijdag" ],
		[ "1W1D1", "In de eerste week 1 maal daags" ],
		[ "22111", "2 dagen 2 per dag, daarna 1 per dag" ],
		[ "2Z2U1", "2 tegelijk, daarna zo nodig om de 2 uur" ],
		[ "1N2WH", "1 nu, na 14 dagen herhalen" ],
		[ "3D3WH", "3 dagen; eventueel na 3 weken herhalen" ],
		[ "DDZ", "Op dinsdag, donderdag en zaterdag" ],
		[ "1KDUB", "Eerste maal een dubbele dosis" ],
		[ "3W1WS", "Gedurende 3 weken, daarna 1 week stoppen" ],
		[ "1W3WS", "Gedurende 1 week, daarna 3 weken stoppen" ],
	// Sectie 108 - Dagdelen en gebruik per dagdeel
		[ "MOI", "'s Morgens innemen" ],
		[ "AV", "'s Avonds" ],
		[ "MEA", "'s Middags en 's avonds" ],
		[ "MI", "'s Middags" ],
		[ "MO", "'s Morgens" ],
		[ "OEA", "'s Ochtends en 's avonds" ],
		[ "VN", "Voor de nacht" ],
		[ "OEM", "'s Ochtends en 's middags" ],
		[ "0-1-2", "1 's middags, 2 's avonds" ],
		[ "0-1-H", "1 's middags, 1/2 's avonds" ],
		[ "0-2-1", "2 's middags, 1 's avonds" ],
		[ "0-H-1", "1/2 's middags, 1 's avonds" ],
		[ "1-0-2", "1 's morgens, 2 's avonds" ],
		[ "1-0-H", "1 's morgens, 1/2 's avonds" ],
		[ "1-1-2", "1 's morgens, 1 's middags, 2 's avonds" ],
		[ "1-1-H", "1 's morgens, 1 's middags, 1/2 's avonds" ],
		[ "1-2-0", "1 's morgens, 2 's middags" ],
		[ "1-2-1", "1 's morgens, 2 's middags, 1 's avonds" ],
		[ "1-2-2", "1 's morgens, 2 's middags, 2 's avonds" ],
		[ "1-H-0", "1 's morgens, 1/2 's middags" ],
		[ "1-H-1", "1 's morgens, 1/2 's middags, 1 's avonds" ],
		[ "1-H-2", "1 's morgens, 1/2 's middags, 2 's avonds" ],
		[ "1-H-H", "1 's morgens 1/2 's middags 1/2 's avonds" ],
		[ "2-0-1", "2 's morgens, 1 's avonds" ],
		[ "2-0-3", "2 's morgens, 3 's avonds" ],
		[ "2-0-H", "2 's morgens, 1/2 's avonds" ],
		[ "2-1-0", "2 's morgens, 1 's middags" ],
		[ "2-1-1", "2 's morgens, 1 's middags, 1 's avonds" ],
		[ "2-1-H", "2 's morgens, 1 's middags, 1/2 's avonds" ],
		[ "2-1-2", "2 's morgens, 1 's middags, 2 's avonds" ],
		[ "2-2-1", "2 's morgens, 2 's middags, 1 's avonds" ],
		[ "H-0-1", "1/2 's morgens, 1 's avonds" ],
		[ "H-0-2", "1/2 's morgens, 2 's avonds" ],
		[ "H-1-0", "1/2 's morgens, 1 's middags" ],
		[ "H-1-1", "1/2 's morgens, 1 's middags, 1 's avonds" ],
		[ "H-1-2", "1/2 's morgens, 1 's middags, 2 's avonds" ],
		[ "H-H-1", "1/2 's morgens 1/2 's middags 1 's avonds" ],
		[ "H-H-2", "1/2 's morgens 1/2 's middags 2 's avonds" ],
		[ "OEVN", "'s Ochtends en voor de nacht" ],
		[ "3D12N", "3 maal daags 1, 2 voor de nacht" ],
		[ "3DH1N", "3 maal daags 1/2, 1 voor de nacht" ],
	// Sectie 109 - Periode aanduiding
		[ "2EWK", "De tweede week" ],
		[ "3EWK", "De derde week" ],
		[ "1EWK", "De eerste week" ],
		[ "4EWK", "De vierde week" ],
		[ "5EWK", "De vijfde week" ],
	// Sectie 110 - Duur aanduiding
		[ "3DNH", "Voortzetten tot 3 dagen na herstel" ],
		[ "NH48U", "Na herstel nog 48 uur voortzetten" ],
		[ "3D", "Gedurende 3 dagen" ],
		[ "5D", "Gedurende 5 dagen" ],
		[ "10D", "Gedurende 10 dagen" ],
		[ "25D", "Gedurende 25 dagen" ],
		[ "1W", "Gedurende 1 week" ],
		[ "1C", "Gedurende 1 cyclus" ],
		[ "3C", "Gedurende 3 cycli" ],
		[ "2WNA", "Tot 2 weken na genezing" ],
		[ "2W", "Gedurende 2 weken" ],
		[ "4W", "Gedurende 4 weken" ],
		[ "5W", "Gedurende 5 weken" ],
	// Sectie 111 - Overigen
		[ "OVT", "Op vast tijdstip" ],
		[ "DAZA", "Dagzalf/-creme" ],
		[ "NAZA", "Nachtzalf/-creme" ],
		[ "LAXNK", "Fors laxeren 1-2 uur na de kuur" ],
		[ "BMAAG", "Bij maagklachten staken" ],
		[ "1EDAV", "Eerste dosis 's avonds innemen" ],
		[ "WRS15", "Bij houden klacht na 15 min arts waarsch." ],
	// Sectie 112 - Herhalen
		[ "N1WH", "Na 1 week herhalen" ],
		[ "N2WH", "Na 2 weken herhalen" ],
		[ "ZN5MH", "Zo nodig om de 5 minuten herhalen" ],
		[ "ZNKHH", "Zo nodig na een kwartier herhalen" ],
		[ "ZN1WH", "Zo nodig na 1 week herhalen" ],
		[ "HH1", "1 maal herhalen" ],
		[ "HH2", "2 maal herhalen" ],
		[ "HH3", "3 maal herhalen" ],
		[ "HH4", "4 maal herhalen" ],
		[ "HH5", "5 maal herhalen" ],
		[ "HH6", "6 maal herhalen" ],
		[ "HH7", "7 maal herhalen" ],
		[ "HH8", "8 maal herhalen" ],
		[ "HH9", "9 maal herhalen" ],
		[ "HH10", "10 maal herhalen" ],
		[ "HH11", "11 maal herhalen" ],
		[ "HH12", "12 maal herhalen" ],
		[ "ZNN5H", "Zo nodig na 5 tot 10 minuten herhalen" ],
		[ "ZN6UH", "Zo nodig na 6 uur herhalen" ],
		[ "ZN1UH", "Zo nodig na 1 tot 1,5 uur herhalen" ],
	// Sectie 113 - Maximaal aanduidingen
		[ "MX4PD", "Niet meer dan 4 per 24 uur" ],
		[ "MX2PD", "Niet meer dan 2 per 24 uur" ],
		[ "MX4PW", "Niet meer dan 4 per week" ],
		[ "MX5DG", "Niet langer dan 5 dagen achtereen gebr." ],
		[ "MX12U", "Niet langer dan 12 uur per dag toepassen" ],
		[ "MX10W", "Niet meer dan 10 per week" ],
		[ "MX6U", "Maximaal 6 uur tussentijd!" ],
		[ "MX10D", "Niet langer dan 10 dagen gebruiken" ],
		[ "MX1W", "Niet langer dan 1 week gebruiken" ],
	// Sectie 114 - Weekdagen
		[ "MA", "op maandag" ],
		[ "DI", "op dinsdag" ],
		[ "WO", "op woensdag" ],
		[ "DO", "op donderdag" ],
		[ "VR", "op vrijdag" ],
		[ "ZA", "op zaterdag" ],
		[ "ZO", "op zondag" ],
	// Sectie 115 - Gebruik
		[ "GB", "Gebruik bekend" ],
		[ "GVB", "Gebruik volgens aanwijzingen bijsluiter" ],
		[ "GVH", "Gebruik volgens aanwijzingen huisarts" ],
		[ "IMM", "Aan de huisarts afgeven" ],
		[ "GVSCH", "Gebruik volgens schema" ],
		[ "GVS", "Gebruik volgens voorschrift specialist" ],
		[ "GVV", "Gebruik volgens aanwijzing verloskundige" ],
		[ "GVTA", "Gebruik volgens aanwijzingen tandarts" ],
		[ "VZKMM", "Gebruik met voorzetkamer met masker" ],
		[ "VZK", "Gebruik met voorzetkamer" ],
	// Sectie 116 - Administratief
		[ "AFS", "Volgende maal afspraak maken" ],
		[ "SPV", "Specialistisch voorschrift" ],
		[ "N2WCO", "Na twee weken controle" ],
	// Sectie 117 - Adviezen en waarschuwingen
		[ "GNALC", "Gebruik geen alcohol bij dit middel" ],
		[ "ALCO", "Pas op met alcohol" ],
		[ "BIJT", "Pas op: bijtend middel" ],
		[ "ZONUV", "Felle zon en UVlamp op de huid vermijden" ],
		[ "HAWA", "Na gebruik handen wassen" ],
		[ "FKVD", "Goed fijnkauwen voor het doorslikken" ],
		[ "HEEL", "Heel doorslikken, niet kauwen" ],
		[ "KUUR", "Kuur afmaken" ],
		[ "MWNMM", "Met water innemen, niet met melk" ],
		[ "RIJV", "Kan het reactievermogen verminderen" ],
		[ "ZSW", "Zittend of staand innemen met veel water" ],
		[ "BLEEK", "Pas op: werkt blekend op haar en kleding" ],
		[ "VERKL", "Kan de urine of stoelgang verkleuren" ],
		[ "VLEK", "Maakt vlekken op kleding en linnengoed" ],
		[ "NEMA", "Bij maagklachten NA het eten innemen" ],
		[ "VUUR", "Pas op met vuur" ],
		[ "VEVO", "Innemen met veel vocht" ],
		[ "ZOLA", "Zo lang gebruiken als arts voorschrijft" ],
		[ "KFV", "Kauwen of fijngemaakt met vocht innemen" ],
		[ "ALCMA", "Pas op met alcohol i.v.m. maagklachten" ],
		[ "DABR", "Dun op de huid aanbrengen" ],
		[ "CONTL", "Let op: beschadigt zachte contactlenzen" ],
		[ "GVT", "Gebruik volgens schema trombosedienst" ],
		[ "2V2NN", "2 uur voor en 2 uur na innemen niet eten" ],
		[ "OTSM", "Tablet ONDER de tong laten oplossen" ],
		[ "GORGU", "Gorgelen, daarna uitspugen" ],
		[ "SPU", "Mond spoelen, daarna uitspugen" ],
		[ "OPZL", "Langzaam opzuigen" ],
		[ "INHM", "Ter inhalatie via de mond" ],
		[ "INHN", "Ter inhalatie via de neus" ],
		[ "NGMS", "Na gebruik mond spoelen" ],
		[ "2V1NN", "2 uur voor en 1 uur na innemen niet eten" ],
		[ "SMELT", "Op de tong laten smelten, wegslikken" ],
		[ "PLZON", "Pleister niet aan zonlicht blootstellen" ],
		[ "20SMD", "ca 20 sec in de mond houden, doorslikken" ],
		[ "1UNNE", "Gedurende 1 uur na innemen niet eten" ],
		[ "GRAPE", "Bij dit middel GEEN grapefruit(sap) gebr." ],
		[ "VERKM", "Kan metaal verkleuren (bril, sieraden)" ],
		[ "COIGD", "Capsule mag open,korrels heel doorslikken 3 4 2,9 1 117137 BLEKL Pas op: bleekt kleding en linnengoed" ],
		[ "ND15M", "15 min. voor en na gebruik niet drinken" ],
		[ "LUCHT", "Luchtbel niet verwijderen" ],
		[ "VGKAM", "Voor gebruik op kamertemperatuur brengen" ],
		[ "MVOE", "Innemen met wat voedsel" ],
		[ "BHNL", "Binnen 30 min. na inname niet gaan liggen" ],
		[ "BUNL", "Binnen 60 min. na inname niet gaan liggen" ],
		[ "MEEDR", "Gemengd met eten of drinken innemen" ],
		[ "KUURS", "Kan kuur met stopperiode(s) zijn" ],
		[ "MVITC", "Hierbij max. 200 mg/dag vit. C toegestaan" ],
		[ "LVGB", "Lees voor gebruik de bijsluiter" ],
		[ "GRAPF", "Pas op met grapefruit(sap), lees folder" ],
		[ "BRP1W", "Bij reuma/psoriasis 1xper wk op vaste dag" ],
		[ "MX2W", "Niet langer dan 2 weken gebruiken" ],
		[ "KORHE", "Korrels heel doorslikken, niet kauwen" ],
		[ "3V3NN", "3 uur voor en 3 uur na innemen niet eten" ],
		[ "ZUIV", "Niet met zuivel innemen, zie bijsluiter" ],
		[ "CITR", "Pas op met citrusvruchten, lees folder" ],
		[ "1V2NN", "1 uur voor en 2 uur na innemen niet eten" ],
		[ "BREEK", "Indien nodig breken langs breukstreep" ],
		[ "TABHE", "Tabletdelen heel doorslikken" ],
		[ "MW", "Met water innemen" ],
		[ "VMMON", "Vermijd mondhoeken, ooghoeken en neus" ],
		[ "NGEZI", "Niet in het gezicht toepassen" ],
	// Sectie 118 - Houdbaarheid
		[ "VPBW", "In deze verpakking bewaren" ],
		[ "HELD", "Alleen gebruiken indien helder" ],
		[ "HB1W", "Na openen 1 week houdbaar" ],
		[ "HB2W", "Na openen 2 weken houdbaar" ],
		[ "HB1M", "Na openen 1 maand houdbaar" ],
		[ "KOELK", "In de koelkast bewaren (2-8 C)" ],
		[ "HB2M", "Na openen 2 maanden houdbaar" ],
		[ "HB3M", "Na openen 3 maanden houdbaar" ],
		[ "HB6M", "Na openen 6 maanden houdbaar" ],
		[ "HB1J", "Na openen 1 jaar houdbaar" ],
		[ "KOEL", "Koel bewaren (8-15 C)" ],
		[ "KAMER", "Bij kamertemperatuur bewaren (15-25 C)" ],
		[ "HB24U", "Na openen 24 uur houdbaar" ],
		[ "HB6W", "Na openen 6 weken houdbaar" ],
		[ "DONKR", "Bewaar in het donker" ],
		[ "HB3J", "Na openen 3 jaar houdbaar" ],
		[ "LICHT", "Bewaar in het licht" ],
		[ "DIEPV", "In de vriezer bewaren (beneden -15 C)" ],
		[ "HB10D", "Na openen 10 dagen houdbaar" ],
		[ "HB1D", "Na openen 1 dag houdbaar" ],
		[ "HB1DR", "Houdbaar tot 1 dag na ref.tijdstip" ],
		[ "HB3DR", "Houdbaar tot 3 dagen na ref.tijdstip" ],
		[ "HB4DR", "Houdbaar tot 4 dagen na ref.tijdstip" ],
		[ "HB4WR", "Houdbaar tot 28 dagen na ref.tijdstip" ],
		[ "HB2MR", "Houdbaar tot 2 maanden na ref.tijdstip" ],
		[ "HB8UL", "Na labelen 8 uur houdbaar" ],
		[ "KOEEG", "In koelkast bewaren na eerste gebruik" ],
		[ "HB7DR", "Houdbaar tot 7 dagen na ref.tijdstip" ],
		[ "HB4UL", "Na labelen 4 uur houdbaar" ],
		[ "KAMNL", "Na labelen bij kamertemperatuur bewaren" ],
		[ "KOENL", "Na labelen in koelkast bewaren" ],
		[ "HB9DR", "Houdbaar tot 9 dagen na ref.tijdstip" ],
		[ "ELB8U", "Eluaat binnen 8 uur gebruiken" ],
		[ "HB12U", "Na openen 12 uur houdbaar (in koelkast)" ],
		[ "HBK2W", "Buiten koelkast max. 14 dagen houdbaar" ],
		[ "HB6UL", "Na labelen 6 uur houdbaar" ],
		[ "HBHUL", "Na labelen 30 minuten houdbaar" ],
		[ "HB4M", "Na openen 4 maanden houdbaar" ],
		[ "HBK3M", "Buiten koelkast max. 3 maanden houdbaar" ],
		[ "ELB10", "Eluaat binnen 10 uur gebruiken" ],
		[ "HB2WR", "Houdbaar tot 14 dagen na ref.tijdstip" ],
		[ "HB20R", "Houdbaar tot 20 uur na ref.tijdstip" ],
		[ "HB36R", "Houdbaar tot 36 uur na ref.tijdstip" ],
		[ "HB12K", "Houdbaar tot 12 uur na ref.tijdstip" ],
		[ "HB1JK", "In koelkast 1 jaar houdbaar" ],
		[ "HB6MT", "Bij kamertemperatuur 6 maanden houdbaar" ],
		[ "RECHO", "Rechtop bewaren" ],
		[ "HB12L", "Na labelen 12 uur houdbaar" ],
		[ "H12WR", "Houdbaar tot 12 weken na ref.tijdstip" ],
		[ "ONKOE", "Onaangebroken: in koelkast bewaren" ],
		[ "NOKAM", "Na openen: bij kamertemperatuur bewaren" ],
		[ "KOKAB", "Koel of bij kamertemp. bewaren (8-25 C)" ],
		[ "H10ML", "Na labelen 10 min houdbaar" ],
		[ "H21DR", "Houdbaar tot 21 dagen na ref.tijdstip" ],
		[ "IJS1U", "In droog ijs tot 1 uur voor gebruik" ],
		[ "H2DR", "Houdbaar tot 2 dagen na ref.tijdstip" ],
		[ "HBK4W", "Buiten koelkast max. 4 weken houdbaar" ],
		[ "HB4W", "Na openen 4 weken houdbaar" ],
		[ "NOPKO", "Na oplossen in de koelkast bewaren" ],
		[ "HB48U", "Na openen 48 uur houdbaar" ],
		[ "HBK30", "Buiten koelkast max. 30 dagen houdbaar" ],
		[ "HBK24", "Buiten koelkast max. 24 uur houdbaar" ],
		[ "HBK6W", "Buiten koelkast max. 6 weken houdbaar" ],
		[ "HB6WR", "Houdbaar tot 6 weken na ref.tijdstip" ],
		[ "NO4W", "Na oplossen 4 weken houdbaar in koelkast" ],
		[ "HBK7D", "Buiten koelkast max. 7 dagen houdbaar" ],
		[ "HBK3D", "Buiten koelkast max. 3 dagen houdbaar" ],
		[ "HB3W", "Na openen 3 weken houdbaar" ],
		[ "HB24K", "Na openen 24 uur houdbaar (in koelkast)" ],
		[ "HB4MA", "4 maanden houdbaar" ],
		[ "H24DR", "Houdbaar tot 24 dagen na ref.tijdstip" ],
		[ "HB7W", "Na openen 7 weken houdbaar" ],
		[ "HB8W", "Na openen 8 weken houdbaar" ],
		[ "HB6WT", "Bij kamertemperatuur 6 weken houdbaar" ],
		[ "HB5W", "Na openen 5 weken houdbaar" ],
		[ "HB2J", "Na openen 2 jaar houdbaar" ],
		[ "HB1WA", "Na aansluiten 1 week houdbaar" ],
		[ "HB7M", "Na openen 7 maanden houdbaar" ],
		[ "KOEVR", "In de koelkast of in de vriezer bewaren" ],
		[ "HB2WT", "Bij kamertemperatuur 2 weken houdbaar" ],
		[ "HBK2M", "Buiten koelkast max. 2 maanden houdbaar" ],
		[ "NO6U", "Na oplossen 6 uur houdbaar" ],
		[ "NOB48", "Na ontdooien binnen 48 uur gebruiken" ],
		[ "HB5D", "Na openen 5 dagen houdbaar" ],
		[ "NOB72", "Na ontdooien binnen 72 uur gebruiken" ],
		[ "HBBIJ", "Na openen beperkt houdbaar,zie bijsluiter" ],
		[ "HB9MT", "Bij kamertemperatuur 9 maanden houdbaar" ],
		[ "HB5M", "Na openen 5 maanden houdbaar" ],
		[ "HBK6M", "Buiten koelkast max. 6 mnd houdbaar" ],
	// Sectie 119 - Bereidingsadviezen
		[ "OMS", "Omschudden vlak voor gebruik" ],
		[ "OPLW", "Eerst oplossen in water" ],
		[ "UIEW", "Eerst uiteen laten vallen in water" ],
		[ "OMR", "Omroeren voor gebruik" ],
		[ "LTEMP", "Op lichaamstemperatuur brengen voor gebr" ],
		[ "SR150", "Op 150 ml vloeistof strooien, doorroeren" ],
		[ "VGOMZ", "Voor gebruik ten minste 10x omzwenken" ],
		[ "NOB6U", "Na ontdooien binnen 6 uur gebruiken" ],
		[ "VGMRO", "Voor gebruik mengen door te rollen" ],
		[ "WTAPS", "Water toevoegen aan poeder, schudden" ],
		[ "VDIGW", "Dosis verdunnen in een glas water" ],
		[ "VG1VD", "Voor gebruik 1:1 verdunnen met water" ],
		[ "TBFGM", "De tablet mag worden fijngemalen" ],
		[ "VGOMK", "Voor gebruik flacon enkele malen omkeren" ],
		[ "KOMS", "Krachtig omschudden vlak voor gebruik" ],
		[ "OPLWL", "Oplossen in water of limonade" ]
	];

	if (code.length > 0)
	{
		if (code[0] == '-')
			hoeveelheid = '';
		else if (code[0] != ' ')								// Hele code is er niet. Alleen eventuele aanvullende teksten
		{
			while (i < code.length && !end)
			{
				if (code[i] >= '0' && code[i] <= '9')
				{
					if (pVorm == 0)
						hCodeVan += code[i];
					else
						hCodeTot += code[i];
					hoeveelheid += code[i];
					i++;
				}
				else if (code[i] == '.')
				{
					if (pVorm == 0)
						hCodeVan += code[i];
					else
						hCodeTot += code[i];
					hoeveelheid += ',';
					i++;
				}
				else if (code[i] == '-')
				{
					hoeveelheid += ' tot ';
					pVorm = 1;
					i++;
				}
				else
					end = 1;
			}
			if (  !pVorm
			    && parseInt (hoeveelheid) > 1)
				pVorm = 1;
		}
		if (i < code.length && code[i] != ' ')
		{
			while (   i < code.length
				   && code[i] >= 'A'
				   && code[i] <= 'Z')
				per += code[i++];
		}
		if (i < code.length && code[i] != ' ')
		{
			end = 0;
			j = 0;
			while (i < code.length && !end)
			{
				if (code[i] >= '0' && code[i] <= '9')
				{
					if (j == 0)
						pCodeVan += code[i];
					else
						pCodeTot += code[i];
					dosis += code[i];
					i++;
				}
				else if (code[i] == '.')
				{
					if (j == 0)
						pCodeVan += code[i];
					else
						pCodeTot += code[i];
					dosis += ',';
					i++;
				}
				else if (code[i] == '-')
				{
					dosis += ' tot ';
					j = 1;
					i++;
				}
				else
					end = 1;
			}
		}
		if (i < code.length && code[i] != ' ')
		{
			while (   i < code.length
				   && code[i] >= 'A'
				   && code[i] <= 'Z')
				vorm += code[i++];
		}

		j = 0;
		var fc;
		var cd = '';
		while (   i < code.length
			   && code[i] == ' ')
		{
			i++;
			fc = 0;
			cd = '';
			while (i < code.length && code[i] != ' ')
				cd += code[i++];
			for (var c = 0; c < aanvullend.length && fc == 0; c++)
			{
				if (aanvullend[c][0] == cd)
				{
					fc = 1;
					if (tekst != '')
						tekst += '<br />';
					tekst += aanvullend[c][1];
				}
			}
		}
	}
	if (hoeveelheid != '')
		omschrijving = hoeveelheid + ' maal';

	if (per.length > 0)
	{
		omschrijving += ' per ';
		var plural = 0;
		if (per.length > 1)
		{
			plural = 1;
			if (per[1] == 'T')
			{
				perMaal = 2;
				omschrijving += 'twee ';
			}
			else if (per[1] == 'D')
			{
				perMaal = 3;
				omschrijving += 'drie ';
			}
			else if (per[1] == 'V')
			{
				perMaal = 4;
				omschrijving += 'vier ';
			}
			else if (per[1] == 'Q')
			{
				perMaal = 5;
				omschrijving += 'vijf ';
			}
			else if (per[1] == 'Z')
			{
				perMaal = 6;
				omschrijving += 'zes ';
			}
			else if (per[1] == 'S')
			{
				perMaal = 7;
				omschrijving += 'zeven ';
			}
			else if (per[1] == 'A')
			{
				perMaal = 8;
				omschrijving += 'acht ';
			}
			else if (per[1] == 'N')
			{
				perMaal = 9;
				omschrijving += 'negen ';
			}
			else if (per[1] == 'X')
			{
				perMaal = 10;
				omschrijving += 'tien ';
			}
			else if (per[1] == 'W')
			{
				perMaal = 12;
				omschrijving += 'twaalf ';
			}
			else if (per[1] == 'P')
			{
				perMaal = 24;
				omschrijving += 'vierentwintig ';
			}
			else if (per[1] == 'H')
			{
				perMaal = 0.5;
				omschrijving += 'half ';
			}
		}
		if (per[0] == 'D' && !plural)
		{
			perPeriode = 1;
			omschrijving += 'dag';
		}
		else if (per[0] == 'D' && plural)
		{
			perPeriode = 1;
			omschrijving += 'dagen';
		}
		else if (per[0] == 'U')
		{
			perPeriode = 2;
			omschrijving += 'uur';
		}
		else if (per[0] == 'W' && !plural)
		{
			perPeriode = 3;
			omschrijving += 'week';
		}
		else if (per[0] == 'W' && plural)
		{
			perPeriode = 3;
			omschrijving += 'weken';
		}
		else if (per[0] == 'M' && !plural)
		{
			perPeriode = 4;
			omschrijving += 'maand';
		}
		else if (per[0] == 'M' && plural)
		{
			perPeriode = 4;
			omschrijving += 'maanden';
		}
	}
	if (dosis != '')
		omschrijving += ' ' + dosis;
	if (vorm != '')
	{
		omschrijving += ' ';
		for (j = 0; j < vormen.length && fVorm == 0; j++)
		{
			if (vormen[j][0] == vorm)
			{
				fVorm = 1;
				if (pVorm)
					omschrijving += vormen[j][2];
				else
					omschrijving += vormen[j][1];
			}
		}
	}

	if (tekst != '')
	{
		if (omschrijving != '')
			omschrijving += '<br />';
		omschrijving += tekst;
	}

	r.omschrijving	= omschrijving;
	r.hoeveelheid	= hoeveelheid;
	r.dosis			= dosis;
	r.hCodeVan		= hCodeVan;
	r.hCodeTot		= hCodeTot;
	r.pCodeVan		= pCodeVan;
	r.pCodeTot		= pCodeTot;
	r.perMaal		= perMaal;
	r.perPeriode	= perPeriode;

	return r;
}
