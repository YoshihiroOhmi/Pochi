jQuery(function($) {
	"use strict";
});

function save() {
	var out = {
		showTransition: $('input[name=showTransition]:checked').val(),
		showSelection: $('input[name=showSelection]:checked').val(),
		showResults: $('input[name=showResults]:checked').val(),
		clientKey: $('input[name=clientKey]:checked').val(),
		hostname: $('input[name=hostname]').val(),
		port: $('input[name=port]').val(),
		adminUser: $('input[name=adminUser]').val(),
		adminPassword: $('input[name=adminPassword]').val(),
		idleMessage: $('input[name=idleMessage]').val()
	};
	$.post('config', {config: out}, function(result) {
		console.log('posted' +JSON.stringify(out));
	});
	showMessage('保存しました');
}