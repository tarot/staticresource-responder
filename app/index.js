'use strict';

chrome.storage.sync.get(['mapping', 'enabled'], (data) => {
  if (!data.mapping) {
    data = {
      mapping: [],
      enabled: !!data.enabled
    };
    chrome.storage.sync.set({mapping: data});
  }
  document.querySelector('tbody').insertAdjacentHTML('beforeend',
    Array(11).join('<tr><td><input size="40"/></td><td><input size="40"/></td></tr>')
  );
  let rows = document.querySelectorAll('tbody tr');
  data.mapping.forEach((e, i) => {
    let inputs = rows[i].querySelectorAll('input');
    inputs[0].value = e.before;
    inputs[1].value = e.after;
  });
  document.querySelector('input[name="enabled"]').checked = !!data.enabled;
  document.body.style.display = '';
});

document.querySelector('input[name="enabled"]').addEventListener('change', (event) => {
  let submitEvent = document.createEvent('Event');
  submitEvent.initEvent('submit', true, true);
  document.querySelector('form').dispatchEvent(submitEvent);
});

document.querySelector('form').addEventListener('submit', (event) => {
  event.preventDefault();
  let data = {
    mapping: Array.prototype.slice.call(document.querySelectorAll('tbody tr')).map((e) => {
      let inputs = e.querySelectorAll('input');
      return {before: inputs[0].value, after: inputs[1].value};
    }),
    enabled: document.querySelector('input[name="enabled"]').checked
  };
  chrome.storage.sync.set(data);
}, false);
