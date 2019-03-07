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

export const toPascalCase = (input: string): string => {
    return upperCaseFirsts(input, "");
};
