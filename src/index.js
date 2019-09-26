import config from "./config.json";
import cron from "node-cron";
import express from "express";
import Binance from "binance-api-node";
import { isInArray } from "./utils.js";
import telegraf from 'telegraf';

let app = express();

const client = Binance({
  apiKey: config.API_KEY,
  apiSecret: config.SECRET_KEY
});

if (config.BOT_TOKEN != "" && config.BOT_CHAT != "") {
  const TelegramBot = require("node-telegram-bot-api");
  const TOKEN = config.BOT_TOKEN;
  var bot = new TelegramBot(TOKEN, { polling: true });
  bot.sendMessage(
    config.BOT_CHAT,
    "\u{1F916} stablecoins-infinity-profit-bot iniciando"
  );
  botMemory.telegram = true;
}

client
  .openOrders({
    symbol: config.CURRENCY + config.MARKET
  })
  .then(result => {
    for (let i = 0; i < result.length; i++) {
      if (result[i].side == "BUY") {
        if (botMemory.telegram) {
          bot.sendMessage(
            config.BOT_CHAT,
            "\u{1F5E3} Order de compra encontrada: " +
              result[i].orderId +
              " No total de: " +
              result[i].origQty +
              " no valor de: " +
              result[i].price +
              ""
          );
        }
        console.log(
          "Order de compra encontrada: " +
            result[i].orderId +
            " No total de: " +
            result[i].origQty +
            " no valor de: " +
            result[i].price +
            ""
        );
        filledBuyOrder = false;
        OrderBuyID = result[i].orderId;
        buyAmount = result[i].origQty;
        buyPriceTemp = result[i].price;
      }
      if (result[i].side == "SELL") {
        if (botMemory.telegram) {
          bot.sendMessage(
            config.BOT_CHAT,
            "\u{1F5E3} Order de venda encontrada: " +
              result[i].orderId +
              " No total de: " +
              result[i].origQty +
              " no valor de: " +
              result[i].price +
              ""
          );
        }
        console.log(
          "Order de venda encontrada: " +
            result[i].orderId +
            " No total de: " +
            result[i].origQty +
            " no valor de: " +
            result[i].price +
            ""
        );
        filledSellOrder = false;
        OrderSellID = result[i].orderId;
        sellAmount = result[i].origQty;
        sellPriceTemp = result[i].price;
      }
    }
  });

