var config = require('./config.json');
var cron = require('node-cron');
var app = require('express')();
var coins = ['TUSD', 'USDT', 'USDC', 'USDC', 'PAX', 'USDS', 'USDSB', ];

const Binance = require('binance-api-node').default;
const client = Binance({
    apiKey: config.API_KEY,
    apiSecret: config.SECRET_KEY,
});


if(config.BOT_TOKEN == "" && config.BOT_CHAT == "") {
	bot_enabled = 0;
} else {
	const TelegramBot = require('node-telegram-bot-api');
	const TOKEN = config.BOT_TOKEN;
	var bot = new TelegramBot(TOKEN, {polling: true});
	bot.sendMessage(config.BOT_CHAT, '\u{1F916} stablecoins-infinity-profit-bot iniciando');
	bot_enabled = 1;
}

client.openOrders({
  symbol: config.CURRENCY + config.MARKET,
}).then((result) => {
	for (let index = 0; index < result.length; index++) {
		if(result[index].side == "BUY") {
			if(bot_enabled == 1) {
				bot.sendMessage(config.BOT_CHAT, '\u{1F5E3} Order de compra encontrada: '+ result[index].orderId +' No total de: '+ result[index].origQty +' no valor de: '+ result[index].price +'');
			}
			console.log('Order de compra encontrada: '+ result[index].orderId +' No total de: '+ result[index].origQty +' no valor de: '+ result[index].price +'');	
			filledBuyOrder = false;
			OrderBuyID = result[index].orderId;
			buyAmount = result[index].origQty;
			buyPriceTemp = result[index].price;
		}
		if(result[index].side == "SELL") {
			if(bot_enabled == 1) {
				bot.sendMessage(config.BOT_CHAT, '\u{1F5E3} Order de venda encontrada: '+ result[index].orderId +' No total de: '+ result[index].origQty +' no valor de: '+ result[index].price +'');
			}
			console.log("Order de venda encontrada: "+ result[index].orderId +" No total de: "+ result[index].origQty +" no valor de: "+ result[index].price +"");
			filledSellOrder = false;
			OrderSellID = result[index].orderId;
			sellAmount = result[index].origQty;
			sellPriceTemp = result[index].price;
		}
	}
});

