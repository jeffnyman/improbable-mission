class CommonUtils {
  setInterfaceText(id: string, text: string) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  showError(message: string) {
    console.log(message);
    document.getElementById("loading")?.classList.add("hidden");

    const errorDiv = document.getElementById("error");

    if (errorDiv) {
      const abortedContainer = errorDiv.querySelector(".aborted-container");

      if (abortedContainer) {
        this.setInterfaceText("message", `Mission Aborted: ${message}`);
      }

      errorDiv.classList.remove("hidden");
    }
  }
}

export const utils: CommonUtils = new CommonUtils();
