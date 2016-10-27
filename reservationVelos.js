function ajaxGet(url, callback) {
	var req = new XMLHttpRequest();
	req.open('GET', url);
	req.addEventListener('load', function() {
		if (req.status >= 200 && req.status < 400) {
			// Appelle la fonction callback en lui passant la réponse en paramètre
			callback(req.responseText);
		} else {
			console.error(req.status + ' ' + req.statusText + ' ' + url);
		}
	});
	req.addEventListener('error', function() {
		console.error('Erreur réseau avec l\'URL ' + url);
	});
	req.send(null);
}

var map;

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 48.856614, lng: 2.3522219000000177},
    zoom: 12
  });
}

$('.cmd_left').click(function() {
	$('#bloc_photos div:first-child').remove().appendTo('#bloc_photos');
});

$('.cmd_right').click(function() {
	$('#bloc_photos div:last-child').remove().prependTo('#bloc_photos');
});

