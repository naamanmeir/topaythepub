module.exports = function () {
    console.log("LOADING VALIDATOR MIDDLEWARE");
    return async function (req, res, next) {
        // const validate = require('express-validator');
        var validator = require('validator');
        const opts = { 'ignore': ' ' };
        if (!req.body || req.body == null) { res.end(); return; }
        console.log(req.body);
        if (req.body.name && req.body.name != '' || req.body.name != null) {
            if (!validator.isAlphanumeric(req.body.name, 'he', opts)) {
                if (!validator.contains(req.body.name, `'`)) {
                    console.log("VALIDATE FALSE: NON VALID CHARS");
                    res.end();
                    return;
                }
                if (validator.contains(req.body.name, `'`)) {
                    console.log("REPLACE ' SYNMBOL WITH ''");
                    req.body.name = (req.body.name).replace(/\'/g, `''`);
                }
            }
            if (!validator.isLength(req.body.name, { min: 0, max: 40 })) {
                console.log("VALIDATE FALSE: LONGER THEN 40 CHARS");
                res.end();
                return;
            }
        }
        if (req.body.id && req.body.id != '' || req.body.id != null) {
            console.log("VALIDATING ID AS A VALID NUMBER");
            var idNumber = req.body.id;
            if (!validator.isInt(idNumber)) {
                console.log("ID TAG VALIDATE FALSE");
                res.write("ERROR FROM DB: NON VALID USER ID");
                res.end();
                return;
            }
        }
        console.log("END OF VALIDATOR CLIENT")
        console.log(req.body)
        next();
    };
};