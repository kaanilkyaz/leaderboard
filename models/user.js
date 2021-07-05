const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const UserSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  age: {
    type: Number,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique : true
  },
  password: {
    type: String,
    required: true
  },
  start: {
    type: Date,
    default: new Date()
  },
  score:{
      type: Number, 
      default: Math.floor(Math.random() * 100)
  },
  changeInPlace:{
      type: Number,
      default: 0
  },
  lastDayPlace:{
      type: Number,
      default: 0
  },
  earning:{
      type:Number,
      default: 0
  }
});
module.exports = User = mongoose.model("users", UserSchema);