#!/usr/bin/env node

import {Command} from "commander";

const program = new Command();

import AdlibRecordSet from "../index";



async function run() {
    program
        .name("thumbnailfetcher")
        .description("command line tool to fetch thumbnail images based on API input")
        .version("0.0.1");
    program.command("fetch")
        .description("Fetch thumbnail images for a configured vufind query set")
        .argument("<configpath>", "Location of the configuration")
        .argument("<setname>", "Name of the query set")
        .action(async (configpath: string, set: string) => {
        });

    program.parse();

}

run().catch((e) => {
    console.log("Error", e);
});
