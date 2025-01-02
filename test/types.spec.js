import { expect } from "chai";
import { gitmojis } from "gitmojis";
import cloneDeep from "lodash.clonedeep";
import map from "lodash.map";
import { getChoices, typesRaw } from "../src/types.js";

describe("types", function () {
  describe("typesRaw", function () {
    it("should emojis be compatible with gitmoji", function () {
      map(typesRaw, (type) => {
        const gitmoji = gitmojis.find(
          (gitmoji) => gitmoji.code === type.emojiCode
        );
        expect(gitmoji).to.be.an("object");
      });
    });
  });

  describe("getChoices", function () {
    it("should return an array of choices with correct structure", function () {
      const choices = getChoices();
      expect(choices).to.be.an("array");
      choices.forEach((choice) => {
        expect(choice).to.have.property("value").that.is.a("string");
        expect(choice).to.have.property("name").that.is.a("string");
      });
    });

    it("should throw an error if a gitmoji is not found", function () {
      const originalTypesRaw = cloneDeep(typesRaw);
      typesRaw.invalid = {
        title: "Invalid",
        description: "Invalid type",
        emojiCode: ":invalid:",
      };

      expect(() => getChoices(typesRaw)).to.throw(
        Error,
        "Gitmoji not found for :invalid:"
      );

      delete typesRaw.invalid;
      Object.assign(typesRaw, originalTypesRaw);
    });

    it("should append a space to specific emoji codes", function () {
      const choices = getChoices();
      const choreChoice = choices.find((choice) =>
        choice.value.includes("chore")
      );
      const ciChoice = choices.find((choice) => choice.value.includes("ci"));

      expect(
        choreChoice.name.startsWith(
          gitmojis.find((gitmoji) => gitmoji.code === ":pencil2:").emoji + " "
        )
      ).to.be.true;
      expect(
        ciChoice.name.startsWith(
          gitmojis.find((gitmoji) => gitmoji.code === ":recycle:").emoji + " "
        )
      ).to.be.true;
    });
  });
});
