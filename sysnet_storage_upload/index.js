/**
 * Sysnet Storage Service - Serverless
 *
 * This function can be used to upload a file to a blob storage
 *
 * - return 400 if request is empty or if the filename is not defined
 * - save file to the storage defined
 */
const multipart = require("parse-multipart");
let UUID = require("uuidjs");
const FileModel = require('./../models/Files');

module.exports = (context, req) => {
  try {

    //Validate the 
    if (!req.query.filename) {
      return BadRequest(context, `filename is not defined`);
    }

    if (req.body) {
      //Save File
      const bodyBuffer = Buffer.from(req.body);
      let token = UUID.generate();
      const boundary = multipart.getBoundary(req.headers["content-type"]);
      const parts = multipart.Parse(bodyBuffer, boundary);
      context.bindings.storage = parts[0].data;

      // Connect to Mongo
      var mongoose = require('mongoose');
      var env = require('dotenv').config();

      mongoose.connect("mongodb://" + process.env.MONGO_HOST + ":" + process.env.MONGO_PORT + "/" + process.env.MONGO_DATABASE + "?ssl=true&replicaSet=globaldb", {
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

      //Create File
      var _File = new FileModel({
        token: token,
        filename: req.query.filename,
        service:  req.query.service != undefined ?  req.query.service :  process.env.SERVICE,
        repository: req.query.repository != undefined ?  req.query.repository :  process.env.REPOSITORY,
        date_storage: new Date(),
        content_type: parts[0].type,
        url: `https://${process.env.ACCOUNT}.blob.core.windows.net/sysnet/${req.query.filename}`
      });

      //Save in mongo
      _File.save((err, _Save) => { });

      //Return Response
      context.bindings.response = {
        status: 200,
        body: token
      };

      //Finished Execution
      context.done();

    } else {
      return BadRequest(context, `Request Body is not defined`);
    }
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
