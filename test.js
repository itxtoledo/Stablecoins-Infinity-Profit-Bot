var config = require('./config.json')
const axios = require('axios');

axios.get('https://api.binance.com/api/v3/avgPrice', {
        params: {
            symbol: config.CURRENCY + config.MARKET
        }
    })
        .then(function (response) {
          console.log(response)
         })
