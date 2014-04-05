var _socket;
var _data;
var isAddressPage = false;
function drawGraph(data) {
    var max = 0;
    var res = data.response;
    for(var i=0;i < res.length; i++) {
    	if (res[i] > max) {
    		max = res[i];
    	}
    }
    if (max < 3) { max = 3; }
    for(var i=0;i < res.length; i++) {
    	var v = res[i]/max*100;
    	var txt = ''+res[i];
    	if (data.total > 0) {
    		txt += ' ('+(res[i]/data.total*100).toFixed(0)+'%)';
    	}
	  	$('#graph'+(i+1)).progressbar({value:v, width:'50%', text:txt});
	}
   	var persent = 0;
	if (data.numUser > 0) {
		persent = (data.total/data.numUser*100).toFixed(0);
	}
	var txt = data.total+'/'+data.numUser+' ('+persent+'%)';
	$('#progressbar').progressbar({text:txt});
	$('#progressbar').progressbar('setValue', persent);
	$('.progressbar-value .progressbar-text').css('background-color', '#f88');
}

jQuery(function($) {
	"use strict";

    function setOption(id, message) {
        if (message != undefined) {
			$('#options').append('<li><span style="font-size:150%">'+id+'. '+message+'</span>'+
				'<div id="graph'+id+'" class="easyui-progressbar" '+
					'style="display:inline-block;width:50%;height:40px;position:absolute;right:5px;top:5px"></div></li>');
		}
    }


	_socket = io.connect('http://'+location.host+'/');

	_socket.on('question',function(data){
		$('#question').text(data.question);
		$('#options').children().remove();
		if (data.type == 'options') {
			for(var i = 0; i < data.options.length; i++) {
			  setOption(i+1, data.options[i]);
			}
		}
		$('#options').listview('refresh');
		$('#othermessage').children().remove();
//		console.log(data.showResults);
		if (data.showResults == 'true') {
			$('#othermessage').text('');
		} else {
			$('#othermessage').text('結果表示は行いません');
		}
		$('#othermessage').trigger('create');
		
//		$('#options').trigger('create');
		$('#next').button('disable');
		$('#next').buttonMarkup({'theme':'a'});
		$('#result').button('enable');
		$('#result').buttonMarkup({'theme':'b'});
//		$('#result').trigger('refresh');
		console.log('question '+data.options.length)
	});

	_socket.on('message',function(data){
		$('#question').text(data.message);
		$('#options').children().remove();
		$('#options').trigger('create');

		console.log('message ')
	});

	_socket.on('current', function(data){
		console.log('current '+JSON.stringify(data));
		var id = $.mobile.activePage.attr('id');
		if (id == 'address') {
			_data = data;
			if (isAddressPage == false) {
				isAddressPage = true;
				setTimeout(delayGraph, 500);
			}
		} else {
			drawGraph(data);
		}
	});
});

function delayGraph() {
	var id = $.mobile.activePage.attr('id');
//console.log(id+':'+$('#progressbar').size()+':'+JSON.stringify(_data));
	if (isAddressPage) {
		if (id == 'address') {
			isAddressPage = true;
			setTimeout(delayGraph, 500);
		} else {
			isAddressPage = false;
			setTimeout(delayGraph, 500);
			drawGraph(_data);
		}
	} else {
		drawGraph(_data);
	}
}

document.onkeydown = function(e){
    if (e.keyCode == 32) {//Space Key
        next();
    }
};

function startQuestion(filename) {
    console.log('start '+filename);
}

function result() {
	console.log('result');
	_socket.emit('result', 0, function(data){
		drawGraph(data.result);
		$('#result').button('disable');
		$('#result').buttonMarkup({'theme':'a'});
		if(data.last) {
//			$('#finish').button('enable');
			$('#finish').buttonMarkup({'theme':'b'});
		} else {
			$('#next').button('enable');
			$('#next').buttonMarkup({'theme':'b'});
		}
	});
}

function next() {
   console.log('next');
   _socket.emit('next');
}

function prev() {
	console.log('back');
	$('#finish').buttonMarkup({'theme':'a'});
	_socket.emit('prev');
}

function finish() {
	console.log('finish');
    _socket.emit('finish');
}
