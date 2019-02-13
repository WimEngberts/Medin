//---------------------------------------------------------------------------------
// lijsten.js
// Het omgaan met medicatielijsten (tonen, inlezen en zo)
//
function initTables (db)
{
	db.transaction (function (tx)
	{
		tx.executeSql ('CREATE TABLE IF NOT EXISTS person(id INTEGER PRIMARY KEY ASC,'
															+ 'naam TEXT,'
															+ 'gebJaar INTEGER,'
															+ 'gebMaand INTEGER,'
															+ 'gebDag INTEGER,'
															+ 'selected INTEGER,'
															+ 'warnCalender INTEGER DEFAULT 1)');
	});
	db.transaction (function (tx)
	{
		tx.executeSql ('CREATE TABLE IF NOT EXISTS lijsten(id INTEGER PRIMARY KEY ASC,'
															+ 'apotheekID TEXT,'					// AGB code van de apotheek
															+ 'apotheek TEXT,'
															+ 'listDag INTEGER,'
															+ 'listMaand INTEGER,'
															+ 'listJaar INTEGER,'
															+ 'patient INTEGER,'
															+ 'listTijd TEXT)');
	});
	db.transaction (function (tx)
	{
		tx.executeSql ('CREATE TABLE IF NOT EXISTS medicatie  (lijst INTEGER,'						// interne lijst ID
															+ 'regel INTEGER,'						// intern regelnummer
															+ 'uuid TEXT,'							// medicatie ID van het apotheeksysteem
															+ 'transcriptTimestamp TEXT,'			// datum/tijd van registratie
															+ 'dispenseTimestamp TEXT,'				// datum/tijd van uitlevering
															+ 'voorschrijverNaam TEXT,'				// wie heeft dit medicijn voorgeschreven
															+ 'voorschrijverAGB TEXT,'				// met zijn/haar AGB code
															+ 'voorschrijverSpec TEXT,'				// en specialisme
															+ 'startGebruik TEXT,'					// datum start gebruik
															+ 'eindGebruik TEXT,'					// datum eind gebruik
															+ 'hoeveelheid INTEGER,'				// double dosering
															+ 'codeUnit TEXT,'						// bijvoorbeeld ST, ML, etc
															+ 'zi TEXT,'							// medicatiecodering z-Index
															+ 'hpk TEXT,'							// handelsproductcode in de G-Standaard
															+ 'prk TEXT,'							// Prescriptiecode
															+ 'dispensedMedicationName TEXT,'		// naam op het doosje
															+ 'iterationCredit INTEGER,'			// hoeveelheid nog te herhalen
															+ 'iterationDate TEXT,'					// herhaaldatum
															+ 'text1 TEXT,'							// teksten
															+ 'text2 TEXT,'							// let op: kunnen html opmaak als bijvoorbeeld <br /> bevatten
															+ 'text3 TEXT,'							// bijvoorbeeld
															+ 'text4 TEXT,'							// 1 maal per dag 2 tabletten Kuur afmaken<br/>Eerst uiteen laten vallen in water
															+ 'text5 TEXT,'
															+ 'nhg25 TEXT)');						// inname gecodeerd
	});
	db.transaction (function (tx)
	{
		tx.executeSql ('CREATE TABLE IF NOT EXISTS tijden     (personID INTEGER,'					// Iedere gebruiker z'n eigen lijst
															+ 'tijdID INTEGER PRIMARY KEY ASC,'		// Het tijdstip ID
															+ 'tijdNaam TEXT,'						// De naam (ontbijt, lunch, etc)
															+ 'periodiciteit TEXT,'					// Periodiciteit (dag, week, etc)
															+ 'tijdStip TEXT)');					// Het bijbehorende tijdstip (hh:mm)
	});
	db.transaction (function (tx)
	{
		tx.executeSql ('CREATE TABLE IF NOT EXISTS innames    (personID INTEGER,'					// Iedere gebruiker z'n eigen lijst
															+ 'tijdID INTEGER,'						// op dit tijdStip
															+ 'prk TEXT,'							// neemt u dit medicijn
															+ 'naam TEXT,'							// De naam van het medicijn
															+ 'eigen INTEGER,'						// Deze hebt u buiten de lijst om zelf toegevoegd
															+ 'nDosis INTEGER,'						// in deze hoeveelheid (verwerkbaar)
															+ 'dosis TEXT,'							// in deze hoeveelheid (tekstueel)
															+ 'UNIQUE (personID, tijdID, prk))');	// Deze combi moet uniek zijn. Niet tweemaal hetzelfde medicijn op dezelfde tijd
	});
	db.transaction (function (tx)
	{
		tx.executeSql ('DROP TABLE IF EXISTS inname');												// Eventuele vorige versie mag weer weg nu.
	});
	saveSetting ('dbVersion', '1');
}

