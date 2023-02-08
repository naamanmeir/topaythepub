const bcrypt = require("bcrypt");

module.exports = function (limit) {
    console.log("SESSIONCLASS MODULE CHECKING FOR CREDENTIALS: ")
    return async function(req, res, next) {
        if(!req || !req.session || !req.session.userclass){next();return;}        
        if(req.session.userclass>limit){
            console.log("SESSIONCLASS MODULE CREDENTIALS FAILED REDIRECT TO /")
            res.redirect('./');
            return;
        }else{
            console.log("SESSIONCLASS MODULE CREDENTIALS MATCH GOTO NEXT()")
            next();
        }
    };    
};