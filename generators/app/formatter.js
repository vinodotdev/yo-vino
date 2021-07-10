"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FMT_CHALK = exports.FMT_MARKDOWN = void 0;
const chalk_1 = __importDefault(require("chalk"));
class MarkdownFormatter {
    ev(text) {
        return `**${text}**`;
    }
    instr(text) {
        return `**${text}**`;
    }
    cmd(text) {
        return '`' + text + '`';
    }
    emph(text) {
        return `**${text}**`;
    }
}
class ChalkFormatter {
    ev(text) {
        return chalk_1.default.cyan(text);
    }
    instr(text) {
        return chalk_1.default.yellow(text);
    }
    cmd(text) {
        return chalk_1.default.yellow(text);
    }
    emph(text) {
        return chalk_1.default.yellow(text);
    }
}
exports.FMT_MARKDOWN = new MarkdownFormatter();
exports.FMT_CHALK = new ChalkFormatter();
//# sourceMappingURL=formatter.js.map