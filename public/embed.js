(function() {
  var iframe = document.createElement('iframe');
  iframe.src = 'http://localhost:3000/widget.html';
  iframe.id = 'yuume-orb-iframe';
  iframe.allow = 'clipboard-write;';
  iframe.style.position = 'fixed';
  iframe.style.bottom = '32px';
  iframe.style.right = '32px';
  iframe.style.zIndex = '999999';
  iframe.style.background = 'transparent';
  iframe.style.border = 'none';
  iframe.style.overflow = 'hidden';
  // Dimensioni iniziali più grandi per contenere l'orb
  iframe.style.width = '250px';
  iframe.style.height = '250px';
  iframe.setAttribute('scrolling', 'no');
  
  // Listener per messaggi dal widget
  window.addEventListener('message', function(event) {
    if (event.data.type === 'resize') {
      if (event.data.enlarged) {
        // Chat aperta - iframe più piccolo
        iframe.style.width = '680px';
        iframe.style.height = '680px';
        iframe.style.bottom = '0px';
        iframe.style.right = '0px';
      } else {
        // Orb piccolo - iframe più grande per non tagliare
        iframe.style.width = '250px';
        iframe.style.height = '250px';
        iframe.style.bottom = '32px';
        iframe.style.right = '32px';
      }
    }
  });
  
  document.body.appendChild(iframe);
})();