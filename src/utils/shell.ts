'use strict';

import * as shelljs from 'shelljs';

import { Errorable } from './errorable';

export enum Platform {
  Windows,
  MacOS,
  Linux,
  Unsupported, // shouldn't happen!
}

export interface ExecOpts {
  readonly cwd?: string;
}

export const shell = {
  isWindows: isWindows,
  isUnix: isUnix,
  platform: platform,
  home: home,
  combinePath: combinePath,
  execOpts: execOpts,
  exec: exec,
  execObj: execObj,
  execCore: execCore,
  execToFile: execToFile,
  unquotedPath: unquotedPath,
};

const WINDOWS = 'win32';

export interface ShellResult {
  readonly code: number;
  readonly stdout: string;
  readonly stderr: string;
}

export type ShellHandler = (code: number, stdout: string, stderr: string) => void;

function isWindows(): boolean {
  return process.platform === WINDOWS;
}

function isUnix(): boolean {
  return !isWindows();
}

function platform(): Platform {
  switch (process.platform) {
    case 'win32':
      return Platform.Windows;
    case 'darwin':
      return Platform.MacOS;
    case 'linux':
      return Platform.Linux;
    default:
      return Platform.Unsupported;
  }
}

function home(): string {
  return process.env['HOME'] || process.env['USERPROFILE'] || '';
}

function combinePath(basePath: string, relativePath: string): string {
  let separator = '/';
  if (isWindows()) {
    relativePath = relativePath.replace(/\//g, '\\');
    separator = '\\';
  }
  return basePath + separator + relativePath;
}

function execOpts(): shelljs.ExecOptions {
  let env = process.env;
  if (isWindows()) {
    env = Object.assign({}, env, { HOME: home() });
  }
  const opts = {
    env: env,
    silent: true,
    async: true,
  };
  return opts;
}

async function exec(cmd: string): Promise<Errorable<ShellResult>> {
  try {
    return { succeeded: true, result: await execCore(cmd, execOpts()) };
  } catch (ex) {
    return { succeeded: false, error: [`Error invoking '${cmd}: ${ex}`] };
  }
}

async function execObj<T>(
  cmd: string,
  cmdDesc: string,
  opts: ExecOpts,
  fn: (stdout: string) => T,
): Promise<Errorable<T>> {
  const o = Object.assign({}, execOpts(), opts);
  try {
    const sr = await execCore(cmd, o);
    if (sr.code === 0) {
      const value = fn(sr.stdout);
      return { succeeded: true, result: value };
    } else {
      return { succeeded: false, error: [`${cmdDesc} error: ${sr.stderr}`] };
    }
  } catch (ex) {
    return { succeeded: false, error: [`Error invoking '${cmd}: ${ex}`] };
  }
}

function execCore(cmd: string, opts: shelljs.ExecOptions): Promise<ShellResult> {
  return new Promise<ShellResult>(resolve => {
    shelljs.exec(cmd, opts, (code, stdout, stderr) => resolve({ code: code, stdout: stdout, stderr: stderr }));
  });
}

function execToFile(cmd: string, dest: string, opts: shelljs.ExecOptions): Promise<ShellResult> {
  return new Promise<ShellResult>(resolve => {
    shelljs.exec(cmd + ` >${dest}`, opts, (code, stdout, stderr) =>
      resolve({ code: code, stdout: stdout, stderr: stderr }),
    );
  });
}

function unquotedPath(path: string): string {
  if (isWindows() && path && path.length > 1 && path.startsWith('"') && path.endsWith('"')) {
    return path.substring(1, path.length - 1);
  }
  return path;
}

export function safeValue(s: string): string {
  if (s.indexOf(' ') >= 0) {
    return `"${s}"`; // TODO: confirm quoting style on Mac/Linux
  }
  return s;
}
