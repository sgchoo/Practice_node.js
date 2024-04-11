const mongo = require('../services/database');

let db;
mongo.connectDB
    .then((client) => {
        db = client.db('nodejs');
    })
    .catch((err) => {
        console.log(err)
    })

module.exports = {

    showDetail: async (req, res) => {
        try
        {
            // URL의 뒷부분(/detail/:id의 id)을 가지고있는 document를 가져온다
            const result = await mongo.findOneDocument(db, 'sgchoo', { _id: new mongo.ObjectId(req.params.id) });
            // render시에 데이터를 보내준다.
            if(result == null)
                res.status(404).send('invalid url')
            else
            {
                res.render('detail.ejs', { title: result.title, content: result.content, id: req.params.id, image: result.img});
            }
        }
        catch(e)
        {
            console.log(e);
            res.status(404).send('invalid url')
        }
    }
};