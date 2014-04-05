var _socket;
function checkWebSocket() {
	if ('WebSocket' in window) {
		/* document.write('OK'); */ 
	} else {
		document.write('WebSocketに対応したブラウザを使用することをお勧めします'); 
	}
}
function showMessage(message) {
	$('<div class="ui-loader ui-overlay-shadow ui-body-a ui-corner-all"><h1>'+
		message+'</h1></div>').css({
			display:"block",
			opacity: 0.96,
			left: "200px"
		})
		.appendTo("body").delay(800)
		.fadeOut(400, function() {
			$(this).remove();
		});
}
