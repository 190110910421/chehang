const mongoose = require("./db.js")

const CarSchema = {
    id:String,
    goodsname: String,
    price: Number,
    photo: String,
    status1: Number,
    status2:Number
}

const Car = mongoose.model("Car", CarSchema, "car")

module.exports  = Car