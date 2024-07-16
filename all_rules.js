let translations = {};

// Load translations and apply current language
fetch("messages.json")
  .then((response) => response.json())
  .then((data) => {
    translations = data;
    applyTranslations();
  });

document.addEventListener("DOMContentLoaded", () => {
  displayAllRules();
});

function displayAllRules() {
  chrome.storage.sync.get("rules", (data) => {
    const rules = data.rules || [];
    const rulesList = document.getElementById("rules");
    rulesList.innerHTML = "";
    rules.forEach((rule, index) => {
      const li = document.createElement("li");
      li.innerHTML = `
                <span>${getMatchTypeText(rule.matchType)}</span>
                <span>${rule.url}</span>
                <div class="color-box" style="background-color: ${
                  rule.color
                }" data-index="${index}"></div>
                <button class="delete-btn" data-index="${index}" data-translate="delete">Delete</button>
            `;
      rulesList.appendChild(li);
    });

    document.querySelectorAll(".delete-btn").forEach((button) => {
      button.addEventListener("click", (e) => {
        const index = e.currentTarget.dataset.index;
        rules.splice(index, 1);
        chrome.storage.sync.set({ rules }, displayAllRules);
      });
    });

    document.querySelectorAll(".color-box").forEach((box) => {
      box.addEventListener("click", (e) => {
        const index = e.currentTarget.dataset.index;
        const colorInput = document.createElement("input");
        colorInput.type = "color";
        colorInput.style.position = "absolute";
        colorInput.style.opacity = 0;
        colorInput.value = rules[index].color;
        colorInput.addEventListener("input", (e) => {
          box.style.backgroundColor = e.target.value;
        });
        colorInput.addEventListener("change", (e) => {
          rules[index].color = e.target.value;
          chrome.storage.sync.set({ rules }, displayAllRules);
        });
        colorInput.click();
      });
    });

    applyTranslations();
  });
}

function getMatchTypeText(type) {
  switch (type) {
    case "exact":
      return translations[currentLanguage]["exact_url"];
    case "contains":
      return translations[currentLanguage]["contains_word"];
    case "startsWith":
      return translations[currentLanguage]["starts_with"];
  }
}

function applyTranslations() {
  document.querySelectorAll("[data-translate]").forEach((element) => {
    const key = element.getAttribute("data-translate");
    if (translations[currentLanguage] && translations[currentLanguage][key]) {
      element.textContent = translations[currentLanguage][key];
    }
  });
}

// Load and apply the current language
let currentLanguage = "en";
chrome.storage.sync.get("language", (data) => {
  if (data.language) {
    currentLanguage = data.language;
  }
  applyTranslations();
});
