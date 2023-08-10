const express = require('express');
const router = express.Router();
const fs = require('fs');

const User = require('../models/user');
const multer = require('multer');
const req = require('express/lib/request');
const res = require('express/lib/response');
const user = require('../models/user');

var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './uploads');
    },
    filename: function(req, file, cb) {
        cb(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
    }
});

var upload = multer({
    storage: storage,
}).single("image");


router.post("/add", upload, (req, res) => {
    const user = new User({
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        image: req.file.filename,
    });
    // console.log(user);

    user.save().then(() => {
        req.session.message = {
            type: 'success',
            message: 'User added successfully!',
        };
        console.log("saved successfully");
        res.redirect("/");
    }).catch((err) => {
        req.json({ message: err.message, type: 'danger' });
        console.log(err);
    })


});




router.get('/', (req, res) => {
    // res.render('index.ejs', { title: "Home Page" });
    // User.find().exec((err, users) => {
    //     if (err) {
    //         res.json({ message: err.message });
    //     } else {
    // res.render("index", {
    //     title: "Home Page",
    //     users: users,
    // });
    //     }
    // });

    User.find().then((users) => {
        res.render("index", {
            title: "Home Page",
            users: users,
        });
        // console.log(users);
    }).catch((err) => {
        res.json({ message: err.message });
    })
});

router.get('/add', (req, res) => {
    res.render('add_users.ejs', { title: "Add Users" });
});


// router.get('/edit/:id', (req, res) => {
//     let id = req.params.id;
//     User.findById(id, (err, user) => {
//         if (err) {
//             res.redirect("/");
//         } else {
//             if (user == null) {
//                 res.redirect("/");
//             } else {
//                 res.render("edit_user.ejs", {
//                     title: "Edit User",
//                     user: user,
//                 });
//             }
//         }
//     });
// });


router.get('/edit/:id', async(req, res) => {
    try {
        const id = req.params.id;
        const user = await User.findById(id).exec();

        if (!user) {
            return res.redirect('/');
        }

        res.render('edit_user.ejs', {
            title: 'Edit User',
            user: user,
        });
    } catch (err) {
        console.error(err);
        res.redirect('/');
    }
});


// router.post("/update/:id", upload, (req, res) => {
//     const user = new User({
//         name: req.body.name,
//         email: req.body.email,
//         phone: req.body.phone,
//         image: req.file.filename,
//     });
//     // console.log(user);

//     user.save().then(() => {
//         req.session.message = {
//             type: 'success',
//             message: 'User Updated successfully!',
//         };
//         console.log("saved successfully");
//         res.redirect("/");
//     }).catch((err) => {
//         req.json({ message: err.message, type: 'danger' });
//         console.log(err);
//     })


// });


router.post("/update/:id", upload, async(req, res) => {
    try {
        const id = req.params.id;

        // Find the user by ID
        const user = await User.findByIdAndUpdate(id, {
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            image: req.file.filename,
        }, { new: true }).exec();

        if (!user) {
            req.session.message = {
                type: 'danger',
                message: 'User not found!',
            };
            return res.redirect("/");
        }

        req.session.message = {
            type: 'success',
            message: 'User updated successfully!',
        };
        console.log("updated successfully");
        res.redirect("/");
    } catch (err) {
        console.error(err);
        req.session.message = {
            type: 'danger',
            message: err.message,
        };
        res.redirect("/");
    }
});


// router.get("/delete/:id", (req, res) => {
//     let id = req.params.id;
//     User.findByIdAndRemove(id, (err, result) => {
//         if (result.image != '') {
//             try {
//                 fs.unlinksync('.uploads/' + result.image);
//             } catch (err) {
//                 console.log(err);
//             }
//         }
//         if (err) {
//             res.json({ message: err.message });
//         } else {
//             req.session.message = {
//                 typr: "success",
//                 message: "user deleted successfully!"
//             };
//             res.redirect("/");
//         }
//     });
// });



router.get("/delete/:id", async(req, res) => {
    try {
        const id = req.params.id;
        const user = await User.findByIdAndRemove(id).exec();

        if (!user) {
            req.session.message = {
                type: 'danger',
                message: 'User not found!',
            };
            return res.redirect("/");
        }

        if (user.image !== '') {
            try {
                await fs.unlink(`./uploads/${user.image}`); // Using await for asynchronous file deletion
            } catch (err) {
                console.error(err);
            }
        }

        req.session.message = {
            type: "success",
            message: "User deleted successfully!"
        };
        res.redirect("/");
    } catch (err) {
        console.error(err);
        req.session.message = {
            type: "danger",
            message: err.message,
        };
        res.redirect("/");
    }
});




module.exports = router;