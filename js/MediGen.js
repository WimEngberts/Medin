//--------------------------------------------------------------------
// (c) 2017, MedLex
//
var g_bDeviceIsReady	= false;
var db					= null;
var xmlDoc				= null;
var scanner;
var enterHandlers		= [];
var enterHandlerIndex	= -1;
var backHandlers		= [];
var backHandlerIndex	= -1;
var g_bWarnAboutList	= false;

//---------------------------------------------------------------
// Cordova is ready
//
function onDeviceReady()
{
	g_bDeviceIsReady = true;

//	alert ('The device is ready');

	db = window.openDatabase("Medin.db", "1.0", "Medin", 200000);
	if (db)
	{
		initTables (db);
		cleanMedication ();
		showList (db);
		fillCalender ();
		if (g_bWarnAboutList)
			checkListInCalender ();
	}
	else
		alert ('no database available!');
	setFontSizes ();
	getPincode ();
	setPlus ();
}

function onDeviceReady2()
{
	g_bDeviceIsReady = true;

/*	alert ('The device is ready'); */
//	setNextNotifications ();
	alert (JSON.stringify(cordova.plugins.notification.local.launchDetails, null, 4));
}

function addEnterListener (listenFunction)
{
	if (enterHandlerIndex > -1)
		removeEventListener ('keypress', enterHandlers[enterHandlerIndex]);
	addEventListener ('keypress', listenFunction);
	enterHandlerIndex += 1;
	enterHandlers[enterHandlerIndex] = listenFunction;
}

function removeEnterListener ()
{
	if (enterHandlerIndex > -1)
	{
		removeEventListener ('keypress', enterHandlers[enterHandlerIndex]);
		enterHandlerIndex -= 1;
		if (enterHandlerIndex > -1)
			addEventListener ('keypress', enterHandlers[enterHandlerIndex]);
	}
}

function addBackListener (listenFunction)
{
	if (backHandlerIndex > -1)
		removeEventListener ('backbutton', backHandlers[backHandlerIndex]);
	addEventListener ('backbutton', listenFunction, false);
	backHandlerIndex += 1;
	backHandlers[backHandlerIndex] = listenFunction;
}

function removeBackListener ()
{
	if (backHandlerIndex > -1)
	{
		removeEventListener ('backbutton', backHandlers[backHandlerIndex]);
		backHandlerIndex -= 1;
		if (backHandlerIndex > -1)
			addEventListener ('backbutton', backHandlers[backHandlerIndex]);
	}
}

//--------------------------------------------------------------
// Wait for Cordova to load
//
function init()
{
	var setting;
	
	g_bDeviceIsReady = false;

	setting = loadSetting ('monthsSave');						// Hoe lang bewaren we oude lijsten?
	if (!setting)												// Niet opgegeven?
		setting = 3;											// default is 3 maanden
	document.getElementById ('termijn').value = setting;

	setting = loadSetting ('largeFont');						// grote letters gekozen?
	var bSetting = true;
	if (setting == 'false')
		bSetting = false;
	setFont (bSetting);

	setting = loadSetting ('warnAboutList');
	bSetting = true;
	if (setting == 'false')
		bSetting = false;
	g_bwarnAboutList = bSetting;

	setting = loadSetting ('screen');							// Welk scherm staat voor?
	var nScreen = 0;
	if (setting)
	{
		if (setting == 'lijst')
			nScreen = 1;
	}
	setMain (nScreen);

	onDeviceReady ();
//	alert ('now waiting for deviceready');
	document.addEventListener ("deviceready", onDeviceReady2, false);
}

function isDeviceReady ()
{
	return g_bDeviceIsReady;
}

