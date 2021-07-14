/**
  Don't let TypeKit hide the page while loading
*/
before(function() {
  'use strict';

  var head = document.querySelector('head');
  head.insertAdjacentHTML('beforeend', '<style>.wf-loading { visibility: visible !important; };</style>');
});
