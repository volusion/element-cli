#!/usr/bin/env node

import * as program from "commander";
import * as inquirer from "inquirer";

import { cloneBoilerplate } from "./commands/cloneBoilerplate";
import { login } from "./commands/login";
import {
    newMajorVersion,
    publish,
    release,
    rollback,
    update,
} from "./commands/publish";
import { getCategoryNames, logError, logInfo } from "./utils";

program
    .version("2.0.2", "-v, --version")
    .usage(`[options] command`)
    .option("-V, --verbose", "Display verbose output")
    .description("Command line interface for the Volusion Element ecosystem");

export const isVerbose =
    process.argv.includes("-V") || process.argv.includes("--verbose");

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
    .description(
        `Create the block boilerplate
                    [-g, --git]`
    )
    .option("-g, --git [git]", "Use git to manage major block versions")
    .action((name, { git }) => {
        cloneBoilerplate(name, git);
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
            newMajorVersion();
        } else {
            const breaking = "Yes, breaking change";
            inquirer
                .prompt({
                    choices: ["No", breaking],
                    message: "Are making a breaking change?",
                    name: "breakingChange",
                    type: "list",
                })
                .then(async change => {
                    if (change === breaking) {
                        newMajorVersion();
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
                                    publish(name, categoryFromList);
                                });
                        }
                    }
                });
        }
    });

program
    .command("update")
    .description(
        `Update your existing block in the Block Theme Registry
                    [-p, --toggle-public] An optional flag to toggle
                    whether or not the block is viewable by members
                    outside of your organization.`
    )
    .option(
        "-p, --toggle-public [togglePublic]",
        "Toggle whether or not the block is public."
    )
    .action(({ togglePublic }: any) => {
        update(togglePublic);
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
        rollback();
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
        release(note);
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
