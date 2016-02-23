'use strict';

let config = {
  mapping: [],
  enabled: false
};
let updateMapping = function(data) {
  if (data.mapping) {
    config.mapping = data.mapping.filter((e) => e.before && e.after).map((e) => {
      return {before: new RegExp(e.before), after: e.after};
    });
  }
  if (data.enabled != null) {
    config.enabled = data.enabled;
  }
};

chrome.storage.onChanged.addListener((changes) => {
  updateMapping({
    mapping: changes.mapping && changes.mapping.newValue,
    enabled: changes.enabled && changes.enabled.newValue
  });
});
chrome.storage.sync.get(['mapping', 'enabled'], updateMapping);

chrome.webRequest.onBeforeRequest.addListener(
  function(info) {
    let staticResource = config.enabled && info.url.match(/\https:\/\/[^\/]+\.force\.com\/resource\/[^\/]+\/(.+)$/);
    let match = staticResource && config.mapping.find((e) => staticResource[1].match(e.before));
    if (!match) {
      return;
    }
    return {
      redirectUrl: 'https://localhost:8000/' + staticResource[1].replace(match.before, match.after)
    };
  },
  {
    urls: [
      'https://*.force.com/resource/*'
    ]
  },
  ['blocking']
);