//-------------------------------------------------------------------------------------
// Toon de juiste medicatielijst. Stap1: vind een geselecteerde gebruiker
//
function showList (db)
{
	var overzicht = document.getElementById ('overzicht');
	var div = overzicht.childNodes;
	var i = div.length;

	log ('showList ()');
	while (i-- > 0)			// verwijder alle regels uit een eventuele huidige lijst, behalve de header
	{
		if (div[i].id != 'itemHeader')
			overzicht.removeChild (div[i]);
	}
	db.transaction(function(tx)
	{
		tx.executeSql('SELECT * FROM person WHERE selected = 1', [], function (tx, results)
		{
			if (results.rows.length > 0)
			{
				row = results.rows.item(0);
				document.getElementById ('itemHeader').innerHTML = '<b>Medicatielijst van ' + row['naam'] + '</b>';
				currentUser = row['naam'];
				log ('selected user = ' + row['id'] + ', ' + row['naam']);
				showListStep2 (db, row['id']);
			}
			else
				document.getElementById ('itemHeader').innerHTML = '<b>Er is nog niemand geselecteerd</b>';
		}), function (tx, error)
		{
			alert ('er is een fout opgetreden\r\n' + error.message);
		}, function ()
		{
		};
	});
}

//-------------------------------------------------------------------------------------
// Toon de juiste medicatielijst. Stap2: vindt de meest recente lijst van de geselecteerde
// gebruiker (zo er al een lijst is)
//
function showListStep2 (db, id)
{

	db.transaction(function(tx)
	{
		var sqlStatement = 'SELECT * FROM lijsten WHERE patient = ' + id + ' ORDER BY listJaar DESC, listMaand DESC, listDag DESC, listTijd DESC';
		tx.executeSql(sqlStatement, [], function (tx, results)
		{
			var szHTML   = document.getElementById ('itemHeader').innerHTML;
			if (results.rows.length == 0)
			{
				szHTML += '<br><span class="standard">Er is nog geen lijst geregistreerd</span>';
				document.getElementById ('itemHeader').innerHTML = szHTML;
			}
			else
			{
				var row = results.rows.item(0);
				var d = formatDate (row['listDag'], row['listMaand'], row['listJaar']);
				log ('most recent list = ' + row['id'] + ', ' + d);
				szHTML += '<br><span class="standard">' + row['apotheek'] + ', ' + d + ', ' + row['listTijd'] + '</span>';
				document.getElementById ('itemHeader').innerHTML = szHTML;
				showListStep3 (db, row['id']);
			}
		}), function (tx, error)
		{
			alert ('er is een fout opgetreden\r\n' + error.message);
		}, function ()
		{
		};
	});
}

