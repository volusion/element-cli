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
    releaseBlockRequest,
    sortVersions,
    updateBlockRequest,
    updateBlockSettingsFile,
    validateBlockExistOrExit,
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
            const sortedVersions = sortVersions(res.data.versions);
            const currentVersion = sortedVersions[0].version;

            updateBlockSettingsFile({
                category,
                currentVersion,
                displayName,
                id: res.data.id,
                isPublic: false,
                isStaging: true,
            });
            logSuccess(`
                Published ${displayName} v${currentVersion} for staging
                ID ${res.data.id}
            `);
            exit(0);
        })
        .catch((err: AxiosError) => {
            logError(err);
            checkErrorCode(err);
            exit(1);
        });
};

const update = (togglePublic: boolean): void => {
    validateFilesExistOrExit();
    validateBlockExistOrExit();

    const filePath = resolve(cwd(), BUILT_FILE_PATH);
    const blockData = readFileSync(filePath).toString();
    const {
        currentVersion,
        displayName,
        id,
        isPublic,
        publishedName,
    } = readBlockSettingsFile(BLOCK_SETTINGS_FILE);

    const publicFlag = togglePublic ? !isPublic : isPublic;

    updateBlockRequest(
        { displayName, publishedName },
        blockData,
        id,
        publicFlag
    )
        .then((res: AxiosResponse) => {
            updateBlockSettingsFile({ id: res.data.id, isPublic: publicFlag });
            logSuccess(`
                Updated ${displayName} v${currentVersion}
                ID ${res.data.id}
            `);
            exit(0);
        })
        .catch((err: AxiosError) => {
            logError(err);
            checkErrorCode(err);
            exit(1);
        });
};

const release = (note: string): void => {
    validateFilesExistOrExit();
    validateBlockExistOrExit();

    const { currentVersion, displayName, id } = readBlockSettingsFile(
        BLOCK_SETTINGS_FILE
    );

    releaseBlockRequest(id, note)
        .then((res: AxiosResponse) => {
            updateBlockSettingsFile({
                id: res.data.id,
                isStaging: false,
            });

            logSuccess(`
                Released ${displayName} v${currentVersion}
                ID ${res.data.id}
            `);
            exit(0);
        })
        .catch((err: AxiosError) => {
            logError(err);
            checkErrorCode(err);
            exit(1);
        });
};

export { publish, update, release };
