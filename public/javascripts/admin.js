//var _socket;
//var isResponsing = false;
jQuery(function($) {
	"use strict";
/*
    function setOption(id, message) {
        if (message != undefined) {
			$('#options').append('<input type="radio" name="radio" id="o'+id+'" value="a'+id+'">'
				+'<label for="o'+id+'">'+id+'. '+message+'</label></input>');
		}
    }
    function drawGraph(data) {
    	var d=[];
    	for(var i=1;i < data.length; i++) {
    		d.unshift([data[i], ''+i]);
//    		d[data.length-i-1] = [data[i], ''+i];
    	}

		$('#graph').children().remove();
		jQuery.jqplot('graph',
			[d],
			{
				seriesDefaults: {renderer: jQuery.jqplot.BarRenderer,
								 rendererOptions: {barDirection: 'horizontal'}},
				axes: { yaxis: {renderer: jQuery.jqplot.CategoryAxisRenderer,},
						xaxis: {formatString: '%d'}}
			}
		);
	}
	_socket = io.connect('http://'+location.host+'/');
//    _socket.emit('admin', 'start');

	_socket.on('question',function(data){
		$('#question').text(data.question);
		$('#options').children().remove();
		for(var i = 0; i < data.options.length; i++) {
		  setOption(i+1, data.options[i]);
		}
		$('#options').trigger("create");
		console.log('question '+data.options.length)
		isResponsing = true;
//		setTimeout(currentPolling, currentPollingInterval);
	});

	_socket.on('current', function(data){
		console.log('current '+data);
		drawGraph(data);
	});
*/
});

function startQuestion(filename) {
    console.log('start '+filename);
}

function next() {
   console.log('next');
   _socket.emit('next');
}

