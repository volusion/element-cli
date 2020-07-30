import { AxiosResponse } from "axios";
import { exec } from "child_process";
import { readFileSync } from "fs";
import { resolve } from "path";
import { cwd, exit } from "process";
import * as uglify from "uglify-js";
import * as util from "util";

const execAsync = util.promisify(exec);

import {
    BLOCK_SETTINGS_FILE,
    BUILT_FILE_PATH,
    USER_DEFINED_BLOCK_CONFIG_FILE,
} from "../constants";
import { isVerbose, skipBuild } from "../index";
import {
    checkErrorCode,
    createBlockRequest,
    createMajorBlockRequest,
    logError,
    logInfo,
    logSuccess,
    readBlockSettingsFile,
    releaseBlockRequest,
    rollbackBlockRequest,
    updateBlockRequest,
    updateBlockSettingsFile,
    validateBlockDirectory,
    validateBlockPublished,
    validateInputs,
} from "../utils";

const publish = async (
    name: string | null,
    category: string,
    categories?: string[]
): Promise<void> => {
    validateBlockDirectory();
    await runBuild();

    const { displayName, publishedName, id } = validateInputs(
        name,
        category,
        categories
    );
    const filePath = resolve(cwd(), BUILT_FILE_PATH);
    const blockData = readFileSync(filePath).toString();
    const defaultConfig = readBlockSettingsFile(USER_DEFINED_BLOCK_CONFIG_FILE);
    const minifiedCode = uglify.minify(blockData).code;

    try {
        const res: AxiosResponse = await createBlockRequest(
            defaultConfig,
            id,
            {
                displayName,
                publishedName,
            },
            minifiedCode,
            category
        );

        logResponse(res);

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
    validateBlockDirectory();
    validateBlockPublished();
    await runBuild();

    const defaultConfig = readBlockSettingsFile(USER_DEFINED_BLOCK_CONFIG_FILE);
    const filePath = resolve(cwd(), BUILT_FILE_PATH);
    const { displayName, id } = readBlockSettingsFile(BLOCK_SETTINGS_FILE);

    try {
        const blockData = readFileSync(filePath).toString();
        const minifiedCode = uglify.minify(blockData).code;

        const res: AxiosResponse = await createMajorBlockRequest(
            defaultConfig,
            minifiedCode,
            id
        );
        logResponse(res);

        const latestMajorVersion = getLatestMajorVersion(res.data.versions);

        updateBlockSettingsFile({
            activeVersion: latestMajorVersion,
        });

        logSuccess(`
            Published ${displayName} v${latestMajorVersion} for staging
            ID ${res.data.id}
        `);
        exit(0);
    } catch (err) {
        logError(err);
        checkErrorCode(err);
        exit(1);
    }
};

const update = async (
    togglePublic: boolean,
    unminified: boolean
): Promise<void> => {
    validateBlockDirectory();
    validateBlockPublished();
    await runBuild();

    const filePath = resolve(cwd(), BUILT_FILE_PATH);
    const blockData = readFileSync(filePath).toString();
    const defaultConfig = readBlockSettingsFile(USER_DEFINED_BLOCK_CONFIG_FILE);

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
            defaultConfig,
            { displayName, publishedName },
            code,
            id,
            publicFlag,
            version
        );

        logResponse(res);

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
    validateBlockDirectory();
    validateBlockPublished();

    const { activeVersion, displayName, id } = readBlockSettingsFile(
        BLOCK_SETTINGS_FILE
    );

    const version = activeVersion || 1;

    try {
        const res: AxiosResponse = await releaseBlockRequest(id, note, version);

        logResponse(res);

        updateBlockSettingsFile({
            activeVersion: version,
        });

        logSuccess(`
            Released ${displayName} v${version}
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
    validateBlockDirectory();
    validateBlockPublished();

    const { activeVersion, displayName, id } = readBlockSettingsFile(
        BLOCK_SETTINGS_FILE
    );

    const version = activeVersion || 1;

    try {
        const res: AxiosResponse = await rollbackBlockRequest(id, version);

        logResponse(res);

        logSuccess(`
            Rolled back ${displayName} v${version}
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
    validateBlockDirectory();
    validateBlockPublished();

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

function getLatestMajorVersion(versions: any[]): number {
    return (
        versions.reduce((accMax: any, item: any) => {
            return item.isMajor ? Math.max(accMax, item.version) : accMax;
        }, 1) || 1
    );
}

async function runBuild(): Promise<void> {
    if (skipBuild) {
        logInfo("Skipping npm build");
        return;
    }
    if (isVerbose) {
        logInfo("Running npm build");
    }
    try {
        const { stdout } = await execAsync("npm run build");
        logInfo(stdout);
    } catch (error) {
        logError(`${error.message}

            Error encountered running the build. Please run "npm run build" after addressing the issue.
        `);
        process.exit(1);
    }
}

function logResponse(res: AxiosResponse<any>): void {
    if (isVerbose) {
        logInfo(`Response:\n ${JSON.stringify(res.data, null, 2)}`);
    }
}