//------------------------------------------------------------------------------------------------------
// Bedek alle onderliggende zaken met een semi-transparante waas
// Deze krijgt standaard als id '__brCover' plus de opgegeven naam. Die wordt later weggegooid bij de OK knop.
//
function Cover (szName, bRespond)
{

	elemCover = document.createElement ('div');

	elemCover.style.cssText = 'position:absolute;left:0px;right:0px;top:0px;bottom:0px;opacity:0.2;background:#000;';
	elemCover.id = '__brCover'+szName;
	elemCover.style.transition = 'opacity 0.5s ease';
	elemCover.style.webkitTransition = 'opacity 0.5s ease';
	if (bRespond)
		elemCover.onclick = 'closemenu();';
	document.body.appendChild (elemCover);
}

//------------------------------------------------------------------------------------------------------
// Geef een alert
//
function myAlert (szText, szHeader)
{

    var elemWrapper;
    var elemDiv;
	var fontSize = 'small';

	if (isLargeFont ())
		fontSize = 'medium';

	Cover ('__myAlert', false);    						// onderliggende tekst even bedekken
	elemWrapper = document.createElement ('div');		// wrapper voor alles
	elemWrapper.id = '__myAlert';						// met deze ID. Kunnen we hem straks bij de OK knop terugvinden om weg te gooien
	elemWrapper.style.cssText = 'position:absolute;width:80%;top:50%;left:50%;height:auto;background-color:#ffffff;padding:0;opacity:0;-moz-opacity:0;-khtml-opacity:0;overlow:hidden;';
	elemWrapper.style.overflow = 'hidden';
	elemWrapper.style.transition = 'opacity 0.5s ease';
	elemWrapper.style.webkitTransition = 'opacity 0.5s ease';

	//------------------------------------------------------------------------------------------------
	// De header
	//
    elemDiv = document.createElement ('div');
    elemDiv.style.cssText = 'position:relative;width:100%;height:auto;padding-top:10px;padding-bottom:10px;border-bottom:solid 1px #afafaf;font-family:calibri, helvetica, sans-serif;'
                          + 'font-size:large;text-align:left;color:#000000;background-color:#c7e0ff;padding-left:15px;';
	if (szHeader)
		elemDiv.innerHTML = '<b>' + szHeader + '</b>';
	else
		elemDiv.innerHTML = '<b>Let op!</b>';
	elemWrapper.appendChild (elemDiv);

	//------------------------------------------------------------------------------------------------
	// De melding tekst
	//
	elemDiv = document.createElement ('div');
	elemDiv.id = '__brAlertText';
	elemDiv.style.cssText = 'position:relative;left:0px;right:0px;height:auto;padding-top:15px;padding-bottom:20px;font-family:calibri, helvetica, sans-serif;'
						  + 'text-align:left;color:#000000;background-color:#ffffff;padding-left:15px;padding-right:15px;';
	elemDiv.style.fontSize = fontSize;
	elemDiv.innerHTML = szText;
	elemWrapper.appendChild (elemDiv);

	// ------------------------------------------------------------------------------------------------------
	// de knoppenbalk
	//
	elemDiv = document.createElement ('div');
	elemDiv.style.cssText = 'position:relative;width:100%;height:auto;padding:20px 0 7px 0;background-color:#ffffff;display:inline-block;float:right;vertical-align:bottom;';
	elemWrapper.appendChild (elemDiv);

	// ------------------------------------------------------------------------------------------------------
	// De OK knop
	//
	var elemButton = document.createElement ('div');
	elemButton.style.cssText = 'float:right;height:auto;bottom:0px;padding-left:30px;padding-right:20px;font-family:calibri, helvetica, sans-serif;'
							 + 'font-size:medium;color:#0152a1;background-color:#ffffff;vertical-align:bottom;margin:0;';
	elemButton.onclick = function () { onClickOK ('__myAlert'); };
	elemButton.innerHTML = 'OK';
	elemDiv.appendChild (elemButton);

/*	//------------------------------------------------------------------------------------------------
	// De OK knop
	//
	elemDiv = document.createElement ('div');
	elemDiv.style.cssText = 'position:relative;width:100%;height:auto;padding-top:10px;padding-bottom:7px;padding-right:20px;font-family:calibri, helvetica, sans-serif;'
						  + 'font-size:medium;text-align:right;color:#0152a1;background-color:#ffffff;';
	elemDiv.onclick = function () { onClickOK ('__myAlert'); };
	elemDiv.innerHTML = 'OK';
	elemWrapper.appendChild (elemDiv); */

	elemWrapper.style.opacity = '1';
	elemWrapper.style.mozOpacity = '1';
	elemWrapper.style.khtmlOpacity = '1';

	document.body.appendChild (elemWrapper);
	var vWidth  = elemWrapper.offsetWidth;
	var vHeight = elemWrapper.offsetHeight;
	vWidth = parseInt (vWidth/2, 10);
	vHeight = parseInt (vHeight/2, 10);
	elemWrapper.style.marginLeft = '-' + vWidth + 'px';
	elemWrapper.style.marginTop = '-' + vHeight + 'px';
	addEnterListener (onEnterAlert);
	addBackListener (onAlertBack);

	setFontSizes ();
}

