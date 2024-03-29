module.exports = function () {
    console.log("LOADING RATE LIMIT MIDDLEWARE");
    // console.log(req);
    //--------------RATE LIMIT------------------------//
    const rateLimit = require('express-rate-limit');
        return async function (req, res, next) {
            const rateLimitClient = rateLimit({
            windowMs: 1 * 30 * 1000,
            max: 1000,
            standardHeaders: true,
            legacyHeaders: false,
            handler: function(req,res){
                console.log(getTime());
                console.log("--------RATE LIMIT---------");
                return res.end();
            }
        });
        next();
    };
};