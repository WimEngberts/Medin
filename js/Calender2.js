var g_Medicatie = null;
var g_Person;
var g_ThingsToDo = false;
var g_Innames;

//---------------------------------------------------------------------------------------------------------------
// Check of een lijst al volledig is verdeeld in de kalender
//
function checkListInCalender ()
{

	globalID = -1;
	g_Medicatie = null;

	showMenu (0);								// menu mag weer even weg (als het er al stond)

	db.transaction(function(tx)
	{
		//-------------------------------------------------------------------------------------------------------
		// Stap 1: Haal de persoon op voor wie we dit allemaal gaan doen. Dat is dus de geselecteerde persoon
		//
		tx.executeSql('SELECT * FROM person WHERE selected = 1', [], function (tx, results)
		{
			if (results.rows.length > 0)				// Er is iemand geselecteerd
			{
				row = results.rows.item(0);				// Deze persoon dus
				currentUser = row['naam'];				// Met deze naam
				globalID = row['id'];					// En deze id
				checkListInCalenderStep2 (row['id']);	// Daar gaan we mee verder
			}
			// ----------------------------------------------------------------------------------------------------
			// Is er geen geselecteerde persoon, dan doen we dus niets
			//
			else
			{
				myAlert ('Er is nog geen geselecteerde gebruiker gevonden');
			}
		}), function (tx, error)
		{
			alert ('er is een fout opgetreden\r\n' + error.message);
		}, function ()
		{
		};
	});
}

//---------------------------------------------------------------------------------------------------------------
// Check of een lijst al volledig is verdeeld in de kalender
// Stap 2: Haal de meest recente lijst op van de geselecteerde persoon
//
function checkListInCalenderStep2 (userID)
{

	db.transaction(function(tx)
	{
		var sqlStatement = 'SELECT * FROM lijsten WHERE patient = ' + userID + ' ORDER BY listJaar DESC, listMaand DESC, listDag DESC, listTijd DESC';
		tx.executeSql(sqlStatement, [], function (tx, results)
		{
			if (results.rows.length > 0)								// Als er lijsten zijn geregistreerd
			{
				var row = results.rows.item(0);							// Dan is dit de meest recente
				checkListInCalenderStep3 (row['patient'], row['id']);
			}
			// ------------------------------------------------------------------------------------------------------
			// Als er geen lijsten zijn geregistreerd dan eindigt het dus hier
			//
		}), function (tx, error)
		{
			alert ('er is een fout opgetreden\r\n' + error.message);
		}, function ()
		{
		};
	});
}

//---------------------------------------------------------------------------------------------------------------
// Check of een lijst al volledig is verdeeld in de kalender
// Stap 3: We hebben nu de gebruiker en de lijst. Ga nu alle medicatieregels langs en kijk of we deze al
//         ergens in de kalender hebben staan.
//
function checkListInCalenderStep3 (userID, listID)
{

	g_Person = userID;
	g_ThingsToDo = false;

	db.transaction(function(tx)
	{
		tx.executeSql('SELECT * FROM medicatie WHERE lijst = ' + listID, [], function (tx, results)
		{
			//----------------------------------------------------------------------------------------------------
			// OK, alle medicatie is binnen
			//
			g_Medicatie = results.rows;					// ff bewaren
			if (g_Medicatie.length > 0)
			{
				tx.executeSql('SELECT * FROM innames WHERE personID = ' + g_Person, [], function (tx, results)
				{
					var szHTML = '';
					for (var m = 0; m < g_Medicatie.length; m++)
					{
						var medicatie = g_Medicatie.item(m);

						medicatie['distributed'] = -2;
						var n25 = nhg25 (medicatie['nhg25']);
						medicatie['nhgExpanded'] = n25;
						var hVan = parseInt (n25.hCodeVan);
						var hTot = parseInt (n25.hCodeTot);
						var f = false;
						var n = 0;
						for (var i=0; i < results.rows.length; i++)
						{
							var row = results.rows.item(i);
							if (medicatie['prk'] == row['prk'])				// OK, die hebben we
							{
								n += row['nDosis'];							// Zoveel tellen we er nu dus bij
								if (row['nDosis'] == 0)						// was niet gestructureerd opgegeven?
									n++;									// dan dus maar één keer meer opgevoerd in de kalender
								f = true;
							}
						}
						if (f)
							medicatie['distributed'] = 1;
						else
							medicatie['distributed'] = 0;
						szHTML += '<tr onmouseup=\"addToCalender (' + medicatie['lijst'] + ', ' + medicatie['regel'] + ');\">';
						szHTML += '<td><b>' + medicatie['dispensedMedicationName'] + '</b><br />';
						szHTML += n25['omschrijving'] + '</td><td class=\"tdright\">';
						if (f)
							szHTML += 'wijzigen';
						else
							szHTML += 'toevoegen';
						szHTML += '</td></tr>';
					}
					for (var i=0; i < results.rows.length; i++)							// Nu even omgekeerd. Hebt u niet teveel in de kalender?
					{
						var row = results.rows.item(i);
						if (row['eigen'] != 0)											// Eigen ingevoerde medicatie telt niet mee natuurlijk
						{
							var f = false;
							for (var m = 0; m < g_Medicatie.length; m++)
							{
								var medicatie = g_Medicatie.item(m);
								if (medicatie['prk'] == row['prk'])						// OK, die hebben we
									f = true;
							}
							if (!f)														// Nee, die staat niet meer in de lijst!
							{
								szHTML += '<tr onmouseup=\"deleteFromCalender (' + row['personID'] + ',' + row['tijdID'] + ',' + row['sequence'] + ');\">';
								szHTML += '<td><b>' + row['naam'] + '</b><br />';
								var n25 = nhg25 (row['nhg25']);
								szHTML += n25['omschrijving'] + '</td><td>verwijderen</td></tr>';
							}
						}
					}
					createList ('lijssie', 'medicatie in wekker', szHTML, onCloseCheck, null, true);
				}), function (tx, error)
				{
					alert ('er is een fout opgetreden\r\n' + error.message);
				}, function ()
				{
				};
			}
		}), function (tx, error)
		{
			alert ('er is een fout opgetreden\r\n' + error.message);
		}, function ()
		{
		};
	});
}