var task = cron.schedule(
  "*/" + config.LOOP_TIME + " * * * * *",
  () => {
    client
      .dailyStats({ symbol: config.CURRENCY + config.MARKET })
      .then(result => {
        changePrice = parseFloat(result.priceChangePercent);
        avgPrice = parseFloat(result.lastPrice);
        minDay = parseFloat(result.lowPrice);
        maxDay = parseFloat(result.highPrice);
        spreadDay = parseFloat(maxDay - minDay).toFixed(4);
        spreadOpera = parseFloat(spreadDay / 4);
        botMemory.otherStables = 0;
        client
          .accountInfo({ useServerTime: true })
          .then(result => {
            for (let i = 0; i < result.balances.length; i++) {
              if (result.balances[i].asset == "BNB") {
                balanceBNB =
                  parseFloat(result.balances[i].locked) +
                  parseFloat(result.balances[i].free);
              } else if (result.balances[i].asset == "TUSD") {
                botMemory.saldo_TUSD = (
                  parseFloat(result.balances[i].locked) +
                  parseFloat(result.balances[i].free)
                ).toFixed(8);
              } else if (result.balances[i].asset == "USDT") {
                botMemory.saldo_USDT = (
                  parseFloat(result.balances[i].locked) +
                  parseFloat(result.balances[i].free)
                ).toFixed(8);
              } else if (result.balances[i].asset == "USDC") {
                botMemory.saldo_USDC = (
                  parseFloat(result.balances[i].locked) +
                  parseFloat(result.balances[i].free)
                ).toFixed(8);
              } else if (result.balances[i].asset == "PAX") {
                botMemory.saldo_PAX = (
                  parseFloat(result.balances[i].locked) +
                  parseFloat(result.balances[i].free)
                ).toFixed(8);
              } else if (result.balances[i].asset == "USDS") {
                botMemory.saldo_USDS = (
                  parseFloat(result.balances[i].locked) +
                  parseFloat(result.balances[i].free)
                ).toFixed(8);
              } else if (result.balances[i].asset == "USDSB") {
                botMemory.saldo_USDSB = (
                  parseFloat(result.balances[i].locked) +
                  parseFloat(result.balances[i].free)
                ).toFixed(8);
              } else if (result.balances[i].asset == config.MARKET) {
                marketBalanceLocked = parseFloat(result.balances[i].locked);
                marketBalanceFree = parseFloat(result.balances[i].free);
              } else if (result.balances[i].asset == config.CURRENCY) {
                currencyBalanceLocked = parseFloat(result.balances[i].locked);
                currencyBalanceFree = parseFloat(result.balances[i].free);
              } else if (isInArray(config.COINS, result.balances[i].asset)) {
                if (
                  result.balances[i].asset != config.MARKET &&
                  result.balances[i].asset != config.CURRENCY
                ) {
                  botMemory.botMemory.otherStables =
                    botMemory.otherStables + (parseFloat(result.balances[i].locked) + parseFloat(result.balances[i].free));
                }
              }
            }

            total = (
              marketBalanceLocked +
              marketBalanceFree +
              currencyBalanceLocked +
              currencyBalanceFree +
              botMemory.botMemory.otherStables
            ).toFixed(8);

            if (marketBalanceLocked + marketBalanceFree < total / 2) {
              buyAmount = (((total / 2) * config.BUY_VALUE) / 100).toFixed(2);
              sellAmount = (((total / 2) * config.BUY_VALUE) / 100).toFixed(2);
            } else {
              if (currencyBalanceLocked + currencyBalanceFree < total / 2) {
                buyAmount = (((total / 2) * config.BUY_VALUE) / 100).toFixed(2);
                sellAmount = (((total / 2) * config.BUY_VALUE) / 100).toFixed(
                  2
                );
              } else {
                if (setAmount == 0) {
                  buyAmount = (
                    ((marketBalanceLocked + marketBalanceFree) *
                      config.BUY_VALUE) /
                    100
                  ).toFixed(2);
                  sellAmount = (
                    ((currencyBalanceLocked + currencyBalanceFree) *
                      config.BUY_VALUE) /
                    100
                  ).toFixed(2);
                  setAmount = 1;
                }
              }
            }

            if (config.AUTO_SPREAD == 1) {
              status_spread = "ATIVADO";
            } else {
              status_spread = "DESATIVADO";
            }

            console.clear();
            let mess = '===========================================';

            mess += `
            SALDO ${config.MARKET}...: ${marketBalanceLocked + marketBalanceFree}\n
            SALDO ${config.CURRENCY}...: ${currencyBalanceLocked + currencyBalanceFree}\n
            OUTRAS STABLE: ${botMemory.otherStables.toFixed(8)}\n
            SALDO BNB....: ${balanceBNB}\n
            SALDO TOTAL..: ${total} USD\n
            AUTO SPREAD..: ${status_spread}\n
            MINIMA DO DIA: ${minDay}\n
            MAXIMA DO DIA: ${maxDay}\n
            ${config.CURRENCY + config.MARKET}.....: ${avgPrice}\n
            VARIACAO 24H.: ${changePrice} %\n
            SPREAD 24H...: ${spreadDay}\n
            SPREAD OPERA.: ${spreadOpera}\n
            SALDO INICIAL: ${config.INITIAL_INVESTMENT} USD\n
            LUCRO........: ${(total - config.INITIAL_INVESTMENT).toFixed(4)} USD\n
                           ${ (
                            ((total - config.INITIAL_INVESTMENT) * 100) /
                            config.INITIAL_INVESTMENT
                          ).toFixed(2)} %\n
            ===========================================`;
            console.log(mess);
            console.log(
              "UPTIME.......:",
              ((Math.floor(+new Date() / 1000) - startTime) / 3600).toFixed(2),
              "horas"
            );
            console.log(
              "ORDENS.......:",
              "VENDAS: [",
              totalVendas,
              "] COMPRAS: [",
              totalCompras,
              "]"
            );

            let mess =
            simpleStrategy();
          })
          .catch(err => {
            throw err;
          });
      })
      .catch(err => {
        console.log(err);
      });
  },
  { scheduled: false }
);

