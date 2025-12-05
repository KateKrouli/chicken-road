(() => {
  // src/js/main.js
  document.addEventListener("DOMContentLoaded", function() {
    console.log("Chicken Road Demo \u0437\u0430\u0433\u0440\u0443\u0436\u0430\u0435\u0442\u0441\u044F...");
    if (!checkCanvasSupport()) {
      showError("\u0412\u0430\u0448 \u0431\u0440\u0430\u0443\u0437\u0435\u0440 \u043D\u0435 \u043F\u043E\u0434\u0434\u0435\u0440\u0436\u0438\u0432\u0430\u0435\u0442 Canvas. \u041F\u043E\u0436\u0430\u043B\u0443\u0439\u0441\u0442\u0430, \u043E\u0431\u043D\u043E\u0432\u0438\u0442\u0435 \u0431\u0440\u0430\u0443\u0437\u0435\u0440.");
      return;
    }
    if (!checkLocalStorageSupport()) {
      showWarning("LocalStorage \u043D\u0435 \u043F\u043E\u0434\u0434\u0435\u0440\u0436\u0438\u0432\u0430\u0435\u0442\u0441\u044F. \u041F\u0440\u043E\u0433\u0440\u0435\u0441\u0441 \u043D\u0435 \u0431\u0443\u0434\u0435\u0442 \u0441\u043E\u0445\u0440\u0430\u043D\u0435\u043D.");
    }
    UIManager.init();
    console.log("\u0418\u0433\u0440\u0430 \u0433\u043E\u0442\u043E\u0432\u0430 \u043A \u0437\u0430\u043F\u0443\u0441\u043A\u0443!");
    setTimeout(() => {
      UIManager.showNotification("\u0414\u043E\u0431\u0440\u043E \u043F\u043E\u0436\u0430\u043B\u043E\u0432\u0430\u0442\u044C \u0432 Chicken Road Demo!", "success");
    }, 1e3);
  });
  function checkCanvasSupport() {
    const canvas = document.createElement("canvas");
    return !!(canvas.getContext && canvas.getContext("2d"));
  }
  function checkLocalStorageSupport() {
    try {
      localStorage.setItem("test", "test");
      localStorage.removeItem("test");
      return true;
    } catch (e) {
      return false;
    }
  }
  function showError(message) {
    const container = document.querySelector(".container");
    if (container) {
      container.innerHTML = `
            <div class="error-message">
                <h2><i class="fas fa-exclamation-triangle"></i> \u041E\u0448\u0438\u0431\u043A\u0430</h2>
                <p>${message}</p>
                <p>\u041F\u043E\u0436\u0430\u043B\u0443\u0439\u0441\u0442\u0430, \u043E\u0431\u043D\u043E\u0432\u0438\u0442\u0435 \u0431\u0440\u0430\u0443\u0437\u0435\u0440 \u0438\u043B\u0438 \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u0443\u0439\u0442\u0435 \u0434\u0440\u0443\u0433\u043E\u0439 \u0431\u0440\u0430\u0443\u0437\u0435\u0440.</p>
            </div>
        `;
    }
  }
  function showWarning(message) {
    console.warn(message);
  }
  document.addEventListener("keydown", function(e) {
    if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") {
      return;
    }
    switch (e.key.toLowerCase()) {
      case "arrowup":
      case "w":
        e.preventDefault();
        document.getElementById("moveUp").click();
        UIManager.animateButton("moveUp", "pulse");
        break;
      case "arrowdown":
      case "s":
        e.preventDefault();
        document.getElementById("moveDown").click();
        UIManager.animateButton("moveDown", "pulse");
        break;
      case " ":
      case "enter":
        e.preventDefault();
        document.getElementById("startBtn").click();
        break;
      case "a":
        e.preventDefault();
        document.getElementById("autoBtn").click();
        break;
      case "r":
        e.preventDefault();
        document.getElementById("resetBtn").click();
        break;
      case "m":
        e.preventDefault();
        document.getElementById("addCoinsBtn").click();
        break;
    }
  });
  window.addEventListener("beforeunload", function() {
    if (typeof ChickenRoadGame !== "undefined" && ChickenRoadGame.saveState) {
      ChickenRoadGame.saveState();
    }
  });
})();
