var mongoose = require("mongoose");

// Configured with your verified database user 'text' and new password 'gopika123'
mongoose
    .connect("mongodb+srv://text:gopika123@cluster0.wvbgeuy.mongodb.net/blood?retryWrites=true&w=majority")
    .then(() => {
        console.log("db connected");
    })
    .catch((err) => {
        console.log(err);
    });