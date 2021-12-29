const mongoose = require("./db.js")

const UserSchema = {   
    username: String,
    password: String,
    sex: String,
    email: String,
    regtime: String,
    address: String,
    headimg: String,
    manager: Number
}

const User = mongoose.model("User", UserSchema, "users")

module.exports  = User