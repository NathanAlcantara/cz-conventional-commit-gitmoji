import { expect } from "chai";
import chalk from "chalk";
import engine from "../src/engine.js";

const maxLineWidth = 100;
const maxHeaderWidth = 100;

const type = "func";
const subject = "testing123";
const longSubject =
  "testing123 testing123 testing123 testing123 testing123 testing123 testing123 testing123 testing123";

const affectIssues = "AFFECTED ISSUES: ";
const issues = "#ISSUE-123, #ISSUES-4321";
const longIssues =
  "#ISSUE-123, #ISSUE-123, #ISSUE-123, #ISSUE-123, #ISSUE-123, #ISSUE-123, #ISSUE-123, " +
  "#ISSUE-123, #ISSUE-123, #ISSUE-123, #ISSUE-123, #ISSUE-123, #ISSUE-123, #ISSUE-123, #ISSUE-123, " +
  "#ISSUE-123, #ISSUE-123, #ISSUE-123, #ISSUE-123, #ISSUE-123, #ISSUE-123, #ISSUE-123, #ISSUE-123";
const affectIssuesWidthLine1 = maxLineWidth - affectIssues.length;
const affectIssuesWidthLine2 = maxLineWidth * 2 - affectIssues.length - 4;
const longIssuesSplit =
  longIssues.slice(0, affectIssuesWidthLine1).trim() +
  "\n" +
  longIssues.slice(affectIssuesWidthLine1, affectIssuesWidthLine2).trim() +
  "\n" +
  longIssues.slice(affectIssuesWidthLine2, longIssues.length).trim();

const breakingChange = "BREAKING CHANGE: ";
const breaking = "asdhdfkjhbakjdhjkashd adhfajkhs asdhkjdsh ahshd";
const longBreaking =
  "asdhdfkjhbakjdhjkashd adhfajkhs asdhkjdsh ahshd asdhdfkjhbakjdhjkashd adhfajkhs " +
  "asdhkjdsh ahshd asdhdfkjhbakjdhjkashd adhfajkhs asdhkjdsh ahshd asdhdfkjhbakjdhjkashd asdhkjdsh " +
  "ahshd asdhdfkjhbakjdhjkashd adhfajkhs asdhkjdsh ahshd asdhdfkjhbakjdhjkashd asdhkjdsh ahshd";
const breakingChangeWidthLine1 = maxLineWidth - breakingChange.length - 4;
const breakingChangeWidthLine2 = maxLineWidth * 2 - breakingChange.length - 8;
const longBreakingSplit =
  longBreaking.slice(0, breakingChangeWidthLine1).trim() +
  "\n" +
  longBreaking
    .slice(breakingChangeWidthLine1, breakingChangeWidthLine2)
    .trim() +
  "\n" +
  longBreaking.slice(breakingChangeWidthLine2, longBreaking.length).trim();

