function getPincode ()
{

	buildPincodeScreen ();
}

function buildPincodeScreen ()
{
	var div = document.getElementById ('pincode');
	div.setAttribute ('data-position', 0);
	div.setAttribute ('data-pincode', '');
	var width = div.offsetWidth;

	var tekst = document.getElementById ('pinTekst');
	setVisibility ('menubutton', false)
	var requestedPincode = loadSetting ('pincode');
	if (!requestedPincode || requestedPincode == '')
		tekst.innerHTML = 'Om gebruik te maken van Medin dient u een 5-cijferige pincode te installeren';
	else
		tekst.innerHTML = 'Welkom bij Medin. Voer alstublieft uw 5-cijferige pincode in';
	width = div.offsetWidth;
	width /= 3;
	width = parseInt (width);
	var height = parseInt (width/2);
	var left = 0;
	left += width;
	left += width;
	var bottom = 0;
	for (var i = 12; i > 0; i--)
	{
		var key = document.createElement ('div');
		key.style.left = left + 'px';
		key.style.bottom = bottom + 'px';
		key.style.width = width + 'px';
		key.style.height = height + 'px';
		key.style.lineHeight = height + 'px';
		key.className = 'pinKeyboard';
		if (i == 12)
			key.id = 'number-1';
		else
			key.id='number' + i;
		left -= width;
		if (left < 0)
		{
			left = 0;
			left += width;
			left += width;
			bottom += height;
		}
		/*
		if (i != 10)
		{
			key.onmouseover = function ()
			{
				this.style.backgroundColor = '#afafaf';
			};
			key.onmouseout = function ()
			{
				this.style.backgroundColor = '#273e46';
			};
		}
		*/
		if (i == 12)
		{
			var back = height;
			back /= 2;
			back = parseInt (back);
			key.style.background = '#273e46 url(\'img/backspace.png\') center no-repeat';
			key.style.backgroundSize = back + 'px';
			key.onclick = function () { keyPressed (-1); };
		}
		else if (i == 11)
		{
			key.innerHTML = '0';
			key.onclick = function () { keyPressed (0); };
		}
		else if (i != 10)
		{
			key.innerHTML = i;
			if (i == 1)
				key.onclick = function () { keyPressed (1); };
			if (i == 2)
				key.onclick = function () { keyPressed (2); };
			if (i == 3)
				key.onclick = function () { keyPressed (3); };
			if (i == 4)
				key.onclick = function () { keyPressed (4); };
			if (i == 5)
				key.onclick = function () { keyPressed (5); };
			if (i == 6)
				key.onclick = function () { keyPressed (6); };
			if (i == 7)
				key.onclick = function () { keyPressed (7); };
			if (i == 8)
				key.onclick = function () { keyPressed (8); };
			if (i == 9)
				key.onclick = function () { keyPressed (9); };
		}
		div.appendChild (key);
	}

	entry = document.getElementById ('pinEntry');
	entry.style.bottom = bottom + 'px';

	left = div.offsetWidth;
	left -= 250;
	left /= 2;
	left = parseInt (left);

	for (var i = 0; i < 5; i++)
	{
		var square = document.createElement ('div');
		square.style.cssText = 'position:absolute;top:0px;width:50px; height:50px;';
		square.style.left = left + 'px';
		square.style.background = 'url(\'img/pincode1.png\') center no-repeat';
		square.style.backgroundSize = '30px';
		square.id = 'square' + i;
		entry.appendChild (square);
		left += 50;
	}
}