function onCloseCheck (div)
{
	fillCalender ();
}

function distriCancel ()
{
	setVisibility ('distriCover', false);
	setVisibility ('notDistributed', false);
}

function addCancel ()
{
	setVisibility ('addCover', false);
	setVisibility ('addMedicin', false);
}

function addToCalender (listID, regel)
{
	db.transaction(function(tx)
	{
		tx.executeSql('SELECT * FROM medicatie WHERE lijst = ' + listID + ' AND regel = '+ regel, [], function (tx, results)
		{
			if (results.rows.length == 0)
			{
				alert ('Oeps, kan dit medicijn niet meer terugvinden!');
			}
			else
			{
				g_Medicatie = results.rows.item(0);
				tx.executeSql ('SELECT * FROM innames WHERE personID=' + g_Person + ' AND prk=\'' + g_Medicatie['prk'] + '\'', [], function (tx, results)
				{
					var title = '<b>' + g_Medicatie['dispensedMedicationName'] + '</b><br />';
					var n25 = nhg25 (g_Medicatie['nhg25']);
					title += n25['omschrijving'];
					g_Innames = results.rows;

					tx.executeSql ('SELECT * FROM tijden WHERE personID=' + g_Person + ' ORDER BY tijdStip', [], function (tx, results)
					{
						var colorName = 'grey';
						var szHTML = '';
						var n = 0;
						for (var i = 0; i < results.rows.length; i++)
						{
							var tijd = results.rows.item (i);
							var f = false;
							for (var j=0; j<g_Innames.length; j++)
							{
								if (g_Innames[j]['tijdID'] == tijd['tijdID'])
									f = true;
							}
							szHTML += '<div class=\"addRow ' + colorName + '\">';
							szHTML += tijd['tijdNaam'];
							szHTML += '<div id=\"time' + n + '\" class=\"';
							if (f)
								szHTML += 'timeSelected ';
							else
								szHTML += 'timeUnselected ';
							szHTML += 'timeline\" onmouseup=\"selectTime(\'time' + n + '\');\" data-tijd=\"' + tijd['tijdID'] + '\"></div></div>';
							n++;
							if (colorName == 'grey')
								colorName = 'white';
							else
								colorName = 'grey';
						}
						var div = createList ('toevoegen', title, szHTML, closeAddAlarm, cancelAlarm, false);
						div.setAttribute ('data-user', g_Person);
						div.setAttribute ('data-prk',  g_Medicatie['prk']);
						div.setAttribute ('data-naam', g_Medicatie['dispensedMedicationName']);
					}), function (tx, error)
					{
						alert ('er is een fout opgetreden\r\n' + error.message);
					}, function ()
					{
					};
				}), function (tx, error)
				{
					alert ('er is een fout opgetreden\r\n' + error.message);
				}, function ()
				{
				};
			}
		}), function (tx, error)
		{
			alert ('er is een fout opgetreden\r\n' + error.message);
		}, function ()
		{
		};
	});
}

function selectTime (tijdID)
{
	var div = document.getElementById (tijdID);
	if (div)
	{
		if (div.className == 'timeUnselected timeline')
			div.className = 'timeSelected timeline';
		else
			div.className = 'timeUnselected timeline';
	}
}

function closeAddAlarm (div)
{

	db.transaction(function(tx)
	{
		var personID = div.getAttribute ('data-user');
		var naam = div.getAttribute ('data-naam');
		var prk = div.getAttribute ('data-prk');
		var sqlStatement = '';

		var tijden = document.getElementsByClassName ('timeline');
		for (var i = 0; i < tijden.length; i++)
		{
			var tijd = tijden[i];
			var id = tijd.getAttribute ('data-tijd');

			if (tijd.className == 'timeSelected timeline')
				sqlStatement =   'INSERT OR IGNORE INTO innames (personID,tijdID,prk,naam,eigen,nDosis,dosis) VALUES(' + personID + ',' + id + ',\'' + prk + '\',\'' + naam + '\',0,1,\'1\')';
			else
				sqlStatement = 'DELETE FROM innames WHERE personID=' + personID + ' AND tijdID=' + id + ' AND prk=\'' + prk + '\'';

			tx.executeSql(sqlStatement, [], function (tx, results)
			{
			}), function (tx, error)
			{
				alert ('er is een fout opgetreden\r\n' + error.message);
			}, function ()
			{
			};
		}
	});
}

function cancelAlarm ()
{
}
