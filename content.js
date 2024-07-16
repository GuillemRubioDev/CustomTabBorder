chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.addBorder) {
    chrome.storage.sync.get("borderThickness", (data) => {
      const thickness = data.borderThickness || 2;
      const style = document.createElement("style");
      style.innerHTML = `
              body::before {
                  content: '';
                  position: fixed;
                  top: 0;
                  left: 0;
                  width: 100%;
                  height: 100%;
                  pointer-events: none;
                  box-shadow: inset 0 0 0 ${thickness}px ${request.color}, inset 0 0 10px ${request.color}, inset 0 0 20px ${request.color};
                  z-index: 9999;
                  box-sizing: border-box;
                  background: linear-gradient(to center, ${request.color} 0%, rgba(0, 0, 0, 0) 10%);
              }
          `;
      document.head.appendChild(style);
    });
  }
});
