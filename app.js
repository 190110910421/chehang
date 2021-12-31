const ejs = require('ejs');
const Mongoose = require('./modules/mongoose.js');
const express = require('express');
const session = require('express-session')
const path  = require('path')
const multer  = require('multer')
var bodyParser = require('body-parser');
const _ = require('lodash');
const app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:false}));
const port = 60435


// 配置模板引擎
app.set("view engine","ejs")
app.use(express.static("node_modules"));
app.use(express.static("static/photo"))
app.use(express.static('static'))

app.use(session({
    secret: 'this is a session', //服务器生成session签名
    name: 'username',
    resave: false, //强制保存session即使他没有变化
    saveUninitialized: true, //强制保存未初始化的session
    cookie: {
        maxAge: 1000 * 60 * 15
    },
    rolling: true
}))

const storage = multer.diskStorage({ //设置文件保存格式
    destination: function (req, file, cb) {
      cb(null, 'static/upload')
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      var extname = path.extname(file.originalname)
      cb(null, file.fieldname + '-' + uniqueSuffix + extname)
    }
})
const upload = multer({ storage: storage })


//功能主页
app.get('/',(req, res)=>{

  res.render('index.ejs', {
      user:null
  })

})

app.get('/index.ejs',(req, res)=>{

  res.render('index.ejs', {
      user:null
  })

})

//登录页面
app.get('/login.ejs',(req, res)=>{

  res.render('login.ejs', {
      user:null,
      info:null
  })

})

//注册页面
app.get('/reg.ejs',(req, res)=>{

  res.render('reg.ejs', {
      user:null,
      info:null
  })

})

//修改密码界面
app.get('/Repassword.ejs',(req, res)=>{
  var self = req.session.user
  var username=self.username
  res.render('Repassword.ejs', {
      user:self,
      username:username,
      info:null
  })

})

//用户登陆
app.post('/LoginAction',(req, res,next)=>{
  var username = req.body.username;
  var password = req.body.password;
  Mongoose.User.findOne({"username": username, "password": password}).exec((err, user) => {
      if(err) return console.log(err)
      if(!user) res.render("login.ejs", {
          info: "用户名或密码错误",
          user: null
      })
      else {
          req.session.user = user
          // var self = req.session.user
          // var x=self.username
          // console.log("session")
          // console.log(x)
          Mongoose.Goods.find({},function(err,goodslist){
              console.log(goodslist)
              if(err) return console.log(err)
              res.render("zhuyemian.ejs", {
                  info: "登陆成功！",
                  user:user,
                  goodsList:goodslist,
                  key:null
              })
              next();
          })
      }
  })
})

//用户注册
app.post('/Request',  upload.single('headimg'), (req, res, next) => {
  var username = req.body.username
  var password = req.body.password
  var sex = req.body.sex
  var birth = req.body.birth
  var email = req.body.email
  var address = req.body.address
  var headimg = req.file.filename
  var regtime = Mongoose.GetRegTime()
  var manager = 1
  Mongoose.User.findOne({"username":username}).exec((err,user) =>{
      if(!user){
          Mongoose.InsertUser(username, password, sex, birth, email,regtime,address,headimg,manager);
          res.render("login.ejs", {
              user:null,
              info: "注册成功！"
          })
          return next();
      }else{
          res.render("reg.ejs", {
              user:null,
              info: "该用户名已被注册！"
          })
      }
      
  })
})

//个人中心
app.get('/MyInfo', (req, res) => {
  var self = req.session.user
  var username=self.username
  Mongoose.User.findOne({"username": username}).exec((err, user) => {
      if(err) return console.log(err)
      res.render('userInfo.ejs', {
        user:self,
        username:username,
        info:null,
      })
  })
})

//我的足迹
app.get('/MyTracks', (req, res) => {
  console.log(req.session.user)
  var self = req.session.user
  var username=self.username

  Mongoose.Tracks.find({"username": username}).exec((err, historyList) => {
      if(err) return console.log(err)
      if(historyList){
        res.render('mytracks.ejs', {
          historyList:historyList,
          user:self,
          username:username,
        })
      }else{
        res.render('mytracks.ejs', {
          historyList:null,
          user:self,
          username:username,
        })
      }
      
  })
})

