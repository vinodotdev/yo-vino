import Generator = require('yeoman-generator');
import { Errorable } from './utils/errorable';
declare enum LANGUAGE {
    Rust = "Rust"
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
    answers: Answers;
    constructor(args: string | string[], options: Generator.GeneratorOptions & Options);
    prompting(): Promise<void>;
    writing(): void;
    end(): Promise<void>;
}
export {};
