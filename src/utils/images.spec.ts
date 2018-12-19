import { convertToBytes } from "./images";

describe("images", () => {
    describe("convertToBytes", () => {
        it("correctly converts the string '100 kb'", () => {
            expect(convertToBytes("100 kb")).toEqual(100000);
        });
        it("correctly converts the string '10mb'", () => {
            expect(convertToBytes("10mb")).toEqual(10000000);
        });
        it("correctly converts the string '1 GB'", () => {
            expect(convertToBytes("1 GB")).toEqual(1000000000);
        });
    });
});
