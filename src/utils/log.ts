import { AxiosError } from "axios";
import * as chalk from "chalk";

// tslint:disable no-console
const log = console.log;
const logErr = console.error;
export const logWarn = console.warn;
// tslint:enable no-console

export const logError = (toLog: string | Error): void => {
    logErr(chalk.default.red(toLog.toString()));
};

export const logInfo = (toLog: string): void => {
    log(chalk.default.yellow(toLog));
};

export const logSuccess = (toLog: string): void => {
    log(chalk.default.green(toLog));
};

export const checkErrorCode = (err: AxiosError): void => {
    if (err.response && err.response.status === 413) {
        const roundedContentSize = Math.round(
            err.config.headers!["Content-Length"] / 1000
        );
        const message = `Your total upload size -- block, screenshot, and metadata -- was approximately ${roundedContentSize} kb and the maximum payload size is 1000 kb. For an easy win, you could try decreasing the size of the thumbnail.`;
        logInfo(message);
    } else if (err.response && err.response.data) {
        logInfo(err.response.data);
    }
};
