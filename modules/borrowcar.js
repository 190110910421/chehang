const mongoose = require("./db.js")

const BorrowcarSchema = {
    id:String,
    username:String,
    goodsname: String,
    price: Number,
    photo: String,
    time: String,
}

const Borrowcar = mongoose.model("Borrowcar", BorrowcarSchema, "borrowcar")

module.exports  = Borrowcar