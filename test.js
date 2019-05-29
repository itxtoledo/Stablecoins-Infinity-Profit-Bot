var config = require('./config.json')
var binance = require('node-binance-api')().options({
    APIKEY: config.API_KEY,
    APISECRET: config.SECRET_KEY,
    useServerTime: true
});

binance.openOrders("TUSDTUSDT", (error, openOrders, symbol) => {
  console.log("openOrders("+symbol+")", openOrders);
}).then((openOrders) => {
    console.log(openOrders);
}).catch((err) => {
    console.log(err);
});