const axios = require("axios")

function createAPI() {
  const api = axios.create({
    baseURL: 'https://api.binance.com/api/v3',
  })

  return api
}

module.exports = createAPI