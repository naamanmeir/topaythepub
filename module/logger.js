const { createLogger, format, transports, config } = require('winston');
const { combine, timestamp, label, prettyPrint,json ,simple,printf} = format;
const logLevels = {
    levels:{
        error: 0,
        login: 1,
        order: 2,
        userAction: 3
    },
    colors: {
        error: 'red',
        login: 'blue',
        order: 'gren',
        userAction: 'yellow'
    }
};

const actionsLogger = createLogger({
    levels: logLevels.levels,
    format: simple(),
    transports: [
        new transports.Console({level:'error'}),
        new transports.Console({level:'login'}),
        new transports.File({ filename: 'actions.log',level:'login' }),
        new transports.File({ filename: 'errors.log',level:'error' })
    ]
});
const ordersLogger = createLogger({
    levels: logLevels.levels,
    format: simple(),
    transports: [
        new transports.Console({level:'order'}),
        new transports.File({ filename: 'orders.log' , level:'order'})
    ]
});
 
module.exports = {
    actionsLogger: actionsLogger,
    ordersLogger: ordersLogger
};