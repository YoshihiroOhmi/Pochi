
/**
 * Module dependencies.
 */
"use strict";

var pochiVersion = '0.11';

var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');
var fs = require('fs');
var os = require('os');
var crypto = require('crypto');
var encoding = require('./public/javascripts/encoding.js');

var config = JSON.parse(fs.readFileSync('config.json'));
if (config.adminPassword == '') {
	config.adminPassword = crypto.createHash('sha256').update('admin').digest('hex');
}

/*
var config = {
	showTransition: true,
	clientKey: 'ipaddress',// {'cookie', 'ipaddress', 'sessionid'}
	hostname: '',
	port: 80,
	adminPassword: 'admin',
	idleMessage:'現在質問していない状態です。'
};

fs.writeFileSync('config.json', JSON.stringify(config,null,'    '),'utf-8');
*/

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || config.port);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  if (config.clientKey == 'cookie') {
	  app.use(express.session({secret: 'Pochi', cookie:{maxAge: 600000}}));
  }
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

var dataDir = './data/';
var logDir = './log/';

var questions={};
var questionIndex=-1;

app.all('/admin', express.basicAuth(function(user,pass){
	var _pass = crypto.createHash('sha256').update(pass).digest('hex');
	return user === config.adminUser && _pass === config.adminPassword;
}));
app.all('/admin/\*', express.basicAuth(function(user,pass){
	var _pass = crypto.createHash('sha256').update(pass).digest('hex');
	return user === config.adminUser && _pass === config.adminPassword;
}));

function solveIPaddress(nic) {
    if (nic != undefined) {
    	for (var i = 0; i < nic.length; i++) {
    		if (nic[i].family == 'IPv4') {
    			var url = 'http://'+nic[i].address;
    			if (config.port != 80) {
    				url = url + ':' + config.port;
    			}
    			return url + '/';
    		}
    	}
    }
    return undefined;
}

app.get('/', function(req, res) { 
	res.render('client', {showSelection: config.showSelection, showResults: config.showResults}); 
});
app.get('/about', function(req, res) { res.render('about', {pochiVersion: pochiVersion}); });
app.get('/admin/address', function(req, res) { 
	var url;
	if (config.hostname != '') {
		url = 'http://' + config.hostname;
		if (config.port != 80) {
			url = url + ':' + config.port;
		}
		url = url + '/';
	} else {
		var net = os.networkInterfaces();	
		var ostype = os.type();
		if (ostype == 'Darwin') {
			url = solveIPaddress(net.en0);
		} else if (ostype.search('Windows') >= 0) {
			url = solveIPaddress(net['ローカル エリア接続']);
		} else {
			url = solveIPaddress(net.eth0);
		}
	}
console.log(url);	
	res.render('address', {clientaddress:url}); 
});
app.get('/admin', function(req,res) {
	var files = [];
	var _files = fs.readdirSync(dataDir);
	for(var i = 0; i < _files.length; i++) {
		if (_files[i].search('^question.+\.json$') >= 0) {
		    var qs = JSON.parse(fs.readFileSync(dataDir+_files[i]));
		    var mt = fs.statSync(dataDir+_files[i]).mtime;
		    var mtimestr = dateToString(mt);
			files.push({filename:_files[i], title:qs.title, mtime:mtimestr});
		}
	}
	questionIndex = -1;
	res.render('admin', {files: files});
});
app.get('/admin/question', function(req,res) {
	var str = fs.readFileSync(dataDir+req.query.file);
	questions = JSON.parse(str);
	res.render('question');	
	startQuestions();
});
app.get('/admin/edit', function(req,res) {
	var str = fs.readFileSync(dataDir+req.query.file);
	questions = JSON.parse(str);
	res.render('edit', {questions:questions, fname:req.query.file});	
});
app.post('/admin/edit', function(req,res) {
	console.log('edit');
	console.log(JSON.stringify(req.body.questions));
	fs.writeFileSync(dataDir+req.body.fname, JSON.stringify(req.body.questions, null, '    '),'utf-8');
	res.send(req.body);	
});

