const bcrypt = require("bcrypt");

module.exports = function (limit) {
    return async function(req, res, next) {
        if(!req || !req.session || !req.session.userclass){next();return;}        
        if(req.session.userclass>limit){
            res.redirect('./');
            return;
        }else{
            next();
        }
    };    
};