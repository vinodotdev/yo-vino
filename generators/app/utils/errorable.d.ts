export interface Succeeded<T> {
    readonly succeeded: true;
    readonly result: T;
}
export interface Failed {
    readonly succeeded: false;
    readonly error: string[];
}
export declare type Errorable<T> = Succeeded<T> | Failed;
export declare function succeeded<T>(e: Errorable<T>): e is Succeeded<T>;
export declare function failed<T>(e: Errorable<T>): e is Failed;
export declare function map<T, U>(e: Errorable<T>, fn: (t: T) => U): Errorable<U>;