var task = cron.schedule('*/' + config.LOOP_TIME + ' * * * * *', () => {
    client.dailyStats({ symbol: config.CURRENCY + config.MARKET }).then((result) => {
		changePrice = parseFloat(result.priceChangePercent);
		avgPrice = parseFloat(result.lastPrice);
		minDay = parseFloat(result.lowPrice);
		maxDay = parseFloat(result.highPrice); 
		spreadDay = parseFloat(maxDay - minDay).toFixed(4);
		spreadOpera = parseFloat(spreadDay / 4);
		otherStables = 0;
	    client.accountInfo({ useServerTime: true }).then((result) => {
			for (let index = 0; index < result.balances.length; index++) {
				if (result.balances[index].asset == "BNB") {
	   				balanceBNB = (parseFloat(result.balances[index].locked) + parseFloat(result.balances[index].free));
				}
				if (result.balances[index].asset == "TUSD") {
					saldo_TUSD = (parseFloat(result.balances[index].locked) + parseFloat(result.balances[index].free)).toFixed(8);
				}
				if (result.balances[index].asset == "USDT") {
					saldo_USDT = (parseFloat(result.balances[index].locked) + parseFloat(result.balances[index].free)).toFixed(8);
				}
				if (result.balances[index].asset == "USDC") {
					saldo_USDC = (parseFloat(result.balances[index].locked) + parseFloat(result.balances[index].free)).toFixed(8);
				}
				if (result.balances[index].asset == "PAX") {
					saldo_PAX = (parseFloat(result.balances[index].locked) + parseFloat(result.balances[index].free)).toFixed(8);
				}
				if (result.balances[index].asset == "USDS") {
					saldo_USDS = (parseFloat(result.balances[index].locked) + parseFloat(result.balances[index].free)).toFixed(8);
				}
				if (result.balances[index].asset == "USDSB") {
					saldo_USDSB = (parseFloat(result.balances[index].locked) + parseFloat(result.balances[index].free)).toFixed(8);
				}		

				if (result.balances[index].asset == config.MARKET) {
					marketBalanceLocked = parseFloat(result.balances[index].locked);
					marketBalanceFree = parseFloat(result.balances[index].free);
                } else if (result.balances[index].asset == config.CURRENCY) {
					currencyBalanceLocked = parseFloat(result.balances[index].locked);
					currencyBalanceFree = parseFloat(result.balances[index].free);
                }
				
				if (coins.indexOf(result.balances[index].asset) > -1) {
					if((result.balances[index].asset != config.MARKET) && (result.balances[index].asset != config.CURRENCY)) {
						let otherCoinsLocked = parseFloat(result.balances[index].locked);
						let otherCoinsFree = parseFloat(result.balances[index].free);
						otherStables = (otherStables + (otherCoinsLocked + otherCoinsFree));
					}
				}
				
            }
			
			total = (marketBalanceLocked + marketBalanceFree + currencyBalanceLocked + currencyBalanceFree + otherStables).toFixed(8);

			if((marketBalanceLocked + marketBalanceFree) < (total / 2)) {
				buyAmount =  (((total/2)  * config.BUY_VALUE) / 100 ).toFixed(2);		    
				sellAmount = (((total/2) * config.BUY_VALUE) / 100 ).toFixed(2);
			} else {
				if((currencyBalanceLocked + currencyBalanceFree) < (total / 2)) {
					buyAmount =  (((total/2)  * config.BUY_VALUE) / 100 ).toFixed(2);		    
					sellAmount = (((total/2) * config.BUY_VALUE) / 100 ).toFixed(2);
				} else {
					if (setAmount == 0) {
						buyAmount = (((marketBalanceLocked + marketBalanceFree) * config.BUY_VALUE) / 100).toFixed(2);		    
						sellAmount = ((( currencyBalanceLocked + currencyBalanceFree) * config.BUY_VALUE) / 100).toFixed(2);
						setAmount = 1;
		    		}		    
				}
			}

		    if(config.AUTO_SPREAD == 1) {
		    	status_spread = "ATIVADO";
		    } else {
				status_spread = "DESATIVADO";
		    }

			console.clear();
			console.log("===========================================");
			console.log("SALDO "+ config.MARKET +"...:", marketBalanceLocked + marketBalanceFree);
			console.log("SALDO "+ config.CURRENCY +"...:", currencyBalanceLocked + currencyBalanceFree);
			console.log("OUTRAS STALBE:", otherStables.toFixed(8));
		    console.log("SALDO BNB....:", balanceBNB);
			console.log("SALDO TOTAL..:", total, "USD");
		    console.log("AUTO SPREAD..:", status_spread);
			console.log("MINIMA DO DIA:", minDay);
			console.log("MAXIMA DO DIA:", maxDay);
		    console.log(config.CURRENCY + config.MARKET +".....:", avgPrice);
		    console.log("VARIACAO 24H.:", changePrice +" %");
			console.log("SPREAD 24H...:", spreadDay);
			console.log("SPREAD OPERA.:", spreadOpera);
			console.log("SALDO INICIAL:", config.INITIAL_INVESTMENT, "USD");
			console.log("LUCRO........:", (total - config.INITIAL_INVESTMENT).toFixed(4), "USD");
			console.log("              ", ((total - config.INITIAL_INVESTMENT) * 100 / config.INITIAL_INVESTMENT).toFixed(2), "%");
			console.log("===========================================");
			console.log("UPTIME.......:", ((Math.floor(+new Date() / 1000) - startTime) / 3600).toFixed(2) , "horas");
			console.log("ORDENS.......:", "VENDAS: [", totalVendas, "] COMPRAS: [", totalCompras, "]");
			simpleStrategy();
			}).catch((err) => {
            	throw err;
            });
        }).catch((err) => {
            console.log(err);
        });
}, { scheduled: false });

