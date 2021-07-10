"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rust = void 0;
exports.rust = {
    instructions(fmt) {
        return [
            "You'll need the following to build and run this project locally:",
            '* Rust: https://www.rust-lang.org/tools/install',
            `* WASM target: ${fmt.cmd('rustup target add wasm32-unknown-unknown')}.`,
            `* Vino codegen: ${fmt.cmd('npm install -g vino-codegen')}.`,
            `* tomlq ${fmt.cmd('cargo install tomlq')}`,
            '',
            `Build using ${fmt.instr('make')}, test with ${fmt.instr('make test')}.`,
        ];
    },
    templateFolder() {
        return 'rust';
    },
    templateFiles() {
        return [
            '.gitignore.removeext',
            'Cargo.toml',
            'LICENSE',
            'README.md',
            '.cargo/config.toml',
            '.vscode/extensions.json',
            '.vscode/launch.json',
            '.vscode/settings.json',
            '.vscode/tasks.json',
            'schemas/my-component.widl',
            'src/lib.rs',
            'Makefile',
        ];
    },
    async offerToInstallTools() {
        return undefined;
    },
    async installTools( /*_projectDir: string*/) {
        return { succeeded: true, result: null };
    },
    augment(answers) {
        return answers;
    },
};
//# sourceMappingURL=rust.js.map