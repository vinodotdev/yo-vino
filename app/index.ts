import Generator = require('yeoman-generator');
import { default as chalk } from 'chalk';
import path from 'path';
import { promises as fs } from 'fs';

import { Language } from './languages/language';
import { rust } from './languages/rust';
import { Errorable, failed } from './utils/errorable';
import { FMT_CHALK, FMT_MARKDOWN } from './formatter';
import findroot from 'find-root';
import { mark, finishTiming } from './utils/timer';

enum LANGUAGE {
  Rust = 'Rust',
}

function caseInsensitiveFilter<T>(e: T, field: string): T | undefined {
  return Object.values(e).filter(el => el.toLowerCase() === field.toLowerCase())[0];
}

export interface Answers {
  module: string;
  author: string;
  description: string;
  language: LANGUAGE;
  registryProvider: string;
  installTools?: (dir: string) => Promise<Errorable<null>>;
}

export interface Options {
  module: string;
  author: string;
  description: string;
  language: string;
  create: boolean;
}

export default class extends Generator {
  answers!: Answers;

  constructor(args: string | string[], options: Generator.GeneratorOptions & Options) {
    mark('constructStart');
    super(args, options);
    this.option('module', {
      description: 'Default module name',
      type: String,
    });
    this.option('author', {
      description: 'Default author',
      type: String,
    });
    this.option('language', {
      description: 'Default language',
      type: String,
    });
    this.option('description', {
      description: 'Default language',
      type: String,
    });
    this.option('create', {
      description: 'Create a new directory?',
      type: Boolean,
      default: false,
    });
    this.sourceRoot(path.join(findroot(__dirname), 'templates'));
    mark('constructEnd');
  }

  async prompting(): Promise<void> {
    mark('promptingStart');
    const username = this.user.git.name() || process.env.USER || process.env.USERNAME;
    const appname = this.appname.replace(/ /g, '-');

    if (this.options.language)
      this.options.language = caseInsensitiveFilter(LANGUAGE, this.options.language);

    const prompts: Generator.Questions<Answers> = [
      {
        type: 'input',
        name: 'module',
        message: "What is your component's name?",
        default: appname,
        when: !this.options.module,
      },
      {
        type: 'input',
        name: 'author',
        message: 'Who should we put as the author?',
        default: username,
        when: !this.options.author,
      },
      {
        type: 'input',
        name: 'description',
        message: 'How would you briefly describe this component?',
        default: '',
        when: !this.options.description,
      },
      {
        type: 'list',
        name: 'language',
        message: 'What programming language are you using?',
        choices: ['Rust'],
        default: 'Rust',
        when: !this.options.language,
      },
      // {
      //   type: "list",
      //   name: "registryProvider",
      //   message: "Where do you plan to publish the module?",
      //   choices: [REGISTRY_CHOICE_ACR, REGISTRY_CHOICE_NONE],
      //   default: REGISTRY_CHOICE_ACR,
      // },
    ];

    const answers = Object.assign(await this.prompt(prompts), this.options);

    const languagePrompts = await languageSpecificPrompts(answers);
    const languageAnswers = await this.prompt(languagePrompts);

    // const providerPrompts = providerSpecificPrompts(answers);
    const providerAnswers = {}; //await this.prompt(providerPrompts);

    if (this.options.create) {
      const dir = path.join(this.destinationRoot(), answers.module);
      const exists = await fs
        .stat(dir)
        .then(stat => !!stat)
        .catch(e => e.code !== 'ENOENT');
      if (exists) {
        throw new Error(
          `${dir} exists, please remove the directory if you want me to create it automatically`,
        );
      }
      await fs.mkdir(dir);
      this.destinationRoot(dir);
    }

    // To access answers later, use this.answers.*
    this.answers = Object.assign({}, answers, languageAnswers, providerAnswers);
    mark('promptingEnd');
  }

