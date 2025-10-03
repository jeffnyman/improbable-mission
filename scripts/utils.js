class Utils {
  rnd(limit) {
    return Math.floor(Math.random() * limit) + 1;
  }
}

export const utils = new Utils();
