function setNextNotification ()
{

	cordova.plugins.notification.local.schedule(
	{
		title: 'Wellicht iets innemen?',
		text: 'Nou ja, zie ook maar!',
		trigger: { in: 1, unit: 'minute' }
	});
	/*
	if (window.Notification)
	{
		var granted = loadSetting ('notify');
		if (!granted || granted != 'granted')
		{
			Notification.requestPermission(function (permission)
			{
				saveSetting ('notify',  permission);
				// If the user accepts, let’s create a notification
				if (permission == 'granted')
				{
					var notify = new Notification('Medin', {
						tag: 'Een Medin notificatie!!', 
						body: 'Medin heeft u iets heeeeel belangrijks te zeggen!!' 
					});
					notify.onshow  = function() { alert('show'); };
					notify.onclose = function() { alert('close'); };
					notify.onclick = function() { alert('click'); };
				}
			});
		}
		else
		{
			var notify = new Notification('Medin', {
				tag: 'Een Medin notificatie!!', 
				body: 'Medin heeft u iets heeeeel belangrijks te zeggen!!' 
			}); 
/*			notify.onshow  = function() { alert('show'); };
			notify.onclose = function() { alert('close'); };
			notify.onclick = function() { alert('click'); };
		}
	} */
}
