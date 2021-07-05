const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const MoneyPoolSchema = new Schema({
  date: {
    type: Date,
    default: new Date(),
  },
  amount: {
    type: Number,
    default: Math.floor(Math.random() * 100),
  }
});
module.exports = MoneyPool = mongoose.model("moneyPool", MoneyPoolSchema);
