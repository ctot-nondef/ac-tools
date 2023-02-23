import { TAdlibRecordType } from "./TAdlibRecord.type";

export interface IAdlibRecordSetInterface extends Record<string, any> {
    name: string;
    srcUrl: URL | undefined;
    set: TAdlibRecordType[];
}
