import config from "./config.js";
import cron from "node-cron";
import express from "express";
import Binance from "binance-api-node";
import Telegraf from "telegraf";
import botMemory from "./botMemory.js";

const app = express();

let tgBot = null;

const client = Binance({
  apiKey: config.API_KEY,
  apiSecret: config.SECRET_KEY
});

if (config.BOT_TOKEN != "" && config.BOT_CHAT != "") {
  tgBot = new Telegraf(config.BOT_TOKEN);
  tgBot.telegram.sendMessage(
    config.BOT_CHAT,
    "\u{1F916} stablecoins-infinity-profit-bot iniciando"
  );
  botMemory.telegram = true;
}

function showMessage(message) {
  if (botMemory.telegram) tgBot.telegram.sendMessage(config.BOT_CHAT, message);
  console.log(message);
}

client
  .openOrders({
    symbol: config.CURRENCY + config.MARKET
  })
  .then(result => {
    for (let i = 0; i < result.length; i++) {
      if (result[i].side == "BUY") {
        botMemory.filledBuyOrder = false;
        botMemory.OrderBuyID = result[i].orderId;
        botMemory.buyAmount = result[i].origQty;
        botMemory.buyPriceTemp = result[i].price;
      } else {
        botMemory.filledSellOrder = false;
        botMemory.OrderSellID = result[i].orderId;
        botMemory.sellAmount = result[i].origQty;
        botMemory.sellPriceTemp = result[i].price;
      }
      showMessage(
        `Order de ${
          result[i].side === "BUY" ? "compra" : "venda"
        } encontrada: ${result[i].orderId} No total de: ${
          result[i].origQty
        } no valor de: ${result[i].price}`
      );
    }
  });

