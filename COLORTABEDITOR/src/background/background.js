chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ rules: [] });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url) {
    chrome.storage.sync.get("rules", (data) => {
      const rules = data.rules || [];
      const matchedRule = rules.find((rule) =>
        rule.matchType === "exact"
          ? tab.url === rule.url
          : rule.matchType === "contains"
          ? tab.url.includes(rule.url)
          : tab.url.startsWith(rule.url)
      );

      if (matchedRule) {
        chrome.scripting.executeScript(
          {
            target: { tabId: tabId },
            files: ["src/background/content.js"],
          },
          () => {
            if (chrome.runtime.lastError) {
              console.error("Error:", chrome.runtime.lastError.message);
            } else {
              chrome.tabs.sendMessage(tabId, {
                color: matchedRule.color,
                addBorder: true,
              });
            }
          }
        );
      }
    });
  }
});
