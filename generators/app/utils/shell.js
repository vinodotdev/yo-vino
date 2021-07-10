'use strict';
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.safeValue = exports.shell = exports.Platform = void 0;
const shelljs = __importStar(require("shelljs"));
var Platform;
(function (Platform) {
    Platform[Platform["Windows"] = 0] = "Windows";
    Platform[Platform["MacOS"] = 1] = "MacOS";
    Platform[Platform["Linux"] = 2] = "Linux";
    Platform[Platform["Unsupported"] = 3] = "Unsupported";
})(Platform = exports.Platform || (exports.Platform = {}));
exports.shell = {
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
function isWindows() {
    return process.platform === WINDOWS;
}
function isUnix() {
    return !isWindows();
}
function platform() {
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
function home() {
    return process.env['HOME'] || process.env['USERPROFILE'] || '';
}
function combinePath(basePath, relativePath) {
    let separator = '/';
    if (isWindows()) {
        relativePath = relativePath.replace(/\//g, '\\');
        separator = '\\';
    }
    return basePath + separator + relativePath;
}
function execOpts() {
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
async function exec(cmd) {
    try {
        return { succeeded: true, result: await execCore(cmd, execOpts()) };
    }
    catch (ex) {
        return { succeeded: false, error: [`Error invoking '${cmd}: ${ex}`] };
    }
}
async function execObj(cmd, cmdDesc, opts, fn) {
    const o = Object.assign({}, execOpts(), opts);
    try {
        const sr = await execCore(cmd, o);
        if (sr.code === 0) {
            const value = fn(sr.stdout);
            return { succeeded: true, result: value };
        }
        else {
            return { succeeded: false, error: [`${cmdDesc} error: ${sr.stderr}`] };
        }
    }
    catch (ex) {
        return { succeeded: false, error: [`Error invoking '${cmd}: ${ex}`] };
    }
}
function execCore(cmd, opts) {
    return new Promise(resolve => {
        shelljs.exec(cmd, opts, (code, stdout, stderr) => resolve({ code: code, stdout: stdout, stderr: stderr }));
    });
}
function execToFile(cmd, dest, opts) {
    return new Promise(resolve => {
        shelljs.exec(cmd + ` >${dest}`, opts, (code, stdout, stderr) => resolve({ code: code, stdout: stdout, stderr: stderr }));
    });
}
function unquotedPath(path) {
    if (isWindows() && path && path.length > 1 && path.startsWith('"') && path.endsWith('"')) {
        return path.substring(1, path.length - 1);
    }
    return path;
}
function safeValue(s) {
    if (s.indexOf(' ') >= 0) {
        return `"${s}"`; // TODO: confirm quoting style on Mac/Linux
    }
    return s;
}
exports.safeValue = safeValue;
//# sourceMappingURL=shell.js.map