const task = cron.schedule(
  `*/${config.LOOP_TIME} * * * * *`,
  () => {
    client
      .dailyStats({ symbol: config.CURRENCY + config.MARKET })
      .then(result => {
        botMemory.changePrice = parseFloat(result.priceChangePercent);
        botMemory.avgPrice = parseFloat(result.lastPrice);
        botMemory.minDay = parseFloat(result.lowPrice);
        botMemory.maxDay = parseFloat(result.highPrice);
        botMemory.spreadDay = parseFloat(
          botMemory.maxDay - botMemory.minDay
        ).toFixed(4);
        botMemory.spreadOpera = parseFloat(botMemory.spreadDay / 4);
        botMemory.otherStables = 0;
        client
          .accountInfo({ useServerTime: true })
          .then(result => {
            for (let i = 0; i < result.balances.length; i++) {
              if (result.balances[i].asset == "BNB") {
                botMemory.balance_BNB =
                  parseFloat(result.balances[i].locked) +
                  parseFloat(result.balances[i].free);
              } else if (result.balances[i].asset == "TUSD") {
                botMemory.balance_TUSD = (
                  parseFloat(result.balances[i].locked) +
                  parseFloat(result.balances[i].free)
                ).toFixed(8);
              } else if (result.balances[i].asset == "USDT") {
                botMemory.balance_USDT = (
                  parseFloat(result.balances[i].locked) +
                  parseFloat(result.balances[i].free)
                ).toFixed(8);
              } else if (result.balances[i].asset == "USDC") {
                botMemory.balance_USDC = (
                  parseFloat(result.balances[i].locked) +
                  parseFloat(result.balances[i].free)
                ).toFixed(8);
              } else if (result.balances[i].asset == "PAX") {
                botMemory.balance_PAX = (
                  parseFloat(result.balances[i].locked) +
                  parseFloat(result.balances[i].free)
                ).toFixed(8);
              } else if (result.balances[i].asset == "USDS") {
                botMemory.balance_USDS = (
                  parseFloat(result.balances[i].locked) +
                  parseFloat(result.balances[i].free)
                ).toFixed(8);
              } else if (result.balances[i].asset == "USDSB") {
                botMemory.balance_USDSB = (
                  parseFloat(result.balances[i].locked) +
                  parseFloat(result.balances[i].free)
                ).toFixed(8);
              } else if (result.balances[i].asset == config.MARKET) {
                botMemory.marketBalanceLocked = parseFloat(
                  result.balances[i].locked
                );
                botMemory.marketBalanceFree = parseFloat(
                  result.balances[i].free
                );
              } else if (result.balances[i].asset == config.CURRENCY) {
                botMemory.currencyBalanceLocked = parseFloat(
                  result.balances[i].locked
                );
                botMemory.currencyBalanceFree = parseFloat(
                  result.balances[i].free
                );
              } else if (config.COINS.includes(result.balances[i].asset)) {
                if (
                  result.balances[i].asset != config.MARKET &&
                  result.balances[i].asset != config.CURRENCY
                ) {
                  botMemory.botMemory.otherStables =
                    botMemory.otherStables +
                    (parseFloat(result.balances[i].locked) +
                      parseFloat(result.balances[i].free));
                }
              }
            }

            botMemory.total = (
              botMemory.marketBalanceLocked +
              botMemory.marketBalanceFree +
              botMemory.currencyBalanceLocked +
              botMemory.currencyBalanceFree +
              botMemory.botMemory.otherStables
            ).toFixed(8);

            if (
              botMemory.marketBalanceLocked + botMemory.marketBalanceFree <
              botMemory.total / 2
            ) {
              botMemory.buyAmount = (
                ((botMemory.total / 2) * config.BUY_VALUE) /
                100
              ).toFixed(2);
              botMemory.sellAmount = (
                ((botMemory.total / 2) * config.BUY_VALUE) /
                100
              ).toFixed(2);
            } else {
              if (
                botMemory.currencyBalanceLocked +
                  botMemory.currencyBalanceFree <
                botMemory.total / 2
              ) {
                botMemory.buyAmount = (
                  ((botMemory.total / 2) * config.BUY_VALUE) /
                  100
                ).toFixed(2);
                botMemory.sellAmount = (
                  ((botMemory.total / 2) * config.BUY_VALUE) /
                  100
                ).toFixed(2);
              } else {
                if (!botMemory.settedAmount) {
                  botMemory.buyAmount = (
                    ((botMemory.marketBalanceLocked +
                      botMemory.marketBalanceFree) *
                      config.BUY_VALUE) /
                    100
                  ).toFixed(2);
                  botMemory.sellAmount = (
                    ((botMemory.currencyBalanceLocked +
                      botMemory.currencyBalanceFree) *
                      config.BUY_VALUE) /
                    100
                  ).toFixed(2);
                  botMemory.settedAmount = true;
                }
              }
            }

            if (config.AUTO_SPREAD) {
              botMemory.status_spread = "ATIVADO";
            } else {
              botMemory.status_spread = "DESATIVADO";
            }

            console.clear();
            console.log(`
            ===========================================
            SALDO ${config.MARKET}...: ${botMemory.marketBalanceLocked +
              botMemory.marketBalanceFree}\n
            SALDO ${config.CURRENCY}...: ${botMemory.currencyBalanceLocked +
              botMemory.currencyBalanceFree}\n
            OUTRAS STABLE: ${botMemory.otherStables.toFixed(8)}\n
            SALDO BNB....: ${botMemory.balanceBNB}\n
            SALDO TOTAL..: ${botMemory.total} USD\n
            AUTO SPREAD..: ${botMemory.status_spread}\n
            MINIMA DO DIA: ${botMemory.minDay}\n
            MAXIMA DO DIA: ${botMemory.maxDay}\n
            ${config.CURRENCY + config.MARKET}.....: ${botMemory.avgPrice}\n
            VARIACAO 24H.: ${botMemory.changePrice} %\n
            SPREAD 24H...: ${botMemory.spreadDay}\n
            SPREAD OPERA.: ${botMemory.spreadOpera}\n
            SALDO INICIAL: ${config.INITIAL_INVESTMENT} USD\n
            LUCRO........: ${(
              botMemory.total - config.INITIAL_INVESTMENT
            ).toFixed(4)} USD\n
                           ${(
                             ((botMemory.total - config.INITIAL_INVESTMENT) *
                               100) /
                             config.INITIAL_INVESTMENT
                           ).toFixed(2)} %\n
            ===========================================
            UPTIME.......: ${(
              (Math.floor(+new Date() / 1000) - botMemory.startTime) /
              3600
            ).toFixed(2)} horas
            ORDENS.......: VENDAS: [${botMemory.totalSells}] COMPRAS: [${
              botMemory.totalBuys
            }]`);

            simpleStrategy();
          })
          .catch(err => {
            throw err;
          });
      })
      .catch(err => {
        console.error(err);
      });
  },
  { scheduled: false }
);

