# TUSD-USDT Infinity Profit Bot

## Funcionamento

É bem simples, mas você deve refletir sobre isso. O bot se aproveita das pequenas variações entre o TUSD e o USDT. Em cada negociação, você ganha um pouco mais do que as taxas da Binance. Cada trade é mais lucrativo que o anterior.

O mais bonito? Nenhum risco de perder dinheiro! Nós só podemos ganhar ... enquanto o tether não explodir.

## Instalação

Clone esse repositório e edite o arquivo config.json inserindo sua API key e Secret key da Binance.
Você também pode decidiar em qual par operar somente mudando CURRENCY para a moeda que será negociada e MARKET para o mercado desejado. 

Ex.: 

```bash
{
"CURRENCY": "TUSD", 
"MARKET": "USDT"
}
```
No caso acima você estará negociando no par TUSD USDT.

Instale o NodeJS: https://nodejs.org/en/

Vá para a pasta bot com o terminal e execute

```bash
npm install
```

## Utilização

1. Ter mais de US $20 em sua conta da Binance na moeda do mercado selecionado. 

Nota:

No arquivo config.json você encontrará o mercado USDT, caso queira negociar neste mercado você deverá comprar Tether antes de ligar o BOT.

2. Gere uma API, se não souber como se faz isso siga este tutorial: https://www.youtube.com/watch?v=OdzjaE6O31E

3. Coloque a API nos campos do arquivo config.json

4. Cancele todas as ordens que estiverem abertas no par que você for negociar

5. Inicie o BOT na pasta dele

```bash
npm start
```

6. Seja paciente e espere seu saldo em TUSD e USDT aumentar.

## Observações
Estamos atualizando frequentemente o BOT, perdas podem ocorrer, por isso so instale a versão em desenvolvimento se souber o que está fazendo.

## Créditos
Ideia inicial [@usdkhey](https://github.com/usdkhey)
Novo algoritmo [@itxtoledo](https://github.com/itxtoledo)

## Comunidade
Participe de nossa comunidade no [WhatsApp](https://chat.whatsapp.com/KxB0etimVPQL3ncEn8u7tO)
ou no [Telegram](https://t.me/bitragem).

## Patrocinadores
Tiago A Boaventura - 28/05/2019

## Contribua com o projeto
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

## Licença
[MIT](https://choosealicense.com/licenses/mit/)
