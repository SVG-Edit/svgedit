// This file is part of Natural Docs, which is Copyright (C) 2003-2008 Greg Valure
// Natural Docs is licensed under the GPL


//
//  Browser Styles
// ____________________________________________________________________________

var agt=navigator.userAgent.toLowerCase();
var browserType;
var browserVer;

if (agt.indexOf("opera") != -1)
    {
    browserType = "Opera";

    if (agt.indexOf("opera 7") != -1 || agt.indexOf("opera/7") != -1)
        {  browserVer = "Opera7";  }
    else if (agt.indexOf("opera 8") != -1 || agt.indexOf("opera/8") != -1)
        {  browserVer = "Opera8";  }
    else if (agt.indexOf("opera 9") != -1 || agt.indexOf("opera/9") != -1)
        {  browserVer = "Opera9";  }
    }

else if (agt.indexOf("applewebkit") != -1)
    {
    browserType = "Safari";

    if (agt.indexOf("version/3") != -1)
        {  browserVer = "Safari3";  }
    else if (agt.indexOf("safari/4") != -1)
        {  browserVer = "Safari2";  }
    }

else if (agt.indexOf("khtml") != -1)
    {
    browserType = "Konqueror";
    }

else if (agt.indexOf("msie") != -1)
    {
    browserType = "IE";

    if (agt.indexOf("msie 6") != -1)
        {  browserVer = "IE6";  }
    else if (agt.indexOf("msie 7") != -1)
        {  browserVer = "IE7";  }
    }

else if (agt.indexOf("gecko") != -1)
    {
    browserType = "Firefox";

    if (agt.indexOf("rv:1.7") != -1)
        {  browserVer = "Firefox1";  }
    else if (agt.indexOf("rv:1.8)") != -1 || agt.indexOf("rv:1.8.0") != -1)
        {  browserVer = "Firefox15";  }
    else if (agt.indexOf("rv:1.8.1") != -1)
        {  browserVer = "Firefox2";  }
    }


//
//  Support Functions
// ____________________________________________________________________________


function GetXPosition(item)
    {
    var position = 0;

    if (item.offsetWidth != null)
        {
        while (item != document.body && item != null)
            {
            position += item.offsetLeft;
            item = item.offsetParent;
            };
        };

    return position;
    };


function GetYPosition(item)
    {
    var position = 0;

    if (item.offsetWidth != null)
        {
        while (item != document.body && item != null)
            {
            position += item.offsetTop;
            item = item.offsetParent;
            };
        };

    return position;
    };


function MoveToPosition(item, x, y)
    {
    // Opera 5 chokes on the px extension, so it can use the Microsoft one instead.

    if (item.style.left != null)
        {
        item.style.left = x + "px";
        item.style.top = y + "px";
        }
    else if (item.style.pixelLeft != null)
        {
        item.style.pixelLeft = x;
        item.style.pixelTop = y;
        };
    };


//
//  Menu
// ____________________________________________________________________________


function ToggleMenu(id)
    {
    if (!window.document.getElementById)
        {  return;  };

    var display = window.document.getElementById(id).style.display;

    if (display == "none")
        {  display = "block";  }
    else
        {  display = "none";  }

    window.document.getElementById(id).style.display = display;
    }

function HideAllBut(ids, max)
    {
    if (document.getElementById)
        {
        ids.sort( function(a,b) { return a - b; } );
        var number = 1;

        while (number < max)
            {
            if (ids.length > 0 && number == ids[0])
                {  ids.shift();  }
            else
                {
                document.getElementById("MGroupContent" + number).style.display = "none";
                };

            number++;
            };
        };
    }


//
//  Tooltips
// ____________________________________________________________________________


var tooltipTimer = 0;

function ShowTip(event, tooltipID, linkID)
    {
    if (tooltipTimer)
        {  clearTimeout(tooltipTimer);  };

    var docX = event.clientX + window.pageXOffset;
    var docY = event.clientY + window.pageYOffset;

    var showCommand = "ReallyShowTip('" + tooltipID + "', '" + linkID + "', " + docX + ", " + docY + ")";

    tooltipTimer = setTimeout(showCommand, 1000);
    }

