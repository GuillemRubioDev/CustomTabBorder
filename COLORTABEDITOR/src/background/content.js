chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.addBorder) {
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
        box-shadow: inset 0 0 0 3px ${request.color}, inset 0 0 5px ${request.color}, inset 0 0 10px ${request.color};
        z-index: 9999;
        box-sizing: border-box;
        background: linear-gradient(to center, ${request.color} 0%, rgba(0, 0, 0, 0) 50%);
      }
    `;
    document.head.appendChild(style);
  }
});
