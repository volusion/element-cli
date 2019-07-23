import { formatName, toPascalCase } from "./index";

describe("formatName", () => {
    it("upper cases the first letter of each word in a string", () => {
        expect(formatName("word")).toEqual("Word");
        expect(formatName("a string")).toEqual("A String");
        expect(formatName("this is another string")).toEqual(
            "This Is Another String"
        );
    });
});

describe("toPascalCase", () => {
    it("should convert to PascalCase", () => {
        expect(toPascalCase("word")).toEqual("Word");
        expect(toPascalCase("a string")).toEqual("AString");
        expect(toPascalCase("fabulous-block")).toEqual("FabulousBlock");
        expect(toPascalCase("cool_block")).toEqual("CoolBlock");
        expect(toPascalCase("this is another string")).toEqual(
            "ThisIsAnotherString"
        );
        expect(toPascalCase("PascalCase")).toEqual("PascalCase");
    });
});
