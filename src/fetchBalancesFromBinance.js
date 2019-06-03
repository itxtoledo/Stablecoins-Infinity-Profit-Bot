const Promise = require("bluebird")
const _ = require("lodash")
const fp = require("lodash/fp")
const typeOf = require("./typeOf")

async function fetchBalancesFromBinance(binance) {
  async function fetchAndPrepare() {
    const balancesFromAPI = _.chain(await binance.balanceAsync())
      .defaultsDeep(
        process.env.NODE_ENV === "development" && {
          TUSD: { available: "21", onOrder: "10" },
          USDT: { available: "41", onOrder: "10" }
        }
      )
      .tap(toNumber)
      .mapValues(addTotal)
      .mapValues(addSymbol)
      .value()
    return balancesFromAPI
    function addSymbol(value, key) {
      return { ...value, symbol: key }
    }
    function toNumber(source) {
      for (let name in source) {
        const value = source[name]
        const isObject = typeOf(value) === "object"

        isObject ? toNumber(value) : setValue(Number(value))

        function setValue(to) {
          source[name] = to
        }
      }
    }
    function addTotal(symbol) {
      return {
        total: _.chain(symbol)
          .values()
          .sum()
          .value(),
        ...symbol
      }
    }
  }

  const balance = await Promise.resolve(fetchAndPrepare())
    .then(addValues)
    .then(addTotal)
    .then(addTotalValues)

  return balance

  function addValues(balances) {
    const {
      [process.env.MARKET]: market,
      [process.env.CURRENCY]: currency
    } = balances
    return { values: { market, currency } }
  }
  function addTotal(options) {
    const { values } = options

    const total = getTotalFromBalances(values)

    return { ...options, total }
  }
  function addTotalValues(options) {
    const { values } = options

    const totalBalances = getTotalBalancesFromBalances(values)

    return { ...options, totalValues: totalBalances }
  }
  function is(type) {
    return source => typeOf(source) === type
  }
  function getTotalFromBalances(balances) {
    const total = _.chain(balances)
      .map("total")
      .sum()
      .value()
    return total
  }
  function getTotalBalancesFromBalances(balances) {
    const saldos = _(balances)
      .mapKeys(addPrefixAndNumber("saldo"))
      .mapValues(fp.pick(["total", "symbol"]))
      .mapValues(fp.values)
      .mapValues(fp.join(" "))
      .value()

    return saldos

    function addPrefixAndNumber(prefix) {
      let count = 0
      return (value, name) => [prefix, ++count].join(" ")
    }
  }
}

module.exports = fetchBalancesFromBinance