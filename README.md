# Stablecoins-Infinity-Profit-Bot
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fitxtoledo%2FStablecoins-Infinity-Profit-Bot.svg?type=shield)](https://app.fossa.com/projects/git%2Bgithub.com%2Fitxtoledo%2FStablecoins-Infinity-Profit-Bot?ref=badge_shield)

[![Known Vulnerabilities](https://snyk.io/test/github/Guillerbr/Stablecoins-Infinity-Profit-Bot/badge.svg?targetFile=package.json)](https://snyk.io/test/github/Guillerbr/Stablecoins-Infinity-Profit-Bot?targetFile=package.json)

Old TUSD-USDT Infinity Profit Bot

## Funcionamento
O bot trabalha com stablecoins dentro da Binance, comprando e vendendo dentro de uma variação que os pares
de stable coins possuem. A estratégia consiste nos seguintes passos

Dividir o capital que o bot vai trabalhar em duas partes em cada par de stable coin:

50% USDT
50% USDC

Recomendamos pares com maior volume dentro da exchange

Lembrando sempre importante um saldo em BNB para economizar nas taxas

A estratégia consiste nos seguintes passos:

Avaliação do spread:

Por padrao o bot trabalha com spread de 0.00150 (isso significa 0.15%) de diferença para baixo
de compra e 0.15% de venda acima de acordo com o preço atual do mercado, atendendo as seguintes regras:

Verificação da última ordem de compra e venda: Ele busca na exchange a última ordem de compra e venda
para vender dentro do spread definido, vendendo acima do valor de compra + spread e comprando abaixo + valor do spread

Timeout das ordens: Depois de um tempo definido na variável ORDER_EXPIRE ele cancela a ordem de compra ou venda
tentando recolocar a ordem em um valor favorável dentro da condição de mercado, por exemplo, a volatilidade 
do mercado diminuiu ele vai buscar valores mais próximos do que o mercado oferece

Ajuste automático do spread: É possível ajustar o spread através da variável AUTO_SPREAD inserindo valor 1
para que seja dinamico. Ele vai calcular entre a máxima e a mínima diária um valor de variação suficiente
para buscar um lucro, desde que não seja menor que o valor de SPREAD_MIN. Caso o valor AUTO_SPREAD seja 0, 
o bot vai considerar os valores SPREAD_SELL e SPREAD_BUY para venda e compra

Ordens escalonadas: O bot trabalha com ordens escalonadas, então é importante definir dentro do valor
que cada par trabalha uma porcentagem para compra e venda dentro da variável BUY_VALUE. Por exemplo, caso seja
definido 25%, ele vai utilizar 25% dos 50% do capital alocado para aquele par, buscando vender por um valor maior 
sempre que a moeda subir e comprando sempre ela que ela cair.

Informações importantes:

Ordens de compra e venda: Elas são separadas, porém sempre que uma ordem de compra ou venda é executada, a ordem
do sentido contrário é cancelada e ajustada para que seja comprado ou vendido dentro do spread de mercado, então
vamos usar o exemplo abaixo:
	
	- o Bot vendeu TUSD a um valor de 1.005, neste caso a ação será a seguinte
		1. Cancelar a ordem de compra de TUSD
		2. Ajustar a ordem de compra de TUSD, dentro do spread de mercado, abaixo do valor de compra
		3. Ajustar uma nova ordem de venda, dentro do spread de mercado, acima do valor vendido
		
	- O Bot comprou TUSD a um valor de 0.980 neste caso a ação será a seguinte
		1. Cancelar a ordem de venda de TUSD
		2. Ajustar a ordem de venda de TUSD, dentro do spread de mercado, acima do valor de compra
		3. Ajustar uma nova ordem de compra, dentro do spread de mercado, abaixo do valor comprado.
	
	A ação vai se repetir x vezes dependendo da variação de mercado e do saldo disponível.
	
	
Abaixo a documentação dos paramentros de configuração

    "API_KEY": "",
    "SECRET_KEY": "",
    
    São as API e Secret Key geradas na binance para acesso a sua conta
    
    "CURRENCY": "USDC",
    "MARKET" : "USDT",
    
    Define-se acima o par em qual o bot vai trabalhar, neste caso USDC/USDT
    
     "AUTO_SPREAD" : 1,
     
     Define-se se o bot vai trabalhar com spread dinamico ou fixo (1 automatico, 0 fixo)
        
    "SPREAD_SELL" : 0.00150,
    "SPREAD_BUY" : 0.00150,
    
    Quando o auto_spread estiver 0, define-se o spread de compra e venda para operação 
    
    
    "SPREAD_MIN" : 0.00150,
    
    Define-se o spread mínimo para operação, quando utilizado o AUTO_SPREAD com valor 1. 
       
    
    "ORDER_EXPIRE" : 8,
    
    Define um tempo de timeout para as ordens de compra e venda, utilizado quando o mercado
    não está buscando os valores de compra e venda, o bot tenta posicionar de modo mais favorável as ordens.
    Utilize um número em horas para definir ou deixe 0 para desabilitar
   
    "BUY_VALUE" : 25,
    
    Valor de compra para o bot. Essa é uma porcentagem para operação de compra e venda. A porcentagem é calculada
    com base no saldo de TODOS os pares de Stable coin baseados em dólar (USDT, USDC, PAX, etc..).    
    
    
    "LOOP_TIME": 15,
    
    Define o período de tempo em que o bot vai verificar a exchange.
    
    "BOT_TOKEN": "",
    
    Bot Token é a api para envio de mensagens via telegram. Esse bot pode ser criado diretamente 
    no telegram chamando o botfather, digitando o comando /newbot. Não
    vamos auxiliar neste passo, recomendamos que verifique no Google caso tenha dúvidas. Deixando
    o valor em branco o bot assume que não deve usar o telegram.
    
    "BOT_CHAT": "",
    
    Este é o seu ID, para quem o bot vai enviar mensagem. Para obter essa informação busque no telegram 
    por get id e digite /my_id. Não vamos auxiliar neste passo, recomendamos que verifique no google caso 
    tenha dúvidas. Deixando em branco o bot assume que não deve usar o telegram.
      
    "INITIAL_INVESTMENT": 1467.75,
    
    Este é valor de investimento no bot. Este valor, para um cálculo correto, deve somar todo o valor
    em stable coins na exchange (USDT, USDC, PAX, etc..). 
    
    
    "LISTEN_PORT" : 80,
    
    Porta da consulta da API
    
	"LISTEN_REPORT" : 3000
	
	Em desenvolvimento: Será desenvolvido um relatório para o bot.
	
## Observações
Estamos atualizando frequentemente o BOT, perdas podem ocorrer, por isso só instale a versão em desenvolvimento se souber o que está fazendo.

O Bot possui uma API para consulta dos dados em tempo real. Para usá-la basta acessar o IP do seu servidor e a porta definida no arquivo de configurações. Caso esteja executando localmente, para acessar a api o caminho seria como algo assim:
```bash
  localhost:3333
```
## Créditos
1. Ideia [@usdkhey](https://github.com/usdkhey)
2. Algorítmo [@itxtoledo](https://github.com/itxtoledo)
3. Versão 4.0.0 [@vinibr81](https://github.com/vinibr81)

## Comunidade
Participe de nossa comunidade no [WhatsApp](https://chat.whatsapp.com/KxB0etimVPQL3ncEn8u7tO)
ou no [Telegram](https://t.me/bitragem).

## Patrocinadores
Tiago A Boaventura - 28/05/2019

## Licença
[MIT](https://choosealicense.com/licenses/mit/)


## License
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2FGuillerbr%2FStablecoins-Infinity-Profit-Bot.svg?type=large)](https://app.fossa.io/projects/git%2Bgithub.com%2FGuillerbr%2FStablecoins-Infinity-Profit-Bot?ref=badge_large)
