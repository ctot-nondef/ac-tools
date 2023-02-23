import { FieldCodesEnum } from "./EAdlibFieldNames.enum";

export type TAdlibRecordType = {
    [key in FieldCodesEnum]?: string[];
}
