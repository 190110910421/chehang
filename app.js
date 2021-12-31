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

  res.render('login.ejs', {
      user:null,
      info:null
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

//车行界面
app.get('/borrowcar.ejs',(req, res)=>{
  var self = req.session.user
  var username=self.username
  Mongoose.Car.find({},function(err,carList){
    if(err) return console.log(err)
    res.render("borrowcar.ejs", {
        info: null,
        user:self,
        carList:carList,
        key:null
    })
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
          Mongoose.Car.find({},function(err,carList){
              if(err) return console.log(err)
              res.render("borrowcar.ejs", {
                  info: "登陆成功！",
                  user:user,
                  carList:carList,
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
  var email = req.body.email
  var regtime = Mongoose.GetRegTime()
  var manager = req.body.manager
  if(manager=="yes")manager=1
  else manager=0
  Mongoose.User.findOne({"username":username}).exec((err,user) =>{
      if(!user){
          Mongoose.InsertUser(username, password, sex, email,regtime,manager);
          res.render("login.ejs", {
            info: "注册成功！",
            key:null
        })
      }else{
          res.render("reg.ejs", {
              user:null,
              info: "该用户名已被注册！"
          })
      }
      
  })
})



//我的订单
app.get('/Mycar', (req, res) => {
  var self = req.session.user
  var username=self.username

  Mongoose.Borrowcar.find({"username": username}).exec((err, goodsList) => {
      console.log(goodsList.length)
      if(err) return console.log(err)
      res.render('mycar.ejs',{
        user:self,
        username:username,
        goodsList:goodsList,
        info:null
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



//添加商品页面
app.get('/addgoods.ejs',(req, res)=>{
  var self = req.session.user
  var username=self.username
      res.render('addgoods.ejs', {
          user:self,
          username:username,
          info:null
      })
})     

//添加新商品
app.post('/AddGoods', upload.single('photo'), (req, res) =>{
  var self = req.session.user
  var username=self.username
  var goodsname = req.body.goodsname
  var price = req.body.price
  var status = req.body.status
  if(status=="上架")status=1
  else status=0
  var photo = req.file.filename
  Mongoose.InsertCar(goodsname,price,status,photo)
  res.render("addgoods.ejs", {
      info:"添加成功！",
      user:self,
      username:username,
  })
})

//借车
app.get('/borrrowcar', (req, res) =>{
  var self = req.session.user
  var username=self.username
  console.log(username)
  var suburl = req.url.split('?')[1]
  var goodid = suburl.split("=")[1]
  var time= Mongoose.GetRegTime()
  console.log(goodid)
  Mongoose.Car.findOne({"id":goodid}).exec((err, car) => {
    if(err) return console.log(err)
    Mongoose.borrowCar(goodid,username,time,car)
    Mongoose.Car.find({},function(err,carList){
      if(err) return console.log(err)
      res.render("borrowcar.ejs", {
          info: "借车成功",
          user:self,
          carList:carList,
          key:null
      })
    })
  })
})   

//还车
app.get('/returncar', (req, res) =>{
  var self = req.session.user
  var username=self.username
  var suburl = req.url.split('?')[1]
  var goodid = suburl.split("=")[1]
  Mongoose.Borrowcar.findOne({"id":goodid}).exec((err, cc) => {
    if(err) return console.log(err)
    Mongoose.Car.updateOne({"goodsname":cc.goodsname},{"status2":0},(err) => {
      if(err) return console.log(err)
    }) 
    Mongoose.Borrowcar.findOneAndRemove({"id":goodid}, (err) => {  
      if(err) return console.log(err)
    })
      Mongoose.Borrowcar.find({"username":username}).exec((err, carList) =>{
        if(err) return console.log(err)
        res.render("mycar.ejs", {
            info: "还车成功",
            user:self,
            goodsList:carList,
            key:null
        })
      })
          
  })     
})

//商品上架
app.get('/Restoregoods', (req, res) =>{
  var self = req.session.user
  var username=self.username
  var suburl = req.url.split('?')[1]
  var goodid = suburl.split("=")[1]
  Mongoose.RestoreCar(goodid)
  Mongoose.Car.find({"username":username}).exec((err, carList) => {
    if(err) return console.log(err)
    res.render('usergoods.ejs', {
      user:self,
      username:username,
      carList:carList,
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
  console.log("id:"+goodid)
  Mongoose.InvalidCar(goodid)
  Mongoose.Car.find().exec((err, carList) => {
    if(err) return console.log(err)
    res.render('usergoods.ejs', {
      user:self,
      username:username,
      carList:carList,
      info:null,
    })
  })    
})

//车辆管理
app.get('/AllCar', (req, res) => {
  var self = req.session.user
  var username=self.username
  Mongoose.User.findOne({"username":username}).exec((err, user) => {
    if(err) return console.log(err)
    console.log(user.manager)
    if(user.manager==0){
      Mongoose.Car.find({},function(err,carList){
        if(err) return console.log(err)
        res.render("borrowcar.ejs", {
            info: "你不是管理员！",
            user:user,
            carList:carList,
        })
      })
    }else{
      Mongoose.Car.find({},function(err,carList){
        if(err) return console.log(err)
          res.render('usergoods.ejs', {
            user:self,
            username:username,
            carList:carList,
            info:null
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