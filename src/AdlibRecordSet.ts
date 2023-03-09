import * as fs from "fs";
import { parse } from "csv-parse/sync";

import { IAdlibRecordSetInterface } from "./IAdlibRecordSet.interface";
import { EAdlibFieldNamesEnum, FieldCodesEnum } from "./EAdlibFieldNames.enum";
import { TAdlibRecordType } from "./TAdlibRecord.type";

/**
 *
 * @implements IAdlibRecordSetInterface
 */
export class AdlibRecordSet implements IAdlibRecordSetInterface {
	public name;
	public set: TAdlibRecordType[];
	public srcUrl: URL | undefined;

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
	 * sets the source URL of an Adlib instance from wich the current set is loaded
	 * @param url
	 */
	public setSrcUrl = (url: URL): void => {
		this.srcUrl = url;
	};

	/**
	 * loads a file from the given path and attempts to parse it as an adlib tagged file
	 * @param path
	 */
	public loadSetFromFile = (path: string): null | number => {
		const data = fs.readFileSync(path, "utf-8");
		this.set = this.adlibDatToJson(data.replace(/^\uFEFF/, ""));
		return this.set.length;
	};

	/**
	 * loads and parses a csv file from the specified path, if passed an array of field codes, they are used as column headings
	 * if null is passed in fields, the contents of the first row are assumed to be headings, these can be either field names or
	 * two letter field codes, a delimiter must be passed, there is no default
	 * @param path
	 * @param fields
	 * @param delimiter
	 */
	public loadSetFromCSV = (
		path: string,
		fields: FieldCodesEnum[] | null,
		delimiter: string,
	): null | number => {
		const data = parse(fs.readFileSync(path, "utf-8"), {
			delimiter,
			columns: fields ? fields : true,
			group_columns_by_name: true,
		});
		const o: any[] = [];
		for (let i = data.length - 1; i >= 0; i--) {
			o[i] = {};
			Object.keys(data[i]).forEach((k) => {
				let key = null;
				// @ts-ignore
				if (EAdlibFieldNamesEnum[k]) {
					key = k;
				} else if (this.fieldCodeByName(k)) {
					key = this.fieldCodeByName(k);
				}
				if (key) {
					if (!o[i][key]) {
						o[i][key] = [];
					}
					if (Array.isArray(data[i][k])) {
						o[i][key].push(...data[i][k].filter((str: string) => str !== ""));
					} else if (data[i][k] !== "") {
						o[i][key].push(data[i][k]);
					}
				}
			});
		}
		this.set.push(...o.filter((rec: any) => Object.keys(rec).length !== 0));
		return data.length;
	};

	/**\
	 * returns the two letter axiell field code when passed the fields name
	 * @param name
	 */
	public fieldCodeByName = (name: string): FieldCodesEnum | null => {
		const FieldNames = Object.values(EAdlibFieldNamesEnum);
		// @ts-ignore
		if (FieldNames.includes(name)) {
			// @ts-ignore
			return Object.keys(EAdlibFieldNamesEnum).find((key) => EAdlibFieldNamesEnum[key] === name);
		}
		return null;
	};

	/**
	 * parses an adlib export into a filterable array of objects
	 * WARNING: this does not preserve line breaks etc from RTF fields!
	 * @param {string}d an adlibdat string
	 * @returns {[]} an array of objects
	 */
	public adlibDatToJson = (d: string): TAdlibRecordType[] => {
		const source = d.split("**");
		console.log(`parsing ${source.length} records`);
		const o: TAdlibRecordType[] = [];
		for (let i = source.length - 1; i >= 0; i--) {
			console.log(`parsing record ${i} of ${source.length}`);
			const l = source[i].split(/\n/);
			o[i] = {};
			let prevtag = "";
			for (let y = 0; y <= l.length; y++) {
				if (l[y]) {
					// @ts-ignore
					const tag: FieldCodesEnum = l[y].substring(0, 2);
					// @ts-ignore
					if (tag !== "  " && !tag.match(/\r/)) {
						// @ts-ignore
						if (!o[i][tag]) {
							o[i][tag] = [];
						}
						// @ts-ignore
						o[i][tag].push(l[y].substring(3).replace(/[\r]+/g, ""));
						prevtag = tag;
					}
					// @ts-ignore
					if (tag === "  ") {
						// @ts-ignore
						o[i][prevtag][0] = o[i][prevtag][0] + l[y].substring(3).replace(/[\r]+/g, "");
					}
				}
			}
		}
		return o;
	};

	/**
	 * serialises a specified selection of fields from the currently loaded set into an importable adlibdat string
	 * @param {[string]}fields an array of fieldname - strings to be serialized
	 * @returns {string} a serialized adlibdat string
	 */
	public jsonToAdlibDat = (fields: FieldCodesEnum[]|null): string => {
		let x = 0;
		return this.set.reduce((acc, val) => {
			let i = 0;
			let ifields;
			if(Array.isArray(fields)) {
				ifields = fields;
			} else {
				ifields = Object.keys(EAdlibFieldNamesEnum);
			}
			ifields.forEach((f) => {
				// @ts-ignore
				if (Array.isArray(val[f])) {
					// @ts-ignore
					val[f].forEach((y) => {
						acc += `${f} ${y}\n`;
					});
					i++;
				}
			});
			if (i > 0) {
				acc += `**\n`;
			}
			x++;
			return acc;
		}, "");
	};

	/**
	 * Filters the loaded set for a passed {id} in the defined {field}
	 * Returns the FIRST record matched
	 * @param {string} field
	 * @param {string} id
	 * @param {[string]} sel
	 */
	public recByField = (
		field: FieldCodesEnum,
		id: string,
		sel: FieldCodesEnum[],
	): TAdlibRecordType => {
		const res = this.set.filter((rec) => {
			// @ts-ignore
			return !!(Array.isArray(rec[field]) && rec[field].includes(id));
		});
		return res.map((rec) => {
			const m: TAdlibRecordType = {};
			sel.forEach((key) => {
				if (rec[key]) {
					m[key] = rec[key];
				} else {
					m[key] = [];
				}
			});
			return m;
		})[0];
	};
}
