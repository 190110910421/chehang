const mongoose = require("./db.js")

const Usershoppingchema = {   
    username: String,
    goodid: String,
    number: Number,   
}

const Usershopping = mongoose.model("Usershopping", Usershoppingchema, "usershopping")

module.exports  = Usershopping