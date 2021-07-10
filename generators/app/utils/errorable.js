"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.map = exports.failed = exports.succeeded = void 0;
function succeeded(e) {
    return e.succeeded;
}
exports.succeeded = succeeded;
function failed(e) {
    return !e.succeeded;
}
exports.failed = failed;
function map(e, fn) {
    if (failed(e)) {
        return { succeeded: false, error: e.error };
    }
    return { succeeded: true, result: fn(e.result) };
}
exports.map = map;
//# sourceMappingURL=errorable.js.map