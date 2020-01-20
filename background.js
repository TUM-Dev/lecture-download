chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (tab.url.match(/streams.tum.de|www.lecturio.de/)) {
        chrome.pageAction.show(tabId);
    } else {
        chrome.pageAction.hide(tabId);
    }
});
