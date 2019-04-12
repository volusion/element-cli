import { existsSync } from "fs";
import { exit } from "process";

import {
    BLOCK_SETTINGS_FILE,
    BUILT_FILE_PATH,
    RC_FILE_PATH,
} from "../constants";
import { formatName, logError, readBlockSettingsFile } from "./index";

const isCategoryValid = (category: string, categories: string[]): boolean => {
    return categories
        .map(cat => cat.toLowerCase())
        .includes(category.toLowerCase());
};

export const validateInputs = (
    name: string | null,
    category: string,
    categories?: string[]
): { displayName: string; publishedName: string } => {
    if (!category) {
        logError("Please select or enter a category name.");
        exit(1);
    }

    if (categories && !isCategoryValid(category, categories)) {
        logError(
            `${category} is not a valid category name. Please enter a valid category name:\n\t- ${categories.join(
                "\n\t- "
            )}`
        );
        exit(1);
    }

    const nameFromDotfile = readBlockSettingsFile(BLOCK_SETTINGS_FILE)
        .displayName;
    const displayName = formatName(name || nameFromDotfile);
    const publishedName = readBlockSettingsFile(BLOCK_SETTINGS_FILE)
        .publishedName;

    return { displayName, publishedName };
};

export const validateNotAlreadyPublishedOrExit = (): void => {
    const fileContents = readBlockSettingsFile(BLOCK_SETTINGS_FILE);

    if (!!fileContents.id) {
        logError(
            "This block has already been published to staging. Please try running the `update` command to update the contents of this block or run the `release` command to push your block live."
        );
        exit(1);
    }
};

export const validateBlockExistOrExit = (): void => {
    const fileContents = readBlockSettingsFile(BLOCK_SETTINGS_FILE);

    if (!fileContents.id) {
        logError("Please ensure you have published the block first.");
        exit(1);
    }
};

export const validateFilesExistOrExit = (): void => {
    const pathsAndMessages = [
        {
            message:
                "Please log in before proceeding. Use the `login` command.",
            path: RC_FILE_PATH,
        },
        {
            message:
                "This does not seem to be a block directory. Please double-check where you think you are.",
            path: BLOCK_SETTINGS_FILE,
        },
        {
            message:
                "A built file is not present. Please ensure you have built your block with `npm run build`.",
            path: BUILT_FILE_PATH,
        },
    ];

    pathsAndMessages.forEach(({ path, message }) => {
        if (!existsSync(path)) {
            logError(message);
            exit(1);
        }
    });
};
