# Stablecoins-Infinity-Profit-Bot
Old TUSD-USDT Infinity Profit Bot

## Funcionamento

É bem simples. O Bot se aproveita das pequenas variações entre as stablecoins. Em cada negociação, você ganha um pouco mais do que as taxas da Binance. Cada trade é mais lucrativo que o anterior.

O melhor? Nenhum risco de perder dinheiro! Nós só podemos ganhar!

## Instalação

1. Clone esse repositório e edite o arquivo config.json inserindo sua API key e Secret key da Binance.
- Insire qual par o Bot irá operar, em *MARKET* coloque o ID do mercado como está na Binance, em nosso exemplo iremos definir USDT.
- Insira a moeda do mercado que você irá operar, no exemplo abaixo estamos definindo TUSD como *CURRENCY*.

```bash
{
    "API_KEY": "example3X4MPL3example123",
    "SECRET_KEY": "example3X4MPL3example123",
    "CURRENCY": "TUSD",
    "MARKET" : "USDT",
    "SPREAD" : 0.0013,
    "LOOP_TIME": 15,
    "MAX_ASK": 1,
    "INITIAL_INVESTMENT": 20,
    "LISTEN_PORT" : 80
}
```
- Escolha qual será o seu *SPREAD*, por padrão usaremos 0.0013.
- Escolha o *MAX_ASK*, aqui você define o valor máximo para o Bot efetuar a compra de um ativo.
- *INITIAL_INVESTMENT*, como o próprio nome diz, deve ser o valor que você alocou na moeda definida em MARKET para iniciar o Bot.
- Agora se você deseja executar esse Bot em um servidor, a chave *LISTEN_PORT* é muito importante, por padrão aqui vem setado em 80.


2. Instale o NodeJS: https://nodejs.org/en/
3. Vá para a pasta bot com o terminal e execute

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

6. Seja paciente e espere seu saldo na moeda definida em *MARKET* aumentar

## Observações
Estamos atualizando frequentemente o BOT, perdas podem ocorrer, por isso so instale a versão em desenvolvimento se souber o que está fazendo.

O Bot possui uma API para consulta dos dados em tempo real. Para usá-la basta acessar o IP do seu servidor e a porta definida no arquivo de configurações. Caso esteja executando localmente, para acessar a api o caminho seria como algo assim:
```bash
  localhost:80
```
## Créditos
1. Ideia [@usdkhey](https://github.com/usdkhey)
2. Algorítmo [@itxtoledo](https://github.com/itxtoledo)

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
