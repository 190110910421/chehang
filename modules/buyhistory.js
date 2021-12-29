const mongoose = require("./db.js")

const BuyhistorySchema = {   
    username: String,
    goodid: Number,
    time:String,
    photo: String,
    status: Number,
}

const Buyhistory = mongoose.model("Buyhistory", BuyhistorySchema, "buyhistory")

module.exports  = Buyhistory