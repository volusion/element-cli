import { AxiosResponse } from "axios";
import { exec } from "child_process";
import { readFileSync } from "fs";
import { resolve } from "path";
import { cwd, exit } from "process";
import * as uglify from "uglify-js";
import * as util from "util";

const execAsyc = util.promisify(exec);

import { BLOCK_SETTINGS_FILE, BUILT_FILE_PATH } from "../constants";
import {
    checkErrorCode,
    createBlockRequest,
    createMajorBlockRequest,
    logError,
    logSuccess,
    readBlockSettingsFile,
    releaseBlockRequest,
    rollbackBlockRequest,
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

    const { displayName, publishedName, id } = validateInputs(
        name,
        category,
        categories
    );
    const filePath = resolve(cwd(), BUILT_FILE_PATH);
    const blockData = readFileSync(filePath).toString();
    const minifiedCode = uglify.minify(blockData).code;

    try {
        const res: AxiosResponse = await createBlockRequest(
            id,
            {
                displayName,
                publishedName,
            },
            minifiedCode,
            category
        );

        const version = 1;

        updateBlockSettingsFile({
            activeVersion: version,
            category,
            displayName,
            id: res.data.id,
            isPublic: false,
            published: true,
        });

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

const newMajorVersion = async (): Promise<void> => {
    validateFilesExistOrExit();
    validateBlockExistOrExit();

    const filePath = resolve(cwd(), BUILT_FILE_PATH);
    const { activeVersion, displayName, id } = readBlockSettingsFile(
        BLOCK_SETTINGS_FILE
    );

    const version = (activeVersion || 1) + 1;

    try {
        updateBlockSettingsFile({
            activeVersion: version,
        });

        await execAsyc("npm run build");

        const blockData = readFileSync(filePath).toString();
        const minifiedCode = uglify.minify(blockData).code;

        const res: AxiosResponse = await createMajorBlockRequest(
            minifiedCode,
            id,
            version
        );

        updateBlockSettingsFile({
            activeVersion: version,
        });

        logSuccess(`
            Published ${displayName} v${version} for staging
            ID ${res.data.id}
        `);

        exit(0);
    } catch (err) {
        updateBlockSettingsFile({
            activeVersion: activeVersion || 1,
        });
        logError(err);
        checkErrorCode(err);
        exit(1);
    }
};

const update = async (
    togglePublic: boolean,
    unminified: boolean
): Promise<void> => {
    validateFilesExistOrExit();
    validateBlockExistOrExit();

    const filePath = resolve(cwd(), BUILT_FILE_PATH);
    const blockData = readFileSync(filePath).toString();
    const code = unminified ? blockData : uglify.minify(blockData).code;
    const {
        activeVersion,
        displayName,
        id,
        isPublic,
        publishedName,
    } = readBlockSettingsFile(BLOCK_SETTINGS_FILE);

    const publicFlag = togglePublic ? !isPublic : isPublic;
    const version = activeVersion || 1;

    try {
        const res: AxiosResponse = await updateBlockRequest(
            { displayName, publishedName },
            code,
            id,
            publicFlag,
            version
        );

        updateBlockSettingsFile({
            activeVersion: version,
            isPublic: publicFlag,
            published: true,
        });

        logSuccess(`
            Updated ${displayName} v${version} for staging
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

    const version = activeVersion || 1;

    try {
        const res: AxiosResponse = await releaseBlockRequest(id, note, version);

        updateBlockSettingsFile({
            activeVersion: version,
        });

        logSuccess(`
            Released ${displayName} v${version} for production
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

    const { activeVersion, displayName, id } = readBlockSettingsFile(
        BLOCK_SETTINGS_FILE
    );

    const version = activeVersion || 1;

    try {
        const res: AxiosResponse = await rollbackBlockRequest(id, version);

        logSuccess(`
            Rollbacked ${displayName} v${version}
            ID ${res.data.id}
        `);

        exit(0);
    } catch (err) {
        logError(err);
        checkErrorCode(err);
        exit(1);
    }
};

const blockDetails = (): {
    current: number;
    name: string;
} => {
    validateFilesExistOrExit();
    validateBlockExistOrExit();

    const { activeVersion, displayName } = readBlockSettingsFile(
        BLOCK_SETTINGS_FILE
    );

    const version = activeVersion || 1;

    return {
        current: version,
        name: displayName,
    };
};

export { publish, update, release, rollback, blockDetails, newMajorVersion };