app.get('/admin/processQuestions', function(req,res) {
	if (req.query.delfile == undefined) {
		var outpath = dataDir+'question'+dateToFilename(Date.now())+'.json';
		if (req.query.dupfile == undefined) {
			questions = {title: 'タイトルをつけてください',
				contents: []};
		} else {
			questions = JSON.parse(fs.readFileSync(dataDir+req.query.dupfile));
			questions.title += '(コピー)';
		}
		fs.writeFile(outpath,JSON.stringify(questions,null,'  '),
			'utf-8',function(error,content){});
	} else {
		var fname = dataDir+req.query.delfile;
		fs.renameSync(fname, fname+'~');
	}
	res.render('processQuestions');
});

app.get('/admin/config', function(req,res) {
	res.render('config', {config:config});	
});
app.post('/admin/config', function(req,res) {
	console.log('config');
	if (config.adminPassword != req.body.config.adminPassword) {
		req.body.config.adminPassword = 
			crypto.createHash('sha256').update(req.body.config.adminPassword).digest('hex');
	}
	fs.writeFileSync('config.json', JSON.stringify(req.body.config, null, '    '),'utf-8');
	config = req.body.config;
	res.send(req.body);	
});

app.get('/admin/loglist', function(req,res) {
	var files = [];
	var _files = fs.readdirSync(logDir);
	for(var i = 0; i < _files.length; i++) {
		if (_files[i].search('^log.+\.json') >= 0) {
		    var log = JSON.parse(fs.readFileSync(logDir+_files[i]));
		    var mt = fs.statSync(logDir+_files[i]).mtime;
		    var mtimestr = dateToString(mt);
			files.push({filename:_files[i], title:log.title, mtime:mtimestr});
		}
	}
	res.render('loglist', {files: files});
});
app.get('/admin/logview', function(req,res) {
	var str = fs.readFileSync(logDir+req.query.file);
	var log = JSON.parse(str);
	res.render('logview', {log:log, logfilename:req.query.file});
});

app.get('/admin/import', function(req,res) {
	res.render('import', {failed: false});
});

app.post('/admin/import', function(req,res) {
	console.log(req.files.thumbnail.path);
	var file = fs.readFileSync(req.files.thumbnail.path);
	if (file.length > 0 && file[0] == '{'.charCodeAt(0)) {
		questions = JSON.parse(file);

	} else {
		questions = {contents: []};	
		var csv = encoding.Encoding.convert(file, 'UNICODE','SJIS');
		var _b = encoding.Encoding.codeToString(csv);
		var _b2 = _b.split('\r\n');
		var q = {question:'', type:'options', options:[]};
		for (var i = 0; i < _b2.length; i++) {
			var data = _b2[i].split(',');
			if (data.length >= 2) {
				if (data[0].match('^質問群のタイトル')) {
					questions.title = data[1];
				}
				if (data[0].match('^質問[^群]')) {
					if (q.question != '') {
						questions.contents.push(q);
						q = {question:'', type:'options', options:[]};
					}
					q.question = data[1];
				}
				if (data[0].match('^選択肢')) {
					q.options.push(data[1]);
				}
			}
		}
		if (q.question != '') {
			questions.contents.push(q);
		}	
	}
	if (questions.title != undefined && questions.title != ''){
		var outpath = dataDir+'question'+dateToFilename(Date.now())+'.json';
		fs.writeFile(outpath,JSON.stringify(questions,null,'  '),
			'utf-8',function(error,content){});
		res.render('processQuestions');
	} else {
		res.render('import', {failed: true});
	}
});

