# Improbable Mission

_Stay a while ... stay forever._

One of the classic game titles of the 1980s is ["Impossible Mission"](https://en.wikipedia.org/wiki/Impossible_Mission). This game is considered one of the best games ever made for the Commodore 64, ZX Spectrum, and other home computers of that era. This repository is my attempt to recreate that game in a JavaScript format.

## 🛠️ Developing

Make sure you have [Node.js](https://nodejs.org/en). The LTS version should be fine. You will also need the `npm` package manager, which comes with Node.js. A development environment or IDE with TypeScript/JavaScript support will help. [Visual Studio Code](https://code.visualstudio.com/) is a good choice.

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

### 🧬 Code Quality

This project uses Prettier.

<p align="center">
  <a href="https://prettier.io/docs/en/index.html"><img src="https://img.shields.io/badge/Documentation-Prettier-f7ba3e.svg?logo=prettier" alt="Prettier"></a>
  <a href="https://github.com/prettier/prettier"><img src="https://img.shields.io/badge/GitHub-Prettier-f7ba3e.svg?logo=github" alt="Prettier - GitHub"></a>
  <a href="https://stackoverflow.com/questions/tagged/prettier"><img src="https://img.shields.io/badge/stackoverflow-Prettier-e87922.svg?logo=stackoverflow" alt="Prettier - Stack Overflow"></a>
</p>

Prettier is run as part of the precommit hooks. If you want to manually run Prettier and automatically fix any issues, you can do this:

```bash
npm run format
```

This project uses ESLint.

<p align="center">
  <a href="https://eslint.org/docs/latest/"><img src="https://img.shields.io/badge/Documentation-ESLint-4b32c3.svg?logo=eslint" alt="ESLint"></a>
  <a href="https://github.com/eslint/eslint"><img src="https://img.shields.io/badge/GitHub-ESLint-4b32c3.svg?logo=github" alt="ESLint - GitHub"></a>
  <a href="https://stackoverflow.com/questions/tagged/eslint"><img src="https://img.shields.io/badge/stackoverflow-ESLint-e87922.svg?logo=stackoverflow" alt="ESLint - Stack Overflow"></a>
</p>

Linting is also run as part of the precommit hooks. If you want to perform lint checks manually, you can do this:

```shell
npm run lint
```

If you're feeling confident that the linter will be able to auto-fix any issues, you can run it like this:

```shell
npm run lint:fix
```

## 👨‍💻 Author

<p align="center">
  Made with 🤍 by <a href="https://github.com/jeffnyman">Jeff Nyman</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/javascript-3670A0?style=for-the-badge&logo=javascript&logoColor=ffdd54">
</p>

<p align="center">
  <a href="https://testerstories.com" target="_blank" ><img alt="Website - Jeff Nyman" src="https://img.shields.io/badge/Website--%23F8952D?style=social"></a>&nbsp;&nbsp;&nbsp;
  <a href="https://www.linkedin.com/in/jeffnyman/" target="_blank" ><img alt="Linkedin - Jeff Nyman" src="https://img.shields.io/badge/Linkedin--%23F8952D?style=social&logo=linkedin"></a>
</p>

## ☦️ Doxazein (δοξάζειν)

<p align="center">
  חֶסֶד וֶאֱמֶת אַל־יַעַזְבֻךָ קָשְׁרֵם עַל־גַּרְגְּרֹתֶיךָ כָּתְבֵם עַל־לוּחַ לִבֶּךָ
</p>

<p align="center">
"Let not mercy and truth forsake thee:<br>
bind them about thy neck;<br>
write them upon the table of thine heart."<br>
<em>Proverbs 3:3</em>
</p>

## ⚖️ License

The code used in this project is licensed under the [MIT license](https://github.com/jeffnyman/improbable-mission/blob/main/LICENSE).