function ReallyShowTip(tooltipID, linkID, docX, docY)
    {
    tooltipTimer = 0;

    var tooltip;
    var link;

    if (document.getElementById)
        {
        tooltip = document.getElementById(tooltipID);
        link = document.getElementById(linkID);
        }
/*    else if (document.all)
        {
        tooltip = eval("document.all['" + tooltipID + "']");
        link = eval("document.all['" + linkID + "']");
        }
*/
    if (tooltip)
        {
        var left = GetXPosition(link);
        var top = GetYPosition(link);
        top += link.offsetHeight;


        // The fallback method is to use the mouse X and Y relative to the document.  We use a separate if and test if its a number
        // in case some browser snuck through the above if statement but didn't support everything.

        if (!isFinite(top) || top == 0)
            {
            left = docX;
            top = docY;
            }

        // Some spacing to get it out from under the cursor.

        top += 10;

        // Make sure the tooltip doesnt get smushed by being too close to the edge, or in some browsers, go off the edge of the
        // page.  We do it here because Konqueror does get offsetWidth right even if it doesnt get the positioning right.

        if (tooltip.offsetWidth != null)
            {
            var width = tooltip.offsetWidth;
            var docWidth = document.body.clientWidth;

            if (left + width > docWidth)
                {  left = docWidth - width - 1;  }

            // If there's a horizontal scroll bar we could go past zero because it's using the page width, not the window width.
            if (left < 0)
                {  left = 0;  };
            }

        MoveToPosition(tooltip, left, top);
        tooltip.style.visibility = "visible";
        }
    }

function HideTip(tooltipID)
    {
    if (tooltipTimer)
        {
        clearTimeout(tooltipTimer);
        tooltipTimer = 0;
        }

    var tooltip;

    if (document.getElementById)
        {  tooltip = document.getElementById(tooltipID); }
    else if (document.all)
        {  tooltip = eval("document.all['" + tooltipID + "']");  }

    if (tooltip)
        {  tooltip.style.visibility = "hidden";  }
    }


//
//  Blockquote fix for IE
// ____________________________________________________________________________


function NDOnLoad()
    {
    if (browserVer == "IE6")
        {
        var scrollboxes = document.getElementsByTagName('blockquote');

        if (scrollboxes.item(0))
            {
            NDDoResize();
            window.onresize=NDOnResize;
            };
        };
    };


var resizeTimer = 0;

function NDOnResize()
    {
    if (resizeTimer != 0)
        {  clearTimeout(resizeTimer);  };

    resizeTimer = setTimeout(NDDoResize, 250);
    };


function NDDoResize()
    {
    var scrollboxes = document.getElementsByTagName('blockquote');

    var i;
    var item;

    i = 0;
    while (item = scrollboxes.item(i))
        {
        item.style.width = 100;
        i++;
        };

    i = 0;
    while (item = scrollboxes.item(i))
        {
        item.style.width = item.parentNode.offsetWidth;
        i++;
        };

    clearTimeout(resizeTimer);
    resizeTimer = 0;
    }



/* ________________________________________________________________________________________________________

    Class: SearchPanel
    ________________________________________________________________________________________________________

    A class handling everything associated with the search panel.

    Parameters:

        name - The name of the global variable that will be storing this instance.  Is needed to be able to set timeouts.
        mode - The mode the search is going to work in.  Pass <NaturalDocs::Builder::Base->CommandLineOption()>, so the
                   value will be something like "HTML" or "FramedHTML".

    ________________________________________________________________________________________________________
*/


