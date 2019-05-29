var config = require('./config.json')
var binance = require('node-binance-api')().options({
    APIKEY: config.API_KEY,
    APISECRET: config.SECRET_KEY,
    useServerTime: true
});

start();

setInterval(() => {
    if (ciclosRealizados > 4) {
        ciclosRealizados = 0;
        //cancelOrder(config.CURRENCY + config.MARKET);
    }
    try {
        binance.balance((error, balances) => {
            if (error) return console.error(error);
            const total = parseFloat(balances[config.MARKET].onOrder) + parseFloat(balances[config.MARKET].available) + parseFloat(balances[config.CURRENCY].onOrder) + parseFloat(balances[config.CURRENCY].available);
            console.clear();
            console.log("==========================================");
            console.log("SALDO 1......:", parseFloat(balances[config.MARKET].onOrder) + parseFloat(balances[config.MARKET].available), config.MARKET);
            console.log("SALDO 2......:", parseFloat(balances[config.CURRENCY].onOrder) + parseFloat(balances[config.CURRENCY].available), config.CURRENCY);
            console.log("SALDO TOTAL..:", total, "USD")
            console.log("SALDO INICIAL:", config.INITIAL_INVESTMENT, "USD")
            console.log("LUCRO........:", total - config.INITIAL_INVESTMENT, "USD");
            console.log("              ", ((total - config.INITIAL_INVESTMENT) * 100 / config.INITIAL_INVESTMENT).toFixed(2), "%");
            console.log("==========================================");
            console.log("ATUALIZADO EM:", fancyTime())
            console.log("UPTIME.......:", Math.floor(+new Date() / 1000) - startTime, "segundos");
            console.log("ORDENS.......:", "VENDAS: [", totalVendas, "] COMPRAS: [", totalCompras, "]");
            simpleStrategy(balances);
        });
    } catch (e) {
        console.log("ERRO : " + e);
    }
    ciclosRealizados++;
}, 15000);

function simpleStrategy(balances) {
    var buy = config.BUY_PRICE;
    var sell = config.SELL_PRICE;
    try {
        binance.prevDay("BTCUSDT", (error, prevDay, symbol) => {
            if (prevDay.priceChangePercent > 0) {
                buy = 0.9920;
                sell = 0.9965;
            } else {
                buy = 0.9980;
                sell = 1.0020;
            }
            console.log("BTCUSDT......:", prevDay.lastPrice);
            console.log("DEFINIDOS....: Compra " + buy + " e Venda " + sell);
            if (balances[config.MARKET].available > 20) {
                totalCompras++;
                try {
                    binance.buy(config.CURRENCY + config.MARKET, ((balances[config.MARKET].available - 0.1) / buy).toFixed(2), buy);
                } catch (e) {
                    throw e;
                }
            }
            if (balances[config.CURRENCY].available > 20) {
                totalVendas++;
                try {
                    binance.sell(config.CURRENCY + config.MARKET, (balances[config.CURRENCY].available - 0.1).toFixed(2), sell);
                } catch (e) {
                    throw e;
                }
            }
            console.log("==========================================");
        });
    } catch (e) {
        throw e;
    }
}

function fancyTime() {
    date = new Date();
    var horas = parseInt(date.getHours());
    var minutos = parseInt(date.getMinutes());
    var segundos = parseInt(date.getSeconds());
    if (horas < 10)
        horas = "0" + date.getHours();
    if (minutos < 10)
        minutos = "0" + date.getMinutes();
    if (segundos < 10)
        segundos = "0" + date.getSeconds();
    return (horas + ":" + minutos + ":" + segundos);
}

// function cancelOrder(market) {
//     try {
//         binance.openOrders(market, (error, openOrders, symbol) => {
//             console.log("openOrders(" + symbol + ")", openOrders);
//         });
//         binance.cancelOrders(market, (error, response, symbol) => {
//             console.log(symbol + " cancel response:", response);
//         });
//     } catch (e) {
//         console.log("ERRO : " + e);
//     }
// }

function start() {
    console.clear();
    ciclosRealizados = 0;
    startTime = Math.floor(+new Date() / 1000);
    totalCompras = 0;
    totalVendas = 0;
    console.log("Iniciando...");
}