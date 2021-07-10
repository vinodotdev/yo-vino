import Generator = require('yeoman-generator');
import { Answers } from '..';

export const noRegistry = {
  prompts(): Generator.Questions<Answers> {
    return [];
  },
  localInstructions(): ReadonlyArray<string> {
    return [];
  },
  workflowInstructions(): ReadonlyArray<string> {
    return [];
  },
  languageFiles(): ReadonlyArray<string> {
    return [];
  },
  releaseTemplate(): string {
    return 'release.nopublish.yml';
  },
};
