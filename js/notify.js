function setNextNotification ()
{
	if (window.Notification)
	{
		var notify = loadSetting ('notify');
		if (!notify || notify != 'granted')
		{
			Notification.requestPermission(function (permission)
			{
				saveSetting ('notify',  permission);
				// If the user accepts, let’s create a notification
				if (permission == 'granted')
				{
					var notification = new Notification('Medin', {
						tag: 'Een Medin notificatie!!', 
						body: 'Medin heeft u iets heeeeel belangrijks te zeggen!!' 
					}); 
//					notification.onshow  = function() { alert('show'); };
					notification.onclose = function() { alert('close'); };
					notification.onclick = function() { alert('click'); };
				}
			});
		}
		else
		{
			var notification = new Notification('Medin', {
				tag: 'Een Medin notificatie!!', 
				body: 'Medin heeft u iets heeeeel belangrijks te zeggen!!' 
			}); 
			notification.onshow  = function() { alert('show'); };
			notification.onclose = function() { alert('close'); };
			notification.onclick = function() { alert('click'); };
		}
	}
}
