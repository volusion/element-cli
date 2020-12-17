import { existsSync } from "fs";
import { exit } from "process";

import { BLOCK_SETTINGS_FILE } from "../constants";
import { formatName, logError, readBlockSettingsFile } from "./index";
import { getCategoryNames } from "./network";

const INTEGRATIONS: Record<string, { id: number } | undefined> = {
    volt: {
        id: 1,
    },
    // tslint:disable-next-line: object-literal-sort-keys
    standard: {
        id: 2,
    },
    v1: {
        id: 3,
    },
};

const isCategoryValid = (
    category: string,
    validCategories: string[]
): boolean => validCategories.includes(category);

export const validateCategory = async (
    category: string,
    categories: string[] = []
): Promise<void> => {
    const categoryNames =
        categories.length > 0
            ? categories
            : await getCategoryNames().catch((err: Error) => {
                  logError(
                      `Unexpected error retrieving categories: ${err.message}`
                  );
                  exit(1);
              });

    if (!isCategoryValid(category, categoryNames || [])) {
        const validCategoryDisplayList = (categoryNames || []).join("\n\t- ");
        logError(
            `\n"${category}" is not a valid category name.\nPlease use a valid category name:\n\t- ${validCategoryDisplayList}`
        );
        exit(1);
    }
};

export const validateInputs = async ({
    name,
    category,
    categories,
    integrationName,
}: {
    name: string | null;
    category: string;
    categories?: string[];
    integrationName?: string;
}): Promise<{
    displayName: string;
    publishedName: string;
    id: string;
    integrationId?: number;
}> => {
    // Commander sends `name` as a function if user does not
    // provide the name
    if (typeof name === "function") {
        logError("The block name is required (-n option).");
        exit(1);
    }
    if (!category) {
        logError("Please select or enter a category name.");
        exit(1);
    }

    const integrationId = validateIntegration(integrationName);

    await validateCategory(category, categories);

    const nameFromDotFile = readBlockSettingsFile(BLOCK_SETTINGS_FILE)
        .displayName;
    const displayName = formatName(name || nameFromDotFile);
    const { publishedName, id } = readBlockSettingsFile(BLOCK_SETTINGS_FILE);

    return { displayName, publishedName, id, integrationId };
};

export const validateBlockPublished = (): void => {
    const fileContents = readBlockSettingsFile(BLOCK_SETTINGS_FILE);

    if (!fileContents.published) {
        logError("Please ensure you have published the block first.");
        exit(1);
    }
};

export const validateBlockDirectory = (): void => {
    if (!existsSync(BLOCK_SETTINGS_FILE)) {
        logError(
            "This does not seem to be a block directory. Please double-check where you think you are."
        );
        process.exit(1);
    }
};

export const validateIntegration = (
    integrationName: string | undefined
): number | undefined => {
    if (!integrationName) {
        return undefined;
    }

    const integration = INTEGRATIONS[integrationName!];
    if (!integration) {
        logError("Supported integrations are 'volt', 'standard', and 'v1'.");
        exit(1);
    }
    return integration.id;
};
