const jwt = require("jsonwebtoken");
require("dotenv").config();

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;

function generateAccessToken (user) {
    return jwt.sign(user, ACCESS_TOKEN_SECRET)
};

module.exports=generateAccessToken