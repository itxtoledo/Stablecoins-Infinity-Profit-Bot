const Promise = require("bluebird")

function createBinance() {
  const binance = require("node-binance-api")().options({
    APIKEY: process.env.API_KEY,
    APISECRET: process.env.SECRET_KEY,
    useServerTime: true
  })
  Promise.promisifyAll(binance)
  return binance
}

module.exports = createBinance
