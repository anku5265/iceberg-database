/*!
 * Iceberg Connect Browser Script (v1.0.0) -- https://dashboard.icebergdb.in/embed.js
 * Exposes global `ConnectPopup(options)` and `connectToIceberg(callback, options)`
 * for websites, CMS portals, and web applications without requiring a bundler.
 */
(function (global) {
  "use strict";

  var DEFAULT_DASHBOARD = "https://dashboard.icebergdb.in";

  function resolveBase(customUrl) {
    return String(customUrl || DEFAULT_DASHBOARD).replace(/\/+$/, "");
  }

  function ConnectPopup(options) {
    var opts = options || {};
    var popupRef = null;
    var removeMsg = null;

    function close() {
      if (removeMsg) {
        removeMsg();
        removeMsg = null;
      }
      if (popupRef && !popupRef.closed) {
        popupRef.close();
      }
      popupRef = null;
    }

    function open() {
      var slug = String(opts.integrationId || "").trim();
      if (!slug) {
        console.warn("[Iceberg Connect] Missing required `integrationId`; popup did not open.");
        return null;
      }
      close();
      var base = resolveBase(opts.dashboardUrl);
      var url = base + "/connect?integration=" + encodeURIComponent(slug);
      popupRef = global.open(url, "iceberg_connect", "width=560,height=680,menubar=no,toolbar=no");

      function onMessage(ev) {
        if (!ev.origin || ev.origin.indexOf(base) !== 0) return;
        var d = ev.data || {};
        if ((d.type === "ICEBERG_API_KEY_CONNECTED" || d.type === "ICEBERG_CONNECT_SUCCESS") && typeof d.apiKey === "string") {
          if (typeof opts.onConnect === "function") {
            opts.onConnect(d.apiKey, { apiKey: d.apiKey, projectId: d.projectId, integrationId: slug });
          }
          close();
        }
      }

      global.addEventListener("message", onMessage);
      removeMsg = function () {
        global.removeEventListener("message", onMessage);
      };
      return popupRef;
    }

    return { open: open, close: close };
  }

  function connectToIceberg(callback, options) {
    var opts = options || {};
    var slug = String(opts.integrationId || "").trim();
    var container = opts.container;
    if (!slug || !container) {
      console.warn("[Iceberg Connect] Both `integrationId` and `container` are required to render the widget.");
      return { destroy: function () {} };
    }

    var base = resolveBase(opts.dashboardUrl);
    var iframe = document.createElement("iframe");
    iframe.src = base + "/connect?integration=" + encodeURIComponent(slug) + "&embed=1";
    iframe.style.width = "100%";
    iframe.style.maxWidth = "480px";
    iframe.style.height = (opts.height || 460) + "px";
    iframe.style.border = "1px solid #27272a";
    iframe.style.borderRadius = "12px";
    iframe.style.background = "#0b0c10";
    iframe.setAttribute("allow", "clipboard-read; clipboard-write");

    container.innerHTML = "";
    container.appendChild(iframe);

    function onMessage(ev) {
      if (!ev.origin || ev.origin.indexOf(base) !== 0) return;
      var d = ev.data || {};
      if ((d.type === "ICEBERG_API_KEY_CONNECTED" || d.type === "ICEBERG_CONNECT_SUCCESS") && typeof d.apiKey === "string") {
        if (typeof callback === "function") {
          callback(d.apiKey, { apiKey: d.apiKey, projectId: d.projectId, integrationId: slug });
        }
      }
    }

    global.addEventListener("message", onMessage);
    return {
      destroy: function () {
        global.removeEventListener("message", onMessage);
        if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
      },
    };
  }

  global.ConnectPopup = ConnectPopup;
  global.connectToIceberg = connectToIceberg;
})(typeof window !== "undefined" ? window : globalThis);
