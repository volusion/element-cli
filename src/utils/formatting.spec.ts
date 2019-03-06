import { formatName, sortVersions, toPascalCase } from "./index";

const anotherString = "this is another string";
const aString = "a string";
const word = "word";

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

    it("converts a string of more than two words", () => {
        expect(toPascalCase(aString)).toEqual("AString");
        expect(toPascalCase(anotherString)).toEqual("ThisIsAnotherString");
    });
});

describe("sortVersions", () => {
    it("sorts by version then createdOn", () => {
        const versions = [
            { createdOn: "2019-03-05T16:52:30.276Z", version: 1 },
            { createdOn: "2020-03-05T16:52:30.276Z", version: 1 },
            { createdOn: "2019-03-05T16:52:30.276Z", version: 2 },
            { createdOn: "2020-03-05T16:52:30.276Z", version: 2 },
        ];

        const correctVersions = [
            { createdOn: "2020-03-05T16:52:30.276Z", version: 2 },
            { createdOn: "2019-03-05T16:52:30.276Z", version: 2 },
            { createdOn: "2020-03-05T16:52:30.276Z", version: 1 },
            { createdOn: "2019-03-05T16:52:30.276Z", version: 1 },
        ];

        expect(sortVersions(versions)).toEqual(correctVersions);
    });
});
