import { Answers } from '..';
import { Formatter } from '../formatter';
import { Errorable } from '../utils/errorable';
import { Language } from './language';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface RustAnswers {}

export const rust: Language = {
  instructions(fmt: Formatter): ReadonlyArray<string> {
    return [
      "You'll need the following to build and run this project locally:",
      '* Rust: https://www.rust-lang.org/tools/install',
      `* WASM target: ${fmt.cmd('rustup target add wasm32-wasi')}.`,
      `* wasmtime: ${fmt.cmd('curl https://wasmtime.dev/install.sh -sSf | bash')}`,
      '',
      `Build using VS Code ${fmt.instr('Build WASM')} task or ${fmt.cmd('cargo build-wasm')}.`,
      `Run using VS Code ${fmt.instr('Debug WASM')} task or ${fmt.cmd('wasmtime')} CLI.`,
    ];
  },

  templateFolder(): string {
    return 'rust';
  },

  templateFiles(): string[] {
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

  async offerToInstallTools(): Promise<string | undefined> {
    return undefined;
  },

  async installTools(/*_projectDir: string*/): Promise<Errorable<null>> {
    return { succeeded: true, result: null };
  },

  augment(answers: Answers): Answers & RustAnswers {
    return answers;
  },
};