app.get('/admin/csv', function(req,res) {
	function _write(str) {
		var _s = [];
		for (var i = 0; i < str.length; i++) {
			_s.push(str.charCodeAt(i));
		}
		var _a = encoding.Encoding.convert(_s,'SJIS');
		var _b = '';
		for (var i = 0; i < _a.length; i++) {
			_b += String.fromCharCode(_a[i]);
		}
		res.write(_b, 'binary');
	}
	if (req.query.out != undefined) {
		res.statusCode = 200;
		res.setHeader('Content-Type', 'text/csv');
		if (req.query.out.match('^log')) {
			var str = fs.readFileSync(logDir+req.query.out);
			var log = JSON.parse(str);
			_write('"実施記録のタイトル","'+log.title+'"\r\n');
			_write('"実施記録のファイル名","'+req.query.out+'"\r\n');

			for (var i = 0; i < log.results.length; i++) {
				_write('\r\n');
				var r = log.results[i];
				_write('"質問'+(r.questionNumber+1)+'",');
				_write('"接続利用者数",');
				_write('"回答者数",');
				var q = log.questions.contents[r.questionNumber];
				for (var j = 0; j < r.response.length; j++) {
					_write('"'+q.options[j]+'",');
				}

				_write('\r\n');
				_write('"'+log.questions.contents[r.questionNumber].question+'",');
				_write(r.numUser+',');
				_write(r.total+',');
				for (var j = 0; j < r.response.length; j++) {
					_write('"'+r.response[j]+'",');
				}
				_write('\r\n\r\n');
			}
/*			for (var i = 0; i < log.questions.contents.length; i++) {
				var q = log.questions.contents[i];
				_write('"質問'+(i+1)+'","'+q.question+'"\r\n');
				if (q.type == 'options') {
					for (var j = 0; j < q.options.length; j++) {
						_write('"'+q.response[j]+'",');
					}
				}
			}
*/
		} else {
			var str = fs.readFileSync(dataDir+req.query.out);
			questions = JSON.parse(str);
			_write('"質問群のタイトル","'+questions.title+'"\r\n');
			_write('"質問群のファイル名","'+req.query.out+'"\r\n');
			for (var i = 0; i < questions.contents.length; i++) {
				var q = questions.contents[i];
				_write('"質問'+(i+1)+'","'+q.question+'"\r\n');
				if (q.type == 'options') {
					for (var j = 0; j < q.options.length; j++) {
						_write('"選択肢'+(j+1)+'","'+q.options[j]+'"\r\n');
					}
				}
			}
		}
		res.end();
	}
});

var server = http.createServer(app);
server.listen(app.get('port'), function(){
	console.log("Express server listening on port " + app.get('port'));
//	console.log(os.networkInterfaces());
});

function dateToString(date) {
	if (typeof(date) == 'number') {
		date = new Date(date);
	}
	return date.getFullYear()+'/'+(date.getMonth()+1)+'/'+date.getDate()
		+' '+date.getHours()+':'+date.getMinutes()+':'+date.getSeconds();
}

function dateToFilename(date) {
	if (typeof(date) == 'number') {
		date = new Date(date);
	}
	return ('0000'+date.getFullYear()).slice(-4)+('00'+(date.getMonth()+1)).slice(-2)
		+('00'+date.getDate()).slice(-2)+'-'
		+('00'+date.getHours()).slice(-2)+('00'+date.getMinutes()).slice(-2)
		+('00'+date.getSeconds()).slice(-2);
}

var io = require('socket.io').listen(server,{'log level':1});
var cookie = require('cookie');
var _userId = 0;
var _numUser = 0;
var _numAdmin = 0;
var responses=[];
var responseLog={};
var isResponsing = false;
var responseChange = 0;
var currentUpdateInterval = 30;
var startTime = 0;

function solveResponse(includeResponse) {
	if (includeResponse == undefined || includeResponse == 'true') {
		includeResponse = true;
	}
	if (includeResponse == 'false') {
		includeResponse = false;
	}
	var r={numUser:_numUser, total:0, response: []};
    if (questionIndex >= 0) {
    	if (includeResponse) {
		    for(var i = 0; i < questions.contents[questionIndex].options.length; i++) {
		        r.response[i] = 0;
		    }
		}
		for(var key in responses) {
			r.total++;
			if (includeResponse) {
				r.response[responses[key]-1]++;
			}
		}
	}
	return r;
}

function currentUpdate() {
	if(responseChange > 0) {
		var result = solveResponse(config.showTransition == 'true' &&
			questions.contents[questionIndex].showResults == 'true');
		responseChange = 0;
		io.sockets.to('admin').emit('current', result);
		console.log('current '+result);
	}
	if (isResponsing) {
		setTimeout(currentUpdate, currentUpdateInterval);
	}
}

function startQuestions() {
	if (questions.contents.length > 0) {
		responseLog = {
			title: questions.title,
			results: [],
			questions: questions
		};
		doQuestion(0);
	}
}

function doQuestion(idx) {
	questionIndex=idx;
	if (questionIndex >= 0) {
		startTime = Date.now();
		responses = {};
		isResponsing = true;
		responseChange = 1;
		io.sockets.emit('question', questions.contents[questionIndex]);
		setTimeout(currentUpdate, currentUpdateInterval);
	}
}

