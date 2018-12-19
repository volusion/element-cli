declare module "git-clone" {
    type Callback = (err: any, result: any) => void;
    type FuncDef = (
        gitUrl: string,
        name: string,
        opts: any,
        cb?: Callback
    ) => void;
    const func: FuncDef;
    export = func;
}

declare module "replace-in-file" {
    interface Options {
        files: string[];
        from: RegExp;
        to: string;
    }

    type FuncDef = (options: Options) => Promise<string[]>;
    const func: FuncDef;
    export = func;
}
