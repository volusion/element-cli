import { existsSync } from "fs";
import * as clone from "git-clone";
import { exit } from "process";
import * as replace from "replace-in-file";
import * as rimraf from "rimraf";
import { promisify } from "util";

import { BLOCK_SETTINGS_FILE } from "../constants";
import {
    createBlockSettingsFile,
    logError,
    logInfo,
    logSuccess,
    toPascalCase,
} from "../utils";

const clonePromise = promisify(clone);

const BOILERPLATE_LOCATION = "git@github.com:Volusion/element-BlockStarter.git";

const getBoilerplate = (name: string): Promise<{}> => {
    return clonePromise(BOILERPLATE_LOCATION, name);
};

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
        files: [`${name}/local/index.html`, `${name}/rollup.config.js`],
        from: /HelloWorldBlock/g,
        to: toPascalCase(name),
    };
    return replace(options);
};

const cloneBoilerplate = ([name]: string[]): void => {
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

    getBoilerplate(name)
        .then(() => {
            logInfo(`Saved boilerplate to ./${name}; now updating...`);
            removeStarterExtras([
                `${name}/CODE_OF_CONDUCT.md`,
                `${name}/LICENSE`,
                `${name}/docs/`,
                `${name}/.git`,
            ]);
            return updateModuleNames(name).then(
                (updatedFiles: string[]): void => {
                    createBlockSettingsFile(name);
                    logSuccess(`Updated files ${updatedFiles.join(", ")}!`);
                    exit(0);
                }
            );
        })
        .catch((err: Error) => {
            logError(err);
            exit(1);
        });
};

export { cloneBoilerplate };
