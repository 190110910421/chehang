const mongoose = require("./db.js")

const BuyhistorySchema = {  
    id:String,
    username: String,
    goodid: String,
    time:String,
    photo: String,
    status: Number,
}

const Buyhistory = mongoose.model("Buyhistory", BuyhistorySchema, "buyhistory")

module.exports  = Buyhistory