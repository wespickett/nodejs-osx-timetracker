chrome.browserAction.onClicked.addListener(function() {
    chrome.tabs.create({url: chrome.extension.getURL('time-tracking-page.html')});
});