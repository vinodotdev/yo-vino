export interface Formatter {
    ev(text: string): string;
    instr(text: string): string;
    cmd(text: string): string;
    emph(text: string): string;
}
export declare const FMT_MARKDOWN: Formatter;
export declare const FMT_CHALK: Formatter;
