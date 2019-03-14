/*

function setNextNotification ()
{

	cordova.plugins.notification.local.schedule(
	{
		id: 1,
		title: 'Wellicht iets innemen?',
		text: 'Nou ja, zie ook maar!',
		foreground: true,
		trigger: { in: 1, unit: 'minute' }
	});
}
*/
function setNextNotification ()
{

	showMenu (0);
	alert ('testing notifications');
	cordova.plugins.notification.local.hasPermission(function (granted)
	{
		alert ('checked for permission');
		if (granted == false)
		{

			alert ("No permission yet");
			// If app doesnt have permission request it
			cordova.plugins.notification.local.registerPermission(function (granted)
			{
				if (granted == true)
				{
					alert ("Permission accepted");
					// If app is given permission try again
					testNotifications();

				}
				else
				{
					alert ("We need permission to show you notifications");
				}

			});
		}
		else
			testNotifications ();
	});
}

function testNotifications ()
{

	alert ('we have permission!');
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