function simpleStrategy() {
    if(OrderBuyID != 0 && (hasFundsBuy == 1)) {
    	client.getOrder({
		symbol: config.CURRENCY + config.MARKET,
		orderId: OrderBuyID,
	 	}).then((result) => {
			dateOrderBuy = result.time; 
			if(result.status == 'FILLED') {
				filledBuyOrder = true;
				if(bot_enabled == 1) {
					bot.sendMessage(config.BOT_CHAT, '\u{1f911} Ordem de compra executada com sucesso. Saldo atual: '+  config.MARKET + ': '+ (marketBalanceLocked + marketBalanceFree).toFixed(4) +' '+ config.CURRENCY  +' '+ (currencyBalanceLocked + currencyBalanceFree).toFixed(4) +' Lucro atual: '+ (total - config.INITIAL_INVESTMENT).toFixed(4) + " USD" +' \u{1F4B0} '+ ((total - config.INITIAL_INVESTMENT) * 100 / config.INITIAL_INVESTMENT).toFixed(2) +'%');
				}
				client.cancelOrder({
					symbol: config.CURRENCY + config.MARKET,
					orderId: OrderSellID,}).catch((err) => {
					console.log(err);
				});
			}

			if(result.status == 'CANCELED') {
				filledBuyOrder = true;
				if(bot_enabled == 1) {
					bot.sendMessage(config.BOT_CHAT, '\u{1f6a8} Ordem de compra '+ OrderBuyID +' cancelada na exchange, gerando uma nova ordem.');
				}
			}
		}).catch((err) => {
			throw err;
     	});
    }

    if(OrderSellID != 0 && (hasFundsSell == 1)) {
    	client.getOrder({
			symbol: config.CURRENCY + config.MARKET,
			orderId: OrderSellID,
        }).then((result) => {
			dateOrderSell = result.time;
			if(result.status == 'FILLED') {
				filledSellOrder = true;
				if(bot_enabled == 1) {
					bot.sendMessage(config.BOT_CHAT, '\u{1f911} Ordem de venda executada com sucesso. Saldo atual: '+ config.MARKET + ': '+ (marketBalanceLocked + marketBalanceFree).toFixed(4) +' '+ config.CURRENCY +' '+ (currencyBalanceLocked + currencyBalanceFree).toFixed(4) +' Lucro atual: '+ (total - config.INITIAL_INVESTMENT).toFixed(4) + " USD" +' \u{1F4B0} '+ ((total - config.INITIAL_INVESTMENT) * 100 / config.INITIAL_INVESTMENT).toFixed(2) +'%');
				}
				client.cancelOrder({
					symbol: config.CURRENCY + config.MARKET,
					orderId: OrderBuyID,}).catch((err) => {
					console.log(err);
				});
			}

			if(result.status == 'CANCELED') {
				filledSellOrder = true;
				if(bot_enabled == 1) {
					bot.sendMessage(config.BOT_CHAT, '\u{1f6a8} Ordem de venda '+ OrderSellID  +' cancelada na exchange, gerando uma nova ordem.');
				}
			}
		}).catch((err) => {
          	throw err;
        });
    }

	if(config.ORDER_EXPIRE != 0) {
		date = new Date(dateOrderBuy);
		dateOrderBuyExpire = date.setHours(date.getHours() + config.ORDER_EXPIRE);
		if((dateOrderBuyExpire > 1546300800) && (Date.now() > dateOrderBuyExpire) && (OrderBuyID != 0) && (buyPriceTemp != 0) && (countExpireBuy > 2)) {
			if(bot_enabled == 1) {
				bot.sendMessage(config.BOT_CHAT, '\u{231b} A ordem de compra expirou em '+ new Date(dateOrderSellExpire) +' sem execução do mercado. Timeout em '+ config.ORDER_EXPIRE +' horas. Será gerada uma nova ordem de compra para operação.');
			}
			client.cancelOrder({
				symbol: config.CURRENCY + config.MARKET,
				orderId: OrderBuyID,}).catch((err) => {
				console.log(err);
			});
			countExpireBuy = 0;
		} else {
			countExpireBuy++;
		}

		date = new Date(dateOrderSell);
		dateOrderSellExpire = date.setHours(date.getHours() + config.ORDER_EXPIRE);
		if((dateOrderSellExpire > 1546300800) && (Date.now() > dateOrderSellExpire) && (OrderSellID != 0) && (sellPriceTemp != 0) && (countExpireSell > 2)) {
			if(bot_enabled == 1) {
				bot.sendMessage(config.BOT_CHAT, '\u{231b} A ordem de venda expirou em '+ new Date(dateOrderSellExpire)  +' sem execução do mercado. Timeout em '+ config.ORDER_EXPIRE +' horas. Será gerada uma nova ordem de venda para operação.');
			}
			client.cancelOrder({
				symbol: config.CURRENCY + config.MARKET,
				orderId: OrderSellID,}).catch((err) => {
				console.log(err);
			});
			countExpireSell = 0;
		} else {
			countExpireSell++;
		}

	}
		
    if ((config.AUTO_SPREAD == 1) && (SpreadTemp != 0) && (SpreadTemp != spreadOpera) && (spreadOpera >= config.SPREAD_MIN)) {
		if(bot_enabled == 1) {
    		bot.sendMessage(config.BOT_CHAT, '\u{1f6a7} Ajuste no spread de mercado de '+ SpreadTemp +' para '+ spreadOpera +' para variação de '+ changePrice + ' %. As próximas ordens vão utilizar esta margem.');
		}
    }
    SpreadTemp = spreadOpera;
    changePriceTemp = changePrice;

    if(config.AUTO_SPREAD == 1) {
		if((OrderSellID == 0 && OrderBuyID == 0) || (spreadOpera <= config.SPREAD_MIN))  {
			spreadOpera = config.SPREAD_MIN;
			buyPrice = (avgPrice * (1 - spreadOpera)).toFixed(4);
			sellPrice = (avgPrice * (1 + spreadOpera)).toFixed(4);
		} else {
			buyPrice = (avgPrice - (spreadOpera)).toFixed(4);
			sellPrice = (avgPrice + (spreadOpera)).toFixed(4);
		}
    } else {
        buyPrice = (avgPrice * (1 - config.SPREAD_BUY)).toFixed(4);
        sellPrice = (avgPrice * (1 + config.SPREAD_SELL)).toFixed(4);
    }
	

	client.myTrades({
	  symbol: config.CURRENCY + config.MARKET,
	}).then((result) => {
		if(filledSellOrder == true) {
			for (let index = (result.length -1); index > 1; index--) {
				if((result[index].isBuyer == true) && (filledSellOrder == true) && (currencyBalanceFree >= 20)) {
					if(sellPrice - parseFloat(result[index].price).toFixed(4) < spreadOpera) {
						let sellPriceTemp = (parseFloat(result[index].price).toFixed(4) * (1 + spreadOpera)).toFixed(4);
						if((sellPriceTemp > avgPrice) && ((sellPriceTemp - avgPrice) >= spreadOpera) && notifySellMin == 0) {
							sellPrice = sellPriceTemp;
							if(bot_enabled == 1) {
								bot.sendMessage(config.BOT_CHAT, '\u{2716} ALERTA: A ordem de venda está em um valor abaixo da diferença de spread '+ spreadOpera +' da última ordem de compra no valor de '+ parseFloat(result[index].price).toFixed(4) +' comparado ao preço atual de mercado em '+ avgPrice +'. Ela teve seu valor reajustado para: '+ sellPrice +'.');
							}
						} else {
							if(bot_enabled == 1 && notifySellMin == 0) {
								bot.sendMessage(config.BOT_CHAT, '\u{2714} AVISO: A ordem de venda está dentro da diferença de spread '+ spreadOpera +' da última ordem de compra no valor de '+ parseFloat(result[index].price).toFixed(4) +'');
							}
						}
					} else {
							if(bot_enabled == 1 && notifySellMin == 0) {
								bot.sendMessage(config.BOT_CHAT, '\u{2714} AVISO: A ordem de venda está dentro da diferença de spread '+ spreadOpera +' da última ordem de compra no valor de '+ parseFloat(result[index].price).toFixed(4) +'');
							}
					}
					index = 0;
				}
			}
		}
		
		if(filledBuyOrder == true) {
			for (let index = (result.length - 1); index > 1; index--) {
				if((result[index].isBuyer == false) && (filledBuyOrder == true) && (marketBalanceFree >= 20)) {
					if(buyPrice - parseFloat(result[index].price).toFixed(4) < spreadOpera) {
						let buyPriceTemp = (parseFloat(result[index].price).toFixed(4) * (1 - spreadOpera)).toFixed(4);
						if ((buyPriceTemp < avgPrice) && ((avgPrice - buyPriceTemp) >= spreadOpera) && notifyBuyMax == 0) {
							buyPrice = buyPriceTemp;
							if(bot_enabled == 1) {
								bot.sendMessage(config.BOT_CHAT, '\u{2716} ALERTA: A ordem de compra está em um valor abaixo da diferença de spread '+ spreadOpera +' da última ordem de venda no valor de '+ parseFloat(result[index].price).toFixed(4) +' comparado ao preço atual de mercado em '+ avgPrice +'. Ela teve seu valor reajustado para: '+ buyPrice +'.');
							}
						} else {
							if(bot_enabled == 1 && notifyBuyMax == 0) {
								bot.sendMessage(config.BOT_CHAT, '\u{2714} AVISO: A ordem de compra está dentro da diferença de spread '+ spreadOpera +' da última ordem de venda no valor de '+ parseFloat(result[index].price).toFixed(4) +'');
							}
						}
					} else {
							if(bot_enabled == 1 && notifyBuyMax == 0) {
								bot.sendMessage(config.BOT_CHAT, '\u{2714} AVISO: A ordem de compra está dentro da diferença de spread '+ spreadOpera +' da última ordem de venda no valor de '+ parseFloat(result[index].price).toFixed(4) +'');
							}
					}
					index = 0;
				}
			}
		}
	});
	
	
    client.dailyStats({ symbol: "BTC" + config.MARKET }).then((result) => {
		console.log("DEFINIDOS....: Compra " + buyPrice + " e Venda " + sellPrice);
	    console.log("TIMEOUT ORDEM:"+ " "+config.ORDER_EXPIRE+" horas");
		console.log("HORA AGORA...:"+ " "+new Date());
	    console.log("============== DADOS DE COMPRA ============");
	    console.log("VALOR COMPRA.:", buyAmount);
		console.log("PRECO COMPRA.:", parseFloat(buyPriceTemp).toFixed(4));
		console.log("ID ORDEM BUY.:", OrderBuyID);
		console.log("EXPIRA EM....:", new Date(dateOrderBuyExpire));
		console.log("============== DADOS DE VENDA =============");
	    console.log("VALOR VENDA..:", sellAmount);
		console.log("PRECO VENDA..:", parseFloat(sellPriceTemp).toFixed(4));
		console.log("ID ORDEM SELL:", OrderSellID);
	    console.log("EXPIRA EM....:", new Date(dateOrderSellExpire));
		console.log("===========================================");
		client.openOrders({
			symbol: config.CURRENCY + config.MARKET,
		}).then((result) => {
			if (filledBuyOrder == true) {
        		if ((marketBalanceFree > 20 || marketBalanceFree >= buyAmount) && buyPrice < config.BUY_MAX) {
					if((marketBalanceFree > 20) && (marketBalanceFree <= buyAmount)) {
						buyAmount = parseFloat(marketBalanceFree).toFixed(2);
					}
					client.order({
						symbol: config.CURRENCY + config.MARKET,
						side: 'BUY',
						quantity: buyAmount,
						price: buyPrice,
						useServerTime: true
					}).then((result) => {
						totalCompras++;
						OrderBuyID = result.orderId;
						filledBuyOrder = false;
					}).catch((err) => {
							totalCompras--;
							throw err;
					});
					notifyBuyMax = 0;
					hasFundsBuy = 1;
					buyPriceTemp = buyPrice;
					if(bot_enabled == 1) {
						bot.sendMessage(config.BOT_CHAT, '\u{1F4C9} Order de compra criada com sucesso: Quantidade comprada: \u{1f4b5} '+ buyAmount +', valor de compra: \u{1f3f7} '+ buyPrice +' utilizando spread em '+ spreadOpera +'.');
					}
				} else {
					if(bot_enabled == 1 && notifyBuyMax == 0 && marketBalanceFree >= buyAmount) {
						bot.sendMessage(config.BOT_CHAT, '\u{274C} O valor de compra do mercado esta acima do definido em '+ config.BUY_MAX+'. O bot vai aguardar o preço reduzir até o valor definido para evitar prejuízos.');
						notifyBuyMax = 1;
					} 
					if(bot_enabled == 1 && hasFundsBuy == 1 && notifyBuyMax == 0) {
						bot.sendMessage(config.BOT_CHAT, '\u{1F6AB} O bot está sem saldo para compras em '+ config.MARKET +'. Seu saldo atual é: '+marketBalanceFree+'. O bot vai aguardar até que uma compra seja executada para liberar saldo.');
						notifyBuyMax = 1;
					}
					OrderBuyID = 0;
					hasFundsBuy = 0;
				}
			}

			if (filledSellOrder == true) {
        		if ((currencyBalanceFree > 20 || currencyBalanceFree >= sellAmount) && sellPrice > config.SELL_MIN) {
					if((currencyBalanceFree > 20) && (currencyBalanceFree <= sellAmount)) {
						sellAmount = parseFloat(currencyBalanceFree).toFixed(2);
					}
					client.order({
						symbol: config.CURRENCY + config.MARKET,
						side: 'SELL',
						quantity: sellAmount,
						price: sellPrice,
						useServerTime: true
					}).then((result) => {
                        totalVendas++;
						OrderSellID = result.orderId;
						filledSellOrder = false;
                    }).catch((err) => {
						totalVendas--;
						throw err;
                    });
					notifySellMin = 0;
					hasFundsSell = 1;
					sellPriceTemp = sellPrice;
					if(bot_enabled == 1) {
						bot.sendMessage(config.BOT_CHAT, '\u{1F4C8} Order de venda criada com sucesso: Quantidade vendida: \u{1f4b5} '+ sellAmount +', valor de venda: \u{1f3f7} '+ sellPrice +' utilizando spread em '+ spreadOpera +'.');
					}
				} else {
					if(bot_enabled == 1 && notifySellMin == 0 && currencyBalanceFree >= sellAmount) {
						bot.sendMessage(config.BOT_CHAT, '\u{274C} O valor de venda do mercado esta abaixo do definido em '+ config.SELL_MIN+'. O bot vai aguardar o preço aumentar até o valor definido para evitar prejuízos.');
						notifySellMin = 1;
					} 
					if(bot_enabled == 1 && hasFundsSell == 1 && notifySellMin == 0) {
						bot.sendMessage(config.BOT_CHAT, '\u{1F6AB} O bot está sem saldo para vendas em '+ config.CURRENCY +'. Seu saldo atual é: '+currencyBalanceFree+'. O bot vai aguardar até que uma compra seja executada para liberar saldo.');
						notifySellMin = 1;
					}
					OrderSellID = 0;
					hasFundsSell = 0;
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
notifyBuyMax = 0
notifySellMin = 0;
otherStables = 0;
hasFundsBuy = 1;
hasFundsSell = 1;
countExpireBuy = 0;
countExpireSell = 0
dateOrderBuy = 0 
dateOrderBuyExpire = 0;
dateOrderSell = 0;
dateOrderSellExpire = 0;
buyPriceTemp = 0;
sellPriceTemp = 0;
changePriceTemp = 0;
startTime = Math.floor(+new Date() / 1000);
avgPrice = 0;
OrderBuyID = 0;
filledBuyOrder = true;
filledSellOrder = true;
OrderSellID = 0;
SpreadTemp = 0;
totalCompras = 0;
totalVendas = 0;
marketBalanceLocked = 0;
marketBalanceFree = 0;
currencyBalanceLocked = 0;
currencyBalanceFree = 0;
total = 0;
setAmount = 0;
setBuyOrder = 0;
saldo_TUSD = 0;
saldo_USDT = 0;
saldo_USDC = 0;
saldo_PAX = 0;
saldo_USDS = 0;
saldo_USDSB = 0;
total_stable = 0;

console.log("Iniciando...");

task.start();

app.get('/', (req, res) => {
	let total_investiment = (total - config.INITIAL_INVESTMENT).toFixed(8);
    res.json(
        {
            initialInvestment: config.INITIAL_INVESTMENT,
            market: config.MARKET,
            currency: config.CURRENCY,
            balances: {
				usdt: parseFloat(saldo_USDT),
				tusd: parseFloat(saldo_TUSD),
				pax: parseFloat(saldo_PAX),
				usdc: parseFloat(saldo_USDC),
				usds: parseFloat(saldo_USDS),
				usdsb: parseFloat(saldo_USDSB)
            },
            profit: {
                USD: parseFloat(total_investiment),
                percent: parseFloat(((total - config.INITIAL_INVESTMENT) * 100 / config.INITIAL_INVESTMENT).toFixed(2))
            }
        }
    );
});

app.listen(config.LISTEN_PORT);
