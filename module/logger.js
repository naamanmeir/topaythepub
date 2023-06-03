const { createLogger, format, transports, config } = require('winston');
const { combine, timestamp, label, prettyPrint,json } = format;

const actionsLogger = createLogger({
    format: combine(
        label({label: 'user action'}),
        timestamp({format: 'YY-MM-DD HH:mm:ss'}),        
        prettyPrint()
      ),
   transports: [
       new transports.Console(),
       new transports.File({ filename: 'actions.log' })
     ]
});
const ordersLogger = createLogger({    
    format: combine(        
        label({label: 'order'}),
        timestamp({format: 'YY-MM-DD HH:mm:ss'}),        
        prettyPrint()
      ),
   transports: [
       new transports.Console(),
       new transports.File({ filename: 'orders.log' })
     ]
});
 
module.exports = {
    actionsLogger: actionsLogger,
    ordersLogger: ordersLogger
};