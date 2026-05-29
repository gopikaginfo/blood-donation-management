var mongoose = require("mongoose");

mongoose
    .connect("mongodb+srv://text:test@cluster0.wvbgeuy.mongodb.net/blood?retryWrites=true&w=majority")
    .then(() => {
        console.log("db connected");
    })
    .catch((err) => {
        console.log(err);
    });