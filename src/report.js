const FileSync = require('lowdb/adapters/FileSync');
const adapter = new FileSync('db.json');
const low = require('lowdb');
const db = low(adapter);


var config = require('./config.json');
var http = require('http');
var ip = '0.0.0.0';
var port = config.LISTEN_REPORT;
var getJSON = require('get-json');
var dateFormat = require('dateformat');
var cron = require('node-cron');

saldo_TUSD = 0;
saldo_USDT = 0;
saldo_USDC = 0;
saldo_PAX = 0;
saldo_USDS = 0;
saldo_USDSB = 0;
total_stable = 0;

date = 0;
profit_day = 0;
profit_day_percentage = 0;
total_profit = 0;
total_profit_percentage = 0;

db.defaults({ reports: [], date: {}, saldo_USDT: {}, saldo_TUSD: {}, saldo_USDC: {}, saldo_PAX: {}, saldo_USDS: {}, saldo_USDSB: {}, profit_day: {}, profit_day_percentage: {}, total_profit: {}, total_profit_percentage: {}, id: 0 }).write();
total_report = db.get('reports').size().value();
if(total_report == 0) {
		profit_day = total_profit; 
		profit_day_percentage = total_profit_percentage;
	    getJSON('http://localhost', function(error, response){
			total_profit = parseFloat(response.profit['USD'], 8);
			date = dateFormat(new Date(), "dd/mm/yyyy");
			saldo_USDT = parseFloat(response.balances['usdt'], 8);
			saldo_TUSD = parseFloat(response.balances['tusd'], 8);
			saldo_USDC = parseFloat(response.balances['usdc'], 8);
			saldo_PAX = parseFloat(response.balances['pax'], 8);
			saldo_USDS = parseFloat(response.balances['usds'], 8);
			saldo_USDSB = parseFloat(response.balances['usdsb'], 8);
			total_profit_percentage = response.profit['percent'].toFixed(2);
			total_profit_percentage = parseFloat(total_profit_percentage);
			profit_day = total_profit; 
			profit_day_percentage = total_profit_percentage;
			db.get('reports').push({ date: date, saldo_USDT: saldo_USDT, saldo_TUSD: saldo_TUSD, saldo_USDC: saldo_USDC, saldo_PAX: saldo_PAX, saldo_USDS: saldo_USDS, saldo_USDSB: saldo_USDSB, profit_day: profit_day, profit_day_percentage: profit_day_percentage, total_profit: total_profit, total_profit_percentage: total_profit_percentage, id: total_report}).write();
			db.update('id', n => n + 1).write();
		});
}

var task = cron.schedule('0  0  *  *  *', () => {
	getJSON('http://localhost', function(error, response){
		total_report = db.get('reports').size().value();
		total_profit = parseFloat(response.profit['USD'], 8);
		date = dateFormat(new Date(), "dd/mm/yyyy");
		
		saldo_USDT = parseFloat(response.balances['usdt'], 8);
		saldo_TUSD = parseFloat(response.balances['tusd'], 8);
		saldo_USDC = parseFloat(response.balances['usdc'], 8);
		saldo_PAX = parseFloat(response.balances['pax'], 8);
		saldo_USDS = parseFloat(response.balances['usds'], 8);
		saldo_USDSB = parseFloat(response.balances['usdsb'], 8);
		
		total_profit_percentage = response.profit['percent'].toFixed(2);
		total_profit_percentage = parseFloat(total_profit_percentage);
		
		last_result = db.get('reports').find({ id: (total_report - 1) }).value();
			
		profit_day = (total_profit - last_result.total_profit).toFixed(8);
		profit_day = Math.abs(profit_day);
		profit_day = parseFloat(profit_day);
			
		profit_day_percentage = ((total_profit_percentage - last_result.total_profit_percentage).toFixed(2));
		profit_day_percentage = Math.abs(profit_day_percentage);
		profit_day_percentage = parseFloat(profit_day_percentage);
		
		db.get('reports').push({ date: date, saldo_USDT: saldo_USDT, saldo_TUSD: saldo_TUSD, saldo_USDC: saldo_USDC, saldo_PAX: saldo_PAX, saldo_USDS: saldo_USDS, saldo_USDSB: saldo_USDSB, profit_day: profit_day, profit_day_percentage: profit_day_percentage, total_profit: total_profit, total_profit_percentage: total_profit_percentage, id: total_report}).write();
		db.update('id', n => n + 1).write();
	});
});

task.start();