function SearchPanel(name, mode, resultsPath)
    {
    if (!name || !mode || !resultsPath)
        {  alert("Incorrect parameters to SearchPanel.");  };


    // Group: Variables
    // ________________________________________________________________________

    /*
        var: name
        The name of the global variable that will be storing this instance of the class.
    */
    this.name = name;

    /*
        var: mode
        The mode the search is going to work in, such as "HTML" or "FramedHTML".
    */
    this.mode = mode;

    /*
        var: resultsPath
        The relative path from the current HTML page to the results page directory.
    */
    this.resultsPath = resultsPath;

    /*
        var: keyTimeout
        The timeout used between a keystroke and when a search is performed.
    */
    this.keyTimeout = 0;

    /*
        var: keyTimeoutLength
        The length of <keyTimeout> in thousandths of a second.
    */
    this.keyTimeoutLength = 500;

    /*
        var: lastSearchValue
        The last search string executed, or an empty string if none.
    */
    this.lastSearchValue = "";

    /*
        var: lastResultsPage
        The last results page.  The value is only relevant if <lastSearchValue> is set.
    */
    this.lastResultsPage = "";

    /*
        var: deactivateTimeout

        The timeout used between when a control is deactivated and when the entire panel is deactivated.  Is necessary
        because a control may be deactivated in favor of another control in the same panel, in which case it should stay
        active.
    */
    this.deactivateTimout = 0;

    /*
        var: deactivateTimeoutLength
        The length of <deactivateTimeout> in thousandths of a second.
    */
    this.deactivateTimeoutLength = 200;




    // Group: DOM Elements
    // ________________________________________________________________________


    // Function: DOMSearchField
    this.DOMSearchField = function()
        {  return document.getElementById("MSearchField");  };

    // Function: DOMSearchType
    this.DOMSearchType = function()
        {  return document.getElementById("MSearchType");  };

    // Function: DOMPopupSearchResults
    this.DOMPopupSearchResults = function()
        {  return document.getElementById("MSearchResults");  };

    // Function: DOMPopupSearchResultsWindow
    this.DOMPopupSearchResultsWindow = function()
        {  return document.getElementById("MSearchResultsWindow");  };

    // Function: DOMSearchPanel
    this.DOMSearchPanel = function()
        {  return document.getElementById("MSearchPanel");  };




    // Group: Event Handlers
    // ________________________________________________________________________


    /*
        Function: OnSearchFieldFocus
        Called when focus is added or removed from the search field.
    */
    this.OnSearchFieldFocus = function(isActive)
        {
        this.Activate(isActive);
        };


    /*
        Function: OnSearchFieldChange
        Called when the content of the search field is changed.
    */
    this.OnSearchFieldChange = function()
        {
        if (this.keyTimeout)
            {
            clearTimeout(this.keyTimeout);
            this.keyTimeout = 0;
            };

        var searchValue = this.DOMSearchField().value.replace(/ +/g, "");

        if (searchValue != this.lastSearchValue)
            {
            if (searchValue != "")
                {
                this.keyTimeout = setTimeout(this.name + ".Search()", this.keyTimeoutLength);
                }
            else
                {
                if (this.mode == "HTML")
                    {  this.DOMPopupSearchResultsWindow().style.display = "none";  };
                this.lastSearchValue = "";
                };
            };
        };


    /*
        Function: OnSearchTypeFocus
        Called when focus is added or removed from the search type.
    */
    this.OnSearchTypeFocus = function(isActive)
        {
        this.Activate(isActive);
        };


    /*
        Function: OnSearchTypeChange
        Called when the search type is changed.
    */
    this.OnSearchTypeChange = function()
        {
        var searchValue = this.DOMSearchField().value.replace(/ +/g, "");

        if (searchValue != "")
            {
            this.Search();
            };
        };



    // Group: Action Functions
    // ________________________________________________________________________


    /*
        Function: CloseResultsWindow
        Closes the results window.
    */
    this.CloseResultsWindow = function()
        {
        this.DOMPopupSearchResultsWindow().style.display = "none";
        this.Activate(false, true);
        };


    /*
        Function: Search
        Performs a search.
    */
    this.Search = function()
        {
        this.keyTimeout = 0;

        var searchValue = this.DOMSearchField().value.replace(/^ +/, "");
        var searchTopic = this.DOMSearchType().value;

        var pageExtension = searchValue.substr(0,1);

        if (pageExtension.match(/^[a-z]/i))
            {  pageExtension = pageExtension.toUpperCase();  }
        else if (pageExtension.match(/^[0-9]/))
            {  pageExtension = 'Numbers';  }
        else
            {  pageExtension = "Symbols";  };

        var resultsPage;
        var resultsPageWithSearch;
        var hasResultsPage;

        // indexSectionsWithContent is defined in searchdata.js
        if (indexSectionsWithContent[searchTopic][pageExtension] == true)
            {
            resultsPage = this.resultsPath + '/' + searchTopic + pageExtension + '.html';
            resultsPageWithSearch = resultsPage+'?'+escape(searchValue);
            hasResultsPage = true;
            }
        else
            {
            resultsPage = this.resultsPath + '/NoResults.html';
            resultsPageWithSearch = resultsPage;
            hasResultsPage = false;
            };

        var resultsFrame;
        if (this.mode == "HTML")
            {  resultsFrame = window.frames.MSearchResults;  }
        else if (this.mode == "FramedHTML")
            {  resultsFrame = window.top.frames['Content'];  };


        if (resultsPage != this.lastResultsPage ||

            // Bug in IE.  If everything becomes hidden in a run, none of them will be able to be reshown in the next for some
            // reason.  It counts the right number of results, and you can even read the display as "block" after setting it, but it
            // just doesn't work in IE 6 or IE 7.  So if we're on the right page but the previous search had no results, reload the
            // page anyway to get around the bug.
            (browserType == "IE" && hasResultsPage &&
            	(!resultsFrame.searchResults || resultsFrame.searchResults.lastMatchCount == 0)) )

            {
            resultsFrame.location.href = resultsPageWithSearch;
            }

        // So if the results page is right and there's no IE bug, reperform the search on the existing page.  We have to check if there
        // are results because NoResults.html doesn't have any JavaScript, and it would be useless to do anything on that page even
        // if it did.
        else if (hasResultsPage)
            {
            // We need to check if this exists in case the frame is present but didn't finish loading.
            if (resultsFrame.searchResults)
                {  resultsFrame.searchResults.Search(searchValue);  }

            // Otherwise just reload instead of waiting.
            else
                {  resultsFrame.location.href = resultsPageWithSearch;  };
            };


        var domPopupSearchResultsWindow = this.DOMPopupSearchResultsWindow();

        if (this.mode == "HTML" && domPopupSearchResultsWindow.style.display != "block")
            {
            var domSearchType = this.DOMSearchType();

            var left = GetXPosition(domSearchType);
            var top = GetYPosition(domSearchType) + domSearchType.offsetHeight;

            MoveToPosition(domPopupSearchResultsWindow, left, top);
            domPopupSearchResultsWindow.style.display = 'block';
            };


        this.lastSearchValue = searchValue;
        this.lastResultsPage = resultsPage;
        };



    // Group: Activation Functions
    // Functions that handle whether the entire panel is active or not.
    // ________________________________________________________________________


    /*
        Function: Activate

        Activates or deactivates the search panel, resetting things to their default values if necessary.  You can call this on every
        control's OnBlur() and it will handle not deactivating the entire panel when focus is just switching between them transparently.

        Parameters:

            isActive - Whether you're activating or deactivating the panel.
            ignoreDeactivateDelay - Set if you're positive the action will deactivate the panel and thus want to skip the delay.
    */
    this.Activate = function(isActive, ignoreDeactivateDelay)
        {
        // We want to ignore isActive being false while the results window is open.
        if (isActive || (this.mode == "HTML" && this.DOMPopupSearchResultsWindow().style.display == "block"))
            {
            if (this.inactivateTimeout)
                {
                clearTimeout(this.inactivateTimeout);
                this.inactivateTimeout = 0;
                };

            this.DOMSearchPanel().className = 'MSearchPanelActive';

            var searchField = this.DOMSearchField();

            if (searchField.value == 'Search')
                 {  searchField.value = "";  }
            }
        else if (!ignoreDeactivateDelay)
            {
            this.inactivateTimeout = setTimeout(this.name + ".InactivateAfterTimeout()", this.inactivateTimeoutLength);
            }
        else
            {
            this.InactivateAfterTimeout();
            };
        };


    /*
        Function: InactivateAfterTimeout

        Called by <inactivateTimeout>, which is set by <Activate()>.  Inactivation occurs on a timeout because a control may
        receive OnBlur() when focus is really transferring to another control in the search panel.  In this case we don't want to
        actually deactivate the panel because not only would that cause a visible flicker but it could also reset the search value.
        So by doing it on a timeout instead, there's a short period where the second control's OnFocus() can cancel the deactivation.
    */
    this.InactivateAfterTimeout = function()
        {
        this.inactivateTimeout = 0;

        this.DOMSearchPanel().className = 'MSearchPanelInactive';
        this.DOMSearchField().value = "Search";

	    this.lastSearchValue = "";
	    this.lastResultsPage = "";
        };
    };




