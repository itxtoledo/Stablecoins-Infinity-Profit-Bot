const chalk = require("chalk")
const Promise = require("bluebird")
const _ = require("lodash")
const fp = require("lodash/fp")
const dotenvDefaults = require("dotenv-defaults")
const app = require("./app")
const typeOf = require("./src/typeOf")
const fetchBalancesFromBinance = require("./src/fetchBalancesFromBinance")
const createAPI = require("./src/createAPI")
const fetchAvgPriceFromAPI = require("./src/fetchAvgPriceFromAPI")
const beautifulLog = require("./src/beautifulLog")
const createBinance = require("./src/createBinance")
const useState = require("./src/useState")

dotenvDefaults.config()

const isDevelopment = () => process.env.NODE_ENV === 'development'
const isProduction = () => process.env.NODE_ENV === 'production'

function main() {
  const binance = createBinance()
  const api = createAPI()

  
  app()

  const [state, setState] = useState({})
  setState({
    hasBought: false,
    vendas: {
      total: 0
    },
    compras: {
      total: 0
    },
    startTime: Math.floor(+new Date() / 1000)
  })
  
  if (isDevelopment()) tick()
  if (isProduction()) setInterval(tick, 15000)

  clearAndLog(chalk`{green Iniciando...}`)

  async function tick() {
    try {
      const avgPrice = await fetchAvgPriceFromAPI(api)

      setState({ avgPrice })

      const {
        values: balances,
        total,
        totalValues: totalBalances
      } = await fetchBalancesFromBinance(binance)

      const initialInvestment = Number(process.env.INITIAL_INVESTMENT)

      const profit = total - initialInvestment
      const percentage = ((profit * 100) / initialInvestment).toFixed(2)

      beautifulLog({
        ...totalBalances,
        saldoTotal: concatWithUSD(total),
        saldoInicial: concatWithUSD(initialInvestment),
        lucro: concatWithUSD(profit)
      }, ...jumpLineAndPrintOnCenter(percentage), "%")
      
      beautifulLog({
        uptime: getUptimeFromState(state),
        ordens: getOrdensFromState(state),
        hasOpeningBars: false,
        clearConsole: false
      })

      return
      simpleStrategy(balances)
    } catch (err) {
      console.log(chalk`{red ERRO}`, err)
    }

    function jumpLineAndPrintOnCenter(content) {
      return ["\n", " ".repeat(14), content]
    }
    function concatWithUSD(value) {
      return [value, "USD"].join(" ")
    }
    function getUptimeFromState(state) {
      return Math.floor(+new Date() / 1000) - state.startTime
    }
    function getOrdensFromState(state) {
      return _.chain(state)
        .pick("vendas", "compras")
        .mapValues("total")
        .mapValues(value => [value])
        .value()
    }
  }
  async function simpleStrategy(balances) {
    const { hasBought } = state

    if (hasBought === false)
      setState({
        buy: calculate("buy"),
        sell: calculate("sell")
      })

    try {
      const btcAndMarket = ["BTC", process.env.MARKET].join("")

      const [prevDay] = await binance.prevDayAsync(btcAndMarket)
      const { lastPrice } = prevDay

      console.log(btcAndMarket, "......:", lastPrice)

      const { buy, sell } = state

      console.log("DEFINIDOS....: Compra " + buy + " e Venda " + sell)
      if (balances[process.env.MARKET].available > 20) {
        try {
          compras++
          hasBought = true
          binance.buy(
            process.env.CURRENCY + process.env.MARKET,
            ((balances[process.env.MARKET].available - 0.1) / buy).toFixed(2),
            buy
          )
        } catch (e) {
          compras--
          hasBought = false
          throw e
        }
      }
      if (balances[process.env.CURRENCY].available > 20) {
        try {
          vendas++
          hasBought = false
          binance.sell(
            process.env.CURRENCY + process.env.MARKET,
            (balances[process.env.CURRENCY].available - 0.1).toFixed(2),
            sell
          )
        } catch (e) {
          vendas--
          hasBought = true
          throw e
        }
      }
      console.log("==========================================")
    } catch (err) {
      throw err
    }

    function calculate(type) {
      const { avgPrice } = state

      const operation = type === "buy" ? -1 : 1

      const value = avgPrice * (1 + process.env.SPREAD * operation)

      return value.toFixed(4)
    }
  }

  function clearAndLog(...params) {
    console.clear()
    console.log(...params)
  }
}

main()