//-------------------------------------------------------------------------------------
// Toon de juiste medicatielijst. Stap3: Toon nu de gevonden, meest recente, lijst
//
function showListStep3 (db, id)
{

	db.transaction(function(tx)
	{
		tx.executeSql('SELECT * FROM medicatie WHERE lijst = ' + id, [], function (tx, results)
		{
			var overzicht = document.getElementById ('overzicht');
			var szHTML;
			var id;

			for (var i=0; i < results.rows.length; i++)
			{
				var row = results.rows.item(i);
				var n25 = nhg25 (row['nhg25']);
				if (i == 0)
					id = row['lijst'];
				var div = document.createElement ('div');
				div.className = 'item standard';
				div.setAttribute ('onclick', 'onShowMed (' + id + ', ' + row['regel'] + ');');
				szHTML = '<b>' + row['dispensedMedicationName'] + '</b><br />';
				szHTML += n25['omschrijving'];
//				szHTML += row['hoeveelheid'];
//				szHTML += ' ';
//				szHTML += row['codeUnit'];
				if (row['text1'] != '')
					szHTML += '<div class="warning"></div>';
				div.innerHTML = szHTML;
				overzicht.appendChild (div);
			}
			setFontSizes ();
		}), function (tx, error)
		{
			alert ('er is een fout opgetreden\r\n' + error.message);
		}, function ()
		{
		};
	});
}

function onShowMed (lijst, regel)
{

	db.transaction(function(tx)
	{
		tx.executeSql('SELECT * FROM medicatie WHERE lijst = ' + lijst + ' AND regel = ' + regel, [], function (tx, results)
		{
			if (results.rows.length < 1)
				myAlert ('Oeps, deze medicatie kon niet meer worden gevonden');
			else
			{
				var szHTML = '';
				var row = results.rows.item(0);

				szHTML  = addDate (row['transcriptTimestamp'], 'Voorschrift');
				szHTML += addDate (row['dispenseTimestamp']  , 'Geleverd');
				szHTML += addDate (row['startGebruik']       , 'Startdatum');
				szHTML += addDate (row['eindGebruik']        , 'Stopdatum');
				szHTML += '<tr><td>Geleverd</td><td>:</td><td>'				+ row['hoeveelheid'] + ' ' + row['codeUnit'] + '</td></tr>';
				var d = nhg25 (row['nhg25']);
				szHTML += '<tr><td>Dosering</td><td>:</td><td>'				+ d.omschrijving			+ '</td></tr>'
	                   +  '<tr><td>Voorschrijver</td><td>:</td><td>'		+ row['voorschrijverNaam']	+ '</td></tr>';
				if (row['iterationCredit'] > 0)
					szHTML += '<tr><td>Herhalingen</td><td>:</td><td>'		+ row['iterationCredit']	+ '</td></tr>';
				if (row['text1'] != '')
				{
					szHTML += '<tr><td>Melding</td><td>:</td><td>'			+ row['text1'];
					if (row['text2'] != '')
						szHTML += '<br />' + row['text2'];
					if (row['text3'] != '')
						szHTML += '<br />' + row['text3'];
					if (row['text4'] != '')
						szHTML += '<br />' + row['text4'];
					if (row['text5'] != '')
						szHTML += '<br />' + row['text5'];
					szHTML += '</td></tr>';
				}
				showPrescription (row['dispensedMedicationName'],szHTML);
			}
		}), function (tx, error)
		{
			alert ('er is een fout opgetreden\r\n' + error.message);
		}, function ()
		{
		};
	});
}

function addDate (dateString, label)
{
	var szHTML = '';
	var months = [
		'januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus',
		'september', 'oktober', 'november', 'december' ];

	szHTML  = '<tr><td>';
	szHTML += label;
	szHTML += '</td><td>:</td><td>';
	if (dateString != '')
	{
		var date = new Date (dateString);
		var show = date.getDate ();
		show += ' ';
		show += months[date.getMonth ()];
		show += ' ';
		show += date.getFullYear ();
		szHTML += show;
	}
	szHTML += '</td></tr>';
	
	return szHTML;
}

