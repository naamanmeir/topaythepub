const jwt = require("jsonwebtoken");
require("dotenv").config();

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;

function validateToken(req, res, next) {
    // console.log("checking token and stuff");
    
    if(req.headers == null){res.sendStatus(404);return;}
    if(req.headers["authorization"] == null){res.sendStatus(404);return;}

    const authHeader = req.headers["authorization"]
    const token = authHeader.split(" ")[1]
    
    if (token == null) res.sendStatus(400).send("Token not present");

    jwt.verify(token, ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) { 
        res.status(403).send("Token invalid")
        return;
    }
    else {
        req.user = user;
        next();
    }
    })
  };

module.exports=validateToken