//我的购物车
app.get('/AllShopping', (req, res) => {
  var self = req.session.user
  var username=self.username

  Mongoose.Usershopping.find({"username": username}).exec((err, goodsList) => {
      console.log(goodsList.length)
      if(err) return console.log(err)
      res.render('usershopping.ejs', {
        user:self,
        username:username,
        goodsList:goodsList,
        info:null
      })
  })
})

//我的购买历史
app.get('/Allbuyhistorygood', (req, res) => {
  var self = req.session.user
  var username=self.username

  Mongoose.Buyhistory.find({"username": username}).exec((err, goodsList) => {
      if(err) return console.log(err)
      res.render('userbuyhistory.ejs', {
        user:self,
        username:username,
        goodsList:goodsList,
      })
  })
})

//登出
app.get('/denchu',(req, res)=>{
  req.session.user = null
  res.render("login.ejs", {
      user:null,
      info: null
  })
})

//主页面
app.get('/zhuyemian', (req, res) => {
  var self = req.session.user
  var username=self.username

  Mongoose.Goods.find({},function(err,goodsList){
    if(err) return console.log(err)
      res.render('zhuyemian.ejs', {
        user:self,
        username:username,
        goodsList:goodsList,
        info:null,
        key:null
      })
  })

})

//成为店家页面
app.get('/bemanager.ejs',(req, res)=>{
  var self = req.session.user
  var username=self.username
  res.render('bemanager.ejs', {
      user:self,
      username:username,
      info:null
  })
})

//添加商品页面
app.get('/addgoods.ejs',(req, res)=>{
  var self = req.session.user
  var username=self.username
  Mongoose.User.findOne({"username":username}).exec((err, user) => {
    if(err) return console.log(err)
    if(user.manager==1){
      res.render('bemanager.ejs', {
        user:self,
        username:username,
        info:"请先成为店家"
      })
    }else{
      res.render('addgoods.ejs', {
          user:self,
          username:username,
          info:null
      })
    }    
  })    
})

//成为店家
app.post('/BeManager', (req, res) =>{
  var self = req.session.user
  var username1=self.username
  var username = req.body.username
  var password = req.body.password
  Mongoose.User.find({"username":username,"password":password}).exec((err, user) => {
      if(err) return console.log(err)
      if(!user){
        res.render('bemanager.ejs', {
          user:self,
          username:username1,
          info:"用户名或密码错误"
        })
      }else{
        Mongoose.Bemanager(username)
        res.render('userInfo.ejs', {
          user:self,
          username:username,
          info:"您已成为店家"
        })
      }      
  })
})

//商品上架
app.get('/Restoregoods', (req, res) =>{
  var self = req.session.user
  var username=self.username
  var goodid = req.body.id
  var suburl = req.url.split('?')[1]
  var goodid = suburl.split("=")[1]
  Mongoose.Restoregoods(goodid)
  Mongoose.Goods.find({"username":username}).exec((err, goodsList) => {
    if(err) return console.log(err)
    res.render('usergoods.ejs', {
      user:self,
      username:username,
      goodsList:goodsList,
      info:null,
    })
  })    
})

//商品下架
app.get('/Invalidgoods', (req, res) =>{
  var self = req.session.user
  var username=self.username
  var suburl = req.url.split('?')[1]
  var goodid = suburl.split("=")[1]
  Mongoose.Invalidgoods(goodid)
  Mongoose.Goods.find({"username":username}).exec((err, goodsList) => {
    if(err) return console.log(err)
    res.render('usergoods.ejs', {
      user:self,
      username:username,
      goodsList:goodsList,
      info:null,
    })
  })    
})

//修改商品页面
app.get('/modifygoods.ejs',(req, res)=>{
  var self = req.session.user
  var username=self.username

  Mongoose.User.findOne({"username":username}).exec((err, user) => {
    if(err) return console.log(err)
    if(user.manager==1){
      res.render('bemanager.ejs', {
        user:self,
        username:username,
        info:"请先成为店家"
      })
    }else{
      res.render('modifygoods.ejs', {
        user:self,
        username:username,
        info:null
      })
    }    
  })    
})