function onAlertBack (e)
{
	e.preventDefault ();
	alert ('backbutton pressed');
	removeEnterListener ();
	removeBackListener ();
	onClickOK ('__myAlert');

	return false;
}

function onEnterAlert (e)
{
	var key = e.which;
	if (key === 13)							// The enter key
	{
		e.cancelBubble = true;
		e.returnValue = false;
		onClickOK ('__myAlert');
		removeEnterListener ();
		return false;
	}
}

//------------------------------------------------------------------------------------------------------
// Toon de details van een enkele medicatieregel
//
function showPrescription (szHeader, szText)
{

    var elemWrapper;
    var elemDiv;
	var elemText;
	var szHTML;
	var fontSize = 'small';

//	if (document.getElementById ('largeFont').className == 'checked')
	if (isLargeFont ())
		fontSize = 'medium';

	Cover ('__myPrescription', false);					// onderliggende tekst even bedekken
	elemWrapper = document.createElement ('div');		// wrapper voor alles
	elemWrapper.id = '__myPrescription';				// met deze ID. Kunnen we hem straks bij de OK knop terugvinden om weg te gooien
	elemWrapper.style.cssText = 'position:absolute;width:92%;top:50%;left:50%;height:auto;background-color:#ffffff;padding:0;opacity:0;-moz-opacity:0;-khtml-opacity:0;overflow:hidden;border-radius: 20px;';
	elemWrapper.style.transition = 'opacity 0.5s ease';
	elemWrapper.style.webkitTransition = 'opacity 0.5s ease';
	elemDiv = document.createElement ('div');
	elemDiv.style.cssText = 'position:relative;width:100%;height:auto;padding-top:10px;padding-bottom:10px;border-bottom:solid 1px #afafaf;font-family:calibri, helvetica, sans-serif;'
						  + 'font-size:large;text-align:left;color:#000000;background-color:#c7e0ff;padding-left:15px;border-radius:20px 20px 0 0;border-bottom:solid 1px #a0a0a0;';
	elemDiv.innerHTML = '<b>' + szHeader + '</b>';
	elemWrapper.appendChild (elemDiv);
	elemText = document.createElement ('div');
	elemText.id = '__brAlertText';
	elemText.style.cssText = 'position:relative;left:0px;right:0px;height:auto;padding-top:15px;padding-bottom:20px;border-bottom:solid 1px #afafaf;font-family:calibri, helvetica, sans-serif;'
						  + 'text-align:left;color:#000000;background-color:#ffffff;padding-left:15px;padding-right:15px;';
	szHTML  = '<table>';
	szHTML += szText;
	szHTML += '</table>';
	elemText.innerHTML = szHTML;
	elemWrapper.appendChild (elemText);
	elemDiv = document.createElement ('div');
	elemDiv.style.cssText = 'position:relative;width:100%;height:auto;padding-top:10px;padding-bottom:10px;border-bottom:solid 1px #afafaf;font-family:calibri, helvetica, sans-serif;'
						  + 'font-size:medium;text-align:center;color:#000000;background-color:#ffffff;border-radius:0 0 20px 20px;';
	elemDiv.onclick = function () { onClickOK ('__myPrescription'); };
	elemDiv.innerHTML = '<b>OK</b>';
	elemDiv.onmouseover = function ()
	{
		this.style.backgroundColor = '#afafaf';
	};
	elemDiv.onmouseout = function ()
	{
		this.style.backgroundColor = '#ffffff';
	};
	elemWrapper.appendChild (elemDiv);

	elemWrapper.style.opacity = '1';
	elemWrapper.style.mozOpacity = '1';
	elemWrapper.style.khtmlOpacity = '1';

	document.body.appendChild (elemWrapper);

	var td = elemText.getElementsByTagName ('td');
	for (var i = 0; i < td.length; i++)
		td[i].style.fontSize = fontSize;

	var vWidth  = elemWrapper.offsetWidth;
	var vHeight = elemWrapper.offsetHeight;
	vWidth = parseInt (vWidth/2, 10);
	vHeight = parseInt (vHeight/2, 10);
	elemWrapper.style.marginLeft = '-' + vWidth + 'px';
	elemWrapper.style.marginTop = '-' + vHeight + 'px';
	addEnterListener (onEnterPrescription);
	addBackListener (onBackPrescription);
}

