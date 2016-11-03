//$(function() {

	////////////////////////////////////////
	/////////// Gestion diaporama //////////
	////////////////////////////////////////

	$('.cmd_left').click(function() {
		$('#bloc_photos div:first-child').remove().appendTo('#bloc_photos');
	});

	$('.cmd_right').click(function() {
		$('#bloc_photos div:last-child').remove().prependTo('#bloc_photos');
	});

	//////////////////////////////////////////////////////
	/////////// Gestion Google Map + Formulaire //////////
	//////////////////////////////////////////////////////

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
					$('#erreur').fadeOut();
					var titreEtiquette = document.createElement('h4');
					titreEtiquette.innerHTML = 'Station n°<span id="nomStation">' + nomStation + '</span>';
					
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
						$('#bouton_reserver').attr('disabled', 'disabled');
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

				var offsetSignature = $('#signature').offset().top;
				$('html, body').animate({scrollTop: offsetSignature}, 1000);
				return false;
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

/////////////////////////////////////////
/////////// Gestion canvas //////////////
/////////////////////////////////////////

$(function() {

	// Chargement des réservations en cours avec sessionStorage
	function chargerReservation() {
	  if (sessionStorage.getItem('reservation')) {
	  	document.getElementById('storage_data').innerHTML = sessionStorage.getItem('reservation');
	  	$('#resume').fadeIn();
	  	$('#message_reservation').hide();
	  }
	}
	chargerReservation();

// Variables canvas
	var painting = false,
			started = false,
			canvas = $('#canvas'),
			canvasAll = $('canvas'),
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
	function checkWidthWindow() {
		if ($(window).width() >= '1043') {
			canvasAll.attr('width', '300').attr('height', '150');
		} else if (($(window).width() >= '752') && ($(window).width() <= '1042')) {
			canvasAll.attr('width', '275').attr('height', '150');
		} else if (($(window).width() >= '464') && ($(window).width() <= '751')) {
			canvasAll.attr('width', '300').attr('height', '150');
		} else if ($(window).width() <= '463') {
			canvasAll.attr('width', '200').attr('height', '150');
		}
	}

	$(window).resize(checkWidthWindow);

	// Vérification présence signature dans le canvas pour valider la réservation
	var canvasJS = document.getElementById('canvas'),
			blankCanvas = document.getElementById('blank'),
			nomStationRecup = $('#nomStation').text();

	var decompte;
	function diminuerCompteur() {
		var minutesElt = document.getElementById('minutes'),
				secondesElt = document.getElementById('secondes'),
				minutes = Number(minutesElt.textContent),
				secondes = Number(secondesElt.textContent);

		if (secondes > 0) {
			secondesElt.textContent = secondes - 1;
		} else {
			if (minutes > 0) {
				minutesElt.textContent = minutes - 1;
				secondesElt.textContent = '59';
			} else if (minutes === 0) {
				$('#message_reservation').hide().html('<span class="alert">La durée de 20 minutes est écoulée, votre réservation a été annulée</span>').fadeIn();
				clearInterval(decompte);
			}
		}
	}

	$('#bouton_valider').click(function() {
		
		// Affichage message d'erreur si pas de signature dans le canvas
		if (canvasJS.toDataURL() == blankCanvas.toDataURL()) {
			$('#erreur').fadeIn().delay(5000).fadeOut();
		} 
		// Validation de la réservation, affichage de la réservation dans la section "résumé" et lancement du timer de 20 minutes
		else {
			clearInterval(decompte);
			var nomStationRecup = $('#nomStation').text();

			$('#storage_data').hide();
			$('#message_reservation').hide();
			$('#signature').fadeOut();
			clearCanvas();
			$('#nom_station').text(nomStationRecup);
			$('#minutes').text('20');
			$('#secondes').text('0');
			$('#message_reservation').fadeIn();
			$('#resume').fadeIn();
			decompte = setInterval(diminuerCompteur, 1000);

			var donneesReservation = document.getElementById('message_reservation').textContent;
			sessionStorage.setItem('reservation', donneesReservation);

			var offsetResume = $('#resume').offset().top;
			$('html, body').animate({scrollTop: offsetResume}, 1000);
			return false;
		}
	});

// Dimensionnement initial canvas
checkWidthWindow();

//////////////// Fin Gestion canvas //////////////////

});
