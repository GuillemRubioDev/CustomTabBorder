let translations = {};

// Load translations and apply current language
fetch("messages.json")
  .then((response) => response.json())
  .then((data) => {
    translations = data;
    applyTranslations();
  });

document.addEventListener("DOMContentLoaded", () => {
  // Load saved settings
  chrome.storage.sync.get(["borderThickness", "language"], (data) => {
    if (data.borderThickness) {
      document.getElementById("borderThickness").value = data.borderThickness;
    }
    if (data.language) {
      document.getElementById("language").value = data.language;
    }
  });

  document.getElementById("save").addEventListener("click", () => {
    const borderThickness = document.getElementById("borderThickness").value;
    const language = document.getElementById("language").value;

    chrome.storage.sync.set(
      {
        borderThickness: borderThickness,
        language: language,
      },
      () => {
        alert(translations[currentLanguage]["settings_saved"]);
      }
    );
  });
});

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
