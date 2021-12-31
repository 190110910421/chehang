const mongoose = require("./db.js")

const TracksSchema = {   
    id:String,
    username: String,
    goodid: String,
    goodsname:String,
    clicktime: String,
    photo: String
}

const Tracks = mongoose.model("Tracks", TracksSchema, "tracks")

module.exports  = Tracks