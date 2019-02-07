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
	var back = 'pincode03.png';
	var left = 10;
	width -= 20;
	width /= 5;
	width = parseInt (width);
	for (var i = 0; i < 5; i++)
	{
		var square = document.createElement ('div');
		square.style.cssText = 'position:absolute;top:100px;left:' + left + 'px;width:'+ width + 'px; height:'+ width+ 'px;';
		square.style.background = 'url(\'img/' + back + '\') center no-repeat';
		square.style.backgroundSize = width + 'px';
		square.id = 'square' + i;
		div.appendChild (square);
		left += width;
		back = 'pincode01.png';
	}
	width = div.offsetWidth;
	width /= 3;
	width = parseInt (width);
	var height = width;
	height *= 2;
	height /= 3;
	height = parseInt (height);
	left = 0;
	left += width;
	left += width;
	var bottom = 0;
	for (var i = 12; i > 0; i--)
	{
		var key = document.createElement ('div');
		key.style.cssText = 'position:absolute;left:'+ left + 'px;bottom:'+ bottom + 'px;width:' + width + 'px;height:' + height + 'px;line-height:' + height + 'px;background-color:#efefef;'
						  + 'font-family:calibri, arial, helvetica, sans-serif;font-size:xx-large;font-weight:bold;vertical-align:center;text-align:center;display:block;color:#000000;'
						  + 'border:solid 1px #a0a0a0;';
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

function keyPressed (key)
{
	key = parseInt (key);
	var div = document.getElementById ('pincode');
	var position = div.getAttribute ('data-position');
	var pincode = div.getAttribute ('data-pincode');
	position = parseInt (position);
	var square = document.getElementById ('square' + position);
	var width = square.offsetWidth;

	if (key == -1)
	{
		if (position > 0)
		{
			position -= 1;
			square.style.background = 'url(\'img/pincode01.png\') center no-repeat';
			square.style.backgroundSize = width + 'px';
			square = document.getElementById ('square' + position);
			square.style.background = 'url(\'img/pincode03.png\') center no-repeat';
			square.style.backgroundSize = width + 'px';
			pincode = pincode.slice(0, -1);
			div.setAttribute ('data-position', position);
			div.setAttribute ('data-pincode', pincode);
		}
	}
	else
	{
		square.style.background = 'url(\'img/pincode02.png\') center no-repeat';
		square.style.backgroundSize = width + 'px';
		pincode += key;
		div.setAttribute ('pincode', pincode);

		if (position < 4)
		{
			position += 1;
			square = document.getElementById ('square' + position);
			square.style.background = 'url(\'img/pincode03.png\') center no-repeat';
			square.style.backgroundSize = width + 'px';
			div.setAttribute ('data-position', position);
			div.setAttribute ('data-pincode', pincode);
		}
		else
		{
			div.style.opacity = '0';
			div.style.mozOpacity = '0';
			setTimeout(function() { div.style.display = 'none'; }, 500);
		}
	}
}
