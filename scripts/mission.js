console.log("Mission Improbable");

document.documentElement.classList.replace("no-js", "js");

if (document.location.search) {
  window.history.pushState({}, "", "/");
}