//添加新商品
app.post('/AddGoods', upload.single('photo'), (req, res) =>{
  var self = req.session.user
  var username=self.username
  var goodsname = req.body.goodsname
  var price = req.body.price
  var number = req.body.number
  var status = req.body.status
  if(status=="上架")status=1
  else status=0
  var photo = req.file.filename
  Mongoose.Goods.findOne({"goodsname":goodsname,"username":username}).exec((err,goods)=>{
    if(err) return console.log(err)
    if(!goods){
        Mongoose.InsertGoods(username,goodsname,price,number,status,photo)
        res.render("addgoods.ejs", {
            info:"添加成功！",
            user:self,
            username:username,
        })
    }
    else{
        res.render('addgoods.ejs', {
            user:self,
            username:username,
            info:"该商品已经加入商店！"
        })
    }
  })
})

//小店商品管理
app.get('/AllGoods', (req, res) => {
  var self = req.session.user
  var username=self.username

  Mongoose.Goods.find({"username":username}).exec((err, goodsList) => {
      if(err) return console.log(err)
      res.render('usergoods.ejs', {
        user:self,
        username:username,
        goodsList:goodsList,
        info:null
      })
  })
})

//商品详细信息
app.get('/GoodsDetails', (req, res) => {
  var self = req.session.user
  var username=self.username
  var suburl = req.url.split('?')[1]
  var goodid = suburl.split("=")[1]
  console.log(goodid)
  var time = Mongoose.GetRegTime()
  Mongoose.InsertTracks(username,time,goodid)
  Mongoose.Goods.findOne({"id":goodid}).exec((err, goods) => {
      if(err) return console.log(err)
      console.log(goods)
      Mongoose.Userreply.find({"goodid":goodid}).exec((err, goodreplyList) => {
      if(err) return console.log(err)
        res.render('goods.ejs', {
          user:self,
          username:username,
          good:goods,
          goodreplyList:goodreplyList,
        })
      })
  })
})



//添加商品到购物车
app.get('/AddShopGoods', (req, res) => {
  console.log("1")
  var self = req.session.user
  var username=self.username
  var suburl = req.url.split('?')[1]
  var x = suburl.split("&")
  var goodid = x[0].split("=")[1]
  var number = x[1].split("=")[1]
  // console.log(goodid)
  Mongoose.Goods.findOne({"id":goodid}).exec((err,goods)=>{
    if(err) return console.log(err)
    // console.log("22222222")
    // console.log("1:"+number)
    // console.log("2:"+goods.number)
    if(number>goods.number){
      Mongoose.Goods.find({},function(err, goodsList){
        if(err) return console.log(err)
        res.render("zhuyemian.ejs", {
            info:"商品库存不足",
            user:self,
            username:username,
            goodsList:goodsList,
            key:null
        })
      })
    }else{
      console.log("3")
      Mongoose.InsertShopGoods(goods,number,username)
      Mongoose.Goods.find({},function(err, goodsList){
        if(err) return console.log(err)
        res.render("zhuyemian.ejs", {
            info:"添加成功！",
            user:self,
            username:username,
            goodsList:goodsList,
            key:null
        })
      })
    }
  })
})

//添加评论
app.post('/AddReply', (req, res) => {
  var self = req.session.user
  var username=self.username
  var id = req.body.id
  var text = req.body.text
  var time = Mongoose.GetRegTime()
  console.log("ud:"+id)
  Mongoose.Buyhistory.findOne({"id":id}).exec((err, history) => {
    if(err) return console.log(err)
    Mongoose.InsertReply(history.goodid,username,text,time,id)
    Mongoose.Buyhistory.find({"username": username}).exec((err, goodsList) => {
    if(err) return console.log(err)
      res.render('userbuyhistory.ejs', {
        user:self,
        username:username,
        goodsList:goodsList,
      })
    })
  })
  
})

//直接购买商品
app.post('/Directbuygoods', (req, res) => {
  var self = req.session.user
  var username=self.username
  var goodid = req.body.id
  var number = req.body.number
  Mongoose.Goods.findOne({"id":goodid}).exec((err,goods)=>{
    if(err) return console.log(err)
    if(number>goods.number){
      Mongoose.Goods.find({},function(err, goodsList){
        if(err) return console.log(err)
        res.render("zhuyemian.ejs", {
            info:"商品库存不足",
            user:self,
            username:username,
            goodsList:goodsList,
            key:null
        })
      })
    }else{
      var price = number*goods.price
      var time = Mongoose.GetRegTime()
      Mongoose.BuyGoods(goodid,number,username,time)
      res.render("buyresult.ejs", {
          info:"购买成功！",
          price:price,
          user:self,
          username:username,
      })
    }           
  })
})

