var express = require('express');
var app = express();

app.set("view engine", "ejs");
app.set("views", "./views");
app.use(express.static("public"));
app.listen(3000);

// Mongo
const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://hungmai:maitanhung@cluster0.akbnd.mongodb.net/Marvels?retryWrites=true&w=majority', function (err) {
    if (err) {
        console.log("Mongo connect error: " + err);
    } else {
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
var Marvel = require("./Models/marvel");

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
        if (file.mimetype == "image/bmp" || file.mimetype == "image/png" || file.mimetype == "image/jpeg" || file.mimetype == "image/jpg" || file.mimetype == "image/gif") {
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
            res.json({ "kq": 0, "errMsg": "A Multer error occurred when uploading." })
        } else if (err) {
            res.json({ "kq": 0, "errMsg": "An unknown error occurred when uploading." + err })

        } else {
            // save mongo(req.file.filename);
            // res.send(req.file.filename);
            var marvel = Marvel({
                Name: req.body.txtName,
                Image: req.file.filename,
                Level: req.body.txtLevel
            });
            marvel.save(function (err) {
                if (err) {
                    res.json({ "kq": 0, "errMsg": err })
                } else {
                    res.redirect("./list");
                }
            });
        }

    });
});

// Danh s??ch 
app.get("/list", function (req, res) {
    Marvel.find(function (err, data) {
        if (err) {
            res.json({ "kq": 0, "errMsg": err });
        } else {
            res.render("list", { danhsach: data });
        }
    });
});

// Edit
app.get("/edit/:id", function (req, res) {
    Marvel.findById(req.params.id, function (err, char) {
        if (err) {
            res.json({ "kq": 0, "errMsg": err });
        } else {
            console.log(char);
            // l???y th??ng tin chi ti???t c???a :id
            res.render("edit", { nhanvat: char });
        }
    });
});
// nh???n t??? c??i row s???a ????? ?????y qua b??n ????y
app.post("/edit", function (req, res) {
    //res.send("Xu ly Edit");
    // (Check kh??ch h??ng c?? ch???n file m???i kh??ng)
    // return {}/ Undefined
    // console.log(req.files);
    // console.log(req.body);
    // gi???i quy???t l?? req. n???m trong file upload m???i ??c

    // - Kh??ch h??ng upload file m???i
    // upload file
    upload(req, res, function (err) {
        // - Kh??ch h??ng kh??ng ch???n file n??o m???i
        if (!req.file) {
            Marvel.updateOne({ _id: req.body.IDChar }, {
                Name: req.body.txtName,
                Level: req.body.txtLevel
            }, function (err) {
                if (err) {
                    res.json({ "kq": 0, "errMsg": err });
                } else {
                    // chuy???n h?????ng v??? l???i trang list ????? cho ta xem l???i danh s??ch
                    res.redirect("./list");
                }
            });
        } else {
            if (err instanceof multer.MulterError) {
                res.json({ "kq": 0, "errMsg": "A Multer error occurred when uploading." })
            } else if (err) {
                res.json({ "kq": 0, "errMsg": "An unknown error occurred when uploading." + err })

            } else {
                //    Upload Mongo (req.file.filename)
                Marvel.updateOne({ _id: req.body.IDChar }, {
                    Name: req.body.txtName,
                    Image: req.file.filename,
                    Level: req.body.txtLevel
                }, function (err) {
                    if (err) {
                        res.json({ "kq": 0, "errMsg": err });
                    } else {
                        // chuy???n h?????ng v??? l???i trang list ????? cho ta xem l???i danh s??ch
                        res.redirect("./list");
                    }
                });
            }
        }
        
    });

});

app.get("/delete/:id", function(req, res) {
    Marvel.deleteOne({_id:req.params.id}, function(err){
        if (err) {
            res.json({ "kq": 0, "errMsg": err });
        } else {
            // chuy???n h?????ng v??? l???i trang list ????? cho ta xem l???i danh s??ch
            res.redirect("../list");
        }
    });
});