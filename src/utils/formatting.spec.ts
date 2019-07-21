import { formatName, toPascalCase } from "./index";

const anotherString = "this is another string";
const aString = "a string";
const word = "word";
const pascalCase = "PascalCase";

describe("formatName", () => {
    it("upper cases the first letter of each word in a string", () => {
        expect(formatName(word)).toEqual("Word");
        expect(formatName(aString)).toEqual("A String");
        expect(formatName(anotherString)).toEqual("This Is Another String");
    });
});

describe("toPascalCase", () => {
    it("upper-cases a single word", () => {
        expect(toPascalCase(word)).toEqual("Word");
    });

    it("does not modify a word already in Pascal Case", () => {
        expect(toPascalCase(pascalCase)).toEqual(pascalCase);
    });

    it("converts a string of more than two words", () => {
        expect(toPascalCase(aString)).toEqual("AString");
        expect(toPascalCase(anotherString)).toEqual("ThisIsAnotherString");
    });
});
