var mongoose = require('mongoose');

var schemaMarvel = new mongoose.Schema( {
    Name: String,
    Image: String,
    Level: Number
});

module.exports = mongoose.model("Marvel", schemaMarvel)