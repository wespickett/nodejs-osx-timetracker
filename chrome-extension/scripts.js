var activeTab;
var created = false;

chrome.tabs.onRemoved.addListener(function(closedTabId) {
    if (activeTab && closedTabId === activeTab.id) {
        created = false;
        activeTab = void(0);
    }
});

chrome.browserAction.onClicked.addListener(function() {
    if (!created) {
        created = true;
        chrome.tabs.create({url: chrome.extension.getURL('time-tracking-page.html')}, function(createdTab) {
            activeTab = createdTab;
        });
    } else {
        chrome.tabs.update(activeTab.id, {selected: true});
    }
});