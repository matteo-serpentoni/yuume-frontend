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