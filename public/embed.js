(function () {
  // Ottieni il parametro shop dall'URL dello script
  const currentScript = document.currentScript || document.querySelector('script[src*="embed.js"]');
  const scriptUrl = currentScript?.src;
  const urlParams = new URLSearchParams(scriptUrl?.split('?')[1] || '');
  const SHOP_DOMAIN = urlParams.get('shop') || window.location.hostname;

  var isDevelopment = window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname === '' ||
    window.location.port === '8080' ||
    window.location.port === '3000';

  var config = {
    development: {
      widgetUrl: 'http://localhost:3000/?embed=true'
    },
    production: {
      widgetUrl: 'https://yuumechat.com/widget/?embed=true'
    }
  };

  var env = isDevelopment ? 'development' : 'production';
  var iframe = document.createElement('iframe');
  iframe.src = config[env].widgetUrl;
  iframe.id = 'yuume-orb-iframe';
  iframe.allow = 'clipboard-write;';
  iframe.style.position = 'fixed';
  iframe.style.bottom = '32px';
  iframe.style.right = '32px';
  iframe.style.zIndex = '999999';
  iframe.style.background = 'transparent';
  iframe.style.border = 'none';
  iframe.style.overflow = 'hidden';
  iframe.style.width = '250px';
  iframe.style.height = '250px';
  iframe.setAttribute('scrolling', 'no');

  // Invia shopDomain al widget quando l'iframe è caricato
  iframe.onload = function () {
    iframe.contentWindow.postMessage({
      type: 'YUUME_SHOP_DOMAIN',
      shopDomain: SHOP_DOMAIN
    }, '*');
  };

  // Listener per messaggi dal widget
  window.addEventListener('message', function (event) {
    // Gestisci richieste di shopDomain dal widget
    if (event.source === iframe.contentWindow && event.data.type === 'REQUEST_SHOP_DOMAIN') {
      iframe.contentWindow.postMessage({
        type: 'YUUME_SHOP_DOMAIN',
        shopDomain: SHOP_DOMAIN
      }, '*');
    }

    // Gestisci add to cart
    if (event.source === iframe.contentWindow && event.data.type === 'YUUME_ADD_TO_CART') {
      console.log('📥 Ricevuta richiesta add to cart:', event.data);

      let addDataCache = null;
      let cartCache = null;

      fetch('/cart/add.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({
          items: [{
            id: event.data.variantId,
            quantity: event.data.quantity
          }]
        })
      })
        .then(response => {
          if (!response.ok) throw new Error('Errore aggiunta al carrello');
          return response.json();
        })
        .then(addData => {
          addDataCache = addData;
          console.log('✅ Prodotto aggiunto con successo:', addData);
          // Fetch del carrello aggiornato
          return fetch('/cart.js', { credentials: 'same-origin' }).then(r => r.json());
        })
        .then(cart => {
          cartCache = cart;
          console.log('📊 Carrello completo:', cart);

          // Aggiorna badge numerici se presenti
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
            '#cart-icon-bubble .cart-count-bubble'
          ];

          let badgesUpdated = 0;
          cartCountSelectors.forEach(selector => {
            document.querySelectorAll(selector).forEach(element => {
              if (element.classList.contains('cart-count-bubble')) {
                element.innerHTML = `
              <span aria-hidden="true">${itemCount}</span>
              <span class="visually-hidden">${itemCount} item${itemCount !== 1 ? 's' : ''}</span>
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
          console.log(`✅ ${badgesUpdated} badge(s) del carrello aggiornati`);

          // === NUOVO SISTEMA AUTO-DETECT SECTIONS ===
          const detectedSections = new Set();

          // 1) Se c'è il bubble, prendi la sua section parent
          const bubble = document.getElementById('cart-icon-bubble');
          const parentSection = bubble && bubble.closest('[id^="shopify-section-"]');
          if (parentSection) detectedSections.add(parentSection.id.replace('shopify-section-', ''));

          // 2) Aggiungi classici se esistono
          ['cart-icon-bubble', 'cart-drawer', 'cart-notification', 'header'].forEach(id => {
            if (document.getElementById(`shopify-section-${id}`)) detectedSections.add(id);
          });

          const ids = Array.from(detectedSections);
          console.log('🧭 Sections da aggiornare:', ids);

          if (ids.length) {
            return fetch(`/?sections=${ids.join(',')}`, { credentials: 'same-origin' })
              .then(r => r.json())
              .then(json => {
                ids.forEach(id => {
                  const el = document.getElementById(`shopify-section-${id}`);
                  if (el && json[id]) el.innerHTML = json[id];
                });
                console.log(`🔄 Sections aggiornate: ${ids.join(', ')}`);

                // Dispatch eventi dopo aggiornamento
                document.dispatchEvent(new Event('cart:refresh'));
                document.dispatchEvent(new Event('cart:updated'));
                document.dispatchEvent(new CustomEvent('yuume:cart-updated', { detail: cart }));
              })
              .catch(err => console.warn('Errore aggiornamento sections:', err));
          }
        })
        .then(() => {
          // Invia risposta al widget
          iframe.contentWindow.postMessage({
            type: 'YUUME_ADD_TO_CART_RESPONSE',
            success: true,
            data: { addData: addDataCache, cart: cartCache }
          }, '*');
        })
        .catch(error => {
          console.error('❌ Errore aggiunta al carrello:', error);
          iframe.contentWindow.postMessage({
            type: 'YUUME_ADD_TO_CART_RESPONSE',
            success: false,
            error: error.message
          }, '*');
        });
    }

    // Gestisci resize esistente
    if (event.data.type === 'resize') {
      if (event.data.enlarged) {
        iframe.style.width = '680px';
        iframe.style.height = '680px';
        iframe.style.bottom = '0px';
        iframe.style.right = '0px';
      } else {
        iframe.style.width = '250px';
        iframe.style.height = '250px';
        iframe.style.bottom = '32px';
        iframe.style.right = '32px';
      }
    }
  });

  document.body.appendChild(iframe);
})();