/*
function buildPincodeScreen ()
{
	var div = document.getElementById ('pincode');
	div.setAttribute ('data-position', 0);
	div.setAttribute ('data-pincode', '');
	var width = div.offsetWidth;
	var back = 'pincode03.png';
	var left = 10;
	width -= 20;
	width /= 5;
	width = parseInt (width);
	setVisibility ('menubutton', false)
	var requestedPincode = loadSetting ('pincode');
	for (var i = 0; i < 5; i++)
	{
		var square = document.createElement ('div');
		square.style.cssText = 'position:absolute;top:50px;left:' + left + 'px;width:'+ width + 'px; height:'+ width+ 'px;';
		square.style.background = 'url(\'img/' + back + '\') center no-repeat';
		square.style.backgroundSize = width + 'px';
		square.id = 'square' + i;
		div.appendChild (square);
		left += width;
		back = 'pincode01.png';
	}
	
	var tekst = document.getElementById ('pinTekst');
	var vtop = 70;
	vtop += width;
	tekst.style.top = vtop + 'px';

	if (!requestedPincode || requestedPincode == '')
		tekst.innerHTML = 'Om gebruik te maken van Medin dient u een 5-cijferige pincode te installeren';
	else
		tekst.innerHTML = 'Voer eerst uw 5-cijferige pincode in<br />Medlex kan uw pincode niet reproduceren. Als u uw pincode bent vergeten, kan u de app opnieuw installeren.';
	width = div.offsetWidth;
	width /= 3;
	width = parseInt (width);
	var height = width;
	height *= 2;
	height /= 3.5;
	height = parseInt (height);
	left = 0;
	left += width;
	left += width;
	var bottom = 0;
	for (var i = 12; i > 0; i--)
	{
		var key = document.createElement ('div');
		key.style.left = left + 'px';
		key.style.bottom = bottom + 'px';
		key.style.width = width + 'px';
		key.style.height = height + 'px';
		key.style.lineHeight = height + 'px';
		key.className = 'pinKeyboard';
		if (i < 4)
			key.style.borderTop = 'solid 4px #c7e0ff';
		if (i == 12)
			key.id = 'number-1';
		else
			key.id='number' + i;
		left -= width;
		if (left < 0)
		{
			left = 0;
			left += width;
			left += width;
			bottom += height;
		}
		if (i != 10)
		{
			key.onmouseover = function ()
			{
				this.style.backgroundColor = '#afafaf';
			};
			key.onmouseout = function ()
			{
				this.style.backgroundColor = '#efefef';
			};
		}
		if (i == 12)
		{
			var back = height;
			back /= 2;
			back = parseInt (back);
			key.style.background = '#efefef url(\'img/backspace512.png\') center no-repeat';
			key.style.backgroundSize = back + 'px';
			key.onclick = function () { keyPressed (-1); };
		}
		else if (i == 11)
		{
			key.innerHTML = '0';
			key.onclick = function () { keyPressed (0); };
		}
		else if (i != 10)
		{
			key.innerHTML = i;
			if (i == 1)
				key.onclick = function () { keyPressed (1); };
			if (i == 2)
				key.onclick = function () { keyPressed (2); };
			if (i == 3)
				key.onclick = function () { keyPressed (3); };
			if (i == 4)
				key.onclick = function () { keyPressed (4); };
			if (i == 5)
				key.onclick = function () { keyPressed (5); };
			if (i == 6)
				key.onclick = function () { keyPressed (6); };
			if (i == 7)
				key.onclick = function () { keyPressed (7); };
			if (i == 8)
				key.onclick = function () { keyPressed (8); };
			if (i == 9)
				key.onclick = function () { keyPressed (9); };
		}
		div.appendChild (key);
	}
}
*/
function keyPressed (key)
{
	key = parseInt (key);
	/*
	var field = document.getElementById ('number' + key);
	field.style.backgroundColor = '#efefef';
	*/
	var div = document.getElementById ('pincode');
	var position = div.getAttribute ('data-position');
	var pincode = div.getAttribute ('data-pincode');
	position = parseInt (position);
	var square = document.getElementById ('square' + position);

	if (key == -1)
	{
		if (position > 0)
		{
			position -= 1;
			square.style.background = 'url(\'img/pincode1.png\') center no-repeat';
			square.style.backgroundSize = '30px';
			square = document.getElementById ('square' + position);
			square.style.background = 'url(\'img/pincode1.png\') center no-repeat';
			square.style.backgroundSize = '30px';
			pincode = pincode.slice(0, -1);
			div.setAttribute ('data-position', position);
			div.setAttribute ('data-pincode', pincode);
		}
	}
	else
	{
		square.style.background = 'url(\'img/pincode2.png\') center no-repeat';
		square.style.backgroundSize = '30px';
		pincode += key;
		div.setAttribute ('pincode', pincode);

		if (position < 4)
		{
			position += 1;
			div.setAttribute ('data-position', position);
			div.setAttribute ('data-pincode', pincode);
		}
		else
		{
			processPincode ();
		}
	}
}

function processPincode ()
{

	var div = document.getElementById ('pincode');
	var entered = div.getAttribute ('data-pincode');
	var requestedPincode = loadSetting ('pincode');
	if (!requestedPincode || requestedPincode == '')							// OK, we zijn nu dus een nieuwe pincode aan het invoeren
	{
		var first = div.getAttribute ('data-first');
		if (!first || first == '')												// OK, we hebben een eerste keer ingevoerd
		{
			var tekst = document.getElementById ('pinTekst');
			tekst.innerHTML = 'Voer nu ter controle uw pincode nogmaals in';
			div.setAttribute ('data-first', entered);
			clearPinFields ();
		}
		else if (first != entered)												// Tweede keer ongelijk aan eerste
		{
			var tekst = document.getElementById ('pinTekst');
			tekst.innerHTML = 'De tweede invoer was niet gelijk aan de eerste. Voer nogmaals uw pincode tweemal in.';
			div.setAttribute ('data-first', '');
			clearPinFields ();
		}
		else
		{
			saveSetting ('pincode', entered);
			pinClear ();
		}
	}
	else if (requestedPincode != entered)
	{
		var tekst = document.getElementById ('pinTekst');
		var back = 'pincode03.png';
		tekst.innerHTML = 'Onjuiste pincode ingevoerd.';
		clearPinFields ();
	}
	else
		pinClear ();
}

function pinClear ()
{
	var div = document.getElementById ('pincode');

	div.style.opacity = '0';
	div.style.mozOpacity = '0';
	setVisibility ('menubutton', true)
	setTimeout(function() { div.style.display = 'none'; }, 500);
}

function newPincode ()
{
	clearPinFields ();
	var div = document.getElementById ('pincode');
	div.style.display = 'block';

	div.style.opacity = '1';
	div.style.mozOpacity = '1';
	setVisibility ('menubutton', false)
}

function clearPinFields ()
{
	var div = document.getElementById ('pincode');
	div.setAttribute ('data-pincode', '');
	div.setAttribute ('data-position', 0);
	
	for (var i = 0; i < 5; i++)
	{
		var square = document.getElementById ('square' + i);
		square.style.background = 'url(\'img/pincode1.png\') center no-repeat';
		square.style.backgroundSize = '30px';
	}
}
