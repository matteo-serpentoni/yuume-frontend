(function () {
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CONFIGURAZIONE
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const currentScript =
    document.currentScript || document.querySelector('script[src*="embed.js"]');
  const scriptUrl = currentScript?.src;
  const urlParams = new URLSearchParams(scriptUrl?.split("?")[1] || "");
  const SHOP_DOMAIN = urlParams.get("shop") || window.location.hostname;

  // Genera session ID univoco
  const SESSION_ID = generateSessionId();

  // Ottieni siteId (puoi passarlo come parametro o fare lookup)
  const SITE_ID =
    urlParams.get("siteId") || "shopify_" + SHOP_DOMAIN.split(".")[0];

  var isDevelopment =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1" ||
    window.location.hostname === "" ||
    window.location.port === "8080" ||
    window.location.port === "3000";

  var config = {
    development: {
      widgetUrl: "http://localhost:3000/?embed=true",
      apiUrl: "http://localhost:5001",
    },
    production: {
      widgetUrl: "https://yuumechat.com/widget/?embed=true",
      apiUrl: "https://yuume-backend-production.up.railway.app",
    },
  };

  var env = isDevelopment ? "development" : "production";
  var API_URL = config[env].apiUrl;

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // UTILITY FUNCTIONS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  function generateSessionId() {
    return "sess_" + Math.random().toString(36).substr(2, 9) + Date.now();
  }

  function getVisitorId() {
    // Prova a leggere da localStorage (persiste tra sessioni)
    let visitorId = localStorage.getItem("yuume_visitor_id");

    if (!visitorId) {
      visitorId =
        "visitor_" + Math.random().toString(36).substr(2, 9) + Date.now();
      localStorage.setItem("yuume_visitor_id", visitorId);
    }

    return visitorId;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // TRACKING FUNCTIONS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  function sendHeartbeat() {
    fetch(API_URL + "/api/tracking/heartbeat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        siteId: SITE_ID,
        sessionId: SESSION_ID,
        currentPage: window.location.pathname,
        visitorId: getVisitorId(),
      }),
    }).catch((err) => console.error("❌ Heartbeat failed:", err));
  }

  function notifyChatStart() {
    fetch(API_URL + "/api/tracking/chat-start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId: SESSION_ID }),
    }).catch((err) => console.error("❌ Chat start failed:", err));
  }

  function notifyChatEnd() {
    fetch(API_URL + "/api/tracking/chat-end", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId: SESSION_ID }),
    }).catch((err) => console.error("❌ Chat end failed:", err));
  }

  function notifyLeave() {
    // Usa sendBeacon per affidabilità (funziona anche durante beforeunload)
    const url = API_URL + "/api/tracking/leave";
    const data = JSON.stringify({ sessionId: SESSION_ID });

    if (navigator.sendBeacon) {
      navigator.sendBeacon(url, data);
    } else {
      fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: data,
        keepalive: true,
      }).catch((err) => console.error("❌ Leave failed:", err));
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // BACKGROUND DETECTION
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  function getLuminance(r, g, b) {
    var a = [r, g, b].map(function (v) {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
  }

  function checkBackgroundColor() {
    if (!iframe) return;

    // Coordinate del centro dell'orb (approssimativamente)
    // L'iframe è 250x250, l'orb è al centro.
    // In posizione minimizzata è in basso a destra.
    var rect = iframe.getBoundingClientRect();
    // Targeted coordinates: Bottom-right area where the Orb minimized actually sits
    // (Iframe is 250x250, Orb is offset 32px from bottom/right)
    var x = rect.right - 70;
    var y = rect.bottom - 70;

    // Nascondi momentaneamente l'iframe per vedere cosa c'è sotto
    var prevDisplay = iframe.style.display;
    iframe.style.display = "none";

    var element = document.elementFromPoint(x, y);

    iframe.style.display = prevDisplay;

    if (!element) return;

    // Risali il DOM per trovare un colore di sfondo non trasparente
    var bgColor = "rgba(0, 0, 0, 0)";
    while (element) {
      var style = window.getComputedStyle(element);
      var color = style.backgroundColor;

      // Check se non è trasparente
      if (color && color !== "rgba(0, 0, 0, 0)" && color !== "transparent") {
        bgColor = color;
        break;
      }
      element = element.parentElement;
    }

    // Parse RGB/RGBA
    var rgb = bgColor.match(/\d+/g);
    if (rgb && rgb.length >= 3) {
      var lum = getLuminance(
        parseInt(rgb[0]),
        parseInt(rgb[1]),
        parseInt(rgb[2])
      );
      var mode = lum > 0.5 ? "light" : "dark"; // light background -> dark text

      iframe.contentWindow.postMessage(
        {
          type: "YUUME_BG_LUMINANCE",
          mode: mode,
        },
        "*"
      );
    }
  }

  // Throttle helper
  function throttle(func, limit) {
    var inThrottle;
    return function () {
      var args = arguments;
      var context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(function () {
          inThrottle = false;
        }, limit);
      }
    };
  }

  // Listeners per aggiornare il colore
  var throttledCheck = throttle(checkBackgroundColor, 200);
  window.addEventListener("scroll", throttledCheck);
  window.addEventListener("resize", throttledCheck);

  // Check iniziale dopo un po' che la pagina è carica
  setTimeout(checkBackgroundColor, 1000);

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // IFRAME SETUP
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  var iframe = document.createElement("iframe");
  // Add timestamp to prevent caching of the widget itself
  var widgetUrl = config[env].widgetUrl;
  var separator = widgetUrl.includes("?") ? "&" : "?";
  iframe.src = widgetUrl + separator + "t=" + Date.now();

  iframe.id = "yuume-orb-iframe";
  iframe.allow = "clipboard-write;";
  iframe.style.position = "fixed";
  iframe.style.bottom = "0px";
  iframe.style.right = "0px";
  iframe.style.zIndex = "999999";
  iframe.style.background = "transparent";
  iframe.style.border = "none";
  iframe.style.overflow = "hidden";
  iframe.style.width = "250px";
  iframe.style.height = "250px";
  iframe.setAttribute("scrolling", "no");

  // Invia shopDomain al widget quando l'iframe è caricato
  iframe.onload = function () {
    iframe.contentWindow.postMessage(
      {
        type: "YUUME_SHOP_DOMAIN",
        shopDomain: SHOP_DOMAIN,
      },
      "*"
    );
  };

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // TRACKING INITIALIZATION
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  console.log("🚀 Yuume tracking initialized:", {
    sessionId: SESSION_ID,
    siteId: SITE_ID,
  });

  // Heartbeat iniziale
  sendHeartbeat();

  // Heartbeat ogni 30 secondi
  const heartbeatInterval = setInterval(sendHeartbeat, 30000);

  // Heartbeat quando user torna sulla tab (visibilitychange)
  document.addEventListener("visibilitychange", function () {
    if (!document.hidden) {
      sendHeartbeat();
    }
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // MESSAGE LISTENER
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  window.addEventListener("message", function (event) {
    // Verifica che il messaggio venga dall'iframe
    if (event.source !== iframe.contentWindow) return;

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // SHOP DOMAIN REQUEST
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (event.data.type === "REQUEST_SHOP_DOMAIN") {
      iframe.contentWindow.postMessage(
        {
          type: "YUUME_SHOP_DOMAIN",
          shopDomain: SHOP_DOMAIN,
        },
        "*"
      );
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // CHAT OPENED (utente apre chat)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (event.data.type === "YUUME_CHAT_OPENED") {
      console.log("💬 Chat opened");
      notifyChatStart();
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // CHAT CLOSED (utente chiude chat)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (event.data.type === "YUUME_CHAT_CLOSED") {
      console.log("🔇 Chat closed");
      notifyChatEnd();
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // ADD TO CART
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (event.data.type === "YUUME_ADD_TO_CART") {
      console.log("📥 Ricevuta richiesta add to cart:", event.data);

      let addDataCache = null;
      let cartCache = null;

      fetch("/cart/add.js", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          items: [
            {
              id: event.data.variantId,
              quantity: event.data.quantity,
            },
          ],
        }),
      })
        .then((response) => {
          if (!response.ok) throw new Error("Errore aggiunta al carrello");
          return response.json();
        })
        .then((addData) => {
          addDataCache = addData;
          console.log("✅ Prodotto aggiunto con successo:", addData);
          return fetch("/cart.js", { credentials: "same-origin" }).then((r) =>
            r.json()
          );
        })
        .then((cart) => {
          cartCache = cart;
          console.log("📊 Carrello completo:", cart);

          // Aggiorna badge numerici
          const itemCount = cart.item_count;
          const cartCountSelectors = [
            ".cart-count-bubble",
            "[data-cart-count]",
            ".cart-count",
            ".cart__count",
            "#CartCount",
            ".header__cart-count",
            '[id*="cart-count" i]',
            '[class*="cart-count" i]',
            ".cart-link__bubble",
            "[data-header-cart-count]",
            "span[data-cart-item-count]",
            ".cart-icon-bubble",
            "#cart-icon-bubble .cart-count-bubble",
          ];

          let badgesUpdated = 0;
          cartCountSelectors.forEach((selector) => {
            document.querySelectorAll(selector).forEach((element) => {
              if (element.classList.contains("cart-count-bubble")) {
                element.innerHTML = `
                  <span aria-hidden="true">${itemCount}</span>
                  <span class="visually-hidden">${itemCount} item${
                  itemCount !== 1 ? "s" : ""
                }</span>
                `;
              } else {
                element.textContent = itemCount;
              }
              if (element.hasAttribute("data-cart-count")) {
                element.setAttribute("data-cart-count", itemCount);
              }
              badgesUpdated++;
            });
          });
          console.log(`✅ ${badgesUpdated} badge(s) del carrello aggiornati`);

          // Auto-detect sections
          const detectedSections = new Set();
          const bubble = document.getElementById("cart-icon-bubble");
          const parentSection =
            bubble && bubble.closest('[id^="shopify-section-"]');
          if (parentSection)
            detectedSections.add(
              parentSection.id.replace("shopify-section-", "")
            );

          [
            "cart-icon-bubble",
            "cart-drawer",
            "cart-notification",
            "header",
          ].forEach((id) => {
            if (document.getElementById(`shopify-section-${id}`))
              detectedSections.add(id);
          });

          const ids = Array.from(detectedSections);
          console.log("🧭 Sections da aggiornare:", ids);

          if (ids.length) {
            return fetch(`/?sections=${ids.join(",")}`, {
              credentials: "same-origin",
            })
              .then((r) => r.json())
              .then((json) => {
                ids.forEach((id) => {
                  const el = document.getElementById(`shopify-section-${id}`);
                  if (el && json[id]) el.innerHTML = json[id];
                });
                console.log(`🔄 Sections aggiornate: ${ids.join(", ")}`);

                document.dispatchEvent(new Event("cart:refresh"));
                document.dispatchEvent(new Event("cart:updated"));
                document.dispatchEvent(
                  new CustomEvent("yuume:cart-updated", { detail: cart })
                );
              })
              .catch((err) =>
                console.warn("Errore aggiornamento sections:", err)
              );
          }
        })
        .then(() => {
          iframe.contentWindow.postMessage(
            {
              type: "YUUME_ADD_TO_CART_RESPONSE",
              success: true,
              data: { addData: addDataCache, cart: cartCache },
            },
            "*"
          );
        })
        .catch((error) => {
          console.error("❌ Errore aggiunta al carrello:", error);
          iframe.contentWindow.postMessage(
            {
              type: "YUUME_ADD_TO_CART_RESPONSE",
              success: false,
              error: error.message,
            },
            "*"
          );
        });
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // RESIZE
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (event.data.type === "resize") {
      if (event.data.enlarged) {
        // Robust mobile detection
        var isMobile = false;
        if (window.matchMedia) {
          isMobile = window.matchMedia("(max-width: 768px)").matches;
        } else {
          isMobile = window.innerWidth <= 768 || window.screen.width <= 768;
        }

        if (isMobile) {
          iframe.style.width = "100%";
          iframe.style.height = "100%";
          iframe.style.bottom = "0px";
          iframe.style.right = "0px";
          iframe.style.top = "0px";
          iframe.style.left = "0px";
        } else {
          iframe.style.width = "680px";
          iframe.style.height = "680px";
          iframe.style.bottom = "0px";
          iframe.style.right = "0px";
          iframe.style.top = "auto";
          iframe.style.left = "auto";
        }
      } else {
        iframe.style.width = "250px";
        iframe.style.height = "250px";
        iframe.style.bottom = "0px";
        iframe.style.right = "0px";
        iframe.style.top = "auto";
        iframe.style.left = "auto";
      }
    }
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CLEANUP ON LEAVE
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  window.addEventListener("beforeunload", function () {
    clearInterval(heartbeatInterval);
    notifyLeave();
  });

  // Anche quando tab viene chiusa (visibilitychange + pagehide come backup)
  window.addEventListener("pagehide", function () {
    notifyLeave();
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // MOUNT IFRAME
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  document.body.appendChild(iframe);
})();
