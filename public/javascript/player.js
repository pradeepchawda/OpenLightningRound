/* global window, document, location, prompt, io */

window.onload = function() {
	// get rid of address bar on Android
	//DOES NOT WORK: setTimeout( function() {window.scrollTo(0, 1)}, 1000);
	// only window.innerHeight seems to give reasonable value.
	// subtract 6px x 2 due to padding in <body> tag
    var window_height = window.innerHeight;
	var splitHeight = (window_height / 3) - 12;
	//console.log("document.height: " + splitHeight);
	var message = document.getElementById("message");
	message.style.height = "" + 2*splitHeight + "px";//
	var button = document.getElementById("button");
	button.style.height = "" + splitHeight + "px";
	var title = document.getElementById("title");
	// modal prompt for name
	var name = null;
	var first = true;
	// loop till a valid name is returned
	while (name === null) {
		name = prompt(first?"Enter your name":"Don't hit cancel, enter name");
		if (!name) { // empty string
			name = null;
		}
		first = false;
	}
	// open web socket back to host w/ reconnection set to 'false.'  
	// Default is 'true' which has dead screens re-attach automatically.
	var socket = io("http://" + location.host + "/player", {reconnection: false});
	// This is how we receive messages from the server through the web socket
	socket.on('registered', function(data) {
		console.log('>>registered');
		title.text = name;
		button.textContent = 'Buzz';
	});
	socket.on('deregister', function(data) {
		console.log('>>deregister');
		message.style.fontSize = '36px';
		message.value = data.reason;
		// client was just told to refresh the screen so change status
		button.textContent = 'Register';
	});
	socket.on('ask-question', function(data) {
		console.log('>>ask-question');
		message.style.fontSize = '24px';
		message.value = data;
	});
	socket.on('test-buzzers', function(data) {
		console.log('>>test-buzzers');
		// clear any question in message area
		message.value = "";
	});
	socket.on('admin1-shutdown', function(data) {
		console.log('>>admin1-shutdown');
		// admin1 is gone, so shutdown since re-registration will be required
		shutdown();
	});

	function flash_background() {
		var body = document.getElementById("body");
		var current = body.style.backgroundColor;
		body.style.backgroundColor = 'white';
		setTimeout(set_background, 100, current);
		setTimeout(set_background, 100, 'white');
		setTimeout(set_background, 100, current);
		setTimeout(set_background, 100, 'white');
		setTimeout(set_background, 100, current);
	}
	
	function set_background(color) {
		var body = document.getElementById("body");
		body.style.backgroundColor = color;
		//console.log("set_background: color: " + color);
	}
	// shutdown the client
	function shutdown() {
		console.log('shutting down client');
		socket.end();  // sends 'disconnect' event
	}
	// when user taps or clicks button send buzz message
	button.onclick = function(event) {
		var msg;
		var button = document.getElementById("button");
		if (button.textContent === "Register") {
			socket.emit('register', {'name': name});
		} else {  // assume test of buzzer or problem buzz
			flash_background();
			socket.emit('buzz', {'name': name});
			console.log('  buzz>>server');
		}
	};
	
	window.onunload = shutdown;

};
