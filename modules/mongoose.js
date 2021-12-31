const Car = require("../modules/car")
const User = require("../modules/user")
const Borrowcar = require("../modules/borrowcar")
const { findOneAndDelete } = require("../modules/user")

//获取准确时间
function GetRegTime() {
    var d = new Date()
    var time = d.getFullYear() + "-" + d.getMonth() + "-" + d.getDate() + "-" + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds()
    return time
}

function GetID() {
    var d = new Date()
    var time = d.getFullYear() + "" + d.getMonth() + "" + d.getDate() + "" + d.getHours() + "" + d.getMinutes() + "" + d.getSeconds()
    return time
}

//用户注册
function InsertUser(username, password, sex,email,regtime,headimg, manager) {
    var user = new User({
        username: username,
        password: password,
        sex: sex,
        email: email,      
        regtime: regtime,
        headimg: headimg,
        manager: manager
    })
    user.save((err) => {
        if(err) return console.log(err)
        console.log("插入user成功")
    })
}

//添加新商品
function InsertCar(goodsname, price, status, photo) {
    var id=GetID()
    var car = new Car({
        id:id,
        goodsname: goodsname,
        price: price,
        photo: photo,
        status1: status,
        status2: 0
    })
    car.save((err) => {
        if(err) return console.log(err)
        console.log("插入car成功!")
    })
}

//借车
function borrowCar(goodid,username,time,car) {
    var id=GetID()
    
    Car.updateOne({"id":car.id},{"status2":1},(err) => {
        if(err) return console.log(err)
        console.log(car.id)
        var borrowcar = new Borrowcar({
            id:id,
            username:username,
            goodsname: car.goodsname,
            price: car.price,
            photo: car.photo,
            time: time,
        })
        borrowcar.save((err) => {
            if(err) return console.log(err)
            console.log("插入car成功!")
        })
    })        
}

//还车
function returnCar(goodid) {

    Car.updateOne({"id":goodid},{"static2":0},(err) => {
        if(err) return console.log(err)
    })        
}

//修改密码
function setPwd(username, password) {
    User.updateOne({"username":username},{"password":password},(err) => {
        if(err) return console.log(err)
        console.log("修改密码成功！")
    })
}

//车上架
function RestoreCar(goodid) {
    Car.updateOne({"id":goodid},{"status1":1},(err) => {
        if(err) return console.log(err)
        console.log("上架成功！")
    })
}

//车下架
function InvalidCar(goodid) {
    console.log(goodid)
    Car.updateOne({"id":goodid},{"status1":0},(err) => {
        if(err) return console.log(err)
        console.log("下架成功！")
    })
}



//状态判断
function getStatusCn(static){
    if(static==1){
        return "商品在售"
    }
    else{
        return "商品未在售"
    }
}


module.exports = {User,Car,Borrowcar,returnCar,InsertCar,InsertUser,GetRegTime,setPwd,getStatusCn,borrowCar,InvalidCar,RestoreCar,GetID}
