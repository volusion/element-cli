import { exec } from "child_process";
import * as util from "util";
const execAsyc = util.promisify(exec);

export const cloneRepo = async (url: string, local: string): Promise<void> => {
    await execAsyc(`git clone ${url} ${local}`);
};
