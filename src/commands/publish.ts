import { AxiosError, AxiosResponse } from "axios";
import { readFileSync } from "fs";
import { resolve } from "path";
import { cwd, exit } from "process";

import { BLOCK_SETTINGS_FILE, BUILT_FILE_PATH } from "../constants";
import {
    checkErrorCode,
    createBlockRequest,
    logError,
    logSuccess,
    readBlockSettingsFile,
    updateBlockRequest,
    updateBlockSettingsFile,
    validateFilesExistOrExit,
    validateInputs,
    validateNotAlreadyPublishedOrExit,
} from "../utils";

const publish = async (
    name: string | null,
    category: string,
    categories?: string[]
): Promise<void> => {
    validateFilesExistOrExit();
    validateNotAlreadyPublishedOrExit();

    const { displayName, publishedName } = validateInputs(
        name,
        category,
        categories
    );
    const filePath = resolve(cwd(), BUILT_FILE_PATH);
    const blockData = readFileSync(filePath).toString();

    createBlockRequest({ displayName, publishedName }, blockData, category)
        .then((res: AxiosResponse) => {
            updateBlockSettingsFile({
                category,
                displayName,
                id: res.data.id,
                isPublic: false,
            });
            logSuccess(`Published ${displayName} with the ID ${res.data.id}.`);
            exit(0);
        })
        .catch((err: AxiosError) => {
            logError(err);
            checkErrorCode(err);
            exit(1);
        });
};

const publishUpdate = (togglePublic: boolean): void => {
    validateFilesExistOrExit();
    const filePath = resolve(cwd(), BUILT_FILE_PATH);
    const blockData = readFileSync(filePath).toString();
    const { displayName, id, isPublic, publishedName } = readBlockSettingsFile(
        BLOCK_SETTINGS_FILE
    );

    if (!id) {
        logError("Please ensure you have published the block first.");
        exit(1);
        return;
    }

    const publicFlag = togglePublic ? !isPublic : isPublic;

    updateBlockRequest(
        { displayName, publishedName },
        blockData,
        id,
        publicFlag
    )
        .then((res: AxiosResponse) => {
            updateBlockSettingsFile({ id: res.data.id, isPublic: publicFlag });
            logSuccess(`Updated ${displayName} with ID ${res.data.id}.`);
            exit(0);
        })
        .catch((err: AxiosError) => {
            logError(err);
            checkErrorCode(err);
            exit(1);
        });
};

export { publish, publishUpdate };
