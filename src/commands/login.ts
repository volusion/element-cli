import { AxiosResponse } from "axios";
import { exit } from "process";

import { logError, logInfo, loginRequest, writeTokenFile } from "../utils";

const saveTokenToFile = (idToken: string): void => {
    writeTokenFile(idToken);
};

export const login = (username: string, password: string): Promise<void> => {
    return loginRequest(username, password)
        .then((response: AxiosResponse) => {
            saveTokenToFile(response.data.id_token);
            logInfo(`Logged in as ${username}.`);
            exit(0);
        })
        .catch(err => {
            logError(`Problem with the login process: ${err.message}`);
            exit(1);
        });
};
