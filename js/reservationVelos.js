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

function creerEtiquette(nom, adresse, velosTotal, velosLibres, emplacementsLibres, statut) {
	var titreEtiquette = document.createElement('h5');
	titreEtiquette.textContent = 'Station n°' + nom;
	var infosEtiquette = document.createElement('p');
	infosEtiquette.textContent = 
}

var map;

function initMap() {

  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 48.856614, lng: 2.3522219000000177},
    zoom: 12
  });

	ajaxGet('http://opendata.paris.fr/api/records/1.0/search/?dataset=stations-velib-disponibilites-en-temps-reel&rows=1224&facet=banking&facet=bonus&facet=status&facet=contract_name', function(reponse) {

		var donnees = JSON.parse(reponse);
		var	stations = donnees.records;
		var markers = [];

		/* Récupération des coordonnées de chaque borne et création des marqueurs sur la Google Map */
		stations.forEach(function(station) {
			var latitudeStation = station.fields.position[0],
					longitudeStation = station.fields.position[1];
			var marker = new google.maps.Marker({
				map: map,
				position: {lat: latitudeStation, lng: longitudeStation}
			});
			markers.push(marker);

			var nomStation = station.fields.name,
					adresseStation = station.fields.address,
					velosTotalStation = station.fields.bike_stands,
					velosLibresStation = station.fields.available_bikes,
					emplacementsLibresStation = station.fields.available_bike_stands,
					statutStation = station.fields.status;

			creerEtiquette(nomStation, adresseStation, velosTotalStation, velosLibresStation, emplacementsLibresStation, statutStation);
			
			marker.click(function() {
			});
		});

		/*----- Utilisation de l'objet markerClusterer (regroupement automatique des marqueurs proches) -----*/
		var markerCluster = new MarkerClusterer(map, markers,{imagePath: 'images/m'});
	}); /* Fin appel API Ville de Paris */

}



/*----- Commandes souris diaporama -----*/

$('.cmd_left').click(function() {
	$('#bloc_photos div:first-child').remove().appendTo('#bloc_photos');
});

$('.cmd_right').click(function() {
	$('#bloc_photos div:last-child').remove().prependTo('#bloc_photos');
});


