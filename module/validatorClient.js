module.exports = function () {
    console.log("LOADING VALIDATOR MIDDLEWARE");
    var validator = require('validator');
    return async function (req, res, next) {
        const regexEmoji = /[\p{Extended_Pictographic}\u{1F3FB}-\u{1F3FF}\u{1F9B0}-\u{1F9B3}]/u        
        const isEmoji = regexEmoji.test(req.body.name) ? true : false;        
        const opts = { 'ignore': ' '};
        if (!req.body || req.body == null) { res.end(); return; }
        // console.log(req.body.name);
        if (req.body.name && req.body.name != '' || req.body.name != null) {
            if (!validator.isLength(req.body.name, { min: 0, max: 40 })) {
                console.log("VALIDATE FALSE: LONGER THEN 40 CHARS");
                res.send(JSON.stringify({ 'errorLog': 'name is too long' }));
                res.end();
                return;
            }
            if (!validator.isAlphanumeric(req.body.name, 'he', opts) &&
                !validator.isAlphanumeric(req.body.name, 'en-US', opts) &&
                !validator.isAlphanumeric(req.body.name, 'en-GB', opts)&&
                !isEmoji) {
                if (!validator.contains(req.body.name, `'`)) {
                    console.log("VALIDATE FALSE: NON VALID CHARS");
                    res.send(JSON.stringify({ 'errorLog': 'name contain forbidden characters' }));
                    res.end();
                    return;
                }
                if (validator.contains(req.body.name, `'`)) {
                    console.log("REPLACE ' SYNMBOL WITH ''");
                    req.body.name = (req.body.name).replace(/\'/g, `''`);
                }
            }

        }
        if (req.body.id && req.body.id != '' || req.body.id != null) {
            console.log("VALIDATING ID AS A VALID NUMBER");
            var idNumber = req.body.id;
            if (!idNumber > 0 && !idNumber < 9999) {
                console.log("ID TAG VALIDATE FALSE");
                res.send(JSON.stringify({ 'errorLog': 'not a valid user id' }));
                res.end();
                return;
            }
        }
        console.log("END OF VALIDATOR CLIENT");
        // console.log(req.body);
        next();
    };
};