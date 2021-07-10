"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Generator = require("yeoman-generator");
const chalk_1 = __importDefault(require("chalk"));
const path_1 = __importDefault(require("path"));
const fs_1 = require("fs");
const acr_1 = require("./providers/acr");
const none_1 = require("./providers/none");
const rust_1 = require("./languages/rust");
const errorable_1 = require("./utils/errorable");
const formatter_1 = require("./formatter");
const find_root_1 = __importDefault(require("find-root"));
const timer_1 = require("./utils/timer");
const REGISTRY_CHOICE_ACR = 'Azure Container Registry';
const REGISTRY_CHOICE_NONE = "I don't want to publish the module";
var LANGUAGE;
(function (LANGUAGE) {
    LANGUAGE["Rust"] = "Rust";
})(LANGUAGE || (LANGUAGE = {}));
function caseInsensitiveFilter(e, field) {
    return Object.values(e).filter(el => el.toLowerCase() === field.toLowerCase())[0];
}
class default_1 extends Generator {
    constructor(args, options) {
        timer_1.mark('constructStart');
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
        this.sourceRoot(path_1.default.join(find_root_1.default(__dirname), 'templates'));
        timer_1.mark('constructEnd');
    }
    async prompting() {
        timer_1.mark('promptingStart');
        const username = this.user.git.name() || process.env.USER || process.env.USERNAME;
        const appname = this.appname.replace(/ /g, '-');
        if (this.options.language)
            this.options.language = caseInsensitiveFilter(LANGUAGE, this.options.language);
        const prompts = [
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
        ];
        const answers = Object.assign(await this.prompt(prompts), this.options);
        const languagePrompts = await languageSpecificPrompts(answers);
        const languageAnswers = await this.prompt(languagePrompts);
        // const providerPrompts = providerSpecificPrompts(answers);
        const providerAnswers = {}; //await this.prompt(providerPrompts);
        if (this.options.create) {
            const dir = path_1.default.join(this.destinationRoot(), answers.module);
            const exists = await fs_1.promises
                .stat(dir)
                .then(stat => !!stat)
                .catch(e => e.code !== 'ENOENT');
            if (exists) {
                throw new Error(`${dir} exists, please remove the directory if you want me to create it automatically`);
            }
            await fs_1.promises.mkdir(dir);
            this.destinationRoot(dir);
        }
        // To access answers later, use this.answers.*
        this.answers = Object.assign({}, answers, languageAnswers, providerAnswers);
        timer_1.mark('promptingEnd');
    }
    writing() {
        timer_1.mark('writingStart');
        const language = languageProvider(this.answers.language);
        const registry = provider(this.answers.registryProvider);
        const templateFolder = language.templateFolder();
        const templateValues = language.augment(this.answers);
        for (const filepath of language.templateFiles()) {
            this.fs.copyTpl(this.templatePath(path_1.default.join(templateFolder, filepath)), removeSuppressionExtension(this.destinationPath(filepath)), templateValues);
        }
        const appendToReadMe = (line) => this.fs.append(this.destinationPath('README.md'), line, {
            trimEnd: false,
        });
        logParagraph(appendToReadMe, '## Dev releases', registry.localInstructions(formatter_1.FMT_MARKDOWN, this.answers));
        logParagraph(appendToReadMe, '## CI releases', registry.workflowInstructions(formatter_1.FMT_MARKDOWN, this.answers));
        appendToReadMe('');
        for (const filepath of registry.languageFiles()) {
            this.fs.copyTpl(this.templatePath(path_1.default.join(templateFolder, filepath)), removeSuppressionExtension(this.destinationPath(filepath)), templateValues);
        }
        const tasksFilePath = this.destinationPath('.vscode/tasks.json');
        if (this.fs.exists(tasksFilePath)) {
            const tasksFile = this.fs.readJSON(tasksFilePath);
            tasksFile.tasks = purgeIrrelevant(tasksFile.tasks, this.answers.registryProvider);
            this.fs.writeJSON(tasksFilePath, tasksFile);
        }
        const buildTemplate = 'build.yml';
        this.fs.copyTpl(this.templatePath(path_1.default.join(templateFolder, `.github/workflows/${buildTemplate}`)), this.destinationPath('.github/workflows/build.yml'), templateValues);
        const releaseTemplate = registry.releaseTemplate();
        this.fs.copyTpl(this.templatePath(path_1.default.join(templateFolder, `.github/workflows/${releaseTemplate}`)), this.destinationPath('.github/workflows/release.yml'), templateValues);
        // It would be good to install the language toolchain (and other local tools) here,
        // and also to set up appropriate VS Code settings files etc.  But the install is
        // something we'd like to be able to run on other boxes (when the generated project
        // is cloned) so this needs to be a script that we emit not just something we
        // do during generation.
        timer_1.mark('writingEnd');
    }
    async end() {
        timer_1.mark('endStart');
        const language = languageProvider(this.answers.language);
        const registry = provider(this.answers.registryProvider);
        this.log('');
        this.log(chalk_1.default.green('Created project and GitHub workflows'));
        if (this.answers.installTools) {
            this.log('');
            this.log('Installing tools...');
            const installResult = await language.installTools(this.destinationPath('.'));
            if (errorable_1.failed(installResult)) {
                this.log(`${chalk_1.default.red('Tool installation failed!')} Install tools manually.`);
                this.log(`Error details: ${installResult.error[0]}`);
            }
            else {
                this.log('Installation complete');
            }
        }
        logParagraph(this.log, chalk_1.default.yellow('Building'), language.instructions(formatter_1.FMT_CHALK));
        logParagraph(this.log, chalk_1.default.yellow('Dev releases'), registry.localInstructions(formatter_1.FMT_CHALK, this.answers));
        logParagraph(this.log, chalk_1.default.yellow('CI releases'), registry.workflowInstructions(formatter_1.FMT_CHALK, this.answers));
        this.log('');
        timer_1.mark('endEnd');
        if (process.env.DEBUG)
            timer_1.finishTiming();
    }
}
exports.default = default_1;
function logParagraph(log, title, lines) {
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
function provider(registryProvider) {
    switch (registryProvider) {
        case REGISTRY_CHOICE_ACR:
            return acr_1.acr;
        case REGISTRY_CHOICE_NONE:
            return none_1.noRegistry;
        default:
            return none_1.noRegistry;
    }
}
function languageProvider(language) {
    switch (language) {
        case 'Rust':
            return rust_1.rust;
        default:
            throw new Error("You didn't choose a language");
    }
}
// function providerSpecificPrompts(answers: any): any {
//   return provider(answers.registryProvider).prompts(answers);
// }
async function languageSpecificPrompts(answers) {
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
function removeSuppressionExtension(filepath) {
    if (path_1.default.extname(filepath) === '.removeext') {
        return filepath.substring(0, filepath.length - '.removeext'.length);
    }
    return filepath;
}
function purgeIrrelevant(tasks, registry) {
    return tasks.filter(t => isRelevant(t, registry)).map(removeLabelPrefix);
}
function isRelevant(task, registry) {
    // It's relevant if it applies to this registry, or always applies
    return task.label.startsWith(`#OPT:${registry}# `) || !task.label.startsWith('#OPT');
}
function removeLabelPrefix(task) {
    if (task.label.startsWith('#OPT')) {
        task.label = task.label.substr(task.label.indexOf('# ') + 2).trimLeft();
    }
    return task;
}
//# sourceMappingURL=index.js.map