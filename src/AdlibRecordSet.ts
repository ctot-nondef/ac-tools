import * as fs from "fs";
import { parse } from "csv-parse/sync"

import {IAdlibRecordSetInterface} from "./IAdlibRecordSet.interface";
import {EAdlibFieldNamesEnum, FieldCodesEnum} from "./EAdlibFieldNames.enum"

/**
 *
 */
export class AdlibRecordSet implements IAdlibRecordSetInterface{
    public name;
    public set;
    public srcUrl;

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
     * loads a file from the given path and attempts to parse it as an adlib tagged file
     * @param path
     */
    public loadSetFromFile = (path: string): null|number => {
        let data = fs.readFileSync(path, "utf-8");
        this.set = this.adlibDatToJson(data.replace(/^\uFEFF/, ""));
        return this.set.length;
    }

    /**
     * loads and parses a csv file from the specified path, if passed an array of field codes, they are used as column headings
     * if null is passed in fields, the contents of the first row are assumed to be headings, these can be either field names or
     * two letter field codes, a delimiter must be passed, there is no default
     * @param path
     * @param fields
     * @param delimiter
     */
    public loadSetFromCSV = (path: string, fields: FieldCodesEnum[] | null, delimiter: string): null|number => {
        const data = parse(fs.readFileSync(path, "utf-8"), {
            delimiter: delimiter,
            columns: fields ? fields:true,
        });
        const o = [];
        for(let i = data.length-1; i >= 0; i--) {
            o[i] = {};
            Object.keys(data[i]).forEach((k) => {
                let key = null;
                if(EAdlibFieldNamesEnum[k]) key = k;
                else if(this.fieldCodeByName(k)) key = this.fieldCodeByName(k);
                if (key) {
                    if(!o[i][key]) o[i][key] = [];
                    o[i][key].push(data[i][k])
                }
            })
        }
        this.set.push(...o)
        return data.length;
    }

    /**\
     * returns the two letter axiell field code when passed the fields name
     * @param name
     */
    public fieldCodeByName = (name: string): FieldCodesEnum|null => {
        const FieldNames = Object.values(EAdlibFieldNamesEnum);
        // @ts-ignore
        if(FieldNames.includes(name)) return Object.keys(EAdlibFieldNamesEnum).find(key => EAdlibFieldNamesEnum[key] === name);
        return null;
    }


    /**
     * parses an adlib export into a filterable array of objects
     * WARNING: this does not preserve line breaks etc from RTF fields!
     * @param {string}d an adlibdat string
     * @returns {[]} an array of objects
     */
    public adlibDatToJson = (d: string): Record<FieldCodesEnum, string[]>[] => {
        let source = d.split('**');
        console.log(`parsing ${source.length} records`);
        let o = [];
        for(let i = source.length-1; i >= 0; i--) {
            console.log(`parsing record ${i} of ${source.length}`);
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
        return o;
    }

    /**
     * serialises a specified selection of fields from the currently loaded set into an importable adlibdat string
     * @param {[string]}fields an array of fieldname - strings to be serialized
     * @returns {string} a serialized adlibdat string
     */
    public jsonToAdlibDat = (fields: FieldCodesEnum[]): string => {
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
    public recByField = (field: FieldCodesEnum, id: string, sel: FieldCodesEnum[]): Record<FieldCodesEnum, string[]> => {
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