function simpleStrategy() {
  if (botMemory.OrderBuyID != 0 && botMemory.hasFundsBuy) {
    client
      .getOrder({
        symbol: config.CURRENCY + config.MARKET,
        orderId: botMemory.OrderBuyID
      })
      .then(result => {
        botMemory.dateOrderBuy = result.time;
        if (result.status == "FILLED") {
          botMemory.filledBuyOrder = true;
          if (botMemory.telegram) {
            tgBot.telegram.sendMessage(
              config.BOT_CHAT,
              `\u{1f911} Ordem de compra executada com sucesso. Saldo atual: ${
                config.MARKET
              } : ${(
                botMemory.marketBalanceLocked + botMemory.marketBalanceFree
              ).toFixed(4)} ${config.CURRENCY}${(
                botMemory.currencyBalanceLocked + botMemory.currencyBalanceFree
              ).toFixed(4)} Lucro atual: ${(
                botMemory.total - config.INITIAL_INVESTMENT
              ).toFixed(4)} USD \u{1F4B0} ${(
                ((botMemory.total - config.INITIAL_INVESTMENT) * 100) /
                config.INITIAL_INVESTMENT
              ).toFixed(2)}%`
            );
          }
          client
            .cancelOrder({
              symbol: config.CURRENCY + config.MARKET,
              orderId: botMemory.OrderSellID
            })
            .catch(err => {
              console.error(err);
            });
        }

        if (result.status == "CANCELED") {
          botMemory.filledBuyOrder = true;
          if (botMemory.telegram) {
            tgBot.telegram.sendMessage(
              config.BOT_CHAT,
              `\u{1f6a8} Ordem de compra ${botMemory.OrderBuyID} cancelada na exchange, gerando uma nova ordem.`
            );
          }
        }
      })
      .catch(err => {
        throw err;
      });
  }

  if (botMemory.OrderSellID != 0 && botMemory.hasFundsSell) {
    client
      .getOrder({
        symbol: config.CURRENCY + config.MARKET,
        orderId: botMemory.OrderSellID
      })
      .then(result => {
        botMemory.dateOrderSell = result.time;
        if (result.status == "FILLED") {
          botMemory.filledSellOrder = true;
          if (botMemory.telegram) {
            tgBot.telegram.sendMessage(
              config.BOT_CHAT,
              "\u{1f911} Ordem de venda executada com sucesso. Saldo atual: " +
                config.MARKET +
                ": " +
                (
                  botMemory.marketBalanceLocked + botMemory.marketBalanceFree
                ).toFixed(4) +
                " " +
                config.CURRENCY +
                " " +
                (
                  botMemory.currencyBalanceLocked +
                  botMemory.currencyBalanceFree
                ).toFixed(4) +
                " Lucro atual: " +
                (botMemory.total - config.INITIAL_INVESTMENT).toFixed(4) +
                " USD" +
                " \u{1F4B0} " +
                (
                  ((botMemory.total - config.INITIAL_INVESTMENT) * 100) /
                  config.INITIAL_INVESTMENT
                ).toFixed(2) +
                "%"
            );
          }
          client
            .cancelOrder({
              symbol: config.CURRENCY + config.MARKET,
              orderId: botMemory.OrderBuyID
            })
            .catch(err => {
              console.error(err);
            });
        }

        if (result.status == "CANCELED") {
          botMemory.filledSellOrder = true;
          if (botMemory.telegram) {
            tgBot.telegram.sendMessage(
              config.BOT_CHAT,
              "\u{1f6a8} Ordem de venda " +
                botMemory.OrderSellID +
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
    botMemory.date = new Date(botMemory.dateOrderBuy);
    botMemory.dateOrderBuyExpire = botMemory.date.setHours(
      botMemory.date.getHours() + config.ORDER_EXPIRE
    );
    if (
      botMemory.dateOrderBuyExpire > 1546300800 &&
      Date.now() > botMemory.dateOrderBuyExpire &&
      botMemory.OrderBuyID != 0 &&
      botMemory.buyPriceTemp != 0 &&
      botMemory.countExpireBuy > 2
    ) {
      if (botMemory.telegram) {
        tgBot.telegram.sendMessage(
          config.BOT_CHAT,
          "\u{231b} A ordem de compra expirou em " +
            new Date(botMemory.dateOrderSellExpire) +
            " sem execução do mercado. Timeout em " +
            config.ORDER_EXPIRE +
            " horas. Será gerada uma nova ordem de compra para operação."
        );
      }
      client
        .cancelOrder({
          symbol: config.CURRENCY + config.MARKET,
          orderId: botMemory.OrderBuyID
        })
        .catch(err => {
          console.error(err);
        });
      botMemory.countExpireBuy = 0;
    } else {
      botMemory.countExpireBuy++;
    }

    botMemory.date = new Date(botMemory.dateOrderSell);
    botMemory.dateOrderSellExpire = botMemory.date.setHours(
      botMemory.date.getHours() + config.ORDER_EXPIRE
    );
    if (
      botMemory.dateOrderSellExpire > 1546300800 &&
      Date.now() > botMemory.dateOrderSellExpire &&
      botMemory.OrderSellID != 0 &&
      botMemory.sellPriceTemp != 0 &&
      botMemory.countExpireSell > 2
    ) {
      if (botMemory.telegram) {
        tgBot.telegram.sendMessage(
          config.BOT_CHAT,
          "\u{231b} A ordem de venda expirou em " +
            new Date(botMemory.dateOrderSellExpire) +
            " sem execução do mercado. Timeout em " +
            config.ORDER_EXPIRE +
            " horas. Será gerada uma nova ordem de venda para operação."
        );
      }
      client
        .cancelOrder({
          symbol: config.CURRENCY + config.MARKET,
          orderId: botMemory.OrderSellID
        })
        .catch(err => {
          console.error(err);
        });
      botMemory.countExpireSell = 0;
    } else {
      botMemory.countExpireSell++;
    }
  }

  if (
    config.AUTO_SPREAD &&
    botMemory.SpreadTemp != 0 &&
    botMemory.SpreadTemp != botMemory.spreadOpera &&
    botMemory.spreadOpera >= config.SPREAD_MIN
  ) {
    if (botMemory.telegram) {
      tgBot.telegram.sendMessage(
        config.BOT_CHAT,
        "\u{1f6a7} Ajuste no spread de mercado de " +
          botMemory.SpreadTemp +
          " para " +
          botMemory.spreadOpera +
          " para variação de " +
          botMemory.changePrice +
          " %. As próximas ordens vão utilizar esta margem."
      );
    }
  }
  botMemory.SpreadTemp = botMemory.spreadOpera;
  botMemory.changePriceTemp = botMemory.changePrice;

  if (config.AUTO_SPREAD) {
    if (
      (botMemory.OrderSellID == 0 && botMemory.OrderBuyID == 0) ||
      botMemory.spreadOpera <= config.SPREAD_MIN
    ) {
      botMemory.spreadOpera = config.SPREAD_MIN;
      botMemory.buyPrice = (
        botMemory.avgPrice *
        (1 - botMemory.spreadOpera)
      ).toFixed(4);
      botMemory.sellPrice = (
        botMemory.avgPrice *
        (1 + botMemory.spreadOpera)
      ).toFixed(4);
    } else {
      botMemory.buyPrice = (botMemory.avgPrice - botMemory.spreadOpera).toFixed(
        4
      );
      botMemory.sellPrice = (
        botMemory.avgPrice + botMemory.spreadOpera
      ).toFixed(4);
    }
  } else {
    botMemory.buyPrice = (botMemory.avgPrice * (1 - config.SPREAD_BUY)).toFixed(
      4
    );
    botMemory.sellPrice = (
      botMemory.avgPrice *
      (1 + config.SPREAD_SELL)
    ).toFixed(4);
  }

  client
    .myTrades({
      symbol: config.CURRENCY + config.MARKET
    })
    .then(result => {
      if (botMemory.filledSellOrder) {
        for (let i = result.length - 1; i > 1; i--) {
          if (
            result[i].isBuyer &&
            botMemory.filledSellOrder &&
            botMemory.currencyBalanceFree >= 20
          ) {
            if (
              botMemory.sellPrice - parseFloat(result[i].price).toFixed(4) <
              botMemory.spreadOpera
            ) {
              let sellPriceTemp = (
                parseFloat(result[i].price).toFixed(4) *
                (1 + botMemory.spreadOpera)
              ).toFixed(4);
              if (
                sellPriceTemp > botMemory.avgPrice &&
                sellPriceTemp - botMemory.avgPrice >= botMemory.spreadOpera &&
                !botMemory.notifySellMin
              ) {
                botMemory.sellPrice = sellPriceTemp;
                if (botMemory.telegram) {
                  tgBot.telegram.sendMessage(
                    config.BOT_CHAT,
                    "\u{2716} ALERTA: A ordem de venda está em um valor abaixo da diferença de spread " +
                      botMemory.spreadOpera +
                      " da última ordem de compra no valor de " +
                      parseFloat(result[i].price).toFixed(4) +
                      " comparado ao preço atual de mercado em " +
                      botMemory.avgPrice +
                      ". Ela teve seu valor reajustado para: " +
                      botMemory.sellPrice +
                      "."
                  );
                }
              } else {
                if (botMemory.telegram && !botMemory.notifySellMin) {
                  tgBot.telegram.sendMessage(
                    config.BOT_CHAT,
                    "\u{2714} AVISO: A ordem de venda está dentro da diferença de spread " +
                      botMemory.spreadOpera +
                      " da última ordem de compra no valor de " +
                      parseFloat(result[i].price).toFixed(4) +
                      ""
                  );
                }
              }
            } else {
              if (botMemory.telegram && !botMemory.notifySellMin) {
                tgBot.telegram.sendMessage(
                  config.BOT_CHAT,
                  "\u{2714} AVISO: A ordem de venda está dentro da diferença de spread " +
                    botMemory.spreadOpera +
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

      if (botMemory.filledBuyOrder) {
        for (let i = result.length - 1; i > 1; i--) {
          if (
            !result[i].isBuyer &&
            botMemory.filledBuyOrder &&
            botMemory.marketBalanceFree >= 20
          ) {
            if (
              botMemory.buyPrice - parseFloat(result[i].price).toFixed(4) <
              botMemory.spreadOpera
            ) {
              let buyPriceTemp = (
                parseFloat(result[i].price).toFixed(4) *
                (1 - botMemory.spreadOpera)
              ).toFixed(4);
              if (
                buyPriceTemp < botMemory.avgPrice &&
                botMemory.avgPrice - buyPriceTemp >= botMemory.spreadOpera &&
                botMemory.notifyBuyMax == 0
              ) {
                botMemory.buyPrice = buyPriceTemp;
                if (botMemory.telegram) {
                  tgBot.telegram.sendMessage(
                    config.BOT_CHAT,
                    `\u{2716} ALERTA: A ordem de compra está em um valor abaixo da diferença de spread ${
                      botMemory.spreadOpera
                    } da última ordem de venda no valor de ${parseFloat(
                      result[i].price
                    ).toFixed(4)} comparado ao preço atual de mercado em ${
                      botMemory.avgPrice
                    }. Ela teve seu valor reajustado para: ${
                      botMemory.buyPrice
                    }.`
                  );
                }
              } else {
                if (botMemory.telegram && !botMemory.notifyBuyMax) {
                  tgBot.telegram.sendMessage(
                    config.BOT_CHAT,
                    "\u{2714} AVISO: A ordem de compra está dentro da diferença de spread " +
                      botMemory.spreadOpera +
                      " da última ordem de venda no valor de " +
                      parseFloat(result[i].price).toFixed(4) +
                      ""
                  );
                }
              }
            } else {
              if (botMemory.telegram && !botMemory.notifyBuyMax) {
                tgBot.telegram.sendMessage(
                  config.BOT_CHAT,
                  "\u{2714} AVISO: A ordem de compra está dentro da diferença de spread " +
                    botMemory.spreadOpera +
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

  console.log(`
      DEFINIDOS....: Compra ${botMemory.buyPrice} e Venda ${botMemory.sellPrice}
      TIMEOUT ORDERM: ${config.ORDER_EXPIRE} horas \n
      HORA ATUAL....: ${new Date()}\n
      ============== DADOS DE COMPRA ============\n
      VALOR COMPRA..: ${botMemory.buyAmount}\n
      PRECO COMPRA..: ${parseFloat(botMemory.buyPriceTemp).toFixed(4)}\n
      ID ORDEM BUY..: ${botMemory.OrderBuyID}\n
      EXPIRA EM.....: ${new Date(botMemory.dateOrderBuyExpire)}\n
      "============== DADOS DE VENDA =============\n
      VALOR VENDA...: ${botMemory.sellAmount}\n
      PRECO VENDA...: ${parseFloat(botMemory.sellPriceTemp).toFixed(4)}\n
      ID ORDEM SELL.: ${botMemory.OrderSellID}\n
      EXPIRA EM.....: ${new Date(botMemory.dateOrderSellExpire)}
      ===========================================`);

  if (botMemory.filledBuyOrder) {
    if (
      (botMemory.marketBalanceFree > 20 ||
        botMemory.marketBalanceFree >= botMemory.buyAmount) &&
      botMemory.buyPrice < config.BUY_MAX
    ) {
      if (
        botMemory.marketBalanceFree > 20 &&
        botMemory.marketBalanceFree <= botMemory.buyAmount
      ) {
        botMemory.buyAmount = parseFloat(botMemory.marketBalanceFree).toFixed(
          2
        );
      }
      client
        .order({
          symbol: config.CURRENCY + config.MARKET,
          side: "BUY",
          quantity: botMemory.buyAmount,
          price: botMemory.buyPrice,
          useServerTime: true
        })
        .then(result => {
          botMemory.totalBuys++;
          botMemory.OrderBuyID = result.orderId;
          botMemory.filledBuyOrder = false;
        })
        .catch(err => {
          botMemory.totalBuys--;
          throw err;
        });
      botMemory.notifyBuyMax = false;
      botMemory.hasFundsBuy = true;
      botMemory.buyPriceTemp = botMemory.buyPrice;
      if (botMemory.telegram) {
        tgBot.telegram.sendMessage(
          config.BOT_CHAT,
          "\u{1F4C9} Order de compra criada com sucesso: Quantidade comprada: \u{1f4b5} " +
            botMemory.buyAmount +
            ", valor de compra: \u{1f3f7} " +
            botMemory.buyPrice +
            " utilizando spread em " +
            botMemory.spreadOpera +
            "."
        );
      }
    } else {
      if (
        botMemory.telegram &&
        botMemory.notifyBuyMax == 0 &&
        botMemory.marketBalanceFree >= botMemory.buyAmount
      ) {
        tgBot.telegram.sendMessage(
          config.BOT_CHAT,
          "\u{274C} O valor de compra do mercado esta acima do definido em " +
            config.BUY_MAX +
            ". O bot vai aguardar o preço reduzir até o valor definido para evitar prejuízos."
        );
        botMemory.notifyBuyMax = true;
      }
      if (
        botMemory.telegram &&
        botMemory.hasFundsBuy &&
        botMemory.notifyBuyMax == 0
      ) {
        tgBot.telegram.sendMessage(
          config.BOT_CHAT,
          "\u{1F6AB} O bot está sem saldo para compras em " +
            config.MARKET +
            ". Seu saldo atual é: " +
            botMemory.marketBalanceFree +
            ". O bot vai aguardar até que uma compra seja executada para liberar saldo."
        );
        botMemory.notifyBuyMax = true;
      }
      botMemory.OrderBuyID = 0;
      botMemory.hasFundsBuy = false;
    }
  }

  if (botMemory.filledSellOrder) {
    if (
      (botMemory.currencyBalanceFree > 20 ||
        botMemory.currencyBalanceFree >= botMemory.sellAmount) &&
      botMemory.sellPrice > config.SELL_MIN
    ) {
      if (
        botMemory.currencyBalanceFree > 20 &&
        botMemory.currencyBalanceFree <= botMemory.sellAmount
      ) {
        botMemory.sellAmount = parseFloat(
          botMemory.currencyBalanceFree
        ).toFixed(2);
      }
      client
        .order({
          symbol: config.CURRENCY + config.MARKET,
          side: "SELL",
          quantity: botMemory.sellAmount,
          price: botMemory.sellPrice,
          useServerTime: true
        })
        .then(result => {
          botMemory.totalSells++;
          botMemory.OrderSellID = result.orderId;
          botMemory.filledSellOrder = false;
        })
        .catch(err => {
          botMemory.totalSells--;
          throw err;
        });
      botMemory.notifySellMin = false;
      botMemory.hasFundsSell = true;
      botMemory.sellPriceTemp = botMemory.sellPrice;
      if (botMemory.telegram) {
        tgBot.telegram.sendMessage(
          config.BOT_CHAT,
          "\u{1F4C8} Order de venda criada com sucesso: Quantidade vendida: \u{1f4b5} " +
            botMemory.sellAmount +
            ", valor de venda: \u{1f3f7} " +
            botMemory.sellPrice +
            " utilizando spread em " +
            botMemory.spreadOpera +
            "."
        );
      }
    } else {
      if (
        botMemory.telegram &&
        !botMemory.notifySellMin &&
        botMemory.currencyBalanceFree >= botMemory.sellAmount
      ) {
        tgBot.telegram.sendMessage(
          config.BOT_CHAT,
          "\u{274C} O valor de venda do mercado esta abaixo do definido em " +
            config.SELL_MIN +
            ". O bot vai aguardar o preço aumentar até o valor definido para evitar prejuízos."
        );
        botMemory.notifySellMin = true;
      }
      if (
        botMemory.telegram &&
        botMemory.hasFundsSell &&
        !botMemory.notifySellMin
      ) {
        tgBot.telegram.sendMessage(
          config.BOT_CHAT,
          `\u{1F6AB} O bot está sem saldo para vendas em ${config.CURRENCY}. Seu saldo atual é: ${botMemory.currencyBalanceFree}. O bot vai aguardar até que uma compra seja executada para liberar saldo.`
        );
        botMemory.notifySellMin = true;
      }
      botMemory.OrderSellID = 0;
      botMemory.hasFundsSell = 0;
    }
  }
}

console.clear();
console.log("Iniciando...");

task.start();

app.get("/*", (req, res) => {
  let total_investiment = (botMemory.total - config.INITIAL_INVESTMENT).toFixed(
    8
  );
  res.json({
    initialInvestment: config.INITIAL_INVESTMENT,
    market: config.MARKET,
    currency: config.CURRENCY,
    balances: {
      usdt: parseFloat(botMemory.balance_USDT),
      tusd: parseFloat(botMemory.balance_TUSD),
      pax: parseFloat(botMemory.balance_PAX),
      usdc: parseFloat(botMemory.balance_USDC),
      usds: parseFloat(botMemory.balance_USDS),
      usdsb: parseFloat(botMemory.balance_USDSB)
    },
    profit: {
      USD: parseFloat(total_investiment),
      percent: parseFloat(
        (
          ((botMemory.total - config.INITIAL_INVESTMENT) * 100) /
          config.INITIAL_INVESTMENT
        ).toFixed(2)
      )
    }
  });
});

app.listen(config.LISTEN_PORT);
