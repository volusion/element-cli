#!/usr/bin/env node

import * as program from "commander";
import * as inquirer from "inquirer";
import { exit } from "process";

import { cloneBoilerplate } from "./commands/cloneBoilerplate";
import { login } from "./commands/login";
import { logout } from "./commands/logout";
import {
    blockDetails,
    newMajorVersion,
    publish,
    release,
    rollback,
    update,
} from "./commands/publish";
import {
    BLOCK_SETTINGS_FILE,
    ELEMENT_VERSION,
    INTEGRATIONS,
} from "./constants";
import {
    getBlockRequest,
    getCategoryNames,
    isLoggedInOrExit,
    logError,
    logInfo,
    logWarn,
    readBlockSettingsFile,
} from "./utils";

export const isVerbose =
    process.argv.includes("-V") || process.argv.includes("--verbose");
export const skipBuild =
    process.argv.includes("-S") || process.argv.includes("--skip-build");

program
    .version(ELEMENT_VERSION, "-v, --version")
    .usage(`[options] command`)
    .option("-V, --verbose", "Display verbose output")
    .option("-S, --skip-build", "Skip build")
    .description("Command line interface for the Volusion Element ecosystem");

program
    .command("login")
    .description(
        `Log in using your Volusion credentials
                    [-u, --username USERNAME]`
    )
    .option("-u, --username [username]", "Volusion username")
    .option("-p, --password [password]", "Volusion password")
    .action(({ username, password }) => {
        const prompts = [];
        if (!username) {
            prompts.push({
                message: "Enter your username",
                name: "usernameInput",
                type: "input",
            });
        }
        if (!password) {
            prompts.push({
                message: "Enter your password",
                name: "passwordInput",
                type: "password",
            });
        }
        inquirer
            .prompt(prompts)
            .then((val: any) => {
                const { usernameInput, passwordInput } = val;
                login(username || usernameInput, password || passwordInput);
            })
            .catch(logError);
    });

program
    .command("logout")
    .description("Log out of the cli")
    .action(() => {
        isLoggedInOrExit();
        logout();
    });

program
    .command("new <name>")
    .description(`Create the block boilerplate`)
    .action((name) => {
        isLoggedInOrExit();

        cloneBoilerplate(name);
    });

program
    .command("categories")
    .description("List categories")
    .action(async () => {
        isLoggedInOrExit();
        const categories = await getCategoryNames();
        logInfo((categories || []).join("\n"));
    });

program
    .command("info")
    .description("View block metadata information from server")
    .action(async () => {
        isLoggedInOrExit();
        const { activeVersion, id, published } = readBlockSettingsFile(
            BLOCK_SETTINGS_FILE
        );
        if (!published) {
            logWarn(
                "You must first publish your block to view server information."
            );
            exit(1);
        }
        const block = await getBlockRequest(id, activeVersion).catch(
            (err: Error) => {
                logError(err);
                exit(1);
            }
        );
        logInfo("Block metadata:");
        logInfo(JSON.stringify(block.data.metadata, null, 2));
    });

program
    .command("publish")
    .description(
        `Publish a block to the Block Theme Registry
                    [-n, --name NAME]
                    [-c, --category CATEGORY]
                    [-i, --integration]
                    [-m, --major-version]
                    [-s, --silent] An optional flag to suppress prompts
                    [--cache-duration NUMBER] An optional cache duration in seconds.
                      Defaults to 0 (no cache).
                    Suggestion: Keep your screenshots under 500 kb
                                and aim for more of a rectangle than
                                a square.`
    )
    .option(
        "-n, --name [name]",
        "Name for publishing (defaults to directory name)"
    )
    .option(
        "-c, --category [category]",
        "The Category name that best fits this block"
    )
    .option(
        "-i, --integration [integration]",
        `The integration this block is built for. Options are: ${Object.keys(
            INTEGRATIONS
        )
            .map((x) => `"${x}"`)
            .join(", ")}. Defaults to 'standard'.`
    )
    .option(
        "-m, --major-version [majorVersion]",
        "Publish a new major version of this block"
    )
    .option("-s, --silent [silent]", "Suppress prompts")
    .option(
        "--cache-duration [cacheDuration]",
        "Cache duration in seconds",
        "0"
    )
    .action(
        async ({
            name,
            category,
            majorVersion,
            silent,
            integration,
            cacheDuration,
        }) => {
            isLoggedInOrExit();
            if (majorVersion) {
                const recommendMsg =
                    "We recommend tagging your major releases and creating new branches from them for future updates.";
                if (silent) {
                    logInfo(recommendMsg);
                    await newMajorVersion();
                }
                inquirer
                    .prompt({
                        default: true,
                        message: `Are you sure you want to create a new major release? ${recommendMsg}`,
                        name: "majorConfirmation",
                        type: "confirm",
                    })
                    .then((confirmation: any) => {
                        if (confirmation.majorConfirmation) {
                            newMajorVersion().catch((e) => logError(e.message));
                        } else {
                            exit(0);
                        }
                    });
            } else {
                const categories = await getCategoryNames();
                if (!category && silent) {
                    logError(
                        "When passing the silent flag, you must pass --category\n"
                    );
                    logInfo("Please choose from the list of valid categories:");
                    logInfo((categories || []).join("\n"));
                    exit(1);
                }
                if (category) {
                    publish({
                        name,
                        category,
                        categories,
                        integrationName: integration,
                        cacheDuration,
                    });
                } else {
                    inquirer
                        .prompt({
                            choices: categories,
                            message:
                                "Select the Category that best fits this block:",
                            name: "categoryFromList",
                            type: "list",
                        })
                        .then((val: any) => {
                            const { categoryFromList } = val;
                            publish({
                                name,
                                category: categoryFromList,
                                integrationName: integration,
                                cacheDuration,
                            }).catch((e) => logError(e.message));
                        });
                }
            }
        }
    );

