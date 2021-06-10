import Generator = require('yeoman-generator');
import { Answers } from '..';
import { Formatter } from '../formatter';

export interface Registry {
  prompts(answers: Answers): Generator.Questions<Answers>;
  localInstructions(fmt: Formatter, answers: Answers): ReadonlyArray<string>;
  workflowInstructions(fmt: Formatter, answers: Answers): ReadonlyArray<string>;
  languageFiles(): ReadonlyArray<string>;
  releaseTemplate(): string;
}
