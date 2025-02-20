import commitlintLoad from "@commitlint/load";
import engine from "./src/engine.js";

let startWithGitmoji = true;

const clConfig = await commitlintLoad();
if (clConfig.rules) {
  var startWithGitmojiRule = clConfig.rules["start-with-gitmoji"];
  if (
    typeof startWithGitmojiRule === "object" &&
    startWithGitmojiRule.length == 1 &&
    startWithGitmojiRule[0] === 0
  ) {
    startWithGitmoji = false;
  }
}

export default engine(startWithGitmoji);
