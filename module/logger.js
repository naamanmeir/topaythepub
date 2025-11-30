const { createLogger, format, transports, config } = require('winston');
const { combine, timestamp, label, prettyPrint, json, simple, printf } = format;

const logLevels = {
    levels: {
        error: 0,
        login: 1,
        logout: 11,
        order: 2,
        userAction: 3,
        clientLogin: 4,
        clientAttempted: 5,
        clientRegistered: 6,
        clientUnregistered: 7,
        clientLogout: 8,
        clientMessageBoard: 9,
        orderDelete: 10
    },
    colors: {
        error: 'red',
        login: 'blue',
        order: 'green',
        userAction: 'yellow',
        clientLogin: 'orange',
        clientAttempted: 'red',
        clientRegistered: 'green',
        clientLogout: 'orange',
        clientMessageBoard: 'green',
        orderDelete: 'red'
    }
};

// Custom format for more informative logs
const customFormat = format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.printf(({ level, message, timestamp }) => {
        return `${timestamp} [${level.toUpperCase()}]: ${message}`;
    })
);

const errorLogger = createLogger({
    levels: logLevels.levels,
    format: customFormat,
    transports: [
        new transports.Console({ level: 'error' }),
        new transports.File({ filename: 'log/errors.log', level: 'error' })
    ]
});

const clientLogger = createLogger({
    levels: logLevels.levels,
    format: customFormat,
    transports: [
        new transports.Console({ level: 'clientLogin' }),
        new transports.File({ filename: 'log/clientLogin.log', level: 'clientLogin' }),
        new transports.File({ filename: 'log/clientLogin.log', level: 'clientAttempted' }),
        new transports.File({ filename: 'log/clientLogin.log', level: 'clientRegistered' }),
        new transports.File({ filename: 'log/clientLogin.log', level: 'clientUnregistered' }),
        new transports.File({ filename: 'log/clientLogin.log', level: 'clientLogout' }),
    ]
});

const actionsLogger = createLogger({
    levels: logLevels.levels,
    format: customFormat,
    transports: [
        new transports.Console({ level: 'login' }),
        new transports.File({ filename: 'log/login.log', level: 'login' }),
        new transports.Console({ level: 'logout' }),
        new transports.File({ filename: 'log/login.log', level: 'logout' }),
        // new transports.Console({level:'userAction'}),
        new transports.File({ filename: 'log/actions.log', level: 'userAction' })
    ]
});

const ordersLogger = createLogger({
    levels: logLevels.levels,
    format: customFormat,
    transports: [
        // new transports.Console({level:'order'}),
        new transports.File({ filename: 'log/orders.log', level: 'order' }),
        new transports.File({ filename: 'log/orders.log', level: 'orderDelete' })
    ]
});

const messageBoardLogger = createLogger({
    levels: logLevels.levels,
    format: customFormat,
    transports: [
        // new transports.Console({level:'clientMessageBoard'}),
        new transports.File({ filename: 'log/messageBoard.log', level: 'clientMessageBoard' })
    ]
});

module.exports = {
    errorLogger: errorLogger,
    clientLogger: clientLogger,
    actionsLogger: actionsLogger,
    ordersLogger: ordersLogger,
    messageBoardLogger: messageBoardLogger
};
