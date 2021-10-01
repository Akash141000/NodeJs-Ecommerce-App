const mongoose = require("mongoose");
const express = require("express");
const app = express();

//// environment varibles
const username = process.env.MONGO_USER;
const password = process.env.MONGO_PASSWORD;
const port = process.env.PORT || 3000;
const connectionString = process.env.MONGO_CONNECTION;
console.log(connectionString);


app.use("/",(req,res,next)=>{
    res.send("hello");
})



mongoose
.connect(
  connectionString ,
  { useUnifiedTopology: true, useNewUrlParser: true }
)
.then((result) => {
  app.listen(port, () => console.log("server started..."));
})
.catch((err) => {
    console.log(err);
});
