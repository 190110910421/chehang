const mongoose = require("./db.js")

const GoodsSchema = {
    id:String,
    username: String,
    goodsname: String,
    price: Number,
    number: Number,
    photo: String,
    status: Number
}

const Goods = mongoose.model("Goods", GoodsSchema, "goods")

module.exports  = Goods