import { expect } from "chai";
import chalk from "chalk";
import engine from "../src/engine.js";

const maxLineWidth = 100;
const maxHeaderWidth = 100;

const type = "func";
const subject = "testing123";
const longSubject =
  "testing123 testing123 testing123 testing123 testing123 testing123 testing123 testing123 testing123";

// Jira
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

// Azure Boards
const affectWorkItems = "AFFECTED WORK ITEMS: ";
const workItems = "AB#123, AB#456";

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
          isCardAffected: true,
          cards: issues,
        }),
      ).to.equal(`${type}: ${subject}\n\n${affectIssues}${issues}`);
    });

    it("header and long issues", function () {
      expect(
        commitMessage({
          type,
          subject,
          isCardAffected: true,
          cards: longIssues,
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
          isCardAffected: true,
          cards: issues,
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
          isCardAffected: true,
          cards: longIssues,
        }),
      ).to.equal(
        `${type}: ${subject}\n\n${breakingChange}${longBreakingSplit}\n\n${affectIssues}${longIssuesSplit}`,
      );
    });

    describe("azure boards", function () {
      it("header and work items", function () {
        expect(
          commitMessage(
            {
              type,
              subject,
              isCardAffected: true,
              cards: workItems,
            },
            true,
            "azureboards",
          ),
        ).to.equal(`${type}: ${subject}\n\n${affectWorkItems}${workItems}`);
      });
    });

    describe("no tracker", function () {
      it("header only, card prompts skipped", function () {
        expect(
          commitMessage(
            {
              type,
              subject,
            },
            true,
            "none",
          ),
        ).to.equal(`${type}: ${subject}`);
      });

      it("breaking change, no card output", function () {
        expect(
          commitMessage(
            {
              type,
              subject,
              isBreaking: true,
              breaking,
            },
            true,
            "none",
          ),
        ).to.equal(`${type}: ${subject}\n\n${breakingChange}${breaking}`);
      });
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

    it("empty breaking change description", function () {
      expect(() =>
        commitMessage({
          type,
          subject,
          isBreaking: true,
          breaking: "",
        }),
      ).to.throw("description is required");
    });

    it("empty issue (jira)", function () {
      expect(() =>
        commitMessage({
          type,
          subject,
          isCardAffected: true,
          cards: "",
        }),
      ).to.throw("Issue is required");
    });

    it("issue invalid format (jira)", function () {
      expect(() =>
        commitMessage({
          type,
          subject,
          isCardAffected: true,
          cards: "invalid",
        }),
      ).to.throw("Issue must be in the format");
    });

    it("empty work item (azureboards)", function () {
      expect(() =>
        commitMessage(
          {
            type,
            subject,
            isCardAffected: true,
            cards: "",
          },
          true,
          "azureboards",
        ),
      ).to.throw("Work Item is required");
    });

    it("work item invalid format (azureboards)", function () {
      expect(() =>
        commitMessage(
          {
            type,
            subject,
            isCardAffected: true,
            cards: "invalid",
          },
          true,
          "azureboards",
        ),
      ).to.throw("Work Item must be in the format");
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

    it("has affected card default (jira)", function () {
      expect(questionDefault("isCardAffected")).to.be.true;
    });

    it("cards default", function () {
      expect(questionDefault("cards")).to.be.undefined;
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

    it("cards by default (jira)", function () {
      expect(questionWhen("cards", {})).to.be.undefined;
    });

    it("cards when isCardAffected (jira)", function () {
      expect(
        questionWhen("cards", {
          isCardAffected: true,
        }),
      ).to.be.true;
    });
  });

  describe("no tracker prompts", function () {
    it("isCardAffected prompt not present when cardTracker is none", function () {
      const questions = getQuestions(true, "none");
      expect(questions.find((q) => q.name === "isCardAffected")).to.be.undefined;
    });

    it("cards prompt not present when cardTracker is none", function () {
      const questions = getQuestions(true, "none");
      expect(questions.find((q) => q.name === "cards")).to.be.undefined;
    });
  });
});

function commitMessage(answers, startWithGitmoji = true, cardTracker = "jira") {
  let result = null;
  engine(startWithGitmoji, cardTracker).prompter(
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

function getQuestions(startWithGitmoji = true, cardTracker = "jira") {
  let result = null;
  engine(startWithGitmoji, cardTracker).prompter({
    prompt: (questions) => {
      result = questions;
      return {
        then: () => { },
      };
    },
  });
  return result;
}

function getQuestion(name, startWithGitmoji = true, cardTracker = "jira") {
  const questions = getQuestions(startWithGitmoji, cardTracker);
  for (const i in questions) {
    if (questions[i].name === name) {
      return questions[i];
    }
  }
  return false;
}

function questionPrompt(name, answers, startWithGitmoji = true, cardTracker = "jira") {
  const question = getQuestion(name, startWithGitmoji, cardTracker);
  return question.message && typeof question.message === "string"
    ? question.message
    : question.message(answers);
}

function questionTransformation(name, answers, startWithGitmoji = true, cardTracker = "jira") {
  const question = getQuestion(name, startWithGitmoji, cardTracker);
  return question.transformer && question.transformer(answers[name], answers);
}

function questionFilter(name, answer, startWithGitmoji = true, cardTracker = "jira") {
  const question = getQuestion(name, startWithGitmoji, cardTracker);
  return (
    question.filter &&
    question.filter(typeof answer === "string" ? answer : answer[name])
  );
}

function questionDefault(name, startWithGitmoji = true, cardTracker = "jira") {
  const question = getQuestion(name, startWithGitmoji, cardTracker);
  return question.default;
}

function questionWhen(name, answers, startWithGitmoji = true, cardTracker = "jira") {
  const question = getQuestion(name, startWithGitmoji, cardTracker);
  return question.when(answers);
}
