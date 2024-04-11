const mongo = require('../services/database');
const { upload } = require('../services/s3Bucket');

let db;
mongo.connectDB
    .then((client) => {
        db = client.db('nodejs')
    })

module.exports = {
    pageRender: (req, res) => {
        res.render('write.ejs');
    },

    insertBoard: async (req, res) => {
        // 이미지 예외 처리할때 middleware로 처리하지 말고 여기에 직접하는게 좋음
        upload.array('img1')(req, res, async (err) => {
            if(err) return res.send('이미지 업로드 실패')
    
            const title = req.body.title;
            const content = req.body.content;
    
            let imgArray = []
            for(let i = 0; i < req.files.length; i++)
                imgArray.push(req.files[i].location);
    
            try
            {
                if(title == '' || content == '')
                    res.send("<script>alert('내용을 입력해 주세요.');location.href='/write';</script>");
                else
                {
                    await mongo.insertOneDocument(db, 'sgchoo', { title: title, content: content, img: imgArray });
                    res.redirect('/list/next');
                }
            }
            catch(e)
            {
                console.log(e);
                res.status(500).send('서버 에러');
            }
        })
    },

}