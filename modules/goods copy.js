const mongoose = require("./db.js")

const UserreplySchema = {   
    username: String,
    goodid: Number,
    time: String
}

const Userreply = mongoose.model("Userreply", UserreplySchema, "userreply")

module.exports  = Userreply