function showWarning (lijst, regel)
{

	db.transaction(function(tx)
	{
		tx.executeSql('SELECT * FROM medicatie WHERE lijst = ' + lijst + ' AND regel = ' + regel, [], function (tx, results)
		{
			if (results.rows.length < 1)
				myAlert ('Oeps, deze medicatie kon niet meer worden gevonden');
			else
			{
				var szHTML = '<tr><td>Melding</td><td>:</td><td>'
				row = results.rows.item(0);

				if (row['text1'] != '')
				{
					szHTML += row['text1'];
					if (row['text2'] != '')
						szHTML += '<br />' + row['text2'];
					if (row['text3'] != '')
						szHTML += '<br />' + row['text3'];
					if (row['text4'] != '')
						szHTML += '<br />' + row['text4'];
					if (row['text5'] != '')
						szHTML += '<br />' + row['text5'];

				}
				else
					szHTML += 'Voor dit medicijn is geen melding</td></tr>';
				szHTML += '</td></tr>';
				showPrescription (row['dispensedMedicationName'],szHTML);
			}
		}), function (tx, error)
		{
			alert ('er is een fout opgetreden\r\n' + error.message);
		}, function ()
		{
		};
	});
}

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

	if (code.length > 0)
	{
		if (code[0] == '-')
			hoeveelheid = '';
		else
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
		if (i < code.length && code[i] == ' ')
			i++;
		else
		{
			while (   i < code.length
				   && code[i] >= 'A'
				   && code[i] <= 'Z')
				per += code[i++];
		}
		if (i < code.length && code[i] == ' ')
			i++;
		else
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
		if (i < code.length && code[i] == ' ')
			i++;
		else
		{
			while (   i < code.length
				   && code[i] >= 'A'
				   && code[i] <= 'Z')
				vorm += code[i++];
		}

		j = 0;
		while (i < code.length && code[i] == ' ')
		{
			i++;
			b[j] = '';
			while (i < code.length && code[i] != ' ')
				b[j] += code[i++];
			j++;
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

function cleanMedication ()
{

	var accept = loadSetting ('monthsSave');							// Hoe lang bewaren we eigenlijk?
	if (accept)
		accept = parseInt (accept);
	if (!accept || accept == 0)											// niet opgegeven of oneindig
		return ;														// Dan is er niets te doen.

	db.transaction(function(tx)
	{
		tx.executeSql('SELECT id FROM person', [], function (tx, results)
		{
			for (var i = 0; i < results.rows.length; i++)				// Het opschonen doen we voor alle personen
			{
				var row = results.rows.item (i);						// Dus ook voor jou!
				cleanMedicationStep2 (row['id']);
			}
		}), function (tx, error)
		{
			alert ('er is een fout opgetreden\r\n' + error.message);
		}, function ()
		{
		};
	});
}

function cleanMedicationStep2 (patient)
{
	db.transaction(function(tx)
	{
		tx.executeSql('SELECT * FROM lijsten WHERE patient=' + patient + ' ORDER BY listJaar DESC, listMaand DESC, listDag DESC, listTijd DESC', [], function (tx, results)
		{
			var accept = parseInt (loadSetting ('monthsSave'));
			var now = new Date ();
			for (var i = 1; i < results.rows.length; i++)				// We doen sowieso alleen iets voor de niet actuele lijsten, dus lijst[0] blijft altijd buiten schot, hoe oud ook
			{
				var row = results.rows.item (i);						// We hebben een oudere lijst
				var listDate = new Date (row['listJaar'], row['listMonth'], row['listDag'], 5, 5, 5, 5);
				var months = monthDiff (listDate, now);					// Zitten zoveel hele maanden tussen toen en nu
				if (months > accept)									// meer dan we willen?
					cleanMedicationStep3 (row['patient'], row['id']);	// Dan mag deze lijst weg
			}
		}), function (tx, error)
		{
			alert ('er is een fout opgetreden\r\n' + error.message);
		}, function ()
		{
		};
	});
}

function cleanMedicationStep3 (patient, lijst)
{
	db.transaction(function(tx)
	{
		tx.executeSql('DELETE FROM medicatie WHERE lijst=' + lijst);
		tx.executeSql('DELETE FROM lijsten WHERE patient=' + patient + ' AND id=' + lijst);
	});
}

function monthDiff(d1, d2)
{
	var months;
	
	months = (d2.getFullYear() - d1.getFullYear()) * 12;
	months -= d1.getMonth() + 1;
	months += d2.getMonth();
	
	return months <= 0 ? 0 : months;
}
