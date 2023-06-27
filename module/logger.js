const { createLogger, format, transports, config } = require('winston');
const { combine, timestamp, label, prettyPrint,json ,simple,printf} = format;
const logLevels = {
    levels:{
        error: 0,
        login: 1,
        order: 2,
        userAction: 3,
        clientLogin: 4,
        clientAttempted: 5,
        clientRegistered: 6,
        clientUnregistered: 7,
        clientLogout: 8,
        clientMessageBoard: 9
    },
    colors: {
        error: 'red',
        login: 'blue',
        order: 'gren',
        userAction: 'yellow',
        clientLogin: 'orange',
        clientAttempted: 'red',
        clientRegistered: 'green',
        clientLogout: 'orange',
        clientMessageBoard: 'green'
    }
};

const errorLogger = createLogger({
    levels: logLevels.levels,
    format: format.combine(
        format.timestamp(),
        simple(),
    ),
    transports: [
        new transports.Console({level:'error'}),
        new transports.File({ filename: 'errors.log',level:'error' })
    ]
});

const clientLogger = createLogger({
    levels: logLevels.levels,
    format: format.combine(
        format.timestamp({format:'MM-DD-YY : HH:MM'}),
        simple(),
    ),
    transports: [
        new transports.Console({level:'clientLogin'}),        
        new transports.File({ filename: 'clientLogin.log',level:'clientLogin' }),
        new transports.File({ filename: 'clientLogin.log',level:'clientAttempted' }),
        new transports.File({ filename: 'clientLogin.log',level:'clientRegistered' }),
        new transports.File({ filename: 'clientLogin.log',level:'clientUnregistered' }),
        new transports.File({ filename: 'clientLogin.log',level:'clientLogout' }),
    ]
});

const actionsLogger = createLogger({
    levels: logLevels.levels,
    format: format.combine(
        format.timestamp(),
        simple(),
    ),
    transports: [
        new transports.Console({level:'login'}),
        new transports.File({ filename: 'login.log',level:'login' }),
        // new transports.Console({level:'userAction'}),
        new transports.File({ filename: 'actions.log',level:'userAction' })
    ]
});
const ordersLogger = createLogger({
    levels: logLevels.levels,
    format: format.combine(
        format.timestamp(),
        simple(),
    ),
    transports: [
        new transports.Console({level:'order'}),
        new transports.File({ filename: 'orders.log' , level:'order'})
    ]
});
const messageBoardLogger = createLogger({
    levels: logLevels.levels,
    format: format.combine(
        format.timestamp(),
        simple(),
    ),
    transports: [
        // new transports.Console({level:'clientMessageBoard'}),
        new transports.File({ filename: 'messageBoard.log' , level:'clientMessageBoard'})
    ]
});
 
module.exports = {
    errorLogger: errorLogger,
    clientLogger: clientLogger,
    actionsLogger: actionsLogger,
    ordersLogger: ordersLogger,
    messageBoardLogger: messageBoardLogger
};