/**
 * An error object that can be returned from IPC listeners.
 * @remarks
 * This will automatically be logged as a warning if the listener is not invoked because values can only be returned on invoke.
 * @example
 * ```ts
 * router.registerListener("example:alwaysError", () => {
 *  // do something ...
 *  return new Failure("An error has occured.");
 * })
 * ```
 */
export class Failure extends Error {
    constructor(message) {
        super(message);
        this.name = "Failure";
    }
    /**
     * Call a function and return a {@link Failure} if it throws an error.
     */
    static try(func, ...args) {
        let result;
        let err;
        try {
            result = func(...args);
        }
        catch (e) {
            err = String(e);
        }
        if (err !== undefined) {
            return new Failure(err);
        }
        return result;
    }
    /**
     * Wrap a function in an another function that calls the inner function using {@link Failure.try}.
     * This is the same as doing:
     * ```js
     * const wrapped = (...args) => Failure.try(func, ...args);
     * ```
     */
    static tryWrap(func) {
        return (...args) => Failure.try(func, ...args);
    }
}
