var questions;
var filename;

function objectToHtml() {
	$('#qlist').children().remove();
	for (var i = 0; i < questions.contents.length; i++) {
		var q = questions.contents[i];
		if (q.type == undefined) { q.type = 'options'; }
		var qdiv = '<div id="qqq" data-role="fieldcontain">'+
			'<label for="q'+i+'">質問'+(i+1)+'</label>'+
			'<input name="q'+i+'" type="text" data-theme="b" value="' + q.question +'" />'+
			'<a data-role="button" data-icon="plus" '+
				'data-inline="true" data-iconpos="notext" data-theme="b" '+
				'onClick="addQuestion('+i+');"></a>'+
			'<a data-role="button" data-icon="minus" '+
				'data-inline="true" data-iconpos="notext" data-theme="b" '+
				'onClick="delQuestion('+i+');"></a>';
		if (i > 0) {
			qdiv += '<a data-role="button" data-icon="arrow-u" '+
				'data-inline="true" data-iconpos="notext" data-theme="b" class="rightside" '+
				'onClick="upQuestion('+i+');"></a>';
		}
		qdiv += '</div><div id="q'+i+'">'+
			'<input type="hidden" name="t'+i+'" value="' + q.type+'">'+
			'</div><hr>';
		$('#qlist').append(qdiv);
		for (var j = 0; j < q.options.length; j++) {
			input = '<div data-role="fieldcontain">'+
				'<label for="o'+i+'_'+j+'">選択肢'+(j+1)+'</label>'+
				'<input name="o'+i+'_'+j+'" type="text" value="' + q.options[j] +'" />'+
				'<a data-role="button" data-icon="plus" '+
					'data-inline="true" data-mini="true" data-iconpos="notext" '+
					'onClick="addOption('+i+','+j+');"></a>'+
				'<a data-role="button" data-icon="minus" '+
					'data-inline="true" data-mini="true" data-iconpos="notext" '+
					'onClick="delOption('+i+','+j+');"></a>'+
				'</div>';
			$('#q'+i).append(input);
		}
		qdiv = '<div data-role="fieldcontain">'+
			'<a data-role="button" data-icon="plus" '+
				'data-inline="true" data-mini="true" data-iconpos="notext" '+
				'onClick="addOption('+i+');"></a>'+
			'<span style="display:inline-block;width:50px"></span>'+
			'<label for="q'+i+'showResults" data-inline="true">結果表示</label>'+
			'<select name="q'+i+'showResults" id="q'+i+'showResults" data-role="none">';
		if (q.showResults == "true") {
			qdiv += '<option value="true" selected>する</option>'+
					'<option value="false">しない</option>';
		} else {
			qdiv += '<option value="true">する</option>'+
					'<option value="false" selected>しない</option>';
		}
		qdiv += '</select>';
		if (i < questions.contents.length-1) {
			qdiv += '<a data-role="button" data-icon="arrow-d" '+
				'data-inline="true" data-iconpos="notext" data-theme="b" class="rightside" '+
				'onClick="downQuestion('+i+');"></a>';
		}			
		qdiv +=	'</div>';
		$('#q'+i).append(qdiv);
		$('#q'+i).trigger('create');
	}
	$('#qlist').append('<a data-role="button" data-icon="plus" data-inline="true" onClick="addQuestion()">質問追加</a>');
	$('#qlist').trigger('create');
}

jQuery(function($) {
	"use strict";
});

function qname(num) { return 'input[name="q'+num+'"]'; }
function tname(num) { return 'input[name="t'+num+'"]'; }
function sname(num) { return '#q'+num+'showResults option:selected'; }
function oname(q,o) { return 'input[name="o'+q+'_'+o+'"]'; }

function htmlToObject() {
	var out = {title: $('input[name="title"]').val(), contents: []};
	for (var i = 0; $(qname(i)).length > 0; i++) {
	    var q = {
	    	question: $(qname(i)).val(),
	    	type: $(tname(i)).val(),
	    	showResults: $(sname(i)).val(),
	    	options: []
	    };
	    for (var j = 0; $(oname(i,j)).length > 0;j++) {
	    	q.options.push($(oname(i,j)).val());
	    }
	    out.contents.push(q);
	} 
	return out;
}

function post() {
	$.post('edit', {questions: htmlToObject(), fname:filename}, function(result) {
		console.log('posted');
	});
	showMessage('保存しました');
}

function addQuestion(i) {
	var data = {
		question:'',
		type:'options',
		showResults: 'true',
		options:['はい','いいえ']
	};
	if (i == undefined) {
		questions.contents.push(data);
	} else {
		questions.contents.splice(i,0,data);
	}
	objectToHtml();
}
var delQuestionNumber;
function delQuestion(i) {
	delQuestionNumber = i;
	$.mobile.changePage('#confirmDelQ');
}

function upQuestion(i) {
	questions.contents.splice(i-1,2,questions.contents[i],questions.contents[i-1]);
	objectToHtml();
	showMessage('質問を入れ替えました');
}

function downQuestion(i) {
	questions.contents.splice(i,2,questions.contents[i+1],questions.contents[i]);
	objectToHtml();
	showMessage('質問を入れ替えました');
}

function addOption(i, j) {
	if (j == undefined) {
		questions.contents[i].options.push('');
	} else {
		questions.contents[i].options.splice(j,0,'');
	}
	objectToHtml();
}
function delOption(i, j) {
	questions.contents[i].options.splice(j,1);
	objectToHtml();
}
function confirmDelQ(flag) {
	if (flag) {	
		questions.contents.splice(delQuestionNumber,1);
		objectToHtml();
	}
	$('#confirmDelQ').dialog('close');
}
function delQuestions() {
	$.mobile.changePage('#confirmDel');
}
function confirmDel(flag) {
	if (flag) {
		$.mobile.changePage('/admin/processQuestions?delfile='+filename);
	} else {
		$('#confirmDel').dialog('close');
	}
}

function dupQuestions() {
	$.mobile.changePage('#confirmDup');
}
function confirmDup(flag) {
	if (flag) {
		$.mobile.changePage('/admin/processQuestions?dupfile='+filename);
	} else {
		$('#confirmDup').dialog('close');
	}
}
