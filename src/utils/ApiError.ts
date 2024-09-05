class ApiError extends Error {
    statusCode: string | number;
    errors: string[];

    constructor(
        statusCode: string | number,
        message = 'Something went wrong',
        errors: string[] = [],
        stack = ""
    ) {
        super(message);
        this.statusCode = statusCode;
        this.errors = errors;
        if (stack) {
            this.stack = stack;
        }else{
            Error.captureStackTrace(this, this.constructor)
        }
    }
}
export {ApiError}
