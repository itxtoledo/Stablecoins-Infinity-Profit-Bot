var config = require('./config.json')
var binance = require('node-binance-api')().options({
    APIKEY: config.API_KEY,
    APISECRET: config.SECRET_KEY,
    useServerTime: true
});

setInterval(function () {
    var dateAtual = new Date();
    try {
        binance.balance((error, balances) => {
            if (error) return console.error(error);
            const total = parseFloat(balances.USDT.onOrder) + parseFloat(balances.USDT.available) + parseFloat(balances.TUSD.onOrder) + parseFloat(balances.TUSD.available);
            console.clear();
            console.log("==========================================");
            console.log("SALDO TOTAL..:", total, "USD")
            console.log("SALDO INICIAL:", config.INITIAL_INVESTMENT, "USD")
            console.log("LUCRO........:", total - config.INITIAL_INVESTMENT, "USD")
            dateAtual = new Date();
            console.log("@", dateAtual.getHours() + ':' + dateAtual.getMinutes() + ':' + dateAtual.getSeconds());
            console.log("==========================================");
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
                    console.log("Cotação BTCUSDT", prevDay.lastPrice);
                    console.log("Definidos: compra " + buy + " e venda " + sell);
                    if (balances.USDT.available > 20) {
                        console.log("Compra: " + buy);
                        try {
                            binance.buy("TUSDUSDT", ((balances.USDT.available - 0.1) / buy).toFixed(2), buy);
                        } catch (e) {
                            throw e;
                        }
                    }
                    if (balances.TUSD.available > 20) {
                        console.log("Venda: " + sell);
                        try {
                            binance.sell("TUSDUSDT", (balances.TUSD.available - 0.1).toFixed(2), sell);
                        } catch (e) {
                            throw e;
                        }
                    }
                });
            } catch (e) {
                throw e;
            }
        });
    } catch (e) {
        console.log("ERRO : " + e);
    }
}, 10000)
