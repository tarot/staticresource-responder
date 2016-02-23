'use strict';

let config = {
  mapping: [],
  enabled: false,
  redirectToOrigin: 'https://localhost:8000'
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
  if (data.redirectToOrigin != null) {
    config.redirectToOrigin = data.redirectToOrigin;
  }
};

chrome.storage.onChanged.addListener((changes) => {
  updateMapping({
    mapping: changes.mapping && changes.mapping.newValue,
    enabled: changes.enabled && changes.enabled.newValue,
    redirectToOrigin: changes.redirectToOrigin && changes.redirectToOrigin.newValue
  });
});
chrome.storage.sync.get(['mapping', 'enabled', 'redirectToOrigin'], updateMapping);

chrome.webRequest.onBeforeRequest.addListener(
  function(info) {
    let staticResource = config.enabled && info.url.match(/^https:\/\/[^\/]+\.force\.com\/resource\/[^\/]+\/(.+)$/);
    let match = staticResource && config.mapping.find((e) => staticResource[1].match(e.before));
    if (match) {
      return {redirectUrl: `${config.redirectToOrigin}/${staticResource[1].replace(match.before, match.after)}`};
    }
  },
  {
    urls: ['https://*.force.com/resource/*']
  },
  ['blocking']
);
