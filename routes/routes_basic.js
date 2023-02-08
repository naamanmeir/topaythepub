module.exports = function(app){

    app.get('/route', function(req, res){
        res.render('login', {
            title: 'Express Login'
        });
    });

    //other routes..
}