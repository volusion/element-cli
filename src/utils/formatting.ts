const upperCaseFirsts = (input: string, joinChar: string): string => {
    return input
        .toLowerCase()
        .split(" ")
        .map((word: string) => `${word[0].toUpperCase()}${word.slice(1)}`)
        .join(joinChar);
};

export const formatName = (input: string): string => {
    return upperCaseFirsts(input, " ");
};

// from https://stackoverflow.com/a/53952925/753279
export const toPascalCase = (input: string): string =>
    `${input}`
        .replace(new RegExp(/[-_]+/, "g"), " ")
        .replace(new RegExp(/[^\w\s]/, "g"), "")
        .replace(
            new RegExp(/\s+(.)(\w+)/, "g"),
            (_$1, $2, $3) => `${$2.toUpperCase() + $3.toLowerCase()}`
        )
        .replace(new RegExp(/\s/, "g"), "")
        .replace(new RegExp(/\w/), s => s.toUpperCase());
