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
	cordova.plugin.notification.local.hasPermission(function (granted)
	{
		if (granted == false)
		{

			console.warn("No permission");
			// If app doesnt have permission request it
			cordova.plugin.notification.local.registerPermission(function (granted)
			{
				console.warn("Ask for permission");
				if (granted == true)
				{
					console.warn("Permission accepted");
					// If app is given permission try again
					testNotifications();

				}
				else
				{
					alert("We need permission to show you notifications");
				}

			});
		}
		else
			testNotifications ();
	});
}

function testNotifications ()
{
	var now = new Date();

	console.warn("sending notification");

/*	var isAndroid = false;

	if (device.platform === "Android")
		isAndroid = true; */

	cordova.plugin.notification.local.schedule({
		id: 9,
		title: "Zou je niet eens iets gaan innemen?",
		text: "Nou ja, zie eigenlijk ook maar!",
		at: new Date (new Date ().getTime() + 10)
	});
}
