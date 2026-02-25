(function () {
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CONFIGURAZIONE
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const currentScript = document.currentScript || document.querySelector('script[src*="embed.js"]');
  const scriptUrl = currentScript?.src;

  let shopParam = '';
  let siteIdParam = '';

  if (scriptUrl) {
    try {
      const url = new URL(scriptUrl);
      shopParam = url.searchParams.get('shop');
      siteIdParam = url.searchParams.get('siteId');
    } catch (e) {
      // Error parsing script URL
    }
  }

  const SHOP_DOMAIN = shopParam || window.location.hostname;
  const SITE_ID = siteIdParam || 'shopify_' + SHOP_DOMAIN.split('.')[0];

  const isDevelopment =
    ['localhost', '127.0.0.1', ''].includes(window.location.hostname) ||
    ['8080', '3000', '5173'].includes(window.location.port);

  const config = {
    development: {
      widgetUrl: 'http://localhost:5173/?embed=true',
      apiUrl: 'http://localhost:5001',
    },
    production: {
      widgetUrl: 'https://yuumechat.com/widget/?embed=true',
      apiUrl: 'https://yuume-backend-production.up.railway.app',
    },
  };

  const env = isDevelopment ? 'development' : 'production';
  const API_URL = config[env].apiUrl;
  const WIDGET_URL = config[env].widgetUrl;
  const WIDGET_ORIGIN = new URL(WIDGET_URL).origin;

  // Genera session ID univoco
  const SESSION_ID = generateSessionId();

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // UTILITY FUNCTIONS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  function generateSessionId() {
    return 'sess_' + Math.random().toString(36).substr(2, 9) + Date.now();
  }

  function getVisitorId() {
    // Prova a leggere da localStorage (persiste tra sessioni)
    let visitorId = localStorage.getItem('yuume_visitor_id');

    if (!visitorId) {
      visitorId = 'visitor_' + Math.random().toString(36).substr(2, 9) + Date.now();
      localStorage.setItem('yuume_visitor_id', visitorId);
    }

    return visitorId;
  }

  function getShopifyIdentity() {
    try {
      // 1. Standard Shopify Analytics (ID only)
      const customerId = window.ShopifyAnalytics?.meta?.page?.customerId;

      // 2. Extended Shopify object (some themes include this)
      const customer = window.Shopify?.customer;

      // 3. Fallback: Shopify __st object
      const stCustomerId = window.__st?.cid;

      // 4. Fallback: Trekkie library (often present in Shopify stores)
      const trekkieId = window.ShopifyAnalytics?.lib?.trekkie?.customer?.id;

      const finalId = customerId || customer?.id || stCustomerId || trekkieId;
      const finalEmail =
        customer?.email || window.ShopifyAnalytics?.lib?.trekkie?.customer?.email || null;

      if (finalId) {
        return {
          id: finalId,
          email: finalEmail ? finalEmail.toLowerCase() : null, // Normalize email
          isVerified: true,
        };
      }
    } catch (e) {
      // Silent error for identity detection
    }
    return null;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // TRACKING FUNCTIONS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  function sendHeartbeat() {
    fetch(API_URL + '/api/tracking/heartbeat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        siteId: SITE_ID,
        sessionId: SESSION_ID,
        currentPage: window.location.pathname,
        visitorId: getVisitorId(),
      }),
    }).catch(() => {});
  }

  function notifyChatStart() {
    fetch(API_URL + '/api/tracking/chat-start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: SESSION_ID }),
    }).catch(() => {});
  }

  function notifyChatEnd() {
    fetch(API_URL + '/api/tracking/chat-end', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: SESSION_ID }),
    }).catch(() => {});
  }

  function notifyLeave() {
    // Usa sendBeacon per affidabilità (funziona anche durante beforeunload)
    const url = API_URL + '/api/tracking/leave';
    const data = JSON.stringify({ sessionId: SESSION_ID });

    if (navigator.sendBeacon) {
      navigator.sendBeacon(url, data);
    } else {
      fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: data,
        keepalive: true,
      }).catch(() => {});
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // IFRAME SETUP
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const iframe = document.createElement('iframe');
  // Add timestamp to prevent caching of the widget itself
  const widgetUrl = WIDGET_URL;
  const separator = widgetUrl.includes('?') ? '&' : '?';
  iframe.src = widgetUrl + separator + 't=' + Date.now();

  iframe.id = 'yuume-orb-iframe';
  iframe.allow = 'clipboard-write;';
  iframe.style.position = 'fixed';
  iframe.style.bottom = '0px';
  iframe.style.right = '0px';
  iframe.style.zIndex = '999999';
  iframe.style.background = 'transparent';
  iframe.style.border = 'none';
  iframe.style.overflow = 'hidden';
  iframe.style.width = '250px';
  iframe.style.height = '250px';
  iframe.setAttribute('scrolling', 'no');

  // Invia shopDomain al widget quando l'iframe è caricato
  iframe.onload = function () {
    const identity = getShopifyIdentity();
    iframe.contentWindow.postMessage(
      {
        type: 'YUUME:shopDomain',
        shopDomain: SHOP_DOMAIN,
        shopifyCustomer: identity, // Pass identity on load
      },
      WIDGET_ORIGIN,
    );
  };

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // TRACKING INITIALIZATION
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Tracking initialized

  // Heartbeat iniziale
  sendHeartbeat();

  // Heartbeat ogni 30 secondi
  const heartbeatInterval = setInterval(sendHeartbeat, 30000);

  // Heartbeat quando user torna sulla tab (visibilitychange)
  document.addEventListener('visibilitychange', function () {
    if (!document.hidden) {
      sendHeartbeat();
    }
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CART SYNC (detect store-side changes)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  let lastCartCount = -1;

  function syncCart() {
    fetch('/cart.js', { credentials: 'same-origin' })
      .then(function (r) {
        return r.json();
      })
      .then(function (cart) {
        var count = cart.item_count || 0;
        // Only send update if item count actually changed
        if (count !== lastCartCount) {
          lastCartCount = count;
          iframe.contentWindow.postMessage({ type: 'YUUME:cartUpdate', cart: cart }, WIDGET_ORIGIN);
        }
      })
      .catch(function () {});
  }

  // Poll every 5 seconds (lightweight — /cart.js is cached by Shopify CDN)
  const cartSyncInterval = setInterval(syncCart, 5000);

  // Also sync on Shopify theme cart events
  ['cart:refresh', 'cart:updated', 'yuume:cart-updated'].forEach(function (evt) {
    document.addEventListener(evt, syncCart);
  });

  // Sync on page focus (user comes back from another tab)
  document.addEventListener('visibilitychange', function () {
    if (!document.hidden) syncCart();
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // MESSAGE LISTENER
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  window.addEventListener('message', function (event) {
    // Verifica che il messaggio venga dall'origine corretta
    if (event.origin !== WIDGET_ORIGIN) return;

    // Verifica che il messaggio venga dall'iframe
    if (event.source !== iframe.contentWindow) return;

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // SHOP DOMAIN REQUEST
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (event.data.type === 'YUUME:requestShopDomain') {
      iframe.contentWindow.postMessage(
        {
          type: 'YUUME:shopDomain',
          shopDomain: SHOP_DOMAIN,
        },
        WIDGET_ORIGIN,
      );
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // IDENTITY REQUEST (from widget Ready)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (event.data.type === 'YUUME:ready') {
      const identity = getShopifyIdentity();
      iframe.contentWindow.postMessage(
        {
          type: 'YUUME:identity',
          customer: identity,
        },
        WIDGET_ORIGIN,
      );
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // CHAT OPENED (utente apre chat)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (event.data.type === 'YUUME:chatOpened') {
      notifyChatStart();
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // CHAT CLOSED (utente chiude chat)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (event.data.type === 'YUUME:chatClosed') {
      notifyChatEnd();
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // GET CART
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (event.data.type === 'YUUME:getCart') {
      syncCart();
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // ADD TO CART
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (event.data.type === 'YUUME:addToCart') {
      let addDataCache = null;
      let cartCache = null;

      fetch('/cart/add.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
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
          if (!response.ok) throw new Error('Errore aggiunta al carrello');
          return response.json();
        })
        .then((addData) => {
          addDataCache = addData;
          return fetch('/cart.js', { credentials: 'same-origin' }).then((r) => r.json());
        })
        .then((cart) => {
          cartCache = cart;

          // Aggiorna badge numerici
          const itemCount = cart.item_count;
          const cartCountSelectors = [
            '.cart-count-bubble',
            '[data-cart-count]',
            '.cart-count',
            '.cart__count',
            '#CartCount',
            '.header__cart-count',
            '[id*="cart-count" i]',
            '[class*="cart-count" i]',
            '.cart-link__bubble',
            '[data-header-cart-count]',
            'span[data-cart-item-count]',
            '.cart-icon-bubble',
            '#cart-icon-bubble .cart-count-bubble',
          ];

          let badgesUpdated = 0;
          cartCountSelectors.forEach((selector) => {
            document.querySelectorAll(selector).forEach((element) => {
              if (element.classList.contains('cart-count-bubble')) {
                element.innerHTML = `
                  <span aria-hidden="true">${itemCount}</span>
                  <span class="visually-hidden">${itemCount} item${
                    itemCount !== 1 ? 's' : ''
                  }</span>
                `;
              } else {
                element.textContent = itemCount;
              }
              if (element.hasAttribute('data-cart-count')) {
                element.setAttribute('data-cart-count', itemCount);
              }
              badgesUpdated++;
            });
          });

          // Auto-detect sections
          const detectedSections = new Set();
          const bubble = document.getElementById('cart-icon-bubble');
          const parentSection = bubble && bubble.closest('[id^="shopify-section-"]');
          if (parentSection) detectedSections.add(parentSection.id.replace('shopify-section-', ''));

          ['cart-icon-bubble', 'cart-drawer', 'cart-notification', 'header'].forEach((id) => {
            if (document.getElementById(`shopify-section-${id}`)) detectedSections.add(id);
          });

          const ids = Array.from(detectedSections);

          if (ids.length) {
            return fetch(`/?sections=${ids.join(',')}`, {
              credentials: 'same-origin',
            })
              .then((r) => r.json())
              .then((json) => {
                ids.forEach((id) => {
                  const el = document.getElementById(`shopify-section-${id}`);
                  if (el && json[id]) el.innerHTML = json[id];
                });

                document.dispatchEvent(new Event('cart:refresh'));
                document.dispatchEvent(new Event('cart:updated'));
                document.dispatchEvent(new CustomEvent('yuume:cart-updated', { detail: cart }));
              })
              .catch(() => {});
          }
        })
        .then(() => {
          iframe.contentWindow.postMessage(
            {
              type: 'YUUME:addToCartResponse',
              success: true,
              data: { addData: addDataCache, cart: cartCache },
            },
            WIDGET_ORIGIN,
          );
        })
        .catch((error) => {
          iframe.contentWindow.postMessage(
            {
              type: 'YUUME:addToCartResponse',
              success: false,
              error: error.message,
            },
            WIDGET_ORIGIN,
          );
        });
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // CHECKOUT
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (event.data.type === 'YUUME:checkout') {
      window.open('/checkout', '_blank');
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // RESIZE
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (event.data.type === 'YUUME:resize') {
      const { enlarged, width, height } = event.data;

      if (enlarged) {
        // Robust mobile detection
        const isMobile = window.matchMedia
          ? window.matchMedia('(max-width: 768px)').matches
          : window.innerWidth <= 768;

        if (isMobile) {
          iframe.style.width = '100%';
          iframe.style.height = '100%';
          iframe.style.bottom = '0px';
          iframe.style.right = '0px';
          iframe.style.top = '0px';
          iframe.style.left = '0px';
        } else {
          // Use provided dimensions or fallback to default enlarged size
          iframe.style.width = (width || 680) + 'px';
          iframe.style.height = (height || 680) + 'px';
          iframe.style.bottom = '0px';
          iframe.style.right = '0px';
          iframe.style.top = 'auto';
          iframe.style.left = 'auto';
        }
      } else {
        // Minimized state - increased area for glow and proactive cards
        // Increased from 250px to 350px to allow room for 'CIAO' cards and glow
        iframe.style.width = (width || 350) + 'px';
        iframe.style.height = (height || 350) + 'px';
        iframe.style.bottom = '0px';
        iframe.style.right = '0px';
        iframe.style.top = 'auto';
        iframe.style.left = 'auto';
      }
    }
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CLEANUP ON LEAVE
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  window.addEventListener('beforeunload', function () {
    clearInterval(heartbeatInterval);
    clearInterval(cartSyncInterval);
    notifyLeave();
  });

  // Anche quando tab viene chiusa (visibilitychange + pagehide come backup)
  window.addEventListener('pagehide', function () {
    notifyLeave();
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // MOUNT IFRAME
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  document.body.appendChild(iframe);
})();
