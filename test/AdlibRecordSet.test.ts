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
        });
    })
})
