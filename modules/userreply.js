const mongoose = require("./db.js")

const UserreplySchema = {   
    username: String,
    goodid: String,
    time: String,
    text: String
}

const Userreply = mongoose.model("Userreply", UserreplySchema, "userreply")

module.exports  = Userreply