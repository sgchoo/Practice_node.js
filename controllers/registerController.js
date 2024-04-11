require('dotenv').config();

const bcrypt = require('bcrypt');
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
    pageRender: (req, res) => {
        res.render('register.ejs');
    },

    registUser: async (req, res) => {

        try
        {
            var nameCheck = await mongo.findOneDocument(db, 'user', { username: req.body.username });
            if(nameCheck != null)
                res.send("<script>alert('중복된 아이디 입니다.');location.href='/register';</script>");
        
            else
            {
                if(req.body.password == req.body.doublecheck)
                {
                    let hash = await bcrypt.hash(req.body.password, 10);
                
                    await mongo.insertOneDocument(db, 'user', {
                        username: req.body.username, 
                        password: hash 
                    });
                    res.redirect('/login');
                }
                else
                    res.send("<script>alert('비밀번호가 일치하지 않습니다.');location.href='/register';</script>");
            }
        }
        catch(e)
        {
            console.log(e);
            res.status(500).send('user info create err')
        }
    }
};