program
    .command("update")
    .description(
        `Update your existing block in the Block Theme Registry
                    [-p, --toggle-public]
                        An optional flag to toggle
                        whether or not the block is viewable by members
                        outside of your organization.
                    [-u, --unminified]
                        Optionally, do not minify the bundle sent to the server.
                        Useful for debugging.
                    [-c, --category CATEGORY]
                        Optionally change the block's category.
                    [-i, --integration]
                        Optionally change the block's integration.
                    [--cache-duration NUMBER]
                        Optionally change the cache duration (in seconds).
                        0 means no cache.`
    )
    .option(
        "-p, --toggle-public [togglePublic]",
        "Toggle whether or not the block is public."
    )
    .option(
        "-u, --unminified [unminified]",
        "Optional flag to disable bundle minify. By default, bundles are minified. Useful for debugging problems"
    )
    .option(
        "-c, --category [category]",
        "The Category name that best fits this block"
    )
    .option(
        "-i, --integration [integration]",
        `The integration this block is built for. Options are: ${Object.keys(
            INTEGRATIONS
        )
            .map((x) => `"${x}"`)
            .join(", ")}.`
    )
    .option("--cache-duration [cacheDuration]", "Cache duration in seconds")
    .action(
        ({
            togglePublic,
            unminified,
            category,
            integration,
            cacheDuration,
        }) => {
            isLoggedInOrExit();
            update({
                togglePublic,
                unminified,
                updatedCategory: category,
                updatedIntegration: integration,
                cacheDuration,
            }).catch((e) => logError(e.message));
        }
    );

program
    .command("rollback")
    .description(
        `Rollback your existing block to a previous block in the Block Theme Registry
                    [-s, --silent] An optional flag to suppress prompts
                    If this was a released block it will be pushed back to the staging state
                    and the previous released block will be used in production.
                    If this was a staged block it will be removed.
                    You can not rollback if you only have one released block.`
    )
    .option("-s, --silent [silent]", "Suppress confirmation prompts")
    .action(async ({ silent }) => {
        isLoggedInOrExit();
        const versions = blockDetails();
        const { current, name } = versions;
        if (silent) {
            await rollback();
        }
        inquirer
            .prompt({
                default: true,
                message: `Do you want to rollback ${name} to the previous active release of version ${current}?\nThis will affect all the stores that have your block installed.\nContinue?`,
                name: "rollbackConfirmation",
                type: "confirm",
            })
            .then((confirmation: any) => {
                if (confirmation.rollbackConfirmation) {
                    rollback();
                } else {
                    exit();
                }
            });
    });

program
    .command("release")
    .description(
        `Release your existing block and push it live to the public.
                   However, other people can't use the block unless you update and toggle public.
                    [-n, --note] Note attached to the release
                    [-s, --silent] An optional flag to suppress prompts`
    )
    .option("-n, --note [note]", "Note attached to the release")
    .option("-s, --silent [silent]", "Suppress confirmation prompts")
    .action(async ({ note, silent }: any) => {
        isLoggedInOrExit();
        const versions = blockDetails();
        const { name } = versions;
        const nonMajorInfoMsg =
            "Non-major version changes will take effect immediately on the stores that have your block installed.";
        if (silent) {
            logInfo(`Releasing updates to ${name}.\n${nonMajorInfoMsg}`);
            await release(note);
        }
        inquirer
            .prompt({
                default: true,
                message: `You are about to release your updates to ${name} to production.\n${nonMajorInfoMsg}\nContinue?`,
                name: "releaseConfirmation",
                type: "confirm",
            })
            .then((confirmation: any) => {
                if (confirmation.releaseConfirmation) {
                    release(note);
                } else {
                    logInfo(
                        'If you are releasing a breaking change you should create a major release using "element publish -m"'
                    );
                    exit();
                }
            });
    });

program.on("command:*", () => {
    logError(`\nInvalid command: ${program.args.join(" ")}`);
    logInfo("\nSee --help for a list of available commands.");
    exit(1);
});

if (
    process.env.NODE_ENV !== "test" &&
    (process.argv.length <= 2 ||
        (isVerbose && process.argv.length === 3) ||
        (skipBuild && process.argv.length === 3))
) {
    program.outputHelp();
} else {
    program.parse(process.argv);
}
