async function fetchAvgPriceFromAPI(api) {
  const params = {
    symbol: [process.env.CURRENCY, process.env.MARKET].join("")
  }
  const {
    data: { price }
  } = await api.get("/avgPrice", { params })

  return Number(price)
}

module.exports = fetchAvgPriceFromAPI