const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const passport = require("passport");
const users = require("./routes/user");
const User = require("./models/user");
const app = express();
const http = require('http').Server(app)
const io = require('socket.io')(http)
const userService = require("./services/user")
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
const db = require("./config/keys").mongoURI;
const cron = require("node-cron");

mongoose.connect( db, { useNewUrlParser: true })
  .then(() => console.log("MongoDB successfully connected"))
  .catch(err => console.log(err));
const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server up and running on port ${port} !`));

app.use(passport.initialize());
require("./config/passport")(passport);
app.use("/users", users);
cron.schedule("* * * * * *", updateScoreOfUserEverySec);

function updateScoreOfUserEverySec(){
    io.on("connection", function (socket) {
        console.log("a user connected");

        socket.on("login", function (data) {
        console.log("a user " + data.userId + " connected");
        const user = User.find({ _id: data.userId });
        user.score += Math.floor(Math.random() * 10);
        user.save();
        });
    });
}

