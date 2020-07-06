import { deleteTokenFile, logInfo } from "../utils";

export const logout = (): void => {
    deleteTokenFile();
    logInfo(`You have been logged out`);
};
