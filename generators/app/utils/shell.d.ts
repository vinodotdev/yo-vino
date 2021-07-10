import * as shelljs from 'shelljs';
import { Errorable } from './errorable';
export declare enum Platform {
    Windows = 0,
    MacOS = 1,
    Linux = 2,
    Unsupported = 3
}
export interface ExecOpts {
    readonly cwd?: string;
}
export declare const shell: {
    isWindows: typeof isWindows;
    isUnix: typeof isUnix;
    platform: typeof platform;
    home: typeof home;
    combinePath: typeof combinePath;
    execOpts: typeof execOpts;
    exec: typeof exec;
    execObj: typeof execObj;
    execCore: typeof execCore;
    execToFile: typeof execToFile;
    unquotedPath: typeof unquotedPath;
};
export interface ShellResult {
    readonly code: number;
    readonly stdout: string;
    readonly stderr: string;
}
export declare type ShellHandler = (code: number, stdout: string, stderr: string) => void;
declare function isWindows(): boolean;
declare function isUnix(): boolean;
declare function platform(): Platform;
declare function home(): string;
declare function combinePath(basePath: string, relativePath: string): string;
declare function execOpts(): shelljs.ExecOptions;
declare function exec(cmd: string): Promise<Errorable<ShellResult>>;
declare function execObj<T>(cmd: string, cmdDesc: string, opts: ExecOpts, fn: (stdout: string) => T): Promise<Errorable<T>>;
declare function execCore(cmd: string, opts: shelljs.ExecOptions): Promise<ShellResult>;
declare function execToFile(cmd: string, dest: string, opts: shelljs.ExecOptions): Promise<ShellResult>;
declare function unquotedPath(path: string): string;
export declare function safeValue(s: string): string;
export {};
