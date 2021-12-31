const mongoose = require("./db.js")

const Usershoppingchema = {  
    id:String, 
    username: String,
    goodid: String,
    number: Number, 
    goodsname:String,
    price:Number
}

const Usershopping = mongoose.model("Usershopping", Usershoppingchema, "usershopping")

module.exports  = Usershopping