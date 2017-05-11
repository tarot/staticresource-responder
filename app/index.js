'use strict';

// storage.getハンドラ。storageのデータをフォームに反映する
function initialize(data) {
    const mapping = Array.isArray(data.mapping) ? data.mapping : [];

    Array.from(document.querySelectorAll('tbody tr')).forEach((tr, i) => {
        const [before, after] = tr.querySelectorAll('input');
        const currentMap = mapping[i] || {};
        before.value = currentMap.before || '';
        after.value = currentMap.after || '';
    });

    document.querySelector('[name="enabled"]').checked = !!data.enabled;
}

// submitハンドラ。formをstorageに保存
function handleSubmit(event) {
    event.preventDefault();

    const mapping = Array.from(document.querySelectorAll('tbody tr')).map(tr => {
        const [before, after] = tr.querySelectorAll('input');
        return {before: before.value, after: after.value};
    });
    const enabled = document.querySelector('input[name="enabled"]').checked;

    chrome.storage.sync.set({mapping, enabled});

    Array.from(document.querySelectorAll('.changed')).forEach(e => e.classList.remove('changed'))
}

// inputが変更されたらchangedクラスを付けてマークする。イベントデリゲートを使っている
function markChanged(event) {
    if (event.target.nodeName === 'INPUT') {
        event.target.classList.add('changed');
    }
}

// 有効チェックボックスが変更されたらすぐ保存する。チェックボックスのchangeハンドラ
function handleEnableToggled(event) {
    chrome.storage.sync.set({enabled: event.currentTarget.checked});
}

// background.jsから有効が切り替えられた時にチェックボックスに反映する。storageのchangeハンドラ
function syncCheckbox(changes) {
    const enabled = changes.enabled && changes.enabled.newValue;
    if (enabled != null) {
        document.querySelector('input[name="enabled"]').checked = enabled;
    }
}

// イベントハンドラ設定
chrome.storage.onChanged.addListener(syncCheckbox);
document.querySelector('body').addEventListener('input', markChanged, false);
document.querySelector('input[name="enabled"]').addEventListener('change', handleEnableToggled, false);
document.querySelector('form').addEventListener('submit', handleSubmit, false);

// storageをロード
chrome.storage.sync.get(['mapping', 'enabled'], initialize);