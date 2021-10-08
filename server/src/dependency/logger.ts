enum LogTypes {
    DEBUG = 0,
    INFO = 1,
    WARNING = 2,
    ERROR = 3,
}

export class Logger {
    private static logLevel: string = process.env.LOG_LEVEL;

    public static debug(className: string, methodName: string, message: any): void {
        const logMessage: string = `[DEBUG/${className}/${methodName}] : ${JSON.stringify(message, null, 2)}`;
        this.print(LogTypes.DEBUG, logMessage);
    }

    public static info(className: string, methodName: string, message: any): void {
        const logMessage: string = `[INFO/${className}/${methodName}] : ${JSON.stringify(message, null, 2)}`;
        this.print(LogTypes.INFO, logMessage);
    }

    public static warning(className: string, methodName: string, message: any): void {
        const logMessage: string = `[WARNING/${className}/${methodName}] : ${JSON.stringify(message, null, 2)}`;
        this.print(LogTypes.WARNING, logMessage);
    }

    public static error(className: string, methodName: string, message: any): void {
        const logMessage: string = `[ERROR/${className}/${methodName}] : ${JSON.stringify(message, null, 2)}`;
        this.print(LogTypes.ERROR, logMessage);
    }

    private static print(logType: LogTypes, message: string) {
        switch (logType) {
            case LogTypes.DEBUG: {
                console.debug(message);
                break;
            }
            case LogTypes.ERROR: {
                console.error(message);
                break;
            }
            case LogTypes.INFO: {
                console.info(message);
                break;
            }
            case LogTypes.WARNING: {
                console.warn(message);
                break;
            }
            default: {
                throw new Error('Unknown');
            }
        }
    }
}
