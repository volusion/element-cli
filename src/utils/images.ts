import { existsSync, readFileSync, statSync } from "fs";

import { THUMBNAIL_PATH } from "../constants";
import { logInfo, logWarn } from "./index";

const imageToBase64 = (path: string): string => readFileSync(path, "base64");

const doesExist = (path: string): boolean => existsSync(path);

export const prepareImage = (path: string): string => {
    if (doesExist(path)) {
        if (isImageSmallEnough(path, "1000kb")) {
            return imageToBase64(path);
        }
        logWarn(`Image too big at ${statSync(path).size} bytes.`);
        return "";
    }
    logInfo(`No image at ${THUMBNAIL_PATH}. Continuing...`);
    return "";
};

export const isImageSmallEnough = (path: string, size: string): boolean => {
    const imageSizeInBytes = statSync(path).size;
    return imageSizeInBytes < convertToBytes(size);
};

export const convertToBytes = (size: string): number => {
    const unitsLookup: { [key: string]: number } = {
        gb: 1000000000,
        kb: 1000,
        mb: 1000000,
    };
    const [val, units] = size.match(/(\d+)\s?(\wb)/i)!.slice(1);
    return parseInt(val, 10) * unitsLookup[units.toLowerCase()];
};
