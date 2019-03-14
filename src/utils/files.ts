import { readFileSync, writeFileSync } from "fs";
import { exit } from "process";

import { BLOCK_SETTINGS_FILE, RC_FILE_PATH } from "../constants";
import { formatName, logError, toPascalCase } from "./index";

export interface BlockFileObject {
    category?: string;
    displayName: string;
    id: string;
    isPublic: boolean;
    publishedName: string;
    activeVersion: number;
    git?: boolean;
}

type UpdateData = Partial<BlockFileObject>;

const writeFileUtil = (path: string, data: any): void => {
    try {
        writeFileSync(path, data);
    } catch (err) {
        logError(`We encountered a problem writing to ${path}: ${err}`);
        exit(1);
    }
};

export const createBlockSettingsFile = (name: string, git: boolean): void => {
    const displayName = formatName(name);
    const publishedName = toPascalCase(name);
    const data = JSON.stringify({
        displayName,
        git,
        publishedName,
    });

    writeFileUtil(`${publishedName}/${BLOCK_SETTINGS_FILE}`, data);
};

export const writeTokenFile = (data: string): void => {
    writeFileUtil(RC_FILE_PATH, data);
};

export const readBlockSettingsFile = (path: string): BlockFileObject => {
    return JSON.parse(readFile(path)!);
};

export const readTokenFile = (path: string): string => {
    return readFile(path)!;
};

const readFile = (path: string): string | undefined => {
    try {
        return readFileSync(path).toString();
    } catch (err) {
        logError(`We encountered a problem reading ${path}: ${err}`);
        exit(1);
    }
};

const createDataString = (latestData: UpdateData): string => {
    const currentData = readBlockSettingsFile(BLOCK_SETTINGS_FILE);
    const updatedData = Object.assign({}, currentData, latestData);
    return JSON.stringify(updatedData);
};

export const updateBlockSettingsFile = (latestData: UpdateData): void => {
    const updatedDataString = createDataString(latestData);
    writeFileUtil(BLOCK_SETTINGS_FILE, updatedDataString);
};
