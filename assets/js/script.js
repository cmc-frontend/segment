var doc = document;

// clipboard
var clipboard = new Clipboard('.copy-button', {
  text: function (trigger) {
    return doc.querySelector(trigger.getAttribute('data-clipboard-target'))
      .textContent
      .replace(/s$/g, '');
  }
});
clipboard.on('success', function(e) {
    var content = e.trigger.innerHTML;
    
    e.trigger.classList.add('copied');
    e.trigger.innerHTML = 'Copied';
    setTimeout(function () {
      e.trigger.classList.remove('copied');
      e.trigger.innerHTML = content;
    }, 1000);

    e.clearSelection();
});

clipboard.on('error', function(e) {
    console.error('Action:', e.action);
    console.error('Trigger:', e.trigger);
});

var htmlEle = doc.querySelector('html');
htmlEle.classList.remove('no-js');
htmlEle.classList.add('js');