function endQuestion(socket) {
	if (questionIndex >= 0) {
		if(isResponsing) {
			var res = solveResponse();
			responseLog.results.push({
				questionNumber: questionIndex,
				response: res.response,
				numUser: res.numUser,
				total: res.total,
				startTime: startTime,
				endTime: Date.now()
			});
		}
	}
	isResponsing = false;
	if (config.showResults == "true" &&
		questions.contents[questionIndex].showResults == "true") {
		io.sockets.to('client').emit('current', res);
	} else {
		io.sockets.to('client').emit('message', {message:config.idleMessage});
	}
}	

function finishQuestions(socket) {
	endQuestion(socket);
	fs.writeFile(logDir+'log'+dateToFilename(Date.now())+'.json',
		JSON.stringify(responseLog,null,'  '),'utf-8', function(error,content){});
//	isResponsing = false;
	io.sockets.to('client').emit('message', {message:config.idleMessage});
}

io.configure(function () {
	if (config.clientKey == 'cookie') {
		io.set('authorization', function (handshakeData, callback) {
			console.log('io authorization');
	    	if(handshakeData.headers.cookie) {
	      		var _cookie = handshakeData.headers.cookie;
	      		var sessionID = cookie.parse(_cookie)['connect.sid'];
	      		handshakeData.sessionID =  sessionID;
	    	} else {
	    		console.log('Cannot get Cookie!');
	    		return callback(null, true);
//	      		return callback('Cant get Cookie', false);
	   		}
	    	callback(null, true);
		});
	}
});

function clientId(socket) {
	if (config.clientKey == 'cookie') {
		if (socket.handshake.sessionID != undefined) {
			return socket.handshake.sessionID;
		}
	}
	if (config.clientKey == 'ipaddress') {
		return socket.handshake.address.address;
	}
	return socket.id;
}

io.on('connection',function(socket){
//	console.log(socket.handshake.headers);
	var isAdmin = false;
	if(socket.handshake.headers.referer.search('/admin') >= 0) {
		_numAdmin++;
		isAdmin = true;
		socket.join('admin');
	    console.log('connect admin '+clientId(socket)+':('+_numAdmin+')');
	} else {
		_numUser++;
		socket.join('client');
		responseChange = 1;
	    console.log('connect client '+clientId(socket)+':('+_numUser+')');
	}
//	_userId ++;

	if (questionIndex >= 0) {
		socket.emit('question', questions.contents[questionIndex]);
		if(isAdmin) {
			responseChange = 1;
		}
	} else {
		socket.emit('message', {message:config.idleMessage});
	}
	
	socket.on('response',function(data, fn){
//	    var uid = socket.get('userId');
		responses[clientId(socket)] = data.code;
		responseChange++;
//	    console.log('response['+socket.handshake.address.address+']:'+data);
	    console.log('response['+clientId(socket)+']:'+data.code);
		fn(data.serial);
	});

	socket.on('result',function(data, fn){
	    if (questionIndex>=0) {
			endQuestion(socket);
		    console.log('result '+questionIndex);
			var result = {
				result:solveResponse(questions.contents[questionIndex].showResults == 'true')
			};  
		    if (questionIndex < questions.contents.length-1) {
		    	result.last = false;
		    } else {
		    	result.last = true;
			}
			fn(result);
		}
	});

	socket.on('next',function(data){
	    if (questionIndex+1 < questions.contents.length) {
			doQuestion(questionIndex+1);
		    console.log('next '+questionIndex);
		}
	});
	socket.on('prev',function(data){
		endQuestion(socket);
		var idx = questionIndex;
	    if (idx > 0) {
			idx--;
		}
		doQuestion(idx);
		console.log('prev '+questionIndex);
	});

	socket.on('disconnect',function(){
		if(isAdmin) {
			finishQuestions(socket);
			_numAdmin --;
			console.log("disconnect admin "+clientId(socket)+':('+_numAdmin+')');	    	
		} else {
			_numUser --;
			responseChange = 1;
			console.log("disconnect client "+clientId(socket)+':('+_numUser+')');	    	
		}
	});
});
