var config = require('./config.json');
var cron = require('node-cron');
const Binance = require('binance-api-node').default;
var app = require('express')();

const client = Binance({
    apiKey: config.API_KEY,
    apiSecret: config.SECRET_KEY,
})

var task = cron.schedule('*/' + config.LOOP_TIME + ' * * * * *', () => {
    client.dailyStats({ symbol: config.CURRENCY + config.MARKET })
        .then((result) => {
            avgPrice = parseFloat(result.lastPrice);
            client.accountInfo({ useServerTime: true })
                .then((result) => {
                    for (let index = 0; index < result.balances.length; index++) {
                        if (result.balances[index].asset == config.MARKET) {
                            marketBalanceLocked = parseFloat(result.balances[index].locked);
                            marketBalanceFree = parseFloat(result.balances[index].free);
                        } else if (result.balances[index].asset == config.CURRENCY) {
                            currencyBalanceLocked = parseFloat(result.balances[index].locked);
                            currencyBalanceFree = parseFloat(result.balances[index].free);
                        }
                    }
                    // salva a soma dos saldos
                    total = marketBalanceLocked + marketBalanceFree + currencyBalanceLocked + currencyBalanceFree;

                    console.clear();
                    console.log("===========================================");
                    console.log("SALDO 1......:", marketBalanceLocked + marketBalanceFree);
                    console.log("SALDO 2......:", currencyBalanceLocked + currencyBalanceFree);
                    console.log("SALDO TOTAL..:", total, "USD");
                    console.log("SALDO INICIAL:", config.INITIAL_INVESTMENT, "USD");
                    console.log("LUCRO........:", total - config.INITIAL_INVESTMENT, "USD");
                    console.log("              ", ((total - config.INITIAL_INVESTMENT) * 100 / config.INITIAL_INVESTMENT).toFixed(2), "%");
                    console.log("===========================================");
                    console.log("UPTIME.......:", Math.floor(+new Date() / 1000) - startTime, "segundos");
                    console.log("ORDENS.......:", "VENDAS: [", totalVendas, "] COMPRAS: [", totalCompras, "]");
                    simpleStrategy();
                })
                .catch((err) => {
                    throw err;
                });
        })
        .catch((err) => {
            console.log(err);
        });
}, { scheduled: false });

function simpleStrategy() {
    if (hasBought == false) {
        buyPrice = avgPrice * (1 - config.SPREAD_BUY);
        sellPrice = avgPrice * (1 + config.SPREAD_SELL);
        buyPrice = buyPrice.toFixed(4);
        sellPrice = sellPrice.toFixed(4);
    }
    client.dailyStats({ symbol: "BTC" + config.MARKET })
        .then((result) => {
            console.log("BTC" + config.MARKET + "......:", result.lastPrice);
            console.log("DEFINIDOS....: Compra " + buyPrice + " e Venda " + sellPrice);
            console.log("MÁXIMO COMPRA: " + config.MAX_ASK.toFixed(4));
            console.log("===========================================");
            client.openOrders({
                symbol: config.CURRENCY + config.MARKET,
            }).then((result) => {
                if (result.length == 0) {
                    if (marketBalanceFree > 20 && buyPrice < (1 - config.SPREAD_BUY)) {
                        client.order({
                            symbol: config.CURRENCY + config.MARKET,
                            side: 'BUY',
                            quantity: ((marketBalanceFree - 0.1) / buyPrice).toFixed(2),
                            price: buyPrice,
                            useServerTime: true
                        })
                            .then((result) => {
                                totalCompras++;
                                hasBought = true;
                            })
                            .catch((err) => {
                                totalCompras--;
                                hasBought = false;
                                throw err;
                            });
                    }
                    if (currencyBalanceFree > 20) {
                        client.order({
                            symbol: config.CURRENCY + config.MARKET,
                            side: 'SELL',
                            quantity: (currencyBalanceFree - 0.1).toFixed(2),
                            price: sellPrice,
                            useServerTime: true
                        })
                            .then((result) => {
                                totalVendas++;
                                hasBought = false;
                            })
                            .catch((err) => {
                                totalVendas--;
                                hasBought = true;
                                throw err;
                            });
                    }
                }
            }).catch((err) => {
                throw err;
            });
        }).catch((err) => {
            throw err;
        });
}

// limpa o console
console.clear();
// define as variaveis
startTime = Math.floor(+new Date() / 1000);
avgPrice = 0;
hasBought = false;
totalCompras = 0;
totalVendas = 0;
marketBalanceLocked = 0;
marketBalanceFree = 0;
currencyBalanceLocked = 0;
currencyBalanceFree = 0;
total = 0;

console.log("Iniciando...");

// inicia o cronjob
task.start();

// api de consulta dos dados externamente
app.get('/', (req, res) => {
    res.json(
        {
            initialInvestment: config.INITIAL_INVESTMENT,
            market: config.MARKET,
            currency: config.CURRENCY,
            balances: {
                market: marketBalanceLocked + marketBalanceFree,
                currency: currencyBalanceLocked + currencyBalanceFree
            },
            profit: {
                USD: total - config.INITIAL_INVESTMENT,
                percent: parseFloat(((total - config.INITIAL_INVESTMENT) * 100 / config.INITIAL_INVESTMENT).toFixed(2))
            }
        }
    );
});

app.listen(config.LISTEN_PORT);
