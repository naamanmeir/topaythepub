module.exports = function (limit) {
    // console.log("SESSIONCLASS MODULE CHECKING FOR CREDENTIALS: " + Date())
    return async function (req, res, next) {
        if (req.session.userclass > limit) {
            // console.log(`CREDENTIALS ${limit} FAILED REDIRECT TO /`)
            res.redirect('./');
            return;
        } else if (req.session.userclass <= limit) {
            // console.log(`CREDENTIALS ${limit} MATCH GOTO NEXT()`)
            next();
        } else {
            console.log(`CREDENTIALS NEEDED ${limit} AND SESSIONCLASS FOUND NO REQUEST DATA AT: ${Date()}`)
            // console.log(req);
            res.redirect('/apps/topaythepub');
            // res.sendStatus(401).end();
            return;
        }
    };
};