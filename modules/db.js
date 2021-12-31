const mongoose = require('mongoose')

mongoose.connect('mongodb://localhost/car');

module.exports = mongoose