  writing(): void {
    mark('writingStart');
    const language = languageProvider(this.answers.language);

    const templateFolder = language.templateFolder();
    const templateValues = language.augment(this.answers);

    for (const filepath of language.templateFiles()) {
      this.fs.copyTpl(
        this.templatePath(path.join(templateFolder, filepath)),
        removeSuppressionExtension(this.destinationPath(filepath)),
        templateValues,
      );
    }

    const appendToReadMe = (line: string) =>
      this.fs.append(this.destinationPath('README.md'), line, {
        trimEnd: false,
      });

    appendToReadMe('');

    const tasksFilePath = this.destinationPath('.vscode/tasks.json');
    if (this.fs.exists(tasksFilePath)) {
      const tasksFile = this.fs.readJSON(tasksFilePath) as unknown as VsCodeTasksFile;
      tasksFile.tasks = purgeIrrelevant(tasksFile.tasks, this.answers.registryProvider);
      this.fs.writeJSON(tasksFilePath, tasksFile);
    }

    const buildTemplate = 'build.yml';
    this.fs.copyTpl(
      this.templatePath(path.join(templateFolder, `.github/workflows/${buildTemplate}`)),
      this.destinationPath('.github/workflows/build.yml'),
      templateValues,
    );

    // It would be good to install the language toolchain (and other local tools) here,
    // and also to set up appropriate VS Code settings files etc.  But the install is
    // something we'd like to be able to run on other boxes (when the generated project
    // is cloned) so this needs to be a script that we emit not just something we
    // do during generation.
    mark('writingEnd');
  }

  async end(): Promise<void> {
    mark('endStart');
    const language = languageProvider(this.answers.language);

    this.log('');
    this.log(chalk.green('Created project and GitHub workflows'));
    if (this.answers.installTools) {
      this.log('');
      this.log('Installing tools...');
      const installResult = await language.installTools(this.destinationPath('.'));
      if (failed(installResult)) {
        this.log(`${chalk.red('Tool installation failed!')} Install tools manually.`);
        this.log(`Error details: ${installResult.error[0]}`);
      } else {
        this.log('Installation complete');
      }
    }
    logParagraph(this.log, chalk.yellow('Building'), language.instructions(FMT_CHALK));

    this.log('');
    mark('endEnd');
    if (process.env.DEBUG) finishTiming();
  }
}

function logParagraph(log: (line: string) => void, title: string, lines: ReadonlyArray<string>) {
  if (lines.length === 0) {
    return;
  }
  log('');
  log(title);
  log('');
  for (const line of lines) {
    log(line);
  }
}

function languageProvider(language: string): Language {
  switch (language) {
    case 'Rust':
      return rust;
    default:
      throw new Error("You didn't choose a language");
  }
}

// function providerSpecificPrompts(answers: any): any {
//   return provider(answers.registryProvider).prompts(answers);
// }

async function languageSpecificPrompts(answers: Answers): Promise<Generator.Questions<Answers>> {
  const toolOffer = await languageProvider(answers.language).offerToInstallTools();
  const installationPrompts = toolOffer
    ? [
        {
          type: 'confirm',
          name: 'installTools',
          message: `Would you like to install build tools (${toolOffer})?`,
          default: true,
        },
      ]
    : [];
  return installationPrompts;
}

function removeSuppressionExtension(filepath: string): string {
  if (path.extname(filepath) === '.removeext') {
    return filepath.substring(0, filepath.length - '.removeext'.length);
  }
  return filepath;
}

interface VsCodeTasksFile {
  version: string;
  tasks: VsCodeTask[];
}

interface VsCodeTask {
  label: string;
}

function purgeIrrelevant(tasks: VsCodeTask[], registry: string): VsCodeTask[] {
  return tasks.filter(t => isRelevant(t, registry)).map(removeLabelPrefix);
}

function isRelevant(task: VsCodeTask, registry: string): boolean {
  // It's relevant if it applies to this registry, or always applies
  return task.label.startsWith(`#OPT:${registry}# `) || !task.label.startsWith('#OPT');
}

function removeLabelPrefix(task: VsCodeTask): VsCodeTask {
  if (task.label.startsWith('#OPT')) {
    task.label = task.label.substr(task.label.indexOf('# ') + 2).trimLeft();
  }
  return task;
}
