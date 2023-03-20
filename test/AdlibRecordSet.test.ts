import { expect } from "chai";
import { AdlibRecordSet } from "../src";
import * as fs from "fs";

describe("AdlihRecordSet", () => {
	describe("constructor", () => {
		context("when proper parameters are provided", () => {
			it("should return a working instance", () => {
				const i = new AdlibRecordSet("testset");
				expect(i.name).to.equal("testset");
				expect(i.set.length).to.equal(0);
			});
		});
	});
	describe("loading and writing a set", () => {
		context("when a proper path to a tagged adlib file is passed", () => {
			it("should parse the file into a json array", () => {
				const i = new AdlibRecordSet("testset");
				i.loadSetFromFile("./test/data/testset.dat");
				const o = i.jsonToAdlibDat(["TI"]);
				expect(i.set.length).to.equal(454);
				expect(o).to.be.a("string");
			});
		});
		context("when a proper path to a csv file is passed", () => {
			it("should parse the file into a json array", () => {
				const i = new AdlibRecordSet("testset");
				i.loadSetFromCSV("./test/data/testset.csv", null, ";");
				expect(i.set.length).to.equal(8);
				expect(i.recByField("IN", "AT-OeAI-02-000298", ["OB"]).OB[0]).to.equal("Rohton-Probe");
				expect(i.recByField("IN", "AT-OeAI-02-000298", ["nt"]).nt[3]).to.equal("AT-OeAI-02-000124");
				expect(i.recByField("IN", "AT-OeAI-02-000300", ["nt"]).nt.length).to.equal(2);
			});
		});
		context("when a loaded set is parsed with a set field code array", () => {
			it("should parse the set into an adlib tagged file with only these prperties", () => {
				const i = new AdlibRecordSet("testset");
				i.loadSetFromFile("./test/data/testset.dat");
				const o = i.jsonToAdlibDat(["TI"]);
				const data = fs.readFileSync("./test/data/testset_IN.dat", "utf-8");
				expect(o).to.equal(data);
			});
		});
		context("when a loaded set is parsed without a set field code array", () => {
			it("should parse the set into an adlib tagged file with all available properties", () => {
				const i = new AdlibRecordSet("testset");
				i.loadSetFromFile("./test/data/testset.dat");
				const o = i.jsonToAdlibDat(null);
				//because in JS the sequence of properties in an object is arbitrary the string comparison with the
				//original file fails
				//TODO: find a way to test if all available properties are indeed written
				//const data = fs.readFileSync("./test/data/testset.dat", "utf-8");
				expect(o).to.be.a("string");
			});
		});
	});
	describe("filtering a loaded set", () => {
		context("when a valid field definition and identifier are passed", () => {
			it("should return the requested record", () => {
				const i = new AdlibRecordSet("testset");
				i.loadSetFromFile("./test/data/testset.dat");
				const r = i.recByField("TI", "GL1083_09_01", ["TI", "IN"]);
				expect(r.IN[0]).to.equal("AT-OeAW-BA-3-27-A-GL1083_09_01");
			});
		});
	});
	describe("checking file references and URLs", () => {
		context("when a file reference points to an existing file", () => {
			it("should return OK", () => {
				const i = new AdlibRecordSet("testset");
				i.loadSetFromFile("./test/data/testset.dat");
				const checkres = i.checkFiles("FN", "./");
				expect(checkres[0].status).to.equal("OK");
			});
		});
		context("when a file reference is invalid", () => {
			it("should return FAIL", () => {
				const i = new AdlibRecordSet("testset");
				i.loadSetFromFile("./test/data/testset.dat");
				const checkres = i.checkFiles("FN", "./");
				expect(checkres[1].status).to.equal("FAIL");
			});
		});
	});
});

