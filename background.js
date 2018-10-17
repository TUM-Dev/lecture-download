
const pageStateMatcherForHost = host => {
  return new chrome.declarativeContent.PageStateMatcher({
    pageUrl: { hostEquals: host }
  });
};

// Whenever the extension is installed or updated, we replace all old rules w/ a new one,
// which enables the page action on all matching hosts

chrome.runtime.onInstalled.addListener(() => {
  chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
    chrome.declarativeContent.onPageChanged.addRules([{
      conditions: [
          'streams.tum.de', 'www.lecturio.de'
      ].map(pageStateMatcherForHost),
      actions: [ new chrome.declarativeContent.ShowPageAction() ]
    }]);
  });
});
