function Engine() {
  this.init = function () {
    log("Engine Started ");
  };
}

engine = new Engine();

$(document).ready(function () {
  engine.init();
});
