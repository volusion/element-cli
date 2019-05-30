import { exec } from "child_process";
import { existsSync } from "fs";
import * as path from "path";
import * as util from "util";
const execAsyc = util.promisify(exec);

const commitFiles = async (message: string): Promise<void> => {
    await execAsyc(`git add -A && git commit -m "${message}"`);
};

export const gitInit = async (name: string): Promise<void> => {
    await execAsyc(`git init ${path.resolve(name)}`);
};

export const createBranch = async (branch: string): Promise<void> => {
    const git = path.resolve(process.cwd(), ".git");

    if (!existsSync(git)) {
        throw new Error("This is not a .git repo");
    }

    await execAsyc(`git checkout -b ${branch}`);
    await commitFiles(`init ${branch}`);
};

export const updateBranch = async (branch: string): Promise<void> => {
    await commitFiles(`update ${branch}`);
};

export const cloneRepo = async (url: string, local: string): Promise<void> => {
    await execAsyc(`git clone ${url} ${local}`);
};

export const branchLookup = async (branch: string): Promise<boolean> => {
    const { stdout } = await execAsyc(`git branch --list ${branch}`);
    if (stdout) {
        return true;
    }

    return false;
};
