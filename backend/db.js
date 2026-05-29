var mongoose = require("mongoose");

mongoose
  .connect(
    "mongodb+srv://bloodadmin:blood123@cluster0.wvbgeuy.mongodb.net/blood?retryWrites=true&w=majority&appName=Cluster0"
  )
  .then(() => {
    console.log("DB Connected");
  })
  .catch((err) => {
    console.log(err);
  });