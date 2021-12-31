const Goods = require("../modules/goods")
const User = require("../modules/user")
const Usershopping = require("../modules/usershopping")
const { findOneAndDelete } = require("../modules/user")
const Tracks = require("../modules/tracks")
const Buyhistory = require("../modules/buyhistory")
const Userreply = require("../modules/userreply")

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
function InsertUser(username, password, sex, birth,email,regtime,address,headimg, manager) {
    var user = new User({
        username: username,
        password: password,
        sex: sex,
        birth: birth,
        email: email,      
        regtime: regtime,
        address: address,
        headimg: headimg,
        manager: manager
    })
    user.save((err) => {
        if(err) return console.log(err)
        console.log("插入user成功")
    })
}

//添加新商品
function InsertGoods(username, goodsname, price, number, status, photo) {
    var id=GetID()
    var goods = new Goods({
        id:id,
        username: username,
        goodsname: goodsname,
        price: price,
        number: number,
        photo: photo,
        status: status
    })
    goods.save((err) => {
        if(err) return console.log(err)
        console.log("插入goods成功!")
    })
}

//把商品添加到购物车
function InsertShopGoods(goods,number,username) {
    var id=GetID()
    Usershopping.findOne({"id":goods.id,"username":username}).exec((err, usershopping) => {
        if(err) return console.log(err)
        if(!usershopping){
            var usershopping = new Usershopping({
                id:id,
                username: username,
                goodid: goods.id,
                number: number,
                price:goods.price,
                goodsname:goods.goodsname
            })
            usershopping.save((err) => {
                if(err) return console.log(err)
                console.log("加入购物车成功！")
            })
        }else{
            Usershopping.updateOne({"username":username,"goodid":goods.id},{"number":number+usershopping.number},(err) => {
                if(err) return console.log(err)
                console.log("加入购物车成功！")
            })
        } 
    })    
}

//添加浏览记录
function InsertTracks(username,time,goodid) {
    var id=GetID()
    Tracks.findOne({"goodid":goodid,"username":username}).exec((err, tracks) => {
        if(err) return console.log(err)
        if(!tracks){
            Goods.findOne({"id":goodid,"username":username}).exec((err, goods) => {
                console.log(goods.goodsname)
                if(err) return console.log(err)
                var tracks = new Tracks({
                    id:id,
                    username: username,
                    goodid: goodid,
                    goodsname:goods.goodsname,
                    clicktime: time,
                    photo: goods.photo,
                })
                tracks.save((err) => {
                    if(err) return console.log(err)
                    console.log("加入足迹成功！")
                })
            }) 
        }else{
            Tracks.updateOne({"username":username,"goodid":goodid},{"clicktime":time},(err) => {
                if(err) return console.log(err)
                console.log("加入足迹成功！")
            })
        }
       
    })    
}

//购买商品
function BuyGoods(goodid,number,username,time) {
    var id=GetID()
    Goods.findOne({"id":goodid}).exec((err, goods) => {
        if(err) return console.log(err)
        Goods.updateOne({"id":goodid},{"number":goods.number-number},(err) => {
            if(err) return console.log(err)
            console.log("购买成功！")
            var buyhistory = new Buyhistory({
                id:id,
                username: username,
                goodid: goodid,
                time:time,
                photo: goods.photo,
                status: 0,
            })
            buyhistory.save((err) => {
                if(err) return console.log(err)
                console.log("购买历史添加成功！")
            })
        })     
    })    
}

//添加评论
function InsertReply(goodid,username,text,time,idx){
    var id=GetID()
    console.log("---------------"+idx+"-"+goodid)
    Buyhistory.updateOne({"id":idx,"username":username},{"status":1},(err) => {
        if(err) return console.log(err)
        console.log("评论状态更改")
        var userreply = new Userreply({
            id:id,
            username: username,
            goodid: goodid,
            time: time,
            text: text
        })
        userreply.save((err) => {
            if(err) return console.log(err)
            console.log("评论添加成功！")
        })
    })     

}

//修改密码
function setPwd(username, password) {
    User.updateOne({"username":username},{"password":password},(err) => {
        if(err) return console.log(err)
        console.log("修改密码成功！")
    })
}

//商品上架
function Restoregoods(goodid) {
    Goods.updateOne({"id":goodid},{"status":1},(err) => {
        if(err) return console.log(err)
        console.log("上架成功！")
    })
}

//商品下架
function Invalidgoods(goodid) {
    console.log(goodid)
    Goods.updateOne({"id":goodid},{"status":0},(err) => {
        if(err) return console.log(err)
        console.log("下架成功！")
    })
}

//修改商品信息
function ModifyGoods(goodsname,number,username,price){
    Goods.updateOne({"username":username,"goodsname":goodsname},{"number":number,"price":price},(err) => {
        if(err) return console.log(err)
        console.log("修改商品信息成功！")
    })
}

//成为店家
function Bemanager(username) {
    User.updateOne({"username":username},{"manager":2},(err) => {
        if(err) return console.log(err)
        console.log("成为店家！")
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


module.exports = {User,Goods,Usershopping,Tracks,Buyhistory,Userreply,InsertUser,GetRegTime,
    setPwd,getStatusCn,Bemanager,ModifyGoods,InsertReply,BuyGoods,InsertTracks,InsertShopGoods,
    InsertGoods,Restoregoods,Invalidgoods,GetID}