function onBackPrescription (e)
{
	e.preventDefault ();
	removeEnterListener ();
	removeBackListener ();
	onClickOK ('__myPrescription');
	return false;
}

function onEnterPrescription (e)
{
	var key = e.which;
	if (key === 13)							// The enter key
	{
		e.cancelBubble = true;
		e.returnValue = false;
		removeEnterListener ();
		onClickOK ('__myPrescription');
		return false;
	}
}

function onClickOK (szName)
{

	var elemCover = document.getElementById ('__brCover'+szName);
	var elemWrapper = document.getElementById (szName);

	if (elemWrapper)
	{
		elemWrapper.style.opacity = '0';
		elemWrapper.style.mozOpacity = '0';
		if (elemCover)
		{
			elemCover.style.opacity = '0';
			elemCover.style.mozOpacity = '0';
		}
		setTimeout(function() { closeAll (szName); }, 500);
	}
}

function onCloseList (szName, callback)
{

	var elemCover = document.getElementById ('__brCover'+szName);
	var elemWrapper = document.getElementById (szName);

	if (callback != null)
		callback (elemWrapper);
	if (elemWrapper)
	{
		elemWrapper.style.opacity = '0';
		elemWrapper.style.mozOpacity = '0';
		if (elemCover)
		{
			elemCover.style.opacity = '0';
			elemCover.style.mozOpacity = '0';
		}
		setTimeout(function() { closeAll (szName); }, 500);
	}
}

function closeAll (szName)
{
	var divCover	= document.getElementById ('__brCover'+szName);
	var divWrapper	= document.getElementById (szName);

	if (divWrapper)
		document.body.removeChild (divWrapper);
	if (divCover)
		document.body.removeChild (divCover);
}

//---------------------------------------------------------------------------
// Maak een div zichtbaar of onzichtbaar
//
function setVisibility(id, nVisible)
{
    var test;
    var e;
    
    e = document.getElementById(id);
    if (!e)
        alert ('id \'' + id + '\' not found!');
    test = e.style.display;
    if (nVisible == 2)
    {
        if(e.style.display == 'block')
           e.style.display = 'none';
        else
           e.style.display = 'block';
    }
    else if (nVisible == 0)
        e.style.display = 'none';
    else
        e.style.display = 'block';
}

//------------------------------------------------------------------------------
// Toggle een div tussen selected en unselected
//
function toggle (divID)
{
	var div = document.getElementById (divID);
	var r = false;

	if (div)
	{
		if (div.className == 'checked')
			div.className = 'unchecked';
		else
		{
			div.className = 'checked';
			r = true;
		}
	}
	
	return r;
}

//------------------------------------------------------------------------------
// Kijk of een div checked is
//
function isChecked (divID)
{
	var r = false;
	var div = document.getElementById (divID);
	
	if (div)
	{
		if (div.className == 'checked')
			r = true;
	}

	return r;
}

