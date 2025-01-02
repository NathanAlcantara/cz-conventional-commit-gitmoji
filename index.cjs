exports.prompter = async (...args) => {
  (await import("./index.js")).default.prompter(...args);
};
