import axios, { AxiosPromise, AxiosRequestConfig, AxiosResponse } from "axios";
import { exit } from "process";

import config from "../../config";
import * as packageFile from "../../package.json";
import { isVerbose } from "../../src/index";
import { RC_FILE_PATH, THUMBNAIL_PATH } from "../constants";
import {
    checkErrorCode,
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
        "User-Agent": string;
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
            "User-Agent": config.userAgent,
        },
        method,
        url,
    };
};

const buildRequestConfig = ({
    category,
    fileData,
    id,
    isPublic = false,
    method = "POST",
    names,
    version,
    url,
    defaultConfig,
    note = "",
    integrationId,
    outputCacheDuration,
}: {
    category?: string;
    fileData: string;
    id?: string;
    isPublic?: boolean;
    method: string;
    names: {
        displayName: string;
        publishedName: string;
    };
    version?: number;
    url: string;
    defaultConfig: { [key: string]: any };
    note?: string;
    integrationId: number | undefined;
    outputCacheDuration: number;
}): AxiosRequestConfig => {
    const options = requestOptions(method as HTTPVerbs, url);
    const thumbnail = prepareImage(THUMBNAIL_PATH);

    return {
        ...options,
        data: {
            content: fileData,
            defaultConfig,
            id,
            integrationId,
            metadata: {
                category,
                isPublic,
                names,
                note,
                thumbnail,
            },
            outputCacheDuration,
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

export const createBlockId = (): AxiosPromise =>
    axios(
        buildSimpleRequestConfig({
            method: "POST",
            url: `${config.blockRegistry.host}/blocks/blockId`,
        })
    );

export const getBlockRequest = (id: string, version?: number): AxiosPromise => {
    const optionalVersionQueryString = version ? "?version=" + version : "";
    return axios(
        requestOptions(
            "GET",
            `${config.blockRegistry.host}/blocks/${id}${optionalVersionQueryString}`
        )
    );
};

export const createBlockRequest = ({
    defaultConfig,
    id,
    names,
    fileData,
    category,
    integrationId,
    outputCacheDuration,
}: {
    defaultConfig: { [key: string]: any };
    id: string;
    names: {
        displayName: string;
        publishedName: string;
    };
    fileData: string;
    category: string;
    integrationId: number | undefined;
    outputCacheDuration: number;
}): AxiosPromise =>
    axios(
        buildRequestConfig({
            category,
            defaultConfig,
            fileData,
            id,
            integrationId,
            method: "POST",
            names,
            url: `${config.blockRegistry.host}/blocks`,
            outputCacheDuration,
        })
    );

export const updateBlockRequest = ({
    defaultConfig,
    names,
    fileData,
    id,
    isPublic,
    version,
    category,
    integrationId,
    outputCacheDuration,
}: {
    defaultConfig: { [key: string]: any };
    names: {
        displayName: string;
        publishedName: string;
    };
    fileData: string;
    id: string;
    isPublic: boolean;
    version: number;
    category: string | undefined;
    integrationId: number | undefined;
    outputCacheDuration: number;
}): AxiosPromise =>
    axios(
        buildRequestConfig({
            category,
            defaultConfig,
            fileData,
            isPublic,
            method: "PUT",
            names,
            url: `${config.blockRegistry.host}/blocks/${id}`,
            version,
            integrationId,
            outputCacheDuration,
        })
    );

export const createMajorBlockRequest = (
    defaultConfig: { [key: string]: any },
    content: string,
    id: string
): AxiosPromise =>
    axios(
        buildSimpleRequestConfig({
            data: {
                content,
                defaultConfig,
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
        return axios(
            requestOptions("GET", url)
        ).then((categories: AxiosResponse) =>
            categories.data.map(
                (category: { id: string; name: string }) => category.name
            )
        );
    } catch (err) {
        logError(`Trouble reaching the categories service: ${err.message}`);
        checkErrorCode(err);
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
        logInfo(`\nRequesting ${config.loginUrl}...`);
        logInfo(
            `with data ${JSON.stringify({ ...data, password: "*****" })}\n\n`
        );
    }

    return axios({
        data,
        headers: { "User-Agent": config.userAgent },
        method: "POST",
        url: config.loginUrl,
    });
};
