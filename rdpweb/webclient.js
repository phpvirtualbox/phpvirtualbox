/* JS helpers for the Flash RDP Web Control.
 *
 * Methods started with '_' are for internal use and must not be called.
 * Methods started with '_control' are called from the SWF.
 */
var RDPWebClient = {
    RDPWebUUID: "747f07ac-c30b-4439-826d-7b5c67fd47e7",
    embedSWF: function (FlashFileName, FlashId)
    {
      /* Create the Flash object. */
      var flashvars = {};
      flashvars.flashId = FlashId;

      var params = {};
      params.wmode="opaque";
      params.menu="false";
      params.bgcolor="#ffffff";
      params.quality="low";
      params.allowScriptAccess="always";

      var attributes = {};

      /* Make sure that the SWF will be reloaded from the server, not from browser cache. */
      var stamp = new Date();
      var seed = "?s=" + stamp.getTime();

      swfobject.embedSWF(FlashFileName + seed, FlashId, "100%", "100%", "9.0.0",
                         "", flashvars, params, attributes);
    },
    isRDPWebControlById: function(Id)
    {
        var flash = RDPWebClient.getFlashById(Id);
        return RDPWebClient.isRDPWebControlByElement(flash);
    },
    isRDPWebControlByElement: function(element)
    {
        if (element && element.getProperty)
        {
            var uuid = element.getProperty("UUID");
            if (uuid == RDPWebClient.RDPWebUUID)
            {
                return true;
            }
        }
        return false;
    },
    _controlInit: function (FlashId)
    {
        var flash = RDPWebClient.getFlashById(FlashId);

        if (flash)
        {
            if (window.addEventListener)
            {
                /* Mozilla */
                window.addEventListener("contextmenu", function(event) { return RDPWebClient._MozillaContextMenu(event); }, true);
                window.addEventListener("mousedown", function(event) { return RDPWebClient._MozillaMouse(event, true); }, true);
                window.addEventListener("mouseup", function(event) { return RDPWebClient._MozillaMouse(event, false); }, true);
                flash.addEventListener("mouseout", function(event) { return RDPWebClient._MozillaMouseOut(event); }, true);
            }
            else
            {
                document.oncontextmenu = function() { return RDPWebClient._IEContextMenu(); }
                flash.parentNode.onmousedown = function() { return RDPWebClient._IEMouse(true); }
                flash.parentNode.onmouseup = function() { return RDPWebClient._IEMouse(false); }
                flash.onmouseout=function() {return RDPWebClient._IEMouseOut(); }
            }
        }
    },
    _controlResize: function(flashId, width, height, reason)
    {
        var e = document.getElementById(flashId + 'Container');
        if (e)
        {
            e.style.width=width + "px";
            e.style.height=height +  "px";
        }
    },
    _IEMouseOut: function()
    {
        if (window.event && RDPWebClient.isRDPWebControlById(window.event.srcElement.id))
        {
            RDPWebClient._callMouseOut(window.event.srcElement.id);
        }
        return true;
    },
    _IECancelEvent: function()
    {
        window.event.returnValue = false;
        window.event.cancelBubble = true;
        return false;
    },
    _IEContextMenu: function()
    {
        if (window.event && RDPWebClient.isRDPWebControlById(window.event.srcElement.id))
        {
            return RDPWebClient._IECancelEvent();
        }
    },
    _IEMouse: function(fMouseDown)
    {
        if (window.event && RDPWebClient.isRDPWebControlById(window.event.srcElement.id))
        {
            if (window.event.button == 2)
            {
                if (fMouseDown == true)
                {
                    RDPWebClient.getFlashById(window.event.srcElement.id).parentNode.setCapture();
                    RDPWebClient._callRightMouseDown(window.event.srcElement.id);
                }
                else
                {
                    RDPWebClient._callRightMouseUp(window.event.srcElement.id);
                    RDPWebClient.getFlashById(window.event.srcElement.id).parentNode.releaseCapture();
                }
                return RDPWebClient._IECancelEvent();
            }
        }
    },
    _MozillaMouseOut: function(event)
    {
        if (RDPWebClient.isRDPWebControlById(event.target.id))
        {
            RDPWebClient._callMouseOut(event.target.id);
        }
        return true;
    },
    _MozillaCancelEvent: function(event)
    {
        if (event)
        {
            if (event.preventBubble) event.preventBubble();
            if (event.preventCapture) event.preventCapture();
            if (event.preventDefault) event.preventDefault();
            if (event.stopPropagation) event.stopPropagation();
        }
    },
    _MozillaContextMenu: function(event)
    {
        if (RDPWebClient.isRDPWebControlById(event.target.id))
        {
            RDPWebClient._MozillaCancelEvent(event);
        }
    },
    _MozillaMouse: function(event, fMouseDown)
    {
        if (RDPWebClient.isRDPWebControlById(event.target.id))
        {
            if (event.button == 2)
            {
                if (fMouseDown)
                {
                    RDPWebClient._callRightMouseDown(event.target.id);
                }
                else
                {
                    RDPWebClient._callRightMouseUp(event.target.id);
                }
                RDPWebClient._MozillaCancelEvent(event);
            }
        }
    },
    _callRightMouseDown: function(FlashId)
    {
        var flash = RDPWebClient.getFlashById(FlashId);
        if (flash && flash.rightMouseDown)
        {
            try
            {
                flash.rightMouseDown();
            }
            catch (e) {}; /* Hack for IE, which calls the Flash method but then throws the exception. */
        }
    },
    _callRightMouseUp: function(FlashId)
    {
        var flash = RDPWebClient.getFlashById(FlashId);
        if (flash && flash.rightMouseUp)
        {
            try
            {
               flash.rightMouseUp();
            }
            catch (e) {}; /* Hack for IE, which calls the Flash method but then throws the exception. */
        }
    },
    _callMouseOut: function(FlashId)
    {
        var flash = RDPWebClient.getFlashById(FlashId);
        if (flash && flash.mouseOut)
        {
            try
            {
               flash.mouseOut();
            }
            catch (e) {}; /* Hack for IE, which calls the Flash method but then throws the exception. */
        }
    },
    getFlashById: function(flashId)
    {
        if (document.embeds && document.embeds[flashId])
            return document.embeds[flashId];

        return document.getElementById(flashId);
    }
}
