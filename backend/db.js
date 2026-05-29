var mongoose = require("mongoose");

// Updated to use the clean 'bloodadmin' user credentials
mongoose
    .connect("mongodb+srv://bloodadmin:Password123@cluster0.wvbgeuy.mongodb.net/blood?retryWrites=true&w=majority")
    .then(() => {
        console.log("db connected");
    })
    .catch((err) => {
        console.log(err);
    });