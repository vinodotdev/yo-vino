import Generator = require('yeoman-generator');
import { Answers } from '..';
export declare const noRegistry: {
    prompts(): Generator.Questions<Answers>;
    localInstructions(): ReadonlyArray<string>;
    workflowInstructions(): ReadonlyArray<string>;
    languageFiles(): ReadonlyArray<string>;
    releaseTemplate(): string;
};
