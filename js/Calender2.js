var g_Medicatie = null;
var g_Person;
var g_ThingsToDo = false;

//---------------------------------------------------------------------------------------------------------------
// Check of een lijst al volledig is verdeeld in de kalender
//
function checkListInCalender ()
{

	globalID = -1;
	g_Medicatie = null;

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

	var table = document.getElementById ('distriTable');
	var div = table.childNodes;
	var i = div.length;

	while (i-- > 0)										// verwijder alle regels uit een eventuele huidige lijst
		table.removeChild (div[i]);

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
				tx.executeSql('SELECT * FROM inname WHERE personID = ' + g_Person, [], function (tx, results)
				{
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
						{
							if (hTot == 0)										// We hebben één vast aantal malen te gaan
							{
								if (n < hVan)									// maar we hebben er minder gevonden, dus we zijn er nog niet
									medicatie['distributed'] = -1;
								else if (n == hVan)								// Nee joh, we hebben er precies genoeg!
									medicatie['distributed'] = 0;
								else											// En anders zijn we hier een beetje aan het overdoseren!
									medicatie['distributed'] = 1;
							}
							else												// We hebben een van-tot situatie
							{
								if (n < hVan)									// maar we hebben er minder gevonden, dus we zijn er nog niet
									medicatie['distributed'] = -1;
								else if (   n >= hVan							// Nee joh, we hebben er genoeg!
										 && n <= hTot)							// En ook niet meer dan het maximum
									medicatie['distributed'] = 0;
								else											// En anders zijn we hier een beetje aan het overdoseren!
									medicatie['distributed'] = 1;
							}
						}
						if (medicatie['distributed'] != 0)					// Niet helemaal goed dus nog
						{
							var table = document.getElementById ('distriTable');
							var tr = document.createElement ('tr');
							var td = document.createElement ('td');
							var szHTML = '<b>' + medicatie['dispensedMedicationName'] + '</b><br />';
							var n25 = nhg25 (medicatie['nhg25']);
							
							tr.setAttribute ('onmouseup', 'addToCalender (' + listID + ', ' + medicatie['regel'] + ');');
							szHTML += n25['omschrijving'];
							td.innerHTML = szHTML;
							tr.appendChild (td);
							td = document.createElement ('td');
							td.className = 'distriStatus large';
							if (medicatie['distributed'] == -2)			// Nog helemaal niet gezien
								td.innerHTML = 'Nog niet in kalender';
							else if (medicatie['distributed'] == -1)	// Te weinig gezien
								td.innerHTML = 'Niet voldoende in kalender';
							else										// Blijft over: 1 = teveel gezien
								td.innerHTML = 'Teveel in kalender';
							tr.appendChild (td);
							table.appendChild (tr);
							setVisibility ('distriCover', true);
							setVisibility ('notDistributed', true);
						}
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
								var table = document.getElementById ('distriTable');
								var tr = document.createElement ('tr');
								var td = document.createElement ('td');
								td.innerHTML = '<b>' + row['naam'] + '</b>';
								tr.setAttribute ('onmouseup', 'deleteFromCalender (' + row['personID'] + ',' + row['tijdID'] + ',' + row['sequence'] + ');');
								szHTML += n25['omschrijving'];
								td.innerHTML = szHTML;
								tr.appendChild (td);
								td = document.createElement ('td');
								td.className = 'distriStatus large';
								if (medicatie['distributed'] == -2)			// Nog helemaal niet gezien
									td.innerHTML = 'Nog niet in kalender';
								else if (medicatie['distributed'] == -1)	// Te weinig gezien
									td.innerHTML = 'Niet voldoende in kalender';
								else										// Blijft over: 1 = teveel gezien
									td.innerHTML = 'Teveel in kalender';
								tr.appendChild (td);
								table.appendChild (tr);
								setVisibility ('distriCover', true);
								setVisibility ('notDistributed', true);
							}
						}
					}
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
				var medicatie = results.rows.item(0);
				var div = document.getElementById ('addDescription');
				var szHTML = '<b>' + medicatie['dispensedMedicationName'] + '</b><br />';
				var n25 = nhg25 (medicatie['nhg25']);
				szHTML += n25['omschrijving'];
				div.innerHTML = szHTML;
				div.style.backgroundColor = '#c7e0ff';
				
				tx.executeSql ('SELECT * FROM tijden WHERE personID=' + g_Person, [], function (tx, results)
				{
					var mother = document.getElementById ('addBody');
					var i = mother.length;

					while (i-- > 0)										// verwijder alle regels uit een eventuele huidige lijst
						mother.removeChild (div[i]);
					var colorName = 'grey';
					for (var i = 0; i < results.rows.length; i++)
					{
						var tijd = results.rows.item (i);
						var row = document.createElement ('div');
						row.className = 'addRow ' + colorName;
						row.innerHTML = tijd['tijdNaam'];

						action = document.createElement ('div');
						action.className = 'timeUnselected ' + colorName;
						action.setAttribute('onmouseup', 'selectTime(' + tijd['tijdID'] + ');');
						row.appendChild (action);

						mother.appendChild (row);
						if (colorName == 'grey')
							colorName = 'white';
						else
							colorName = 'grey';
					}
				}), function (tx, error)
				{
					alert ('er is een fout opgetreden\r\n' + error.message);
				}, function ()
				{
				};

				setVisibility ('addCover', true);
				setVisibility ('addMedicin', true);
			}
		}), function (tx, error)
		{
			alert ('er is een fout opgetreden\r\n' + error.message);
		}, function ()
		{
		};
	});
}