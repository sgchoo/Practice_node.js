// MongoDB Connect
const { MongoClient, ObjectId } = require('mongodb');

require('dotenv').config();

const url = process.env.DB_URL;
let connectDB = new MongoClient(url).connect();

// =============================================================================
// =============================================================================

module.exports = {
    connectDB,

    ObjectId,

    /** nodejs Database에 collection에서 targetObj를 가진 Document 한개를 반환 */
    findOneDocument: async (db, collection, targetObj) => {
        if(typeof(collection) !== 'string' || typeof(targetObj) !== 'object')
        {
            console.log('{findOneDocument} collection parameter type must be String and targetObj parameter type must be Object');
            return null;
        }
        let document = await db.collection(collection).findOne(targetObj);
        return document;
    },

    /** nodejs Database의 collection에서 targetObj 객체를 가지거나, 모든 document들을 반환 */
    findDocumentArray: async (db, collection, targetObj = null) => {
        if(typeof(collection) !== 'string' || ((typeof(targetObj) !== 'object') && targetObj != null))
        {
            console.log('{findDocumentArray} collection parameter type must be String and targetObj parameter type must be Object or null');
            return null;
        }
        if (targetObj != null)
        {
            let document = await db.collection(collection).find(targetObj).toArray();
            return document;
        }
        else
        {
            let document = await db.collection(collection).find().toArray();
            return document;
        }
    },

    /** nodejs Database의 collection으로 insertObj 객체를 삽입 */
    insertOneDocument: async (db, collection, insertObj) => {
        if(typeof(collection) !== 'string' || typeof(insertObj) !== 'object')
        {
            console.log('{insertOneDocument} collection parameter type must be String and insertObj parameter type must be Object');
            return null;
        }
        
        let insert = await db.collection(collection).insertOne(insertObj);
        return insert;
    },

    /** nodejs Database의 collection내에 findobj를 가진 document를 updateObj로 업데이트(updateObj의 객체는 set으로 설정해줄 것) */
    updateOneDocument: async (db, collection, findObj, updateObj) => {
        if(typeof(collection) !== 'string' || typeof(updateObj) !== 'object' || typeof(findObj) !== 'object')
        {
            console.log('{updateOneDocument} collection parameter type must be String and updateObj parameter type must be Object and findObj parameter type must be Object');
            return;
        }

        let update = await db.collection(collection).updateOne(findObj, updateObj);
        return update;
    },

    /** nodejs Database의 collection내에 deleteObj 가진 document를 삭제*/
    deleteOneDocument: async (db, collection, deleteObj) => {
        if(typeof(collection) !== 'string' || typeof(deleteObj) !== 'object')
        {
            console.log('{deleteOneDocument} collection parameter type must be String and deleteObj parameter type must be Object');
            return;
        }

        let _delete = await db.collection(collection).deleteOne(deleteObj);
        return _delete;
    },
}