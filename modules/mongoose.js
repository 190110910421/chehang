const Goods = require("./goods")
const User = require("./user")
const Usershopping = require("./usershopping")
const { findOneAndDelete } = require("./user")


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

//修改密码
function setPwd(username, password) {
    User.updateOne({"username":username},{"password":password},(err) => {
        if(err) return console.log(err)
        console.log("修改密码成功！")
    })
}


function GetRegTime() {
    var d = new Date()
    var time = d.getFullYear() + "-" + d.getMonth() + "-" + d.getDate()
    return time
}



module.exports = {User,Goods,Usershopping,InsertUser,GetRegTime,setPwd}
