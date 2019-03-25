import axios, { AxiosPromise, AxiosRequestConfig, AxiosResponse } from "axios";
import { exit } from "process";

import config from "../../config";
import * as packageFile from "../../package.json";
import { isVerbose } from "../../src/index";
import { RC_FILE_PATH, THUMBNAIL_PATH } from "../constants";
import {
    logError,
    logInfo,
    logWarn,
    prepareImage,
    readTokenFile,
} from "./index";

type HTTPVerbs = "GET" | "POST" | "PUT";

const getAppToken = (): string => {
    const token = readTokenFile(RC_FILE_PATH);
    if (!token) {
        logWarn("Please log in before proceeding:\n");
        exit(1);
    }
    return token;
};

const requestOptions = (
    method: HTTPVerbs,
    url: string
): {
    headers: {
        Authorization: string;
        "Content-Type": string;
        "Element-Cli-Version": string;
    };
    method: HTTPVerbs;
    url: string;
} => {
    if (isVerbose) {
        logInfo(`\nRequesting ${url}...\n\n`);
    }

    return {
        headers: {
            Authorization: `Bearer ${getAppToken()}`,
            "Content-Type": "application/json",
            "Element-Cli-Version": packageFile.version,
        },
        method,
        url,
    };
};

const buildRequestConfig = ({
    category,
    fileData,
    isPublic = false,
    method = "POST",
    names,
    version,
    url,
    note = "",
}: {
    category?: string;
    fileData: string;
    isPublic?: boolean;
    method: string;
    names: {
        displayName: string;
        publishedName: string;
    };
    version?: number;
    url: string;
    note?: string;
}): AxiosRequestConfig => {
    const options = requestOptions(method as HTTPVerbs, url);
    const thumbnail = prepareImage(THUMBNAIL_PATH);

    return {
        ...options,
        data: {
            content: fileData,
            metadata: {
                category,
                isPublic,
                names,
                note,
                thumbnail,
            },
            version,
        },
    };
};

const buildSimpleRequestConfig = ({
    method = "POST",
    url,
    data,
}: {
    method: string;
    url: string;
    data?: object;
}): AxiosRequestConfig => {
    const options = requestOptions(method as HTTPVerbs, url);

    return {
        ...options,
        data,
    };
};

export const getBlockRequest = (id: string): AxiosPromise =>
    axios(requestOptions("GET", `${config.blockRegistry.host}/blocks/${id}`));

export const createBlockRequest = (
    names: {
        displayName: string;
        publishedName: string;
    },
    fileData: string,
    category: string
): AxiosPromise =>
    axios(
        buildRequestConfig({
            category,
            fileData,
            method: "POST",
            names,
            url: `${config.blockRegistry.host}/blocks`,
        })
    );

export const updateBlockRequest = (
    names: {
        displayName: string;
        publishedName: string;
    },
    fileData: string,
    id: string,
    isPublic: boolean,
    version: number
): AxiosPromise =>
    axios(
        buildRequestConfig({
            fileData,
            isPublic,
            method: "PUT",
            names,
            url: `${config.blockRegistry.host}/blocks/${id}`,
            version,
        })
    );

export const createMajorBlockRequest = (
    content: string,
    id: string,
    version: number
): AxiosPromise =>
    axios(
        buildSimpleRequestConfig({
            data: {
                content,
                version,
            },
            method: "POST",
            url: `${config.blockRegistry.host}/blocks/${id}/major`,
        })
    );

export const releaseBlockRequest = (
    id: string,
    note: string,
    version: number
): AxiosPromise =>
    axios(
        buildSimpleRequestConfig({
            data: {
                note,
                version,
            },
            method: "PUT",
            url: `${config.blockRegistry.host}/blocks/${id}/release`,
        })
    );

export const rollbackBlockRequest = (
    id: string,
    version: number
): AxiosPromise =>
    axios(
        buildSimpleRequestConfig({
            data: {
                version,
            },
            method: "PUT",
            url: `${config.blockRegistry.host}/blocks/${id}/rollback`,
        })
    );

export const getCategoryNames = async (): Promise<string[] | undefined> => {
    try {
        const url = `${config.blockRegistry.host}/categories`;
        return await axios(requestOptions("GET", url)).then(
            (categories: AxiosResponse) =>
                categories.data.map(
                    (category: { id: string; name: string }) => category.name
                )
        );
    } catch (err) {
        logError(`Trouble reaching the categories service: ${err.message}`);
        exit(1);
    }
};

export const loginRequest = (
    username: string,
    password: string
): AxiosPromise => {
    const data = {
        audience: config.auth0Audience,
        client_id: config.auth0ClientId,
        grant_type: config.grant_type,
        password,
        realm: config.realm,
        scope: config.scope,
        username,
    };

    if (isVerbose) {
        logInfo(`\nRequesting ${config.loginUrl}...\n\n`);
    }

    return axios({ data, method: "POST", url: config.loginUrl });
};
