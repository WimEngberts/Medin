var g_notiInnames;
var g_notiPersons;

// -------------------------------------------------------------------------------------------------
// We gaan de popups voor de medicijnwekker instellen.
//
function setNextNotifications ()
{

	if (typeof cordova != 'undefined' && !cordova)	// Aha, we draaien op een mobiel!
	{
		cordova.plugins.notification.local.cancelAll(function()
		{
		}, this);
	}
	db.transaction(function(tx)
	{
		tx.executeSql('SELECT * FROM person', [], function (tx, results)
		{
			g_notiPersons = results.rows;									// De geregistreerde personen
			tx.executeSql('SELECT * FROM innames', [], function (tx, results)			// Halen we eerst alle geregistreerde innames op
			{
				g_notiInnames = results.rows;
				var any = false;														// Want als er niets is geregistreerd, dan gaan we ook nog niets registreren!
				for (var i = 0; i < g_notiInnames.length; i++)								// Ga ze dan even langs
				{
					var inname = g_notiInnames.item (i);
					for (var j = 0; j < g_notiPersons.length; j++)
					{
						var person = g_notiPersons.item (j);
						if (   person['id'] == inname['personID']					// inname voor deze persoon
							&& person['warnCalender'] == 1)								// en die gebruikt de kalender
							any = true;
					}
				}
				if (any)																// Er is tenminste één inname voor iemand die ook de kalender gebruikt
				{
					if (typeof cordova != 'undefined' && !cordova)	// Aha, we draaien op een mobiel!
					{
						cordova.plugins.notification.local.hasPermission(function (granted)	// Mogen we wel notifications doen?
						{
							if (granted == false)											// (nog) niet
							{

								// If app doesnt have permission request it
								cordova.plugins.notification.local.registerPermission(function (granted)
								{
									if (granted == true)
									{
										// If app is given permission try again
										setNotifications();

									}
									else
									{
										myAlert ('Medin heeft toestemming nodig om uw medicijnwekker te kunnen activeren');
									}

								});
							}
							else
								setNotifications ();
						});
					}
					else											// Een gewone browser op een PC
						setNotifications ();						// Alleen ter test dus
				}
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
	});
}

//-------------------------------------------------------------------------------------------------------------------
// Er zijn geregistreerde gebruikers die de kalender gebruiken en we hebben daar toestemming voor
// Nu kunnen we dus de notifications gaan zetten
//
function setNotifications ()
{

	db.transaction(function(tx)
	{
		tx.executeSql('SELECT * FROM tijden ORDER BY personID', [], function (tx, results)
		{
			var count = 0;
			var now = new Date ();
			var notifs = [];
			for (var t = 0; t < results.rows.length; t++)				// OK, we gaan nu alle tijdstippen langs
			{
				var yep = false;
				var naam = '';
				var tijd = results.rows.item (t);						// Deze bijvoorbeeld
				for (var i = 0; i < g_notiPersons.length; i++)			// van wie is deze?
				{
					var person = g_notiPersons.item(i);
					if (   person['id'] == tijd['personID']				// Aha, mevrouw Jansen
					    && person['warnCalender'] == 1)					// en die wil een kalender
					{
						naam = person['naam'];							// Dan hebben we nu een naam nodig
						yep = true;										// En we gaan hier mee verder
					}
				}
				if (yep)
				{
					var medicijn = '';
					var stip = tijd['tijdStip'].split (':');			// Welke tijd is dit?
					var hour = parseInt (stip[0]);
					var minute = parseInt (stip[1]);

					for (var i = 0; i < g_notiInnames.length; i++)			// En welke medicijnen gaan we dan innemen?
					{
						var inname = g_notiInnames.item (i);
						if (inname['tijdID'] == tijd['tijdID'])			// OK, deze dus
						{
							if (medicijn != '')
								medicijn += '\n';
							medicijn += inname['naam'];
						}
					}
					if (medicijn != '')									// Is er iets geregistreerd op dit tijdstip?
					{
						notifs[count] =
						{
							id: tijd['tijdID'],
							title: naam + ', tijd voor uw medicijn',
							text: medicijn,
							sound:true,
							foreground: true,
//							smallIcon: 'res://img/smallicon',
							trigger: { every: { hour: hour, minute: minute } }
//							trigger: { at: new Date (now.getFullYear (), now.getMonth (), now.getDate (), hour, minute) }
						};
						count += 1;
					}
				}
			}
			if (count > 0)
			{
				if (typeof cordova != 'undefined' && !cordova)				// Aha, we draaien op een mobiel!
					cordova.plugins.notification.local.schedule(notifs);	// OK, voeg dan een notification toe
				else
				{
					document.getElementById ('debugWindow').innerHTML = '';
					log ('setting ' + count + ' notifications:');
					for (var i = 0; i < count; i++)
						log (JSON.stringify(notifs[i], null, 4));
					setVisibility ('debug', true);
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