console.log("Iniciando Report node-telegram-bot-api...");

var server=http.createServer((function(request,response)
{
	response.writeHead(200, {"Content-Type" : "text/html"});
	response.write('<html><head><meta charset="UTF-8"><title>Report Stable Coin</title></head>');
	response.write('<style> .tabelaum{ float: left; } .tabeladois{ float: left; margin-left: 6px;} h1 { font-family: Tahoma, Verdana, Segoe, sans-serif; font-size: 24px; font-style: normal; font-variant: normal; font-weight: 700; line-height: 26.4px; } h3 { font-family: Tahoma, Verdana, Segoe, sans-serif; font-size: 14px; font-style: normal; font-variant: normal; font-weight: 700; line-height: 15.4px; } p { font-family: Tahoma, Verdana, Segoe, sans-serif; font-size: 14px; font-style: normal; font-variant: normal; font-weight: 400; line-height: 20px; } blockquote { font-family: Tahoma, Verdana, Segoe, sans-serif; font-size: 21px; font-style: normal; font-variant: normal; font-weight: 400; line-height: 30px; } pre { font-family: Tahoma, Verdana, Segoe, sans-serif; font-size: 13px; font-style: normal; font-variant: normal; font-weight: 400; line-height: 18.5714px; } table { border-collapse: collapse;} th, td { text-align: left; padding: 6px;} tr:nth-child(even) {background-color: #f2f2f2;} td { font-family: Tahoma, Verdana, Segoe, sans-serif; font-size: 10px; font-style: normal; font-variant: normal; font-weight: 400; line-height: 14px; } th { font-family: Tahoma, Verdana, Segoe, sans-serif; font-size: 10px; font-style: normal; font-variant: normal; font-weight: 400; line-height: 18.5714px; } </style>');
	response.write('</head><body><p>&nbsp;<h1 align="center"> Stable Coin - Report</h1></p> <table width="350" border="1" class="tabelaum"> <tr> <td colspan="2" align="center"><strong>Balances</strong></td> </tr>');
	var total_report = db.get('reports').size().value();
	var result_report = db.get('reports').find({ id: (total_report - 1) }).value();
	response.write('<tr> <td width="61">USDT</td><td width="208">&nbsp;'+result_report.saldo_USDT+'</td> </tr>');
	response.write('<tr> <td width="61">PAX</td><td width="208">&nbsp;'+result_report.saldo_PAX+'</td> </tr>');
	response.write('<tr> <td width="61">TUSD</td><td width="208">&nbsp;'+result_report.saldo_TUSD+'</td> </tr>');
	response.write('<tr> <td width="61">USDC</td><td width="208">&nbsp;'+result_report.saldo_USDC+'</td> </tr>');
	response.write('<tr> <td width="61">USDS</td><td width="208">&nbsp;'+result_report.saldo_USDS+'</td> </tr>');
	response.write('<tr> <td width="61">USDSB</td><td width="208">&nbsp;'+result_report.saldo_USDSB+'</td> </tr>');
	response.write('<tr> <td width="61"><strong>Initial Invest</strong></td><td width="208">&nbsp'+config.INITIAL_INVESTMENT+'</td>');
	response.write('<tr> <td width="61"><strong>Total:</strong></td><td>&nbsp;'+(result_report.saldo_USDT + result_report.saldo_PAX + result_report.saldo_TUSD + result_report.saldo_USDC +  result_report.saldo_USDS + result_report.saldo_USDSB) +'</td></tr></table>');
	response.write('<table width="872" border="1" class="tabeladois"><tr><td width="103"><strong>Date</strong></td><td width="152"><strong>Profit Today USD</strong></td><td width="198"><strong>% Today</strong></td><td width="194"><strong>Total Profit</strong></td><td width="195"><strong>Total %</strong></td></tr>');
	var result_report = db.get('reports').value();
	for (let index = 0; index < result_report.length; index++) {		
		response.write('<tr><td>&nbsp;'+result_report[index].date+'</td><td>&nbsp;'+result_report[index].profit_day+'</td><td>&nbsp;'+result_report[index].profit_day_percentage+'</td><td>&nbsp;'+result_report[index].total_profit+'</td><td>&nbsp;'+result_report[index].total_profit_percentage+'</td></tr>');
	}
	response.write('</table></body></html>');
	response.end("");
}));

server.listen(port, () => {
  console.log(`Servidor rodando em http://${ip}:${port}`);
  console.log('Para derrubar o servidor: ctrl + c');
});
