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
		// Stap 1: Haal cde persoon op voor wie we dit allemaal gaan doen. Dat is dus de geselecteerde persoon
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

						medicatie['distributed'] = 0;
						var nhg25 = nhg25 (medicatie['nhg25']);
						medicatie['nhgExpanded'] = nhg25;
						var hVan = parseInt (nhg25.hCodeVan);
						var hTot = parseInt (nhg25.hCodeTot);
						var n = 0;
						for (var i=0; i < results.rows.length; i++)
						{
							var row = results.rows.item(i);
							if (medicatie['prk'] == row['prk'])				// OK, die hebben we
								n++;										// is dus één keer meer opgevoerd in de kalender
						}
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
							else if (n >= hVan)								// Nee joh, we hebben er genoeg!
							         && n <= hTot)							// En ook niet meer dan het maximum
								medicatie['distributed'] = 0;
							else											// En anders zijn we hier een beetje aan het overdoseren!
								medicatie['distributed'] = 1;
						}
						if (medicatie['distributed'] != 0)					// Niet helemaal goed dus nog
							g_ThingsToDo = true;							// Dan moet er dus nog iets gebeuren!
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
