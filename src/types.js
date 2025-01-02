import { gitmojis } from "gitmojis";
import cloneDeep from "lodash.clonedeep";
import each from "lodash.foreach";
import includes from "lodash.includes";
import map from "lodash.map";

export const typesRaw = {
  feat: {
    title: "Features",
    description: "A new feature",
    emojiCode: ":sparkles:",
  },
  fix: {
    title: "Bug Fixes",
    description: "A bug fix",
    emojiCode: ":bug:",
  },
  docs: {
    title: "Documentation",
    description: "Documentation only changes",
    emojiCode: ":memo:",
  },
  style: {
    title: "Styles",
    description:
      "Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)",
    emojiCode: ":art:",
  },
  refactor: {
    title: "Code Refactoring",
    description: "A code change that neither fixes a bug nor adds a feature",
    emojiCode: ":package:",
  },
  perf: {
    title: "Performance Improvements",
    description: "A code change that improves performance",
    emojiCode: ":rocket:",
  },
  test: {
    title: "Tests",
    description: "Adding missing tests or correcting existing tests",
    emojiCode: ":test_tube:",
  },
  build: {
    title: "Builds",
    description:
      "Changes that affect the build system or external dependencies (example scopes: gulp, broccoli, npm)",
    emojiCode: ":construction_worker:",
  },
  ci: {
    title: "Continuous Integrations",
    description:
      "Changes to our CI configuration files and scripts (example scopes: Travis, Circle, BrowserStack, SauceLabs)",
    emojiCode: ":recycle:",
  },
  chore: {
    title: "Chores",
    description: "Other changes that don't modify src or test files",
    emojiCode: ":pencil2:",
  },
  revert: {
    title: "Reverts",
    description: "Reverts a previous commit",
    emojiCode: ":rewind:",
  },
};

export function getChoices() {
  const types = cloneDeep(typesRaw);
  each(Object.entries(types), ([key, type]) => {
    const gitmoji = gitmojis.find((gitmoji) => gitmoji.code === type.emojiCode);

    if (!gitmoji) {
      throw new Error(`Gitmoji not found for ${type.emojiCode}`);
    } else if (includes([":recycle:", ":pencil2:"], type.emojiCode)) {
      gitmoji.emoji = `${gitmoji.emoji} `;
    }

    types[key].emoji = gitmoji.emoji;
  });

  return map(types, (type, key) => {
    return {
      value: `${type.emojiCode} ${key}`,
      name: `${type.emoji} ${key}:\t${type.description}`,
    };
  });
}