//购物车购买商品
app.get('/Buygoods', (req, res) => {
  var self = req.session.user
  var username=self.username
  var suburl = req.url.split('?')[1]
  var id = suburl.split("=")[1]
  Mongoose.Usershopping.findOne({"id":id}).exec((err,usershopping)=>{
    if(err) return console.log(err)
    Mongoose.Goods.findOne({"id":usershopping.goodid}).exec((err,goods)=>{
      if(err) return console.log(err)
      // console.log(usershopping.number)
      // console.log(id)
      if(usershopping.number>goods.number){
        Mongoose.Usershopping.find({},function(err, goodsList){
          if(err) return console.log(err)
          res.render("usershopping.ejs", {
              info:"商品库存不足",
              user:self,
              username:username,
              goodsList:goodsList
          })
        })
      }else{
        var price = usershopping.number*goods.price
        var time = Mongoose.GetRegTime()
        Mongoose.BuyGoods(usershopping.goodid,usershopping.number,username,time)
        Mongoose.Usershopping.findOneAndRemove({"id":id}, (err, data) => {
          if(err) {
              console.log("删除商品失败")  
              console.log(err)
              return
          }
          console.log("删除商品成功")  
            res.render("buyresult.ejs", {
              info:"购买成功！",
              price:price,
              user:self,
              username:username,
          })
        })  
      }    
    })       
  })
})

//购物车删除商品
app.get('/Deletegoods', (req, res) => {
  var self = req.session.user
  var username=self.username
  var suburl = req.url.split('?')[1]
  var id = suburl.split("=")[1]
  Mongoose.Usershopping.findOneAndRemove({"id":id}, (err, data) => {
    if(err) {
        console.log("删除商品失败")  
        console.log(err)
        return
    }
    console.log("删除商品成功")  
    Mongoose.Usershopping.find({"username": username}).exec((err, goodsList) => {
      // console.log(goodsList.length)
      if(err) return console.log(err)
      res.render('usershopping.ejs', {
        user:self,
        username:username,
        goodsList:goodsList,
        info:"删除商品成功！"
      })
    })
  })
})

//修改商品属性
app.post('/ModifyGoods', (req, res) => {
  var self = req.session.user
  var username=self.username
  var goodsname = req.body.goodsname
  var number = req.body.number
  var price = req.body.price
  Mongoose.Goods.findOne({"goodsname":goodsname,"username":username}).exec((err,goods)=>{
    if(err) return console.log(err)
    if(!goods){
      res.render("modifygoods.ejs", {
          info:"请把信息填写完整!",
          user:self,
          username:username,
      })
    }else{
      Mongoose.ModifyGoods(goodsname,number,username,price) 
      Mongoose.Goods.find({"username":username}).exec((err, goodsList) => {
        if(err) return console.log(err)
        res.render('usergoods.ejs', {
          user:self,
          username:username,
          goodsList:goodsList,
          info:"修改成功！"
        })
      })
    }           
  })
})

//修改密码
app.post('/RePassword',(req, res)=>{
  var self = req.session.user
  var username=self.username
  var password = req.body.oldpassword;
  var newpassword1 = req.body.newpassword1;
  var newpassword2 = req.body.newpassword2;
  if(password == newpassword1){    //判断就密码新密码是否一致
          res.render("setpwd.ejs", {
              user:user,
              info: "新密码不能与原密码一致！"
          })
  }
  if(newpassword2 != newpassword1){    //判断两次新密码是否一致
        res.render("setpwd.ejs", {
            user:user,
            info: "两个新密码不一致！"
        })
}
  Mongoose.User.findOne({"username": username, "password": password}).exec((err, user) => {
      if(err) return console.log(err)
      if(!user) res.render("setpwd.ejs", {
          info: "原密码错误！",
          user: self,
          username:username,
      })
      else{
          Mongoose.setPwd(user.username,newpassword1)
          res.render("login.ejs", {
              user:null,
              info: "修改密码成功！请重新登陆！"
          })
      }

  })
})




app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})