module.exports = function (limit) {
    return async function (req, res, next) {
        if(!req||req==null||!req.session||req.session==null){res.redirect('/apps/topaythepub');return;}
        if (req.session.userclass > limit) {
            res.redirect('./');
            return;
        } else if (req.session.userclass <= limit) {
            next();
        } else {
            console.log(`CREDENTIALS NEEDED ${limit} AND SESSIONCLASS FOUND NO REQUEST DATA AT: ${Date()}`)
            res.redirect('/apps/topaythepub');
            return;
        }
    };
};