import * as Git from "nodegit";
import * as path from "path";

const commitFiles = async (
    repository: Git.Repository,
    message: string
): Promise<Git.Oid> => {
    const index = await repository.refreshIndex();

    await index.addAll();
    await index.write();
    await index.writeTree();

    const files = index.entries().map(entry => entry.path);

    const signature = Git.Signature.default(repository);

    return await repository.createCommitOnHead(
        files,
        signature,
        signature,
        message
    );
};

export const gitInit = async (name: string): Promise<void> => {
    await Git.Repository.init(path.resolve(name), 0);
};

export const createBranch = async (branch: string): Promise<void> => {
    const repository = await Git.Repository.open(
        path.resolve(process.cwd(), ".git")
    );

    const commit = await commitFiles(repository, `init ${branch}`);

    await repository.createBranch(branch, commit, true);
    await repository.checkoutBranch(branch, {});
};

export const updateBranch = async (branch: string): Promise<void> => {
    const repository = await Git.Repository.open(
        path.resolve(process.cwd(), ".git")
    );

    await repository.checkoutBranch(branch, {});

    await commitFiles(repository, `update ${branch}`);
};

export const cloneRepo = async (url: string, local: string): Promise<void> => {
    await Git.Clone.clone(url, local, {
        fetchOpts: {
            callbacks: {
                certificateCheck: (): number => 0,
            },
        },
    });
};

export const branchLookup = async (branch: string): Promise<boolean> => {
    const repository = await Git.Repository.open(
        path.resolve(process.cwd(), ".git")
    );

    try {
        await Git.Branch.lookup(repository, branch, 0);

        return Promise.resolve(true);
    } catch (err) {
        return Promise.resolve(false);
    }
};
