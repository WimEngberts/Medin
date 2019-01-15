//--------------------------------------------------------------------
// (c) 2017, MedLex
//
var g_bDeviceIsReady	= false;
var db = null;
var xmlDoc = null;
var scanner;
var enterHandlers = [];
var enterHandlerIndex = -1;
var backHandlers = [];
var backHandlerIndex = -1;

//---------------------------------------------------------------
// Cordova is ready
//
function onDeviceReady()
{
	g_bDeviceIsReady = true;
	
//	alert ('The device is ready');

	db = window.openDatabase("MediList.db", "1.0", "MediList", 200000);
	if (db)
	{
		initTables (db);
		showList (db);
		fillCalender ();
	}
	else
		alert ('no database available!');
	setFontSizes ();
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

	setting = loadSetting ('monthsSave');						// Hoe lang bewaren we lijsten?
	if (setting)
		document.getElementById ('termijn').value = setting;

	setting = loadSetting ('largeFont');						// grote letters gekozen?
	var bSetting = true;
	if (setting == 'false')
		bSetting = false;
	setFont (bSetting);
	
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
//	document.addEventListener ("deviceready", onDeviceReady, false);
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
function myAlert (szText)
{

    var elemWrapper;
    var elemDiv;
	var fontSize = 'small';

	if (isLargeFont ())
//	if (document.getElementById ('largeFont').className == 'checked')
		fontSize = 'medium';

    Cover ('__myAlert', false);    						// onderliggende tekst even bedekken
    elemWrapper = document.createElement ('div');		// wrapper voor alles
    elemWrapper.id = '__myAlert';				// met deze ID. Kunnen we hem straks bij de OK knop terugvinden om weg te gooien
    elemWrapper.style.cssText = 'position:absolute;width:80%;top:50%;left:50%;height:auto;background-color:#ffffff;padding:0;opacity:0;-moz-opacity:0;-khtml-opacity:0;border-radius:20px;overlow:hidden;';
	elemWrapper.style.overflow = 'hidden';
    elemWrapper.style.transition = 'opacity 0.5s ease';
    elemWrapper.style.webkitTransition = 'opacity 0.5s ease';
    elemDiv = document.createElement ('div');
    elemDiv.style.cssText = 'position:relative;width:100%;height:auto;padding-top:10px;padding-bottom:10px;border-bottom:solid 1px #afafaf;font-family:calibri, helvetica, sans-serif;'
                          + 'font-size:large;text-align:left;color:#000000;background-color:#ffffff;padding-left:15px;border-radius:20px 20px 0 0;';
    elemDiv.innerHTML = '<b>Let op!</b>';
    elemWrapper.appendChild (elemDiv);
    elemDiv = document.createElement ('div');
    elemDiv.id = '__brAlertText';
    elemDiv.style.cssText = 'position:relative;left:0px;right:0px;height:auto;padding-top:15px;padding-bottom:20px;border-bottom:solid 1px #afafaf;font-family:calibri, helvetica, sans-serif;'
                          + 'text-align:left;color:#000000;background-color:#ffffff;padding-left:15px;padding-right:15px;';
	elemDiv.style.fontSize = fontSize;
    elemDiv.innerHTML = szText;
    elemWrapper.appendChild (elemDiv);
    elemDiv = document.createElement ('div');
    elemDiv.style.cssText = 'position:relative;width:100%;height:auto;padding-top:10px;padding-bottom:10px;border-bottom:solid 1px #afafaf;font-family:calibri, helvetica, sans-serif;'
                          + 'font-size:medium;text-align:center;color:#000000;background-color:#ffffff;border-radius:0 0 20px 20px;';
	elemDiv.onclick = function () { onClickOK ('__myAlert'); };
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
						  + 'font-size:large;text-align:left;color:#000000;background-color:#ffffff;padding-left:15px;border-radius:20px 20px 0 0;';
	elemDiv.innerHTML = szHeader;
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