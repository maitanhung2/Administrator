var express = require('express');
var app = express();

app.set("view engine", "ejs");
app.set("views", "./views");
app.use(express.static("public"));
app.listen(3000);

// Mongo
const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://hungmai:maitanhung@cluster0.akbnd.mongodb.net/Marvels?retryWrites=true&w=majority', function(err) {
    if (err) {
        console.log("Mongo connect error: " + err);
    }else {
        console.log("Mongo connect successfull.");
    }
});

//body-parser
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));

// app.get("/", function(req, res) {
//     res.send("Hello");
// });

// Models
var Marvel = require("./models/marvel");

//multer
var multer = require('multer');
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/upload')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname)
    }
});
var upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        console.log(file);
        if (file.mimetype == "image/bmp" || file.mimetype == "image/png" || file.mimetype == "image/jpeg" || file.mimetype == "image/jbg" || file.mimetype == "image/gif") {
            cb(null, true)
        } else {
            return cb(new Error('Only image are allowed!'))
        }
    }
}).single("marvelImage");

app.get("/add", function (req, res) {
    res.render("add");
});
app.post("/add", function (req, res) {
    // upload file
    upload(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            // console.log("A Multer error occurred when uploading.");
            res.json({"kq":0, "errMsg": "A Multer error occurred when uploading."})
        } else if (err) {
            res.json({"kq":0, "errMsg": "An unknown error occurred when uploading." + err})
            
        } else {
            // save mongo
            // res.send(req.file.filename);
            var marvel = Marvel({
                Name: req.body.txtName,
                Image: req.file.filename,
                Level: req.body.txtLevel
            });
            marvel.save(function (err){
                if(err) {
                    res.json({"kq":0, "errMsg":err})
                }else {
                    res.redirect("./list");
                }
            });
        }

    });
});

// Danh sách 
app.get("/list", function (req, res) {
    Marvel.find(function(err, data) {
        if(err) {
            res.json({"kq": 0, "errMsg": err});
        }else{
            res.render("list", {danhsach:data});
        }
    });
})