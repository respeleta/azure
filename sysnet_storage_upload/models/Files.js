var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var FilesSchema = new Schema({
    token: String,
    filename: String,
    id_entity: String,
    service: String,
    repository: String,
    date_storage: Date,
    content_type: String,
    url: String
});
module.exports = mongoose.model('files', FilesSchema); 