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
    showSearchResult: async (req, res) => {
        try
        {
            let obj;
            let target = req.query.val;

            if(target != null)
                obj = { $or: [ 
                                {title : new RegExp(target)}, 
                                {content: new RegExp(target)}
                            ] }

            let result = await mongo.findDocumentArray(db, 'sgchoo', obj);

            if(result.length <= 0)
            {
                res.send("<script>alert('입력한 제목의 게시물이 없습니다.');location.href='/list/next';</script>");
            }
            else
                res.render('search.ejs', {post: result});
        }
        catch(err){
            console.log(err)
        };
    }
};