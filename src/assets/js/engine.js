function Engine() {
  this.init = function () {
    log("Engine Started ");

    // If there is a query portion to the URL, add the current
    // index to the browser's session history stack.

    if (document.location.search != "") {
      window.history.pushState(false, false, "/");
    }

    engine.checkCapabilities(
      function () {
        log("Check capabilities: SUCCESS");

        // Enable the menu interface.
        engine.initMenu();
      },
      function () {
        $("#unsupported").removeClass("hidden");
      },
    );
  };

  this.initMenu = function () {
    log("Initializing menu ...");

    $(".button-dossier").click(function () {
      $("#overlay, #dossier").removeClass("hidden");
    });

    $("#overlay").click(function () {
      $("#overlay, #dossier").addClass("hidden");
    });
  };

  this.checkCapabilities = function (success, fail) {
    log("Checking capabilities ...");

    var allGood = true;

    // Check if canvas creation is possible.
    var testCanvas = document.createElement("canvas");

    if (!(testCanvas.getContext && testCanvas.getContext("2d"))) {
      allGood = false;
    }

    // Check if requestAnimationFrame is available.
    if (!window.requestAnimationFrame) {
      allGood = false;
    }

    if (allGood) {
      success();
    } else {
      fail();
    }
  };
}

engine = new Engine();

$(document).ready(function () {
  engine.init();
});
