export interface IAdlibRecordSetInterface extends Record<string, any> {
    name: string;
    set: Record<string, any>[];
}
