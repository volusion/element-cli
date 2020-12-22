import { existsSync, readFileSync, unlinkSync, writeFileSync } from "fs";
import { exit } from "process";

import { BLOCK_SETTINGS_FILE, RC_FILE_PATH } from "../constants";
import { formatName, logError } from "./index";

export interface BlockFileObject {
    category?: string;
    displayName: string;
    id: string;
    idFromStart?: boolean; // Since v.2.0.8
    isPublic: boolean;
    publishedName: string;
    published?: boolean; // Since v.2.0.8
    activeVersion?: number;
    integrationId?: number;
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

export const createBlockSettingsFile = (name: string, id: string): void => {
    const displayName = formatName(name);

    const data = JSON.stringify({
        activeVersion: 1,
        displayName,
        id,
        idFromStart: true, // Since v.2.0.8
        publishedName: name,
    });

    writeFileUtil(`${name}/${BLOCK_SETTINGS_FILE}`, data);
};

export const writeTokenFile = (data: string): void => {
    writeFileUtil(RC_FILE_PATH, data);
};

export const deleteTokenFile = (): void => {
    unlinkSync(RC_FILE_PATH);
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
    return JSON.stringify(updatedData, null, 2);
};

export const updateBlockSettingsFile = (latestData: UpdateData): void => {
    const updatedDataString = createDataString(latestData);
    writeFileUtil(BLOCK_SETTINGS_FILE, updatedDataString);
};

export const isLoggedInOrExit = (): void => {
    if (!existsSync(RC_FILE_PATH)) {
        logError("You have been logged out. Please run 'element login'");
        exit(1);
    }
};