function simpleStrategy() {
  if (OrderBuyID != 0 && hasFundsBuy == 1) {
    client
      .getOrder({
        symbol: config.CURRENCY + config.MARKET,
        orderId: OrderBuyID
      })
      .then(result => {
        dateOrderBuy = result.time;
        if (result.status == "FILLED") {
          filledBuyOrder = true;
          if (botMemory.telegram) {
            bot.sendMessage(
              config.BOT_CHAT,
              "\u{1f911} Ordem de compra executada com sucesso. Saldo atual: " +
                config.MARKET +
                ": " +
                (marketBalanceLocked + marketBalanceFree).toFixed(4) +
                " " +
                config.CURRENCY +
                " " +
                (currencyBalanceLocked + currencyBalanceFree).toFixed(4) +
                " Lucro atual: " +
                (total - config.INITIAL_INVESTMENT).toFixed(4) +
                " USD" +
                " \u{1F4B0} " +
                (
                  ((total - config.INITIAL_INVESTMENT) * 100) /
                  config.INITIAL_INVESTMENT
                ).toFixed(2) +
                "%"
            );
          }
          client
            .cancelOrder({
              symbol: config.CURRENCY + config.MARKET,
              orderId: OrderSellID
            })
            .catch(err => {
              console.log(err);
            });
        }

        if (result.status == "CANCELED") {
          filledBuyOrder = true;
          if (botMemory.telegram) {
            bot.sendMessage(
              config.BOT_CHAT,
              "\u{1f6a8} Ordem de compra " +
                OrderBuyID +
                " cancelada na exchange, gerando uma nova ordem."
            );
          }
        }
      })
      .catch(err => {
        throw err;
      });
  }

  if (OrderSellID != 0 && hasFundsSell == 1) {
    client
      .getOrder({
        symbol: config.CURRENCY + config.MARKET,
        orderId: OrderSellID
      })
      .then(result => {
        dateOrderSell = result.time;
        if (result.status == "FILLED") {
          filledSellOrder = true;
          if (botMemory.telegram) {
            bot.sendMessage(
              config.BOT_CHAT,
              "\u{1f911} Ordem de venda executada com sucesso. Saldo atual: " +
                config.MARKET +
                ": " +
                (marketBalanceLocked + marketBalanceFree).toFixed(4) +
                " " +
                config.CURRENCY +
                " " +
                (currencyBalanceLocked + currencyBalanceFree).toFixed(4) +
                " Lucro atual: " +
                (total - config.INITIAL_INVESTMENT).toFixed(4) +
                " USD" +
                " \u{1F4B0} " +
                (
                  ((total - config.INITIAL_INVESTMENT) * 100) /
                  config.INITIAL_INVESTMENT
                ).toFixed(2) +
                "%"
            );
          }
          client
            .cancelOrder({
              symbol: config.CURRENCY + config.MARKET,
              orderId: OrderBuyID
            })
            .catch(err => {
              console.log(err);
            });
        }

        if (result.status == "CANCELED") {
          filledSellOrder = true;
          if (botMemory.telegram) {
            bot.sendMessage(
              config.BOT_CHAT,
              "\u{1f6a8} Ordem de venda " +
                OrderSellID +
                " cancelada na exchange, gerando uma nova ordem."
            );
          }
        }
      })
      .catch(err => {
        throw err;
      });
  }

  if (config.ORDER_EXPIRE != 0) {
    date = new Date(dateOrderBuy);
    dateOrderBuyExpire = date.setHours(date.getHours() + config.ORDER_EXPIRE);
    if (
      dateOrderBuyExpire > 1546300800 &&
      Date.now() > dateOrderBuyExpire &&
      OrderBuyID != 0 &&
      buyPriceTemp != 0 &&
      countExpireBuy > 2
    ) {
      if (botMemory.telegram) {
        bot.sendMessage(
          config.BOT_CHAT,
          "\u{231b} A ordem de compra expirou em " +
            new Date(dateOrderSellExpire) +
            " sem execução do mercado. Timeout em " +
            config.ORDER_EXPIRE +
            " horas. Será gerada uma nova ordem de compra para operação."
        );
      }
      client
        .cancelOrder({
          symbol: config.CURRENCY + config.MARKET,
          orderId: OrderBuyID
        })
        .catch(err => {
          console.log(err);
        });
      countExpireBuy = 0;
    } else {
      countExpireBuy++;
    }

    date = new Date(dateOrderSell);
    dateOrderSellExpire = date.setHours(date.getHours() + config.ORDER_EXPIRE);
    if (
      dateOrderSellExpire > 1546300800 &&
      Date.now() > dateOrderSellExpire &&
      OrderSellID != 0 &&
      sellPriceTemp != 0 &&
      countExpireSell > 2
    ) {
      if (botMemory.telegram) {
        bot.sendMessage(
          config.BOT_CHAT,
          "\u{231b} A ordem de venda expirou em " +
            new Date(dateOrderSellExpire) +
            " sem execução do mercado. Timeout em " +
            config.ORDER_EXPIRE +
            " horas. Será gerada uma nova ordem de venda para operação."
        );
      }
      client
        .cancelOrder({
          symbol: config.CURRENCY + config.MARKET,
          orderId: OrderSellID
        })
        .catch(err => {
          console.log(err);
        });
      countExpireSell = 0;
    } else {
      countExpireSell++;
    }
  }

  if (
    config.AUTO_SPREAD == 1 &&
    SpreadTemp != 0 &&
    SpreadTemp != spreadOpera &&
    spreadOpera >= config.SPREAD_MIN
  ) {
    if (botMemory.telegram) {
      bot.sendMessage(
        config.BOT_CHAT,
        "\u{1f6a7} Ajuste no spread de mercado de " +
          SpreadTemp +
          " para " +
          spreadOpera +
          " para variação de " +
          changePrice +
          " %. As próximas ordens vão utilizar esta margem."
      );
    }
  }
  SpreadTemp = spreadOpera;
  changePriceTemp = changePrice;

  if (config.AUTO_SPREAD == 1) {
    if (
      (OrderSellID == 0 && OrderBuyID == 0) ||
      spreadOpera <= config.SPREAD_MIN
    ) {
      spreadOpera = config.SPREAD_MIN;
      buyPrice = (avgPrice * (1 - spreadOpera)).toFixed(4);
      sellPrice = (avgPrice * (1 + spreadOpera)).toFixed(4);
    } else {
      buyPrice = (avgPrice - spreadOpera).toFixed(4);
      sellPrice = (avgPrice + spreadOpera).toFixed(4);
    }
  } else {
    buyPrice = (avgPrice * (1 - config.SPREAD_BUY)).toFixed(4);
    sellPrice = (avgPrice * (1 + config.SPREAD_SELL)).toFixed(4);
  }

  client
    .myTrades({
      symbol: config.CURRENCY + config.MARKET
    })
    .then(result => {
      if (filledSellOrder == true) {
        for (let i = result.length - 1; i > 1; i--) {
          if (
            result[i].isBuyer == true &&
            filledSellOrder == true &&
            currencyBalanceFree >= 20
          ) {
            if (
              sellPrice - parseFloat(result[i].price).toFixed(4) <
              spreadOpera
            ) {
              let sellPriceTemp = (
                parseFloat(result[i].price).toFixed(4) *
                (1 + spreadOpera)
              ).toFixed(4);
              if (
                sellPriceTemp > avgPrice &&
                sellPriceTemp - avgPrice >= spreadOpera &&
                botMemory.notifySellMin == 0
              ) {
                sellPrice = sellPriceTemp;
                if (botMemory.telegram) {
                  bot.sendMessage(
                    config.BOT_CHAT,
                    "\u{2716} ALERTA: A ordem de venda está em um valor abaixo da diferença de spread " +
                      spreadOpera +
                      " da última ordem de compra no valor de " +
                      parseFloat(result[i].price).toFixed(4) +
                      " comparado ao preço atual de mercado em " +
                      avgPrice +
                      ". Ela teve seu valor reajustado para: " +
                      sellPrice +
                      "."
                  );
                }
              } else {
                if (botMemory.telegram && botMemory.notifySellMin == 0) {
                  bot.sendMessage(
                    config.BOT_CHAT,
                    "\u{2714} AVISO: A ordem de venda está dentro da diferença de spread " +
                      spreadOpera +
                      " da última ordem de compra no valor de " +
                      parseFloat(result[i].price).toFixed(4) +
                      ""
                  );
                }
              }
            } else {
              if (botMemory.telegram && botMemory.notifySellMin == 0) {
                bot.sendMessage(
                  config.BOT_CHAT,
                  "\u{2714} AVISO: A ordem de venda está dentro da diferença de spread " +
                    spreadOpera +
                    " da última ordem de compra no valor de " +
                    parseFloat(result[i].price).toFixed(4) +
                    ""
                );
              }
            }
            i = 0;
          }
        }
      }

      if (filledBuyOrder == true) {
        for (let i = result.length - 1; i > 1; i--) {
          if (
            result[i].isBuyer == false &&
            filledBuyOrder == true &&
            marketBalanceFree >= 20
          ) {
            if (
              buyPrice - parseFloat(result[i].price).toFixed(4) <
              spreadOpera
            ) {
              let buyPriceTemp = (
                parseFloat(result[i].price).toFixed(4) *
                (1 - spreadOpera)
              ).toFixed(4);
              if (
                buyPriceTemp < avgPrice &&
                avgPrice - buyPriceTemp >= spreadOpera &&
                botMemory.notifyBuyMax == 0
              ) {
                buyPrice = buyPriceTemp;
                if (botMemory.telegram) {
                  bot.sendMessage(
                    config.BOT_CHAT,
                    "\u{2716} ALERTA: A ordem de compra está em um valor abaixo da diferença de spread " +
                      spreadOpera +
                      " da última ordem de venda no valor de " +
                      parseFloat(result[i].price).toFixed(4) +
                      " comparado ao preço atual de mercado em " +
                      avgPrice +
                      ". Ela teve seu valor reajustado para: " +
                      buyPrice +
                      "."
                  );
                }
              } else {
                if (botMemory.telegram && botMemory.notifyBuyMax == 0) {
                  bot.sendMessage(
                    config.BOT_CHAT,
                    "\u{2714} AVISO: A ordem de compra está dentro da diferença de spread " +
                      spreadOpera +
                      " da última ordem de venda no valor de " +
                      parseFloat(result[i].price).toFixed(4) +
                      ""
                  );
                }
              }
            } else {
              if (botMemory.telegram && botMemory.notifyBuyMax == 0) {
                bot.sendMessage(
                  config.BOT_CHAT,
                  "\u{2714} AVISO: A ordem de compra está dentro da diferença de spread " +
                    spreadOpera +
                    " da última ordem de venda no valor de " +
                    parseFloat(result[i].price).toFixed(4) +
                    ""
                );
              }
            }
            i = 0;
          }
        }
      }
    });

  client
    .dailyStats({ symbol: "BTC" + config.MARKET })
    .then(result => {
      console.log(
        "DEFINIDOS....: Compra " + buyPrice + " e Venda " + sellPrice
      );

      let mess = `
      TIMEOUT ORDERM: ${config.ORDER_EXPIRE} horas \n
      HORA ATUAL....: ${new Date()}\n
      ============== DADOS DE COMPRA ============\n
      VALOR COMPRA..: ${botMemory.buyAmount}\n
      PRECO COMPRA..: ${parseFloat(botMemory.buyPriceTemp).toFixed(4)}\n
      ID ORDEM BUY..: ${OrderBuyID}\n
      EXPIRA EM.....: ${new Date(dateOrderBuyExpire)}\n
      "============== DADOS DE VENDA =============\n
      VALOR VENDA...: ${sellAmount}\n
      PRECO VENDA...: ${parseFloat(sellPriceTemp).toFixed(4)}\n
      ID ORDEM SELL.: ${OrderSellID}\n
      EXPIRA EM.....: ${new Date(dateOrderSellExpire)}
      ===========================================`;
      console.log(mess);
      client
        .openOrders({
          symbol: config.CURRENCY + config.MARKET
        })
        .then(result => {
          if (filledBuyOrder == true) {
            if (
              (marketBalanceFree > 20 || marketBalanceFree >= buyAmount) &&
              buyPrice < config.BUY_MAX
            ) {
              if (marketBalanceFree > 20 && marketBalanceFree <= buyAmount) {
                buyAmount = parseFloat(marketBalanceFree).toFixed(2);
              }
              client
                .order({
                  symbol: config.CURRENCY + config.MARKET,
                  side: "BUY",
                  quantity: buyAmount,
                  price: buyPrice,
                  useServerTime: true
                })
                .then(result => {
                  totalCompras++;
                  OrderBuyID = result.orderId;
                  filledBuyOrder = false;
                })
                .catch(err => {
                  totalCompras--;
                  throw err;
                });
              botMemory.notifyBuyMax = 0;
              hasFundsBuy = 1;
              buyPriceTemp = buyPrice;
              if (botMemory.telegram) {
                bot.sendMessage(
                  config.BOT_CHAT,
                  "\u{1F4C9} Order de compra criada com sucesso: Quantidade comprada: \u{1f4b5} " +
                    buyAmount +
                    ", valor de compra: \u{1f3f7} " +
                    buyPrice +
                    " utilizando spread em " +
                    spreadOpera +
                    "."
                );
              }
            } else {
              if (
                botMemory.telegram &&
                botMemory.notifyBuyMax == 0 &&
                marketBalanceFree >= buyAmount
              ) {
                bot.sendMessage(
                  config.BOT_CHAT,
                  "\u{274C} O valor de compra do mercado esta acima do definido em " +
                    config.BUY_MAX +
                    ". O bot vai aguardar o preço reduzir até o valor definido para evitar prejuízos."
                );
                botMemory.notifyBuyMax = 1;
              }
              if (botMemory.telegram && hasFundsBuy == 1 && botMemory.notifyBuyMax == 0) {
                bot.sendMessage(
                  config.BOT_CHAT,
                  "\u{1F6AB} O bot está sem saldo para compras em " +
                    config.MARKET +
                    ". Seu saldo atual é: " +
                    marketBalanceFree +
                    ". O bot vai aguardar até que uma compra seja executada para liberar saldo."
                );
                botMemory.notifyBuyMax = 1;
              }
              OrderBuyID = 0;
              hasFundsBuy = 0;
            }
          }

          if (filledSellOrder == true) {
            if (
              (currencyBalanceFree > 20 || currencyBalanceFree >= sellAmount) &&
              sellPrice > config.SELL_MIN
            ) {
              if (
                currencyBalanceFree > 20 &&
                currencyBalanceFree <= sellAmount
              ) {
                sellAmount = parseFloat(currencyBalanceFree).toFixed(2);
              }
              client
                .order({
                  symbol: config.CURRENCY + config.MARKET,
                  side: "SELL",
                  quantity: sellAmount,
                  price: sellPrice,
                  useServerTime: true
                })
                .then(result => {
                  totalVendas++;
                  OrderSellID = result.orderId;
                  filledSellOrder = false;
                })
                .catch(err => {
                  totalVendas--;
                  throw err;
                });
              botMemory.notifySellMin = 0;
              hasFundsSell = 1;
              sellPriceTemp = sellPrice;
              if (botMemory.telegram) {
                bot.sendMessage(
                  config.BOT_CHAT,
                  "\u{1F4C8} Order de venda criada com sucesso: Quantidade vendida: \u{1f4b5} " +
                    sellAmount +
                    ", valor de venda: \u{1f3f7} " +
                    sellPrice +
                    " utilizando spread em " +
                    spreadOpera +
                    "."
                );
              }
            } else {
              if (
                botMemory.telegram &&
                botMemory.notifySellMin == 0 &&
                currencyBalanceFree >= sellAmount
              ) {
                bot.sendMessage(
                  config.BOT_CHAT,
                  "\u{274C} O valor de venda do mercado esta abaixo do definido em " +
                    config.SELL_MIN +
                    ". O bot vai aguardar o preço aumentar até o valor definido para evitar prejuízos."
                );
                botMemory.notifySellMin = 1;
              }
              if (botMemory.telegram && hasFundsSell == 1 && botMemory.notifySellMin == 0) {
                bot.sendMessage(
                  config.BOT_CHAT,
                  "\u{1F6AB} O bot está sem saldo para vendas em " +
                    config.CURRENCY +
                    ". Seu saldo atual é: " +
                    currencyBalanceFree +
                    ". O bot vai aguardar até que uma compra seja executada para liberar saldo."
                );
                botMemory.notifySellMin = 1;
              }
              OrderSellID = 0;
              hasFundsSell = 0;
            }
          }
        })
        .catch(err => {
          throw err;
        });
    })
    .catch(err => {
      throw err;
    });
}

