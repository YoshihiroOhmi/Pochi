var _socket;
var clicked = {};
var clickSerial = 0;
var prevClick = -1;
var showSelection;
var showResults;

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
	  	$('#graph'+(i+1)).progressbar({value:v, width:'40%', text:txt});
//    		d[data.length-i-1] = [data[i], ''+i];
	}
	$('.progressbar-value .progressbar-text').css('background-color', '#f88');
}

jQuery(function($) {
	"use strict";
    function setOption(id, message) {
        if (message != undefined) {
        	var li = '<li onClick="response('+id+')" data-icon="false" class="option-client"'
				+'id="o'+id+'"><a class="option-client">'+id+'. '+message+'</a>';
			if (showResults) {
				li += '<div id="graph'+id+'" class="easyui-progressbar" '+
					'style="display:inline-block;width:40%;height:40px;position:absolute;right:5px;top:5px"></div>';
			}
			li += '</li>';
/*			$('#options').append('<input type="radio" name="radio" id="o'+id+
				'" value="o'+id+'" onClick="response('+id+')">'
				+'<label for="o'+id+'" class="option-client">'
				+id+'. '+message+'</label></input>');*/
			$('#options').append(li);
        }
    }

	_socket = io.connect('http://'+location.host+'/');

	_socket.on('question',function(data){
		$('#question').text(data.question);
		$('#question').css('color', 'black');
		$('#options').children().remove();
		if (data.type == 'options') {
			for(var i = 0; i < data.options.length; i++) {
			  setOption(i+1, data.options[i]);
			}
		}
		$('#options').listview('refresh');
//		$('#options').trigger('create');
		console.log('question ')
	});
	
	_socket.on('message',function(data){
		$('#question').text(data.message);
		$('#options').children().remove();
		$('#options').trigger('create');
		console.log('message ')
	});

	_socket.on('current', function(data){
		console.log('current '+JSON.stringify(data));
		drawGraph(data);
	});
	
});

function responseCheck(serial) {
	if (clicked[''+serial] == 1) {
		$('#question').css('color', 'red');
//		$.mobile.changePage('#connectionerror');
		alert('接続できません');
		location.reload();
	}
//    console.log('check '+serial+' '+clicked[''+serial]);
}

function response(code) {
	clicked[''+clickSerial]=1;
	var senddata = {code:code, serial:clickSerial};
    var r = _socket.emit('response', senddata, function(data){
	   	delete clicked[''+data];
	    console.log('response '+code+':'+data);
//	    $.mobile.hidePageLoadingMsg();
	   	$('#question').css('color', 'gray');
console.log(showSelection);
	   	if (showSelection) {
/*
	   		if (prevClick >= 0) {
	   			$('#o'+prevClick).children().css('background-color','');
	   		}
	   		prevClick = code;
		   	for (var i = 1; $('#o'+i).size() > 0; i++) {
				$('#o'+i).children().css('background-color','');
		   	}
*/
			$('#o'+code).children().css('background-color', '#ffc000');
		}
	});
//	$.mobile.showPageLoadingMsg();
	if (showSelection) {
		if (prevClick >= 0) {
			$('#o'+prevClick).children().css('background-color','');
		}
		prevClick = code;
/*
	   	for (var i = 1; $('#o'+i).size() > 0; i++) {
			$('#o'+i).children().css('background-color','');
	   	}
*/
		$('#o'+code).children().css('background-color', '#ff4000');
	}
	setTimeout('responseCheck('+clickSerial+')', 5000);
	clickSerial++;
}
