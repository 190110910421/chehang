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
const port = 50508


const headimg_default = "default.jpg"
// 配置模板引擎
app.set("view engine","ejs")
app.use(express.static("node_modules"));
app.use(express.static("static/photo"))
app.use(express.static('static'))

app.use(session({
    secret: 'this is a session', //服务器生成session签名
    name: 'molename',
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
