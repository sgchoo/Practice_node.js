const mongo = require('../services/database');

let db;
mongo.connectDB
    .then((client) => {
        db = client.db('nodejs');
    })
    .catch((err) => {
        console.log(err);
    });

module.exports = {

    deleteDocument: async(req, res) => {
        var findDocById = { _id: new mongo.ObjectId(req.body._id)};
        
        const result = await mongo.deleteOneDocument(db, 'sgchoo', findDocById);

        if(result.deletedCount === 1)
        {
            res.send('Delete Document Success');
        }
        else
        {
            res.status(500).send('Delete Document Failed');
        }
    },

};
