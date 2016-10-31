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
		
		var infosAdresseEtiquette = document.createElement('p');
		infosAdresseEtiquette.append(adresse + '<br><span>' + statut + '</span>'); 

		var infosVelos = document.createElement('p');
		infosVelos.append('Capacité de la station : ' + velosTotal + '<br>Nombre de vélos libres : ' + velosLibres + '<br>Nombre d\'emplacements libres : ' + emplacementsLibres);

		var etiquette = document.createElement('div');
		etiquette.addClass('etiquette');
		etiquette.append()
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
						statutStation = station.fields.status,
						statutStationFr = '';

						if (statutStation === "OPEN") {
							statutStationFr = 'Ouverte';
						} else if (statutStation === "CLOSED") {
							statutStationFr = 'Fermée';
						} else {
							statutStationFr = 'Non Disponible';
						}
				/*----- Affichage formulaire quand clic sur un marker -----*/
				marker.addListener('click', function() {
					$('#details').html('');
					$('#signature').fadeOut();
					var titreEtiquette = document.createElement('h4');
					titreEtiquette.textContent = 'Station n°' + nomStation;
					
					var infosAdresseEtiquette = document.createElement('p');
					infosAdresseEtiquette.innerHTML = 'Adresse : ' + adresseStation;

					var statutStationEtiquette = document.createElement('p');
					statutStationEtiquette.id = 'statut';

					if (statutStation === "OPEN") {
						statutStationEtiquette.innerHTML = 'Station ' + statutStationFr;
						statutStationEtiquette.className = 'ouverte';
						$('#bouton_reserver').removeAttr('disabled'); 
					} else if (statutStation === "CLOSED") {
						statutStationEtiquette.innerHTML = 'Station ' + statutStationFr;
						statutStationEtiquette.className = 'fermee'; 
						$('#bouton_reserver').attr('disabled', 'disabled');
					} else {
						statutStationEtiquette.innerHTML = 'Station ' + statutStationFr + '</span>';
						statutStationEtiquette.className = 'indefini'; 
						$('#bouton_reserver').prop('disabled');
					}

					var infosVelos = document.createElement('p');
					infosVelos.innerHTML = 'Capacité de la station : ' + velosTotalStation + '<br>Nombre de vélos libres : ' + velosLibresStation + '<br>Nombre d\'emplacements libres : ' + emplacementsLibresStation;

					$('#details').append(titreEtiquette, infosAdresseEtiquette, statutStationEtiquette, infosVelos);

					$('#bloc_infos_station').fadeIn();
				});

			});

				$('#bouton_reserver:enabled').click(function() {
					$('#signature').fadeIn();
				});

				/*----- Fermeture formulaire de réservation si clic en dehors du bloc "carte-forulaire" -----*/
				$(document.body).click(function(e) {
					var carteDetails = $('#carte_details');
					if (!$(e.target).is(carteDetails) && !$.contains(carteDetails[0], e.target)) {
						$('#bloc_infos_station').fadeOut();
						$('#signature').fadeOut();
					}
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


