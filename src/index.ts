#!/usr/bin/env node

import * as program from "commander";
import * as inquirer from "inquirer";

import { cloneBoilerplate } from "./commands/cloneBoilerplate";
import { login } from "./commands/login";
import {
    blockDetails,
    newMajorVersion,
    publish,
    release,
    rollback,
    update,
} from "./commands/publish";
import { getCategoryNames, logError, logInfo } from "./utils";

program
    .version("3.0.3", "-v, --version")
    .usage(`[options] command`)
    .option("-V, --verbose", "Display verbose output")
    .description("Command line interface for the Volusion Element ecosystem");

export const isVerbose =
    process.argv.includes("-V") || process.argv.includes("--verbose");

// tslint:disable-next-line: no-console
const log = console.log;

program
    .command("login")
    .description("Log in using your Volusion credentials")
    .action(() => {
        inquirer
            .prompt([
                {
                    message: "Enter your username",
                    name: "username",
                    type: "input",
                },
                {
                    message: "Enter your password",
                    name: "password",
                    type: "password",
                },
            ])
            .then((val: any) => {
                const { username, password } = val;
                login(username, password);
            })
            .catch(logError);
    });

program
    .command("new <name>")
    .description(`Create the block boilerplate`)
    .action(name => {
        cloneBoilerplate(name);
    });

program
    .command("publish")
    .description(
        `Publish a block to the Block Theme Registry
                    [-n, --name NAME] [-c, --category CATEGORY] [-m, --major-version]
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
        "-m, --major-version [majorVersion]",
        "Publish a new major version of this block"
    )
    .action(async ({ name, category, majorVersion }) => {
        if (majorVersion) {
            inquirer
                .prompt({
                    default: true,
                    message: `Are you sure you want to create a new major release? We recommend tagging your major releases and creating new branches from them for future updates.`,
                    name: "majorConfirmation",
                    type: "confirm",
                })
                .then((confirmation: any) => {
                    if (confirmation.majorConfirmation) {
                        // tslint:disable-next-line: no-console
                        newMajorVersion().catch(e => console.error(e.message));
                    } else {
                        process.exit();
                    }
                });
        } else {
            const categories = await getCategoryNames();
            if (category) {
                publish(name, category, categories);
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
                        publish(name, categoryFromList).catch(e =>
                            // tslint:disable-next-line: no-console
                            console.error(e.message)
                        );
                    });
            }
        }
    });

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
                        Useful for debugging.`
    )
    .option(
        "-p, --toggle-public [togglePublic]",
        "Toggle whether or not the block is public."
    )
    .option(
        "-u, --unminified [unminified]",
        "Optional flag to disable bundle minify. By default, bundles are minified. Useful for debugging problems"
    )
    .action(({ togglePublic, unminified }) => {
        // tslint:disable-next-line: no-console
        update(togglePublic, unminified).catch(e => console.error(e.message));
    });

program
    .command("rollback")
    .description(
        `Rollback your existing block to a previous block in the Block Theme Registry
                   If this was a released block it will be pushed back to the staging state
                   and the previous released block will be used in production.
                   If this was a staged block it will be removed.
                   You can not rollback if you only have one released block.`
    )
    .action(() => {
        const versions = blockDetails();
        const { current, name } = versions;
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
                    process.exit();
                }
            });
    });

program
    .command("release")
    .description(
        `Release your existing block and push it live to the public.
                   However, other people can't use the block unless you update and toggle public.
                    [-n, --note] Note attached to the release`
    )
    .option("-n, --note [note]", "Note attached to the release")
    .action(({ note }: any) => {
        const versions = blockDetails();
        const { name } = versions;
        inquirer
            .prompt({
                default: true,
                message: `You are about to release your updates to ${name} to production.\nNon-major version changes will take effect immediately on the stores that have your block installed.\nContinue?`,
                name: "releaseConfirmation",
                type: "confirm",
            })
            .then((confirmation: any) => {
                if (confirmation.releaseConfirmation) {
                    release(note);
                } else {
                    log(
                        'If you are releasing a breaking change you should create a major release using "element publish -m"'
                    );
                    process.exit();
                }
            });
    });

program.on("command:*", () => {
    logError(`\nInvalid command: ${program.args.join(" ")}`);
    logInfo("\nSee --help for a list of available commands.");
    process.exit(1);
});

if (
    process.env.NODE_ENV !== "test" &&
    (process.argv.length <= 2 || (isVerbose && process.argv.length === 3))
) {
    program.outputHelp();
} else {
    program.parse(process.argv);
}
