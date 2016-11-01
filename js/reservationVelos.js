//$(function() {

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

		// Création de la Google Map
	  map = new google.maps.Map(document.getElementById('map'), {
	    center: {lat: 48.856614, lng: 2.3522219000000177},
	    zoom: 12
	  });

	  // Appel à l'API Ville de Paris
		ajaxGet('http://opendata.paris.fr/api/records/1.0/search/?dataset=stations-velib-disponibilites-en-temps-reel&rows=1224&facet=banking&facet=bonus&facet=status&facet=contract_name', function(reponse) {

			var donnees = JSON.parse(reponse);
			var	stations = donnees.records;
			var markers = [];

			// Récupération des coordonnées de chaque borne et création des marqueurs sur la Google Map 
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
				// Affichage formulaire quand clic sur un marker
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
				}); // Fin de l'événement "clic" sur les markers

			}); // Fin de la boucle "stations.forEach"

			// Ouverture du canvas au clic sur le bouton Réserver (si activé)
			$('#bouton_reserver:enabled').click(function() {
				$('#signature').fadeIn();
			});

			// Fermeture formulaire de réservation si clic en dehors du bloc "carte-forulaire"
			$(document.body).click(function(e) {
				var carteDetails = $('#carte_details');
				if (!$(e.target).is(carteDetails) && !$.contains(carteDetails[0], e.target)) {
					$('#bloc_infos_station').fadeOut();
					$('#signature').fadeOut();
				}
			});

			// Utilisation de l'objet markerClusterer (regroupement automatique des marqueurs proches) 
			var markerCluster = new MarkerClusterer(map, markers,{imagePath: 'images/m'});
		}); // Fin appel API Ville de Paris

	} // Fin de la fontion initMap

/////////// Début Gestion canvas //////////////
$(function() {

	// Variables canvas
	var painting = false,
			started = false,
			canvas = $('#canvas'),
			cursorX, cursorY, 
			width_brush = 1,
			restoreCanvasArray = [],
			restoreCanvasIndex = 0;

	var context = canvas[0].getContext('2d');

	// Trait arrondi
	context.lineJoin = 'round';
	context.lineCap = 'round';

	// Mise en place de la fonction de dessin
	function drawLine() {
		// Si début du dessin : initialisation
		if(!started) {
			context.beginPath();
			context.moveTo(cursorX, cursorY);
			started = true;
		}
		//Sinon, je dessine
		else {
			context.lineTo(cursorX, cursorY);
			context.lineWidth = width_brush;
			context.stroke();
		}
	}

	// Effacement du canvas
	function clearCanvas() {
		console.log(canvas.width());
		console.log(canvas.height());
		context.clearRect(0, 0, canvas.width(), canvas.height());
	}

	// Activation dessin si clic souris enfoncé
	canvas.mousedown(function(e) {
		painting = true;

		// Récupération des coordonnées de la souris
		cursorX = e.pageX - $(this).offset().left;
		cursorY = e.pageY - $(this).offset().top;
	});

	// Arrêt dessin si relâchement clic souris
	$(this).mouseup(function() {
		painting = false;
		started = false;
	});

	// Gestion du mouvement de la souris sur le canvas
	canvas.mousemove(function(e) {
		if(painting) {
			// Récupération des coordonnées de la souris
			cursorX = e.pageX - $(this).offset().left;
			cursorY = e.pageY - $(this).offset().top;

			//Dessine une ligne avec drawLine()
			drawLine();
		}
	});

	// Effacement canvas quand clic sur bouton Reset
	$('#reset').click(function() {
		clearCanvas();
	});

	// Redimensionnement canvas selon la taille de l'écran (par défaut width:300px, height:150px)
	var widthWindow = $(window).width();

	$(window).resize(function() {
		if (widthWindow >= '1060px') {
			canvas.attr('width', '300px').attr('height', '150px');
		} else if ((widthWindow >= '769px') && (widthWindow <= '1059px')) {
			canvas.attr('width', '275px').attr('height', '150px');
		} else if ((widthWindow >= '481px') && (widthWindow <= '768px')) {
			canvas.attr('width', '300px').attr('height', '150px');
		} else if (widthWindow <= '480px') {
			canvas.attr('width', '200px').attr('height', '150px');
		}
	});


//////////////// Fin Gestion canvas //////////////////


	// Commandes souris diaporama 

	$('.cmd_left').click(function() {
		$('#bloc_photos div:first-child').remove().appendTo('#bloc_photos');
	});

	$('.cmd_right').click(function() {
		$('#bloc_photos div:last-child').remove().prependTo('#bloc_photos');
	});

});