//-----------------------------------------------------------------------------------
// Sla een setting parameter op in de permanente storage
//
function saveSetting (szKey, szValue)
{
    if(typeof(Storage) !== "undefined")
    {
        localStorage.setItem (szKey, szValue);
    }
    else
        alert ('Sorry! No Web Storage support..');
}

//-----------------------------------------------------------------------------------
// Haal een setting parameter op uit de permanente storage
//
function loadSetting (szKey)
{
    var szResult = '';

    if(typeof(Storage) !== "undefined")
    {
        szResult = localStorage.getItem(szKey);
    }
    else
        alert ('Sorry! No Web Storage support..');
        
    return szResult;
}

//---------------------------------------------------------------------------
// Lees een xml document. Wordt synchroon geladen, omdat we zonder dit
// document toch niet kunnen beginnen.
//
function loadXMLDoc(filename)
{
    var xhttp = null;
    
    if (window.XMLHttpRequest)
    {
        xhttp=new XMLHttpRequest();
    }
    else // code for IE5 and IE6
    {
        xhttp=new ActiveXObject("Microsoft.XMLHTTP");
    }
    xhttp.open("GET",filename,false);
    xhttp.send();
    
    return xhttp.responseXML;
}

function getXmlValue (xml, tag)
{
	var r = '';
	var vElement = xml.getElementsByTagName (tag);
	if (   vElement
	    && vElement.length > 0)
	{
		if (vElement[0].childNodes.length > 0)
			r = vElement[0].childNodes[0].textContent;
	}
	
	return r;
}

function getXmlAttribute (xml, tag, attribute)
{
	var r = '';
	var vElement = xml.getElementsByTagName (tag);
	if (   vElement
	    && vElement.length > 0)
		r = vElement[0].getAttribute (attribute);

	return r;
}

function formatDate (dag, maand, jaar)
{
	var r = dag;

	if (dag < 10)
		r = '0' + dag;
	if (maand < 10)
		r += '-0' + maand;
	else
		r += '-' + maand;
	r += '-' + jaar;

	return r;
}

function formatTijd (d)
{
	var r = '';

	if (d.getHours () < 10)
		r = '0';
	r += d.getHours () + ':';
	if (d.getMinutes () < 10)
		r += '0';
	r += d.getMinutes ();

	return r;
}

