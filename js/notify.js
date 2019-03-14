var g_Innames;

function setNextNotifications ()
{

	showMenu (0);
	cordova.plugins.notification.local.hasPermission(function (granted)
	{
		if (granted == false)
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

function setNotifications ()
{

	db.transaction(function(tx)
	{
		tx.executeSql('SELECT * FROM innames', [], function (tx, results)
		{
			var g_Innames = results.rows;
			tx.executeSql('SELECT * FROM tijden', [], function (tx, results)
			{
				var now = new Date();
				for (var t = 0; t < results.rows.length; t++)
				{
					var tijd = results.rows.item (t);
					var medicijn = '';
					var stip = tijd['tijdStip'].split (':');
					var hour = parseInt (stip[0]);
					var minute = parseInt (stip[1]);

					for (var i = 0; i < g_Innames.length; i++)
					{
						var inname = g_Innames.item (i);
						if (inname['tijdID'] == tijd['tijdID'])
						{
							if (   hour > now.getHours ()
								|| (   hour   == now.getHours ()
									&& minute >= now.getMinutes ()))
							{
								if (medicijn != '')
									medicijn += '\n';
								medicijn += inname['naam'];
							}
						}
					}
					if (medicijn != '')
					{
						cordova.plugins.notification.local.schedule(
						{
							id: stip['tijdID'],
							title: "Tijd voor uw medicijn",
							text: medicijn,
							sound:true,
							foreground: true,
							trigger: { at: new Date (now.getFullYear (), now.getMonth (), now.getDate (), hour, minute) },
							actions: [ { id: 'actionclick', launch: true, title: 'Click me' } ]
						});
					}
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

	cordova.plugins.notification.local.schedule({
		id: 9,
		title: "Zou je niet eens iets gaan innemen?",
		text: "Nou ja, zie eigenlijk ook maar!",
		sound:true,
		foreground: true,
		trigger: { in: 5, unit: 'second' },
		actions: [ { id: 'actionclick', launch: true, title: 'Click me' } ]
	});
}
