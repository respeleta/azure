/**
 * Sysnet Storage Service - Serverless
 *
 * This function can be used to download a file to a blob storage
 *
 * - return 400 if request is empty or if the filename is not defined
 * - save file to the storage defined
 */
let UUID = require("uuidjs");
const FileModel = require('./../models/Files');

module.exports = async (context, req) => {
    try {

        //Validate the 
        let token = req.query.token;
        if (token === undefined) {
            return BadRequest(context, `token is not defined`);
        }
        // Connect to Mongo
        var mongoose = require('mongoose');

        await mongoose.connect("mongodb://" + process.env.MONGO_HOST + ":" + process.env.MONGO_PORT + "/" + process.env.MONGO_DATABASE + "?ssl=true&replicaSet=globaldb", {
            auth: {
                username: process.env.MONGO_USER,
                password: process.env.MONGO_PASSWORD
            },
            useNewUrlParser: true,
            useUnifiedTopology: true,
            retryWrites: false
        })
            .then(() => context.log('Connection to CosmosDB successful'))
            .catch((err) => context.log.error(err));

        //Find in Mongo
        let _File = await FileModel.findOne({ 'token': token });
        context.log.error(_File);
        if (!_File) {
            
            //Return Response
            context.bindings.response = {
                status: 404
            };
        } else {
            //Return Response
            context.bindings.response = {
                status: 200,
                body: _File
            };
        }

        //Finished Execution
        context.done();

    } catch (err) {
        context.log.error(err.message);
        throw err;
    }
};

function BadRequest(context, message = "Bad Request") {
    context.log.error(message);
    context.bindings.response = {
        status: 400,
        body: message,
    };
    context.done();
}