function createList (name, title, szText, callback, cancelCallback, bInTable)
{

	var elemWrapper;
	var elemDiv;
	var elemText;
	var szHTML = '';
	var fontSize = 'small';

	if (isLargeFont ())
		fontSize = 'medium';

	showMenu (0);
	Cover (name, true);								// onderliggende tekst even bedekken
	elemWrapper = document.createElement ('div');		// wrapper voor alles
	elemWrapper.id = name;								// met deze ID. Kunnen we hem straks bij de OK knop terugvinden om weg te gooien
	elemWrapper.style.cssText = 'position:absolute;width:92%;top:50%;left:50%;height:auto;background-color:#ffffff;padding:0;opacity:0;-moz-opacity:0;-khtml-opacity:0;overflow:hidden;border-radius: 20px;';
	elemWrapper.style.transition = 'opacity 0.5s ease';
	elemWrapper.style.webkitTransition = 'opacity 0.5s ease';
	elemDiv = document.createElement ('div');
	elemDiv.style.cssText = 'position:relative;width:100%;height:auto;padding-top:10px;padding-bottom:10px;border-bottom:solid 1px #afafaf;font-family:calibri, helvetica, sans-serif;'
						  + 'font-size:large;text-align:left;color:#000000;background-color:#c7e0ff;padding-left:15px;border-radius:20px 20px 0 0;border-bottom:solid 1px #a0a0a0;';
	elemDiv.innerHTML = title;
	elemWrapper.appendChild (elemDiv);
	elemText = document.createElement ('div');
	elemText.id = '__text' + name;
	elemText.style.cssText = 'position:relative;left:0px;right:0px;height:auto;padding-top:15px;padding-bottom:20px;border-bottom:solid 1px #afafaf;font-family:calibri, helvetica, sans-serif;'
						  + 'text-align:left;color:#000000;background-color:#ffffff;';
	if (bInTable)
		szHTML  = '<table class=\"tabclass\">';
	szHTML += szText;
	if (bInTable)
		szHTML += '</table>';
	elemText.innerHTML = szHTML;
	elemWrapper.appendChild (elemText);
	elemDiv = document.createElement ('div');
	elemDiv.style.cssText = 'position:relative;width:100%;height:40px;padding:0;border-bottom:solid 1px #afafaf;background-color:#ffffff;border-radius:0 0 20px 20px;';
	elemWrapper.appendChild (elemDiv);
	var elemButton = document.createElement ('div');
	if (cancelCallback)
	{
		elemButton.style.cssText = 'position:absolute;left:0px;width:50%;height:100%;padding:0;font-family:calibri, helvetica, sans-serif;padding-top:10px;padding-bottom:10px;'
							     + 'font-size:medium;text-align:center;color:#000000;background-color:#ffffff;border-radius:0 0 20px 0px;';
	}
	else
	{
		elemButton.style.cssText = 'position:absolute;width:100%;height:100%;padding:0;font-family:calibri, helvetica, sans-serif;padding-top:10px;padding-bottom:10px;'
							  + 'font-size:medium;text-align:center;color:#000000;background-color:#ffffff;border-radius:0 0 20px 20px;';
	}
	elemButton.onclick = function () { onCloseList (name, callback); };
	elemButton.innerHTML = '<b>OK</b>';
	elemButton.onmouseover = function ()
	{
		this.style.backgroundColor = '#afafaf';
	};
	elemButton.onmouseout = function ()
	{
		this.style.backgroundColor = '#ffffff';
	};
	elemDiv.appendChild (elemButton);
	if (cancelCallback)
	{
		elemButton = document.createElement ('div');
		elemButton.style.cssText = 'position:absolute;width:50%;right:0px;height:100%;padding:0;border-left:solid 1px #afafaf;font-family:calibri, helvetica, sans-serif;padding-top:10px;padding-bottom:10px;'
							  + 'font-size:medium;text-align:center;color:#000000;background-color:#ffffff;border-radius:0 0 20px 20px;';
		elemButton.onclick = function () { onCloseList (name, cancelCallback); };
		elemButton.innerHTML = '<b>Cancel</b>';
		elemButton.onmouseover = function ()
		{
			this.style.backgroundColor = '#afafaf';
		};
		elemButton.onmouseout = function ()
		{
			this.style.backgroundColor = '#ffffff';
		};
		elemDiv.appendChild (elemButton);
	}

	elemWrapper.style.opacity = '1';
	elemWrapper.style.mozOpacity = '1';
	elemWrapper.style.khtmlOpacity = '1';

	document.body.appendChild (elemWrapper);

	var td = elemText.getElementsByTagName ('td');
	for (var i = 0; i < td.length; i++)
		td[i].style.fontSize = fontSize;

	var vWidth  = elemWrapper.offsetWidth;
	var vHeight = elemWrapper.offsetHeight;
	vWidth = parseInt (vWidth/2, 10);
	vHeight = parseInt (vHeight/2, 10);
	elemWrapper.style.marginLeft = '-' + vWidth + 'px';
	elemWrapper.style.marginTop = '-' + vHeight + 'px';
	addEnterListener (onEnterPrescription);
	addBackListener (onBackPrescription);

	return elemWrapper;
}

