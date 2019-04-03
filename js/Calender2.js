var g_Medicatie = null;
var g_Person;
var g_ThingsToDo = false;
var g_Innames;

function deleteFromCalender (person, tijd, prk)
{
	db.transaction(function(tx)
	{
		tx.executeSql('DELETE FROM innames WHERE personID = ' + person + ' AND tijdID = ' + tijd + ' AND prk=\"' + prk + '\"', [], function (tx, results)
		{
		}), function (tx, error)
		{
			alert ('er is een fout opgetreden\r\n' + error.message);
		}, function ()
		{
		};
	});
}

function refreshDistribution ()
{
	closeAll ('lijssie');
	showList ();
	fillCalender ();
	setPopups ();
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
							szHTML += showPeriode (tijd['periodiciteit']);
							szHTML += '<br /><b>';
							szHTML += tijd['tijdStip'];
							szHTML += ', ';
							szHTML += tijd['tijdNaam'];
							szHTML += '</b><div id=\"time' + n + '\" class=\"';
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
						if (results.rows.length == 0)					// Er zijn nog helemaal geen tijden
						{
							szHTML	+= '<div class=\"addRow white\">Er zijn nog geen tijdstippen opgegeven waarop u een medicijn kan innemen.<br />'
									+  'Kies alstublieft één van onderstaande knoppen om ofwel een set van drie tijdstippen (\"Ontbijt/Lunch/Diner\") in één keer aan te maken '
									+  'ofwel individuele tijdstippen handmatig aan te maken.<br />'
									+  'U kunt later de namen, tijden en de dagen van de diverse tijdstippen altijd wijzigen.<br /></div>';
							szHTML += '<div class="addTime" onclick="addStandardTimes (' + g_Person + "," + g_Medicatie['lijst'] + ',' + g_Medicatie['regel'] + ',\'toevoegen\');">Stel "Ontbijt/Lunch/Diner" in</div>';
							szHTML += '<div class="addTime" onclick="addNewTime (' + g_Person + ');">Voeg een enkel tijdstip toe</div>';
						}
						else
							szHTML += '<div class="addTime" onclick="addNewTime (' + g_Person + ');">Voeg een extra tijdstip toe</div>';

						var div = createList ('toevoegen', title, szHTML, closeAddAlarm, cancelAlarm, false);
						div.setAttribute ('data-user' , g_Person);
						div.setAttribute ('data-prk' ,  g_Medicatie['prk']);
						div.setAttribute ('data-naam' , g_Medicatie['dispensedMedicationName'].replace (/\'/g, "''"));
						div.setAttribute ('data-start', g_Medicatie['startGebruik']);
						div.setAttribute ('data-stop' , g_Medicatie['eindGebruik']);
						div.setAttribute ('data-nhg'  , g_Medicatie['nhg25']);
						div.setAttribute ('data-list' , g_Medicatie['lijst']);
						div.setAttribute ('data-regel', g_Medicatie['regel']);
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

function addNewTime (personID)
{
	var iedere = document.getElementsByName ('iedere');
	var div = document.getElementById ('toevoegen');
	var listID = div.getAttribute ('data-list');
	var regel  = div.getAttribute ('data-regel');
	onCloseList ('toevoegen', null);
	for (var i = 0; i < iedere.length; i++)
		iedere[i].checked = true;
	var stip = document.getElementById ('tijdStip');
	stip.setAttribute ('data-person', personID);
	stip.setAttribute ('data-stip', '');
	stip.setAttribute ('data-fromlist', 1);
	stip.setAttribute ('data-listID', listID);
	stip.setAttribute ('data-regel', regel);
	document.getElementById ('stipNaam').value = '';
	document.getElementById ('stipTijd').value = '';
	setVisibility ('stipDelete', false);
	openTijdstip (true);
}

function addStandardTimes (personID, listID, regel, name)
{
	db.transaction(function(tx)
	{
		var sqlStatement = 'INSERT INTO tijden (personID, tijdNaam, periodiciteit, tijdStip) VALUES (' + personID + ', \'Ontbijt\', \'1111111\', \'08:30\')';
		tx.executeSql(sqlStatement);
		sqlStatement = 'INSERT INTO tijden (personID, tijdNaam, periodiciteit, tijdStip) VALUES (' + personID + ', \'Lunch\', \'1111111\', \'12:30\')';
		tx.executeSql(sqlStatement);
		sqlStatement = 'INSERT INTO tijden (personID, tijdNaam, periodiciteit, tijdStip) VALUES (' + personID + ', \'Diner\', \'1111111\', \'18:30\')';
		tx.executeSql(sqlStatement);
	});

	closeAll (name);
	fillCalender ();
	setPopups ();
	addToCalender (listID, regel);
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
		var naam     = div.getAttribute ('data-naam');
		var prk      = div.getAttribute ('data-prk');
		var start    = div.getAttribute ('data-start');
		var stop     = div.getAttribute ('data-stop');
		var nhg25    = div.getAttribute ('data-nhg');
		var sqlStatement = '';

		var tijden = document.getElementsByClassName ('timeline');
		for (var i = 0; i < tijden.length; i++)
		{
			var tijd = tijden[i];
			var id = tijd.getAttribute ('data-tijd');

			if (tijd.className == 'timeSelected timeline')
				sqlStatement = 'INSERT OR IGNORE INTO innames (personID,tijdID,prk,naam,eigen,nDosis,dosis,startGebruik,eindGebruik,nhg25) '
			                 + 'VALUES(' + personID + ',' + id + ',\'' + prk + '\',\'' + naam + '\',0,1,\'1\',\'' + start + '\', \'' + stop + '\', \'' + nhg25 + '\')';
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
		refreshDistribution ();
	});
}

function cancelAlarm ()
{
}

function deletePassedInnames ()
{
	db.transaction(function(tx)
	{
		tx.executeSql('SELECT * FROM innames', [], function (tx, results)
		{
			var now = new Date ();
			var bDeleted = false;										// Ga er even vanuit dat we niets verwijderen
			for (var i = 0; i < results.rows.length; i++)				// OK, we gaan nu alle innames langs
			{
				var inname = results.rows.item(i);
				var stop  = new Date (inname['eindGebruik']);			// Stopdatum
				if (now.getTime () > stop.getTime ())					// Oeps, deze is al voorbij datum einde gebruik
				{
					bDeleted = true;									// Er was dus wel degelijk iets te verwijderen!
					deleteFromCalender (inname['personID'], inname['tijdID'], inname['prk']);
				}
			}
		}), function (tx, error)
		{
			alert ('er is een fout opgetreden\r\n' + error.message);
		}, function ()
		{
		};
	});
}
