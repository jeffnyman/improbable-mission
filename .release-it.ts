export default {
  git: {
    requireBranch: "main",
    commitMessage: "chore: release v${version}",
    commit: true,
    tag: true,
    push: true,
  },
  hooks: {
    "before:init": "npm run build",
  },
  plugins: {
    "@release-it/conventional-changelog": {
      infile: "CHANGELOG.md",
      preset: "conventionalcommits",
    },
  },
  github: {
    release: true,
    releaseName: "Release ${version}",
    releaseNotes: true,
  },
  npm: {
    publish: false,
  },
};
