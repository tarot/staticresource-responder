'use strict';

const ICONS = {
    ENABLED: 'images/icon-128.png',
    DISABLED: 'images/icon-gray-128.png',
};

// グローバル変数。アプリケーションの設定
const config = {
    mapping: [],
    enabled: false,
    get icon () {
        return this.enabled ? ICONS.ENABLED : ICONS.DISABLED;
    }
};

// storageをグローバル変数とアイコンに反映
function updateConfig(data) {
    config.mapping = data.mapping
        .filter(e => e.before && e.after)
        .map(e => ({before: new RegExp(e.before), after: e.after}));
    config.enabled = !!data.enabled;

    updateIcon();
}

// 最初にマッチしたマッピングのリダイレクトURLを返す
function findRedirectUrl(pathAndParams) {
    for (let i = 0, n = config.mapping.length; i < n; ++i) {
        let e = config.mapping[i];
        let match = pathAndParams.match(e.before);
        if (match) {
            // $n の解決
            return e.after.replace(/\$(\d{1,2})/g, (_, n) => match[parseInt(n, 10)] || '');
        }
    }
}

// beforeRequestハンドラ。URLのpathname + searchがマッチしたらリダイレクトする
function route(info) {
    if (!config.enabled) {
        return;
    }
    const url = new URL(info.url);
    const pathAntParams = `${url.pathname}${url.search}`;
    const redirectUrl = findRedirectUrl(pathAntParams);
    if (redirectUrl) {
        return {redirectUrl};
    }
}

// アイコン更新。有効の切り替えを反映する
function updateIcon() {
    chrome.browserAction.setIcon({path: config.icon});
}

// ブラウザアクションのアイコンクリックハンドラ。有効をトグルしてstorageに保存する
// グローバル変数やアイコンには、storageのchangeハンドラで反映する
function toggleEnabled() {
    chrome.storage.sync.set({enabled: !config.enabled});
}

// イベントハンドラ設定
chrome.browserAction.onClicked.addListener(toggleEnabled);

chrome.storage.onChanged.addListener(changes => {
    updateConfig({
        mapping: changes.mapping ? changes.mapping.newValue : config.mapping,
        enabled: changes.enabled ? changes.enabled.newValue : config.enabled,
    });
});

chrome.webRequest.onBeforeRequest.addListener(
    route,
    {
        urls: ['https://*.force.com/*', 'https://*.salesforce.com/*']
    },
    ['blocking']
);

// storageをロード
chrome.storage.sync.get(['mapping', 'enabled'], updateConfig);