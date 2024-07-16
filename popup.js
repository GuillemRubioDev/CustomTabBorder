let translations = {};

// Load translations and apply current language
fetch("messages.json")
  .then((response) => response.json())
  .then((data) => {
    translations = data;
    chrome.storage.sync.get("language", (data) => {
      let currentLanguage = data.language || "en";
      applyTranslations(currentLanguage);
      displayRules(currentLanguage); // Ensure rules are displayed with correct language
    });
  });

document.getElementById("colorPreview").addEventListener("click", () => {
  const colorInput = document.createElement("input");
  colorInput.type = "color";
  colorInput.style.position = "absolute";
  colorInput.style.opacity = 0;
  colorInput.addEventListener("input", (e) => {
    document.getElementById("colorPreview").style.backgroundColor =
      e.target.value;
    document.getElementById("colorPreview").style.color = getContrastingColor(
      e.target.value
    );
    document.getElementById("color").value = e.target.value;
    toggleAddButton();
  });
  colorInput.click();
});

function getContrastingColor(hex) {
  const r = parseInt(hex.substr(1, 2), 16);
  const g = parseInt(hex.substr(3, 2), 16);
  const b = parseInt(hex.substr(5, 2), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? "black" : "white";
}

document.getElementById("url").addEventListener("input", toggleAddButton);

function toggleAddButton() {
  const url = document.getElementById("url").value.trim();
  const color = document.getElementById("color").value;
  document.getElementById("add").disabled = !url || color === "#ffffff";
}

document.getElementById("add").addEventListener("click", () => {
  const url = document.getElementById("url").value.trim();
  const color = document.getElementById("color").value;
  const matchType = document.getElementById("matchType").value;

  chrome.storage.sync.get("rules", (data) => {
    const rules = data.rules || [];
    rules.push({ url, color, matchType });
    chrome.storage.sync.set({ rules }, () => {
      displayRules(currentLanguage);
      document.getElementById("url").value = "";
      document.getElementById("color").value = "#ffffff";
      document.getElementById("colorPreview").style.backgroundColor = "#ffffff";
      document.getElementById("colorPreview").style.color =
        getContrastingColor("#ffffff");
      document.getElementById("matchType").value = "exact";
      toggleAddButton();
    });
  });
});

function displayRules(currentLanguage) {
  chrome.storage.sync.get("rules", (data) => {
    const rules = data.rules || [];
    const rulesList = document.getElementById("rules");
    rulesList.innerHTML = "";
    rules.slice(0, 5).forEach((rule, index) => {
      const li = document.createElement("li");
      li.innerHTML = `
                <span>${getMatchTypeText(
                  rule.matchType,
                  currentLanguage
                )}</span>
                <span>${rule.url}</span>
                <div class="color-box" style="background-color: ${
                  rule.color
                }" data-index="${index}"></div>
                <button class="delete-btn" data-index="${index}" data-translate="delete">${
        translations[currentLanguage]["delete"]
      }</button>
            `;
      rulesList.appendChild(li);
    });

    if (rules.length > 5) {
      const li = document.createElement("li");
      li.innerHTML = `<button id="viewMore" data-translate="view_more">${translations[currentLanguage]["view_more"]}</button>`;
      rulesList.appendChild(li);
      document.getElementById("viewMore").addEventListener("click", () => {
        chrome.tabs.create({ url: chrome.runtime.getURL("all_rules.html") });
      });
    }

    document.querySelectorAll(".delete-btn").forEach((button) => {
      button.addEventListener("click", (e) => {
        const index = e.currentTarget.dataset.index;
        rules.splice(index, 1);
        chrome.storage.sync.set({ rules }, () => displayRules(currentLanguage));
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
          chrome.storage.sync.set({ rules }, () =>
            displayRules(currentLanguage)
          );
        });
        colorInput.click();
      });
    });

    applyTranslations(currentLanguage);
  });
}

function getMatchTypeText(type, currentLanguage) {
  switch (type) {
    case "exact":
      return translations[currentLanguage]["exact_url"];
    case "contains":
      return translations[currentLanguage]["contains_word"];
    case "startsWith":
      return translations[currentLanguage]["starts_with"];
  }
}

// Handle language switching
document
  .getElementById("set-lang-en")
  .addEventListener("click", () => setLanguage("en"));
document
  .getElementById("set-lang-es")
  .addEventListener("click", () => setLanguage("es"));

function setLanguage(lang) {
  chrome.storage.sync.set({ language: lang }, () => {
    applyTranslations(lang);
    displayRules(lang);
  });
}

function applyTranslations(currentLanguage) {
  document.querySelectorAll("[data-translate]").forEach((element) => {
    const key = element.getAttribute("data-translate");
    if (translations[currentLanguage] && translations[currentLanguage][key]) {
      element.textContent = translations[currentLanguage][key];
    }
  });
}

// Ensure rules are displayed when popup is opened
document.addEventListener("DOMContentLoaded", () => {
  chrome.storage.sync.get("language", (data) => {
    let currentLanguage = data.language || "en";
    applyTranslations(currentLanguage);
    displayRules(currentLanguage);
  });
});
