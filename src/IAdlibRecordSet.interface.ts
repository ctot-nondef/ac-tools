import { FieldCodesEnum } from "./EAdlibFieldNames.enum";

export interface IAdlibRecordSetInterface extends Record<string, any> {
    name: string;
    srcUrl: URL;
    set: Record<FieldCodesEnum, string[]>[];
}
