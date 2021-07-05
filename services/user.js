module.exports.findFirst100PlayerAndCurrentUserPlace = async function(email){
  const first100Players = await User.find({}).sort({ score: -1 }).limit(100);
  let player = await User.find({ email: email })
  let twoPlaceFront = await User.find({ score: { $gt: player[0].score }}).sort({ score: 1 }).limit(3)
  twoPlaceFront = twoPlaceFront.slice(0, twoPlaceFront.length - 1);
  let threePlaceBehind = await User.find({ score: { $lt: player[0].score } }).sort({ score: -1 }).limit(4);
  threePlaceBehind = threePlaceBehind.slice(0, threePlaceBehind.length - 1);

  return { first100Players, player, twoPlaceFront, threePlaceBehind }
}