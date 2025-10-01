# Improbable Mission

_Stay a while ... stay forever._

One of the classic game titles of the 1980s is ["Impossible Mission"](https://en.wikipedia.org/wiki/Impossible_Mission). This game is considered one of the best games ever made for the Commodore 64, ZX Spectrum, and other home computers of that era. This repository is my attempt to recreate that game in a JavaScript format.

## 🛠️ Developing

Clone the repository:

```bash
git clone https://github.com/jeffnyman/improbable-mission.git
cd improbable-mission
```

Get a clean, reproducible install:

```bash
npm ci
```

This ensures you get the exact dependency versions locked in `package-lock.json`.

Husky is used to enforce linting and formatting before commits. The `prepare` script runs automatically when you install dependencies, so your Git hooks are ready to go.

This project uses Vite as the build system, so you can start a dev server:

```bash
npm run dev
```

To build the project:

```bash
npm run build
```

To preview the built project:

```bash
npm run preview
```

## ⚖️ License

The code used in this project is licensed under the [MIT license](https://github.com/jeffnyman/improbable-mission/blob/main/LICENSE).
