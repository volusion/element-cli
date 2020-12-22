import { homedir } from "os";
import * as packageFile from "../package.json";

export const BLOCK_SETTINGS_FILE = ".element-block";
export const BUILT_FILE_PATH = "./dist/component.umd.js";
export const RC_FILE_PATH = `${homedir()}/.volusionrc`;
export const THUMBNAIL_PATH = "thumbnail.png";
export const USER_DEFINED_BLOCK_CONFIG_FILE = "./dist/defaultConfig.json";
export const ELEMENT_VERSION = packageFile.version;

export const INTEGRATIONS: Record<string, { id: number } | undefined> = {
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