describe("engine", function () {
  describe("commit message", function () {
    it("only header", function () {
      expect(
        commitMessage({
          type,
          subject,
        }),
      ).to.equal(`${type}: ${subject}`);
    });

    it("header and issues", function () {
      expect(
        commitMessage({
          type,
          subject,
          isIssuesAffected: true,
          issues,
        }),
      ).to.equal(`${type}: ${subject}\n\n${affectIssues}${issues}`);
    });

    it("header and long issues", function () {
      expect(
        commitMessage({
          type,
          subject,
          isIssuesAffected: true,
          issues: longIssues,
        }),
      ).to.equal(`${type}: ${subject}\n\n${affectIssues}${longIssuesSplit}`);
    });

    it("header and breaking change", function () {
      expect(
        commitMessage({
          type,
          subject,
          isBreaking: true,
          breaking,
        }),
      ).to.equal(`${type}: ${subject}\n\n${breakingChange}${breaking}`);
    });

    it("header and long breaking change", function () {
      expect(
        commitMessage({
          type,
          subject,
          isBreaking: true,
          breaking: longBreaking,
        }),
      ).to.equal(
        `${type}: ${subject}\n\n${breakingChange}${longBreakingSplit}`,
      );
    });

    it("header, breaking change, and issues", function () {
      expect(
        commitMessage({
          type,
          subject,
          isBreaking: true,
          breaking,
          isIssuesAffected: true,
          issues,
        }),
      ).to.equal(
        `${type}: ${subject}\n\n${breakingChange}${breaking}\n\n${affectIssues}${issues}`,
      );
    });

    it("header, long breaking change, and long issues", function () {
      expect(
        commitMessage({
          type,
          subject,
          isBreaking: true,
          breaking: longBreaking,
          isIssuesAffected: true,
          issues: longIssues,
        }),
      ).to.equal(
        `${type}: ${subject}\n\n${breakingChange}${longBreakingSplit}\n\n${affectIssues}${longIssuesSplit}`,
      );
    });
  });

  describe("validation", function () {
    it("empty subject", function () {
      expect(() =>
        commitMessage({
          type,
          subject: "",
        }),
      ).to.throw("subject is required");
    });

    it("subject exceeds max length", function () {
      expect(() =>
        commitMessage({
          type,
          subject: longSubject,
        }),
      ).to.throw(
        "length must be less than or equal to " +
          `${maxLineWidth - (type.length + 2)}`,
      );
    });

    it("empty braking change description", function () {
      expect(() =>
        commitMessage({
          type,
          subject,
          isBreaking: true,
          breaking: "",
        }),
      ).to.throw("description is required");
    });

    it("empty issue", function () {
      expect(() =>
        commitMessage({
          type,
          subject,
          isIssuesAffected: true,
          issues: "",
        }),
      ).to.throw("issues are required");
    });

    it("issues invalid", function () {
      expect(() =>
        commitMessage({
          type,
          subject,
          isIssuesAffected: true,
          issues: "invalid",
        }),
      ).to.throw("issues must be in the format");
    });
  });

  describe("defaults", function () {
    it("type default", function () {
      expect(questionDefault("type")).to.be.undefined;
    });

    it("subject default", function () {
      expect(questionDefault("subject")).to.be.undefined;
    });

    it("has breaking changes default", function () {
      expect(questionDefault("isBreaking")).to.be.false;
    });

    it("breaking changes default", function () {
      expect(questionDefault("breaking")).to.be.undefined;
    });

    it("has affected issue default", function () {
      expect(questionDefault("isIssuesAffected")).to.be.true;
    });

    it("issues default", function () {
      expect(questionDefault("issues")).to.be.undefined;
    });
  });

  describe("prompts", function () {
    it("commit subject prompt for commit", function () {
      expect(questionPrompt("subject", { type })).to.contain(
        `(max ${maxHeaderWidth - type.length - 2} chars)`,
      );
    });
  });

  describe("transformation", function () {
    it("subject w/ character count", function () {
      expect(
        questionTransformation("subject", {
          type,
          subject,
        }),
      ).to.equal(chalk.green(`(${subject.length}) ${subject}`));
    });

    it("long subject w/ character count", function () {
      expect(
        questionTransformation("subject", {
          type,
          subject: longSubject,
        }),
      ).to.equal(chalk.red(`(${longSubject.length}) ${longSubject}`));
    });
  });

  describe("filter", function () {
    it("lowerfirst subject trimmed and trailing dots striped", function () {
      expect(questionFilter("subject", "  A subject...  ")).to.equal(
        "a subject",
      );
    });
  });

  describe("when", function () {
    it("breaking by default", function () {
      expect(questionWhen("breaking", {})).to.be.undefined;
    });

    it("breaking when isBreaking", function () {
      expect(
        questionWhen("breaking", {
          isBreaking: true,
        }),
      ).to.be.true;
    });

    it("issues by default", function () {
      expect(questionWhen("issues", {})).to.be.undefined;
    });

    it("issues when isIssuesAffected", function () {
      expect(
        questionWhen("issues", {
          isIssuesAffected: true,
        }),
      ).to.be.true;
    });
  });
});

function commitMessage(answers) {
  let result = null;
  engine().prompter(
    {
      prompt: (questions) => {
        return {
          then: (finalizer) => {
            processQuestions(questions, answers);
            finalizer(answers);
          },
        };
      },
    },
    (message) => {
      result = message;
    },
  );
  return result;
}

function processQuestions(questions, answers) {
  for (const i in questions) {
    const question = questions[i];
    const answer = answers[question.name];
    const validation =
      answer === undefined || !question.validate
        ? true
        : question.validate(answer, answers);
    if (validation !== true) {
      throw new Error(
        validation ||
          `Answer '${answer}' to question '${question.name}' was invalid`,
      );
    }
    if (question.filter && answer) {
      answers[question.name] = question.filter(answer);
    }
  }
}

function getQuestions() {
  let result = null;
  engine().prompter({
    prompt: (questions) => {
      result = questions;
      return {
        then: () => {},
      };
    },
  });
  return result;
}

function getQuestion(name) {
  const questions = getQuestions();
  for (const i in questions) {
    if (questions[i].name === name) {
      return questions[i];
    }
  }
  return false;
}

function questionPrompt(name, answers) {
  const question = getQuestion(name);
  return question.message && typeof question.message === "string"
    ? question.message
    : question.message(answers);
}

function questionTransformation(name, answers) {
  const question = getQuestion(name);
  return question.transformer && question.transformer(answers[name], answers);
}

function questionFilter(name, answer) {
  const question = getQuestion(name);
  return (
    question.filter &&
    question.filter(typeof answer === "string" ? answer : answer[name])
  );
}

function questionDefault(name) {
  const question = getQuestion(name);
  return question.default;
}

function questionWhen(name, answers) {
  const question = getQuestion(name);
  return question.when(answers);
}
