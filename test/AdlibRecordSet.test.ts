import { expect } from "chai";
import { AdlibRecordSet } from "../src/AdlibRecordSet";

describe ("AdlihRecordSet", () => {
    describe("constructor", () => {
        context("when proper parameters are provided", () => {
            it("should return a working instance", () => {
                const i = new AdlibRecordSet("testset");
                expect(i.name).to.equal("testset");
                expect(i.set.length).to.equal(0);
            })
        })
    })
    describe("loading and writing a set", () => {
        context("when a proper path to a tagged adlib file is passed", () => {
            it("should parsed the file into a json array", () => {
                const i = new AdlibRecordSet("testset");
                i.loadSetFromFile("./test/data/testset.dat");
                const o = i.jsonToAdlibDat(["TI"]);
                expect(i.set.length).to.equal(453);
                expect(o).to.be.a("string");
            })
        })
    })
    describe("filtering a loaded set", () => {
        context("when a valid field definition and identifier are passed", () => {
            it("should return the requested record", () => {
                const i = new AdlibRecordSet("testset");
                i.loadSetFromFile("./test/data/testset.dat");
                const r = i.recByField("TI", "GL1083_09_01",["TI","IN"]);
                expect(r.IN[0]).to.equal("AT-OeAW-BA-3-27-A-GL1083_09_01");
            })
        })
    })
})
