var config = require('./config.json');
const axios = require('axios');
var binance = require('node-binance-api')().options({
    APIKEY: config.API_KEY,
    APISECRET: config.SECRET_KEY,
    useServerTime: true
});



start();

setInterval(() => {
    
    const date = new Date();
    const tstart = date.getTime() - (config.PERIOD * 60 * 1000);
    const tfinish = date.getTime();
    
        axios.get('https://api.binance.com/api/v1/aggTrades', {
            params: {
                symbol: config.CURRENCY + config.MARKET,
                startTime: tstart,
                endTime: tfinish
            }
        })
        .then(function (response) {
            
            avgPrice = 0;

            response.data.forEach(function(hist){
            
                avgPrice += parseFloat(hist.p);

            });
            
            avgPrice = parseFloat(avgPrice/response.data.length).toFixed(4);
        

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
                    console.log("UPTIME.......:", Math.floor(+new Date() / 1000) - startTime, "segundos");
                    console.log("ORDENS.......:", "VENDAS: [", totalVendas, "] COMPRAS: [", totalCompras, "]");
                    simpleStrategy(balances);
                });
            } catch (e) {
                console.log("ERRO : " + e);
            }
        })
        .catch(function (error) {
            console.log(error);
        })

}, 15000);

function simpleStrategy(balances) {
    if (hasBought == false) {
        buy = avgPrice * (1 - config.SPREAD);
        sell = avgPrice * (1 + config.SPREAD);
        //buy = (buy > 1.0001 ? 1.0001 : buy.toFixed(4));
        //sell = (sell > 1.0025 ? 1.0025 : sell.toFixed(4));
        
        buy = buy.toFixed(4);
        sell = sell.toFixed(4);
        
    }
    try {
        binance.prevDay("BTC" + config.MARKET, (error, prevDay, symbol) => {
            console.log("BTC" + config.MARKET + "......:", prevDay.lastPrice);
            console.log("DEFINIDOS....: Compra " + buy + " e Venda " + sell);
            if (balances[config.MARKET].available > 20) {
                try {
                    totalCompras++;
                    hasBought = true;
                    binance.buy(config.CURRENCY + config.MARKET, ((balances[config.MARKET].available - 0.1) / buy).toFixed(2), buy);
                } catch (e) {
                    totalCompras--;
                    hasBought = false;
                    throw e;
                }
            }
            if (balances[config.CURRENCY].available > 20) {
                try {
                    totalVendas++;
                    hasBought = false;
                    binance.sell(config.CURRENCY + config.MARKET, (balances[config.CURRENCY].available - 0.1).toFixed(2), sell);
                } catch (e) {
                    totalVendas--;
                    hasBought = true;
                    throw e;
                }
            }
            console.log("==========================================");
        });
    } catch (e) {
        throw e;
    }
}

function start() {
    console.clear();
    hasBought = false;
    startTime = Math.floor(+new Date() / 1000);
    totalCompras = 0;
    totalVendas = 0;
    console.log("Iniciando...");
}
