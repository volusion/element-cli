import { existsSync } from "fs";
import { exit } from "process";
import * as replace from "replace-in-file";
import * as rimraf from "rimraf";

import { BLOCK_SETTINGS_FILE } from "../constants";
import {
    cloneRepo,
    createBlockId,
    createBlockSettingsFile,
    logError,
    logInfo,
    logSuccess,
    toPascalCase,
} from "../utils";

const BOILERPLATE_LOCATION =
    "https://github.com/volusion/element-BlockStarter.git";

const removeStarterExtras = (toRemove: string[]): void => {
    toRemove.forEach(name => {
        try {
            rimraf.sync(name);
        } catch (error) {
            logInfo(`Problem removing ${name}: ${error.message}`);
        }
    });
};

const updateModuleNames = (name: string): Promise<string[]> => {
    const options = {
        files: [`${name}/local/index.js`],
        from: /StarterBlock/g,
        to: name,
    };
    return replace(options);
};

const cloneBoilerplate = async (name: string): Promise<void> => {
    name = toPascalCase(name);

    logInfo(`Cloning boilerplate for ${name}...`);

    if (existsSync(name)) {
        logError(
            `${name} block already exists.\nPlease choose a new name and try again.`
        );
        exit(1);
    }

    if (existsSync(BLOCK_SETTINGS_FILE)) {
        logError(
            "Please run this command from a directory that does not already contain block files."
        );
        exit(1);
    }

    try {
        const blockIdRes = await createBlockId();
        await cloneRepo(BOILERPLATE_LOCATION, name);
        const blockId = blockIdRes.data.blockId;

        logInfo(`Saved boilerplate to ./${name}; now updating...`);

        await removeStarterExtras([
            `${name}/CODE_OF_CONDUCT.md`,
            `${name}/LICENSE`,
            `${name}/docs/`,
            `${name}/.git`,
        ]);

        const updatedFiles: string[] = await updateModuleNames(name);

        await createBlockSettingsFile(name, blockId);

        logSuccess(`Updated files ${updatedFiles.join(", ")}!`);

        exit(0);
    } catch (err) {
        logError(err);
        logInfo("Hint: Try `element login` before running this command again.");
        exit(1);
    }
};

export { cloneBoilerplate };
