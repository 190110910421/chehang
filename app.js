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
  var user = req.session.user
  res.render('Repassword.ejs', {
      user:user,
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
          Mongoose.Goods.find({},function(err,goodslist){
              if(err) return console.log(err)
              res.render("zhuyemian.ejs", {
                  info: "登陆成功！",
                  user:user
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
  var manager = req.body.manager
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
app.post('/MyInfo', (req, res) => {
  var self = req.session.user
      username=self.username

  Mongoose.User.findOne({"username": username}).exec((err, user) => {
      if(err) return console.log(err)
      res.render('userInfo.ejs', {
          user:user,
      })
  })
})

//我的足迹
app.post('/MyTracks', (req, res) => {
  var self = req.session.user
      username=self.username

  Mongoose.tracks.find({"username": username}).function((err, historyList) => {
      if(err) return console.log(err)
      res.render('mytracks.ejs', {
        historyList:historyList,
      })
  })
})

//我的购物车
app.post('/AllShopping', (req, res) => {
  var self = req.session.user
      username=self.username

  Mongoose.usershopping.find({"username": username}).function((err, goodsList) => {
      if(err) return console.log(err)
      res.render('usershopping.ejs', {
        goodsList:goodsList,
      })
  })
})

//我的购买历史
app.post('/Allbuyhistorygood', (req, res) => {
  var self = req.session.user
      username=self.username

  Mongoose.usershopping.find({"username": username}).function((err, goodsList) => {
      if(err) return console.log(err)
      res.render('userbuyhistory.ejs', {
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
app.post('/zhuyemian', (req, res) => {
  var self = req.session.user
      username=self.username

  Mongoose.goods.find().function((err, goodsList) => {
      if(err) return console.log(err)
      res.render('zhuyemian.ejs', {
        user:self,
        goodsList:goodsList,
      })
  })
})

//成为店家页面
app.get('/bemanager.ejs',(req, res)=>{
  var self = req.session.user
  username=self.username
  res.render('bemanager.ejs', {
      user:self,
      info:null
  })
})

//成为店家
app.post('/BeManager', (req, res) =>{
  var self = req.session.user
  realname=self.username
  var username = req.body.username
  var password = req.body.password
  Mongoose.user.find({"username":username,"password":password}).function((err, user) => {
      if(err) return console.log(err)
      if(!user){
        res.render('bemanager.ejs', {
          user:self,
          info:"用户名或密码错误"
        })
      }else{
          res.render('userInfo.ejs', {
            user:self,
            info:"您已成为店家"
          })
      }      
  })
})

//添加新商品页面
app.get('/addgood.ejs',(req, res)=>{
  var self = req.session.user
  res.render('addgood.ejs', {
      user:self,
      info:null
  })
})

//添加新商品
app.post('/BeManager', (req, res) =>{
  var self = req.session.user
  realname=self.username
  var username = req.body.username
  var password = req.body.password
  Mongoose.user.find({"username":username,"password":password}).function((err, user) => {
      if(err) return console.log(err)
      if(!user){
        res.render('bemanager.ejs', {
          user:self,
          info:"用户名或密码错误"
        })
      }else{
          res.render('userInfo.ejs', {
            user:self,
            info:"您已成为店家"
          })
      }      
  })
})

//小店商品管理
app.post('/AllGoods', (req, res) => {
  var self = req.session.user
      username=self.username

  Mongoose.goods.find({"username":username}).function((err, goodsList) => {
      if(err) return console.log(err)
      res.render('usergoods.ejs', {
        user:self,
        goodsList:goodsList,
      })
  })
})


app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})