/* ________________________________________________________________________________________________________

   Class: SearchResults
   _________________________________________________________________________________________________________

   The class that handles everything on the search results page.
   _________________________________________________________________________________________________________
*/


function SearchResults(name, mode)
    {
    /*
        var: mode
        The mode the search is going to work in, such as "HTML" or "FramedHTML".
    */
    this.mode = mode;

    /*
        var: lastMatchCount
        The number of matches from the last run of <Search()>.
    */
    this.lastMatchCount = 0;


    /*
        Function: Toggle
        Toggles the visibility of the passed element ID.
    */
    this.Toggle = function(id)
        {
        if (this.mode == "FramedHTML")
            {  return;  };

        var parentElement = document.getElementById(id);

        var element = parentElement.firstChild;

        while (element && element != parentElement)
            {
            if (element.nodeName == 'DIV' && element.className == 'ISubIndex')
                {
                if (element.style.display == 'block')
                    {  element.style.display = "none";  }
                else
                    {  element.style.display = 'block';  }
                };

            if (element.nodeName == 'DIV' && element.hasChildNodes())
                {  element = element.firstChild;  }
            else if (element.nextSibling)
                {  element = element.nextSibling;  }
            else
                {
                do
                    {
                    element = element.parentNode;
                    }
                while (element && element != parentElement && !element.nextSibling);

                if (element && element != parentElement)
                    {  element = element.nextSibling;  };
                };
            };
        };


    /*
        Function: Search

        Searches for the passed string.  If there is no parameter, it takes it from the URL query.

        Always returns true, since other documents may try to call it and that may or may not be possible.
    */
    this.Search = function(search)
        {
        if (!search)
            {
            search = window.location.search;
            search = search.substring(1);  // Remove the leading ?
            search = unescape(search);
            };

        search = search.replace(/^ +/, "");
        search = search.replace(/ +$/, "");
        search = search.toLowerCase();

        if (search.match(/[^a-z0-9]/)) // Just a little speedup so it doesn't have to go through the below unnecessarily.
            {
            search = search.replace(/\_/g, "_und");
            search = search.replace(/\ +/gi, "_spc");
            search = search.replace(/\~/g, "_til");
            search = search.replace(/\!/g, "_exc");
            search = search.replace(/\@/g, "_att");
            search = search.replace(/\#/g, "_num");
            search = search.replace(/\$/g, "_dol");
            search = search.replace(/\%/g, "_pct");
            search = search.replace(/\^/g, "_car");
            search = search.replace(/\&/g, "_amp");
            search = search.replace(/\*/g, "_ast");
            search = search.replace(/\(/g, "_lpa");
            search = search.replace(/\)/g, "_rpa");
            search = search.replace(/\-/g, "_min");
            search = search.replace(/\+/g, "_plu");
            search = search.replace(/\=/g, "_equ");
            search = search.replace(/\{/g, "_lbc");
            search = search.replace(/\}/g, "_rbc");
            search = search.replace(/\[/g, "_lbk");
            search = search.replace(/\]/g, "_rbk");
            search = search.replace(/\:/g, "_col");
            search = search.replace(/\;/g, "_sco");
            search = search.replace(/\"/g, "_quo");
            search = search.replace(/\'/g, "_apo");
            search = search.replace(/\</g, "_lan");
            search = search.replace(/\>/g, "_ran");
            search = search.replace(/\,/g, "_com");
            search = search.replace(/\./g, "_per");
            search = search.replace(/\?/g, "_que");
            search = search.replace(/\//g, "_sla");
            search = search.replace(/[^a-z0-9\_]i/gi, "_zzz");
            };

        var resultRows = document.getElementsByTagName("div");
        var matches = 0;

        var i = 0;
        while (i < resultRows.length)
            {
            var row = resultRows.item(i);

            if (row.className == "SRResult")
                {
                var rowMatchName = row.id.toLowerCase();
                rowMatchName = rowMatchName.replace(/^sr\d*_/, '');

                if (search.length <= rowMatchName.length && rowMatchName.substr(0, search.length) == search)
                    {
                    row.style.display = "block";
                    matches++;
                    }
                else
                    {  row.style.display = "none";  };
                };

            i++;
            };

        document.getElementById("Searching").style.display="none";

        if (matches == 0)
            {  document.getElementById("NoMatches").style.display="block";  }
        else
            {  document.getElementById("NoMatches").style.display="none";  }

        this.lastMatchCount = matches;

        return true;
        };
    };

