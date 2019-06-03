const axios = require("axios")
const dotenvDefaults = require("dotenv-defaults")


async function main() {
  dotenvDefaults.config()
  
  try {
    const { data } = await axios.get(
      "https://api.binance.com/api/v3/avgPrice",
      {
        params: {
          symbol: process.env.CURRENCY + process.env.MARKET
        }
      }
    )
    console.log(data)
  } catch (err) {
    if (err.data) console.log(err.data)

    console.log(err)
  }
}

main()
