import chalk from "chalk";
import map from "lodash.map";
import wrap from "word-wrap";
import types from "./types.js";

const filter = (array) => {
  return array.filter((x) => {
    return x;
  });
};

const headerLength = (answers) => {
  return answers.type.length + 2;
};

const maxSummaryLength = (answers) => {
  return 100 - headerLength(answers);
};

const filterEmptyAnswer = (subject) => {
  subject = subject.trim();
  if (subject.charAt(0).toLowerCase() !== subject.charAt(0)) {
    subject =
      subject.charAt(0).toLowerCase() + subject.slice(1, subject.length);
  }
  while (subject.endsWith(".")) {
    subject = subject.slice(0, subject.length - 1);
  }
  return subject;
};

// This can be any kind of SystemJS compatible module.
// We use Commonjs here, but ES6 or AMD would do just
// fine.
export default () => {
  const choices = map(types, (type, key) => {
    return {
      value: `${type.emojiCode} ${key}`,
      name: `${type.emoji} ${key}:\t${type.description}`,
    };
  });

  return {
    // When a user runs `git cz`, prompter will
    // be executed. We pass you cz, which currently
    // is just an instance of inquirer.js. Using
    // this you can ask questions and get answers.
    //
    // The commit callback should be executed when
    // you're ready to send back a commit template
    // to git.
    //
    // By default, we'll de-indent your commit
    // template and will keep empty lines.
    prompter: (cz, commit) => {
      // Let's ask some questions of the user
      // so that we can populate our commit
      // template.
      //
      // See inquirer.js docs for specifics.
      // You can also opt to use another input
      // collection library if you prefer.
      cz.prompt([
        {
          type: "list",
          name: "type",
          message: "Select the type of change that you're committing:",
          choices: choices,
        },
        {
          type: "input",
          name: "subject",
          message: (answers) => {
            return (
              "Write a short, imperative tense description of the change (max " +
              maxSummaryLength(answers) +
              " chars):\n"
            );
          },
          validate: (subject, answers) => {
            const filteredSubject = filterEmptyAnswer(subject);
            return filteredSubject.length == 0
              ? "subject is required"
              : filteredSubject.length <= maxSummaryLength(answers)
                ? true
                : "Subject length must be less than or equal to " +
                  maxSummaryLength(answers) +
                  " characters. Current length is " +
                  filteredSubject.length +
                  " characters.";
          },
          transformer: (subject, answers) => {
            const filteredSubject = filterEmptyAnswer(subject);
            const color =
              filteredSubject.length <= maxSummaryLength(answers)
                ? chalk.green
                : chalk.red;
            return color("(" + filteredSubject.length + ") " + subject);
          },
          filter: (subject) => {
            return filterEmptyAnswer(subject);
          },
        },
        {
          type: "confirm",
          name: "isBreaking",
          message: "Are there any breaking changes?",
          default: false,
        },
        {
          type: "input",
          name: "breaking",
          message: "Describe the breaking changes:\n",
          when: (answers) => {
            return answers.isBreaking;
          },
          validate: (breaking) => {
            const filteredBreaking = filterEmptyAnswer(breaking);
            return filteredBreaking.length == 0
              ? "description is required"
              : true;
          },
        },

        {
          type: "confirm",
          name: "isIssuesAffected",
          message: "Does this change affect any open issues?",
          default: true,
        },
        {
          type: "input",
          name: "issues",
          message: 'Add issue references (e.g. "#ISSUE-123, #ISSUE-543".):\n',
          when: (answers) => {
            return answers.isIssuesAffected;
          },
          validate: (issues) => {
            const filteredIssues = filterEmptyAnswer(issues);
            const jiraMatcher = /#([A-Z][A-Z0-9]+-[0-9]+)/g;
            return filteredIssues.length == 0
              ? "issues are required"
              : issues.match(jiraMatcher)
                ? true
                : 'issues must be in the format "#ISSUE-123, #ISSUE-543"';
          },
        },
      ]).then((answers) => {
        const wrapOptions = {
          trim: true,
          cut: false,
          newline: "\n",
          indent: "",
          width: 100,
        };

        // Hard limit this line in the validate
        const head = answers.type + ": " + answers.subject;

        // Apply breaking change prefix
        let breaking = answers.isBreaking
          ? `BREAKING CHANGE: ${answers.breaking}`
          : "";
        breaking = breaking ? wrap(breaking, wrapOptions) : false;

        let issues = answers.isIssuesAffected
          ? `AFFECTED ISSUES: ${answers.issues}`
          : "";
        issues = issues ? wrap(issues, wrapOptions) : false;

        commit(filter([head, breaking, issues]).join("\n\n"));
      });
    },
  };
};