function myQuestion (id, szQuestion, szHeader, szButtonLeft, szButtonRight, leftCallback, rightCallback)
{
	var elemWrapper;
	var elemDiv;
	var elemText;
	var szHTML = '';
	var fontSize = 'small';

	if (isLargeFont ())
		fontSize = 'medium';

	showMenu (0);										// menu mag nu even weg
	Cover (id, true);									// onderliggende tekst even bedekken
	elemWrapper = document.createElement ('div');		// wrapper voor alles
	elemWrapper.id = id;								// met deze ID. Kunnen we hem straks bij de OK knop terugvinden om weg te gooien
	elemWrapper.style.cssText = 'position:absolute;width:80%;top:50%;left:50%;height:auto;background-color:#ffffff;padding:0;opacity:0;-moz-opacity:0;-khtml-opacity:0;overflow:hidden;'; // border-radius: 20px;';
	elemWrapper.style.transition = 'opacity 0.5s ease';
	elemWrapper.style.webkitTransition = 'opacity 0.5s ease';
	elemDiv = document.createElement ('div');
//	elemDiv.style.cssText = 'position:relative;width:100%;height:auto;padding-top:10px;padding-bottom:10px;border-bottom:solid 1px #afafaf;font-family:calibri, helvetica, sans-serif;'
	elemDiv.style.cssText = 'position:relative;width:100%;height:auto;padding:10px;border-bottom:solid 1px #afafaf;font-family:calibri, helvetica, sans-serif;'
						  + 'font-size:large;text-align:left;color:#000000;background-color:#c7e0ff;padding-left:15px;border-bottom:solid 1px #a0a0a0;';		// border-radius:20px 20px 0 0;';
	elemDiv.innerHTML = szHeader;
	elemWrapper.appendChild (elemDiv);
	elemText = document.createElement ('div');
	elemText.id = '__text' + id;
	elemText.style.cssText = 'position:relative;left:0px;right:0px;height:auto;padding-top:15px;padding-bottom:20px;padding-left:7px;padding-right:7px;font-family:calibri, helvetica, sans-serif;'
						   + 'text-align:left;color:#000000;background-color:#ffffff;';
	elemText.innerHTML = szQuestion;
	elemWrapper.appendChild (elemText);

	// ------------------------------------------------------------------------------------------------------
	// de knoppenbalk
	//
	elemDiv = document.createElement ('div');
	elemDiv.style.cssText = 'position:relative;width:100%;height:auto;padding:20px 0 7px 0;background-color:#ffffff;display:inline-block;float:right;vertical-align:bottom;';				// border-radius:0 0 20px 20px;';
	elemWrapper.appendChild (elemDiv);

	// ------------------------------------------------------------------------------------------------------
	// Maak eerste de rechterknop
	//
	var elemButton = document.createElement ('div');
	elemButton.style.cssText = 'float:right;height:auto;bottom:0px;padding-left:30px;padding-right:20px;font-family:calibri, helvetica, sans-serif;'
							 + 'font-size:medium;color:#0152a1;background-color:#ffffff;vertical-align:bottom;margin:0;';
	elemButton.onclick = function () { onCloseList (id, rightCallback); };
	elemButton.innerHTML = szButtonRight;
	elemDiv.appendChild (elemButton);

	// ------------------------------------------------------------------------------------------------------
	// En dan de linkerknop
	//
	elemButton = document.createElement ('div');
	elemButton.style.cssText = 'float:right;display:inline-block;height:auto;bottom:0px;padding-right:30px;padding-left:20px;color:#0152a1;'
							 + 'font-size:medium;font-family:calibri, helvetica, sans-serif;background-color:#ffffff;vertical-align:bottom;';
	elemButton.onclick = function () { onCloseList (id, leftCallback); };
	elemButton.innerHTML = szButtonLeft;
	elemDiv.appendChild (elemButton);

	elemWrapper.style.opacity = '1';
	elemWrapper.style.mozOpacity = '1';
	elemWrapper.style.khtmlOpacity = '1';

	document.body.appendChild (elemWrapper);

	var vWidth  = elemWrapper.offsetWidth;
	var vHeight = elemWrapper.offsetHeight;
	vWidth = parseInt (vWidth/2, 10);
	vHeight = parseInt (vHeight/2, 10);
	elemWrapper.style.marginLeft = '-' + vWidth + 'px';
	elemWrapper.style.marginTop = '-' + vHeight + 'px';
//	addEnterListener (onEnterPrescription);

	return elemWrapper;
}