// limpa o console
console.clear();
// define as variaveis
let botMemory = {
  notifyBuyMax: 0,
  notifySellMin: 0,
  otherStables: 0,
  hasFundsBuy: 1,
  hasFundsSell: 1,
  countExpireBuy: 0,
  countExpireSell: 0,
  dateOrderBuy: 0,
  dateOrderBuyExpire: 0,
  dateOrderSell: 0,
  dateOrderSellExpire: 0,
  buyPriceTemp: 0,
  sellPriceTemp: 0,
  changePriceTemp: 0,
  startTime: Date.now(),
  avgPrice: 0,
  OrderBuyID: 0,
  filledBuyOrder: true,
  filledSellOrder: true,
  OrderSellID: 0,
  SpreadTemp: 0,
  totalCompras: 0,
  totalVendas: 0,
  marketBalanceLocked: 0,
  marketBalanceFree: 0,
  currencyBalanceLocked: 0,
  currencyBalanceFree: 0,
  total: 0,
  setAmount: 0,
  setBuyOrder: 0,
  saldo_TUSD: 0,
  saldo_USDT: 0,
  saldo_USDC: 0,
  saldo_PAX: 0,
  saldo_USDS: 0,
  saldo_USDSB: 0,
  total_stable: 0,
  telegram = false
};

console.log("Iniciando...");

task.start();

app.get("/*", (req, res) => {
  let total_investiment = (botMemory.total - config.INITIAL_INVESTMENT).toFixed(8);
  res.json({
    initialInvestment: config.INITIAL_INVESTMENT,
    market: config.MARKET,
    currency: config.CURRENCY,
    balances: {
      usdt: parseFloat(botMemory.saldo_USDT),
      tusd: parseFloat(botMemory.saldo_TUSD),
      pax: parseFloat(botMemory.saldo_PAX),
      usdc: parseFloat(botMemory.saldo_USDC),
      usds: parseFloat(botMemory.saldo_USDS),
      usdsb: parseFloat(botMemory.saldo_USDSB)
    },
    profit: {
      USD: parseFloat(total_investiment),
      percent: parseFloat(
        (
          ((total - config.INITIAL_INVESTMENT) * 100) /
          config.INITIAL_INVESTMENT
        ).toFixed(2)
      )
    }
  });
});

app.listen(config.LISTEN_PORT);
