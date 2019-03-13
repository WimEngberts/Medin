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
															+ 'startGebruik TEXT,'					// datum start gebruik
															+ 'eindGebruik TEXT,'					// datum eind gebruik
															+ 'UNIQUE (personID, tijdID, prk))');	// Deze combi moet uniek zijn. Niet tweemaal hetzelfde medicijn op dezelfde tijd
	});
	db.transaction (function (tx)
	{
		tx.executeSql ('ALTER TABLE innames ADD COLUMN startGebruik TEXT');							// datum start gebruik
		tx.executeSql ('ALTER TABLE innames ADD COLUMN eindGebruik TEXT');							// datum eind gebruik
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
				var stop  = new Date (row['eindGebruik']);
				var start = new Date (row['startGebruik']);
				var now   = new Date ();
				var bGrey = false;
				if (now.getTime () > stop.getTime ())
					bGrey = true;
				if (now.getTime () < start.getTime ())
					bGrey = true;
				if (i == 0)
					id = row['lijst'];
				var div = document.createElement ('div');
				var className = 'item standard';
				if (bGrey)
					className += ' greyLetters';
				div.className = className;
				div.setAttribute ('onclick', 'onShowMed (' + id + ', ' + row['regel'] + ');');
				szHTML = '<b>' + row['dispensedMedicationName'] + '</b><br />';
				szHTML += n25['omschrijving'];
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
				var voorschrijver = row['voorschrijverNaam'];
				if (row['voorschrijverSpec'])
					voorschrijver += ',<br />' + row['voorschrijverSpec'];

				szHTML  = addDate (row['transcriptTimestamp'], 'Voorschrift', 0);
				szHTML += addDate (row['dispenseTimestamp']  , 'Leverdatum', 0);
				szHTML += addDate (row['startGebruik']       , 'Startdatum', 1);
				szHTML += addDate (row['eindGebruik']        , 'Stopdatum', 2);
				szHTML += '<tr><td>Geleverd</td><td>:</td><td>'				+ row['hoeveelheid'] + ' ' + row['codeUnit'] + '</td></tr>';
				var d = nhg25 (row['nhg25']);
				szHTML += '<tr><td>Dosering</td><td>:</td><td>'				+ d.omschrijving			+ '</td></tr>'
	                   +  '<tr><td>Voorschrijver</td><td>:</td><td>'		+ voorschrijver	+ '</td></tr>';
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

function addDate (dateString, label, check)
{
	var bRed = false;
	var szHTML = '';
	var months = [
		'januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus',
		'september', 'oktober', 'november', 'december' ];

	szHTML  = '<tr><td>';
	szHTML += label;
	szHTML += '</td><td>:</td><td>';
	if (dateString != '')
	{
		var now = new Date ();
		var date = new Date (dateString);
		var show = '<span';
		if (check == 1)
		{
			if (date.getTime () > now.getTime ())
				bRed = true;
		}
		else if (check == 2)
		{
			if (date.getTime () < now.getTime ())
				bRed = true;
		}
		if (bRed)
			show += ' style=\"color:#ff0000;\"';
		show += '>';
		show += date.getDate ();
		show += ' ';
		show += months[date.getMonth ()];
		show += ' ';
		show += date.getFullYear ();
		if (bRed)
			show += ' !';
		show += '</span>';
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
				var listDate = new Date (row['listJaar'], row['listMaand'], row['listDag'], 5, 5, 5, 5);
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
	var months = 0;

	months = (d2.getFullYear() - d1.getFullYear()) * 12;
	months -= d1.getMonth() + 1;
	months += d2.getMonth();

	return months <= 0 ? 0 : months;
}
