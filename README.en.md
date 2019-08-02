# Stablecoins-Infinity-Profit-Bot

Old TUSD-USDT Infinity Profit Bot

- [English](https://github.com/itxtoledo/Stablecoins-Infinity-Profit-Bot/blob/master/README.en.md)
- [Español - no completado](https://github.com/itxtoledo/Stablecoins-Infinity-Profit-Bot/blob/master/README.es.md)

## How it works

It's simple. This bot takes advantage of little variation between stablecoins. In every trade you get a little bit more than the Binance fees. Every trade is more profitable than the last one.

Do you know what? It's risk free! We can only have gains!

## Install

1. Download the last [release](https://github.com/itxtoledo/Stablecoins-Infinity-Profit-Bot/releases), uncompress and edit the config.json. Insert your Binance's API and Secret keys.
   - Insert the pair our Bot will trade in _MARKET_ just put the market ID as we find in Binance, for instance we will put USDT.
   - Insert the market's coin we want to trade as _CURRENCY_, for instance TUSD.
   - Type your _SPREAD_BUY_ and _SPREAD_SELL_. For now we will leave the default value.
   - In _MAX_ASK_, you can set the maximum value of the buy order.
   - _INITIAL_INVESTMENT_, it's the value you did deposit to start trading.
   - If you want to start this Bot in a Server, pay attention to the _LISTEN_PORT_ key. Very important to check this. Default is set to 3333 port.

```bash
{
    "API_KEY": "your_api_key",
    "SECRET_KEY": "your_secret_key",
    "CURRENCY": "TUSD",
    "MARKET" : "USDT",
    "SPREAD_SELL" : 0.00100,
    "SPREAD_BUY" : 0.00150,
    "LOOP_TIME": 15,
    "MAX_ASK": 1,
    "INITIAL_INVESTMENT": 20,
    "LISTEN_PORT" : 3333
}
```

2. Install NodeJS: https://nodejs.org/en/
   While developing we used the following versions:

```
Node v12.5.0
NPM 6.9.0
```

3. Open your terminal prompt and head to the bot folder. Then type and press Enter the following command:

```bash
npm install
```

## How to use

1. You must have more than \$20 USD in your Binance wallet in the coin you choose to trade.

Notice:

The config.json file is set for USDT market so if you want to trade this market you must have USD Tether before start the Bot.

2. Generate an API. If you don't know how to do it, watch this video: https://www.youtube.com/watch?v=OdzjaE6O31E
3. Insert your API keys in config.json file
4. Before start, just in case, cancel all open orders in the currency pair you want to trade
5. Start the bot as follows

```bash
  npm start
```

6. Be patient and wait your balance increase little by little.

## Notes

We are always updating this bot, losing trades may happen so only install the DEV realease if you know what you are doing.

This Bot have an API so you can get real time info. To use just access your IP server address and the Port you set before in the config file. If you are running local you can access the API like this:

```bash
  localhost:3333
```

## Credits

1. Idea [@usdkhey](https://github.com/usdkhey)
2. Algorithm [@itxtoledo](https://github.com/itxtoledo)

## Comunity

Join our comunity: [WhatsApp](https://chat.whatsapp.com/KxB0etimVPQL3ncEn8u7tO)
or [Telegram](https://t.me/bitragem).

## Sponsors

Tiago A Boaventura - 28/05/2019

## Make your donation and help our project

```bash
  USDS: 0x349d3038f6384fe5bdf18ba3bb38cb5f8ef86949
  USDC: 0x349d3038f6384fe5bdf18ba3bb38cb5f8ef86949
  TUSD: 0x349d3038f6384fe5bdf18ba3bb38cb5f8ef86949
  USDT: 1Ed87MBpJHc23eytYYRp6uP9H831Qtcwek
  BTC: 1GzbMuVjhHLibL9fvayfE5UUWg4enKTVR3
  LTC: LgJpDPgM3friu848oZnAMM9iVfX8TBLWhF
  ETH: 0x349d3038f6384fe5bdf18ba3bb38cb5f8ef86949
  DASH: Xwb4bKtbuLXsbfAtvbe6VCq5hmQJKA2tmF
```

## License

[MIT](https://choosealicense.com/licenses/mit/)
