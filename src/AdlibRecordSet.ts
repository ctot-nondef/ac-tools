import * as fs from "fs";
import {IAdlibRecordSetInterface} from "./IAdlibRecordSet.interface";

/**
 *
 */
export class AdlibRecordSet implements IAdlibRecordSetInterface{
    public name;
    public set;

    /**
     * creates a new instance and sets the name passed
     * to load a set please refer to loadSetFromFile
     * @param name
     */
    constructor(name: string) {
        this.name = name;
        this.set = [];
    }

    /**
     * loads a file from given path and attempts to parse it as an adlib tagged file
     * @param path
     */
    public loadSetFromFile = (path: string): null|number => {
        let data = fs.readFileSync(path, "utf-8");
        this.set = this.adlibDatToJson(data.replace(/^\uFEFF/, ""));
        return this.set.length;
    }

    /**
     * parses an adlib export into a filterable array of objects
     * WARNING: this does not preserve line breaks etc from RTF fields!
     * @param {string}d an adlibdat string
     * @returns {[]} an array of objects
     */
    private adlibDatToJson = (d: string): Record<string, any>[] => {
        let source = d.split('**');
        console.log(`parsing ${source.length} records`);
        let o = [];
        for(let i = source.length; i >= 0; i--) {
            console.log(`parsing record ${i} of ${source.length}`);
            if(source[i]) {
                let l = source[i].split(/\n/);
                o[i] = {};
                let prevtag = '';
                for(let y = 0; y <= l.length; y++) {
                    if(l[y]) {
                        let tag = l[y].substring(0, 2);
                        if (tag !== '  ' && !tag.match(/\r/) ) {
                            if (!o[i][tag]) o[i][tag] = [];
                            o[i][tag].push(l[y].substring(3).replace(/[\r]+/g, ''));
                            prevtag = tag;
                        }
                        if (tag === '  ') {
                            o[i][prevtag][0] = o[i][prevtag][0] + l[y].substring(3).replace(/[\r]+/g, '');
                        }
                    }
                }
            }
        }
        return o;
    }

    /**
     * serialises a specified selection of fields from an array of adlibdat
     * objects into an importable adlibdat string
     * @param {[string]}fields an array of fieldname - strings to be serialized
     * @returns {string} a serialized adlibdat string
     */
    public jsonToAdlibDat = (fields: string[]): string => {
        let x = 0;
        return this.set.reduce((acc, val) => {
            let i = 0;
            fields.forEach((f) => {
                if(Array.isArray(val[f])) {
                    val[f].forEach((y) => {
                        acc += `${f} ${y}\n`
                    })
                    i++;
                }
            });
            if(i>0) acc += `**\n`;
            x++;
            return acc;
        }, '');
    }

    /**
     * Filters the loaded set for a passed {id} in the defined {field}
     * Returns the FIRST record matched
     * @param {string} field
     * @param {string} id
     * @param {[string]} sel
     * @returns {[]}
     */
    public recByField = (field: string, id: string, sel: string[]): Record<string, any> => {
        let res = this.set.filter((rec) => {
            return !!(Array.isArray(rec[field]) && rec[field].includes(id));
        });
        return res.map((rec) => {
            let m = {};
            sel.forEach((key) => {
                if(rec[key]) m[key] = rec[key];
                else m[key] = [];
            })
            return m;
        })[0];
    }
}
