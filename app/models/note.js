var mongoose = require('mongoose');
var config = require('../../config/config');

var Schema = mongoose.Schema;

var ItemSchema = new Schema({
    id: { type: String, index:true },
    user_id: { type: String, index:true },
    priority: { type: Number },
    project_id: { type: String },
    content: { type: String, trim: true },
    date_added: { type: Date },
    date_string: { type: String },
    notes: [ {type: Schema.ObjectId, ref : 'Note' } ]
});

var NoteSchema = new Schema({
    id: {type: String, unique: true},
    item_id: {type: String, index: true},
    is_deleted: {type: Number, default: 0},
    is_archived: {type: Number, default: 0},
    content: {type: String, trim: true},
    posted: {type: Date, default: Date.now},
    is_send: { type: Boolean, default: false }
});

module.exports = mongoose.model('Note', NoteSchema);
