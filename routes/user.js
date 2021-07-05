const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const keys = require("../config/keys");
const validateRegisterInput = require("../services/register");
const validateLoginInput = require("../services/login");
const User = require("../models/user");
const MoneyPool = require("../models/moneyPool");
const userService = require("../services/user");
const cron = require("node-cron");

router.get("/leaderboard", findFirst100PlayerAndCurrentUserPlace)
router.post("/register", register);
router.post("/login", login)

cron.schedule("0 0 0 * * *", updatePlaceOfUsers)
cron.schedule("0 0 0 * * 1", updateMoneyPoolAndDistributeToPlayers);

async function register(req, res, next){
  const { errors, isValid } = validateRegisterInput(req.body)
  if (!isValid) return res.status(400).json(errors)
  try {
    let user = await User.findOne({ email: req.body.email })
    if (user) return res.status(400).json({ email: "Email already exists" });
    else {
      const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        age: req.body.age
      });
      newUser.password = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(8), null);
      newUser.save()
      return res.json(newUser);
    } 
  } catch (error) {
    next(error)
  }
}

async function login(req, res, next){
  const { errors, isValid } = validateLoginInput(req.body);
  if (!isValid) {
      return res.status(400).json(errors);
  }
  try {
    const password = req.body.password;
    const email = req.body.email;
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(404).json({ emailnotfound: "Email not found" });
    }
    if(bcrypt.compare(password, user.password)){
      const payload = { id: user.id, name: user.name };
      const token = jwt.sign( payload, keys.secretOrKey, { expiresIn: 31556926 });
      res.json({{ success: true, token: token})
    } else return res.status(400).json({ passwordincorrect: "Password incorrect" });
  } catch (error) {
    next(error)
  }
}

async function findFirst100PlayerAndCurrentUserPlace(req, res, next){
  try {
    const obj = await userService.findFirst100PlayerAndCurrentUserPlace(req.body.email)
    return res.json(obj)
  } catch (error) {
    next(error)
  }
}

async function updatePlaceOfUsers(){
  const allPlayers = await User.find({}).sort({score: -1})
  allPlayers.forEach((p, i) => {
    p.changeInPlace =  p.lastDayPlace - (i + 1)
    p.lastDayPlace = i + 1
    p.save()
  })
}

async function updateMoneyPoolAndDistributeToPlayers(){
  let totalMoney = 0
  const allPlayers = await User.find({}).sort({score: -1})
  allPlayers.forEach(p => {
    totalMoney += p.score * 0.02
  })
  const moneyPool = new MoneyPool({date: new Date(), amount: totalMoney})
  moneyPool.save()
  const first3Players = allPlayers.slice(0, 3);
  first3Players[0].earning = totalMoney * 0.2;
  first3Players[1].earning = totalMoney * 0.15;
  first3Players[2].earning = totalMoney * 0.1;
  first3Players.forEach(p => p.save())
  const remainingPlayers = allPlayers.slice(3,100)
  const unitPercent = 0.01157164 //%55 => 4753x for other 97 players
  for(let i = 0; i < 97; i++){
    remainingPlayers[i].earning = totalMoney * (unitPercent * (97 - i) / 100)
    remainingPlayers[i].save()
  }
}

module.exports = router;