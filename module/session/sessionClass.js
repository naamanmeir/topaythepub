module.exports = function (limit) {
    return async function (req, res, next) {        
        if(!req||req==null||!req.session||req.session==null){res.redirect('./login');return;}
        // console.log(req.session);
        // let back = req.header('Referer') || '/';
        if (req.session.userclass > limit) {
            res.redirect('./');
            // res.redirect(back);
            return;
        } else if (req.session.userclass <= limit) {
            next();
        } else {
            console.log(`CREDENTIALS NEEDED ${limit} AND SESSIONCLASS FOUND NO REQUEST DATA AT: ${Date()}`);
            res.redirect(req.baseUrl+'./login');
            // res.redirect(back);
            return;
        }
    };
};