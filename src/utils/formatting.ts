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

interface VersionObject {
    version: number;
    createdOn: string;
}

export const sortVersions = (versions: VersionObject[]): VersionObject[] => {
    return versions.sort((a, b) => {
        const aDate = new Date(a.createdOn);
        const bDate = new Date(b.createdOn);

        if (a.version > b.version) {
            return -1;
        } else if (a.version < b.version) {
            return 1;
        } else if (aDate > bDate) {
            return -1;
        } else if (aDate < bDate) {
            return 1;
        }

        return 0;
    });
};
