// env
require('dotenv').config();

const { passport } = require('../services/passport.js');
const mongo = require('../services/database.js');

let db;
mongo.connectDB
    .then((client) => {
        db = client.db('nodejs');
    })
    .catch((err) => {
        console.log(err);
    });

module.exports = {
    
    renderLoginPage: (req, res) => {
        res.render('login.ejs');
    },

    checkValidUser: (req, res, next) => {
        passport.authenticate('local', (err, user, info) => {
            if(err) return res.status(500).json(err);
            if(!user) return res.status(401).json(info.message);
    
            req.logIn(user, () => {
                if(err) return next(err);
                res.redirect('/list/next/');
            });
        })(req, res, next);
    },
};
