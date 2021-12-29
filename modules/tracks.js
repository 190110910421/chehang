const mongoose = require("./db.js")

const TracksSchema = {   
    username: String,
    goodid: Number,
    clicktime: String,
    photo: String
}

const Tracks = mongoose.model("Tracks", TracksSchema, "tracks")

module.exports  = Tracks