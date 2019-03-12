import { AxiosResponse } from "axios";
import { readFileSync } from "fs";
import { resolve } from "path";
import { cwd, exit } from "process";

import { BLOCK_SETTINGS_FILE, BUILT_FILE_PATH } from "../constants";
import {
    checkErrorCode,
    createBlockRequest,
    createBranch,
    logError,
    logSuccess,
    readBlockSettingsFile,
    releaseBlockRequest,
    rollbackBlockRequest,
    updateBlockRequest,
    updateBlockSettingsFile,
    updateBranch,
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
    const { activeVersion } = readBlockSettingsFile(BLOCK_SETTINGS_FILE);

    try {
        const res: AxiosResponse = await createBlockRequest(
            {
                displayName,
                publishedName,
            },
            blockData,
            category
        );

        const version = activeVersion || 1;

        updateBlockSettingsFile({
            activeVersion: version,
            category,
            displayName,
            id: res.data.id,
            isPublic: false,
            isReleased: false,
        });

        await createBranch(`v${version}`);

        logSuccess(`
            Published ${displayName} v${version} for staging
            ID ${res.data.id}
        `);

        exit(0);
    } catch (err) {
        logError(err);
        checkErrorCode(err);
        exit(1);
    }
};

const update = async (togglePublic: boolean): Promise<void> => {
    validateFilesExistOrExit();
    validateBlockExistOrExit();

    const filePath = resolve(cwd(), BUILT_FILE_PATH);
    const blockData = readFileSync(filePath).toString();
    const {
        activeVersion,
        displayName,
        id,
        isPublic,
        publishedName,
    } = readBlockSettingsFile(BLOCK_SETTINGS_FILE);

    const publicFlag = togglePublic ? !isPublic : isPublic;

    try {
        const res: AxiosResponse = await updateBlockRequest(
            { displayName, publishedName },
            blockData,
            id,
            publicFlag
        );

        updateBlockSettingsFile({
            isPublic: publicFlag,
            isReleased: false,
        });

        await updateBranch(`v${activeVersion}`);

        logSuccess(`
            Updated ${displayName} v${activeVersion} for staging
            ID ${res.data.id}
        `);

        exit(0);
    } catch (err) {
        logError(err);
        checkErrorCode(err);
        exit(1);
    }
};

const release = async (note: string): Promise<void> => {
    validateFilesExistOrExit();
    validateBlockExistOrExit();

    const { activeVersion, displayName, id } = readBlockSettingsFile(
        BLOCK_SETTINGS_FILE
    );

    try {
        const res: AxiosResponse = await releaseBlockRequest(id, note);

        updateBlockSettingsFile({
            isReleased: true,
        });

        logSuccess(`
            Released ${displayName} v${activeVersion} for production
            ID ${res.data.id}
        `);

        exit(0);
    } catch (err) {
        logError(err);
        checkErrorCode(err);
        exit(1);
    }
};

const rollback = async (): Promise<void> => {
    validateFilesExistOrExit();
    validateBlockExistOrExit();

    const {
        activeVersion,
        displayName,
        id,
        isReleased,
    } = readBlockSettingsFile(BLOCK_SETTINGS_FILE);

    try {
        const res: AxiosResponse = await rollbackBlockRequest(id);

        if (isReleased) {
            updateBlockSettingsFile({
                isReleased: false,
            });

            logSuccess(`
                Rollbacked ${displayName} v${activeVersion} back to staging
                ID ${res.data.id}
            `);
        } else {
            updateBlockSettingsFile({
                isReleased: true,
            });

            logSuccess(`
                Removed ${displayName} v${activeVersion} from staging
                ID ${res.data.id}
            `);
        }

        exit(0);
    } catch (err) {
        logError(err);
        checkErrorCode(err);
        exit(1);
    }
};

export { publish, update, release, rollback };
