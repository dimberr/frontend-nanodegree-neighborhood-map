function ViewModel() {

    var self = this;
    var map;
    var currentLoc = null;
    var currentInfoWindow;
    self.markers = [];
    self.tempMarkers = [];
    self.nearMarkers = ko.observableArray();
    self.photos = ko.observable();
    self.showDesc = ko.observable(false);
    self.placeIndex = ko.observable();



    //filters
    self.filters = ko.observableArray(['All', 'Food', 'Drinks', 'Coffee', 'Shops', 'Arts']);
    self.currentFilter = ko.observable('All');
    self.currentFilter.subscribe(function(newValue) {
        self.updateFilters(newValue);
    });



    //default locations
    self.locations = [{
        placeId: 'ChIJzyx_aNch8TUR3yIFlZslQNA',
        name: 'Great Wall of China (China)',
        location: null,
        description: 'Perhaps the most recognizable symbol of China and its long and vivid history, the Great Wall of China actually consists of numerous walls and fortifications, many running parallel to each other.'
    }, {
        placeId: 'ChIJPRQcHyBxdDkRs1lw_Dj1QnU',
        name: 'Taj Mahal (India)',
        location: null,
        description: 'An immense mausoleum of white marble, built in Agra between 1631 and 1648 by order of the Mughal emperor Shah Jahan in memory of his favourite wife, the Taj Mahal is the jewel of Muslim art in India and one of the universally admired masterpieces of the world\'s heritage.'
    }, {
        placeId: 'ChIJVVVViV-abZERJxqgpA43EDo',
        name: 'Machu Picchu (Peru)',
        location: null,
        description: 'It\'s no wonder Machu Picchu is Peru\'s most-visited site. Dating to the mid-1400s, it\'s a marvel of mortar-free limestone architecture perched on a high plateau deep in the Amazonian jungle. Get there via train from Cusco or, if you\'re not faint-hearted, make the trip on foot via a multi-day hiking trail—you\'ll travel through deep Andean gullies and enjoy stunning views.'
    }, {
        placeId: 'ChIJzbs54n1PWBQRizZuWjV0dMo',
        name: 'Giza Pyramid Complex (Egypt)',
        location: null,
        description: 'Pyramids of Giza, Arabic Ahrāmāt Al-Jīzah, three 4th-dynasty (c. 2575–c. 2465 bce) pyramids erected on a rocky plateau on the west bank of the Nile River near Al-Jīzah (Giza) in northern Egypt. In ancient times they were included among the Seven Wonders of the World. The ancient ruins of the Memphis area, including the Pyramids of Giza, Ṣaqqārah, Dahshūr, Abū Ruwaysh, and Abū Ṣīr, were collectively designated a UNESCO World Heritage site in 1979.'
    }, {
        placeId: 'ChIJbRuqowzq9pQRfphenBd1e5E',
        name: 'Iguazu Falls (Argentine)',
        location: null,
        description: 'One of the great natural wonders of the world, the Iguaçu Falls (Portuguese: Cataratas do Iguaçu, Spanish: Cataratas del Iguazú, Tupi: Y Ûasu "big water") are situated near the border of Brazil, Paraguay, and Argentina. The area is on the UNESCO World Heritage List.'
    }, {
        placeId: 'ChIJD7fiBh9u5kcRYJSMaMOCCwQ',
        name: 'Paris (France)',
        location: null,
        description: 'Year after year, the magnetic City of Light draws travelers looking to cross the Eiffel Tower and Notre Dame off their bucket lists. But what visitors really fall in love with are the city\'s quaint cafes, vibrant markets, trendy shopping districts and unmistakable je ne sais quoi charm.'
    }, {
        placeId: 'ChIJLSea6ooWEDERjUGwVxGoqz4',
        name: 'Angkor Wat (Cambodia)',
        location: null,
        description: 'Angkor is one of the most important archaeological sites in South-East Asia. Stretching over some 400 km2, including forested area, Angkor Archaeological Park contains the magnificent remains of the different capitals of the Khmer Empire, from the 9th to the 15th century. They include the famous Temple of Angkor Wat and, at Angkor Thom, the Bayon Temple with its countless sculptural decorations.'
    }];



    //init map
    self.initMap = function() {

        //styles for Map
        var styles = [{
            "featureType": "administrative",
            "elementType": "labels.text.fill",
            "stylers": [{
                "color": "#444444"
            }]
        }, {
            "featureType": "landscape",
            "elementType": "all",
            "stylers": [{
                "color": "#f2f2f2"
            }]
        }, {
            "featureType": "poi",
            "elementType": "all",
            "stylers": [{
                "visibility": "off"
            }]
        }, {
            "featureType": "road",
            "elementType": "all",
            "stylers": [{
                "saturation": -100
            }, {
                "lightness": 45
            }]
        }, {
            "featureType": "road.highway",
            "elementType": "all",
            "stylers": [{
                "visibility": "simplified"
            }]
        }, {
            "featureType": "road.arterial",
            "elementType": "labels.icon",
            "stylers": [{
                "visibility": "off"
            }]
        }, {
            "featureType": "transit",
            "elementType": "all",
            "stylers": [{
                "visibility": "off"
            }]
        }, {
            "featureType": "water",
            "elementType": "all",
            "stylers": [{
                "color": "#46bcec"
            }, {
                "visibility": "on"
            }]
        }];




        map = new google.maps.Map(document.getElementById('map'), {
            styles: styles,
            mapTypeControl: false,
            backgroundColor: 'none'
        });


        var bounds = new google.maps.LatLngBounds();




        //init default locations to map
        self.initLocations = function(locations) {
            var placeInfoService = new google.maps.places.PlacesService(map);
            var callback = function(place, status) {
                if (status == google.maps.places.PlacesServiceStatus.OK) {

                    //put place object to proper index of locations array
                    for (var i = 0; i < self.locations.length; i++) {
                        if (place.place_id === self.locations[i].placeId) {
                            self.locations[i].location = place;
                        }
                    }

                    //and create marker
                    self.createMarker(place);

                    if (locations.length == markers.length) {
                        self.showMarkers(markers);
                    }
                } else {
                    // throw an error
                    alert('initLocations() error: ' + status);
                }
            };
            for (var i = 0; i < locations.length; i++) {
                placeInfoService.getDetails(locations[i], callback);
            }
        };





        self.createMarker = function(location) {
            // The following group uses the location array to create an array of markers on initialize.
            // Create a marker per location, and put into markers array.

            var marker = new google.maps.Marker({
                map: map,
                position: location.geometry.location,
                placeId: location.place_id,
                title: location.name,
                location: location,
                animation: google.maps.Animation.DROP,
            });

            // Push the marker to our array of markers.
            markers.push(marker);
            // Create an onclick event to show the route from user's location
            marker.addListener('click', function() {
                self.getInfo(location);
            });
        };




        self.createNearMarker = function(location, filter, html, rating) {
            // The following group uses the location array to create an array of markers on initialize.
            // Create a marker per location, and put into markers array.

            var infowindow = new google.maps.InfoWindow({
                maxWidth: 200,
                content: rating
            });

            var marker = new google.maps.Marker({
                map: map,
                position: location,
                animation: google.maps.Animation.DROP,
                filter: filter,
                icon: 'img/blue-dot.png',
                html: html,
                rating: rating,
                infowindow: infowindow,
            });

            infowindow.addListener('closeclick', function() {
                marker.setAnimation(null);
                marker.infowindow = null;
                marker.setIcon('img/blue-dot.png');
            });

            // Push the marker to our array of markers.
            self.nearMarkers.push(marker);
            // Create an onclick event to show the route from user's location
            marker.addListener('click', function() {
                self.markerClick(marker);
            });
        };



        self.markerClick = function(marker) {
            self.disablePreviousMarker();
            currentInfoWindow = marker.infowindow;
            marker.setAnimation(google.maps.Animation.BOUNCE);
            marker.setIcon('img/yellow-dot.png');
            marker.infowindow.open(map, marker);
        };




        self.disablePreviousMarker = function() {

            self.nearMarkers().forEach(function(marker) {
                marker.setIcon('img/blue-dot.png');
                marker.setAnimation(null);
            });
            if (currentInfoWindow) {
                currentInfoWindow.close();
            }
        };



        self.showMarkers = function(markers) {
            //check if any markers were found
            //empty markers array could happen when
            // no palce from foursquare was found
            var bounds = new google.maps.LatLngBounds();
            if (markers.length !== 0) {
                for (var i = 0; i < markers.length; i++) {
                    markers[i].setMap(map);
                    bounds.extend(markers[i].position);
                }

                //fit current Location to the bounds
                if (currentLoc) {
                    bounds.extend(currentLoc.geometry.location);
                }
                map.fitBounds(bounds);
            }
        };




        self.clearAllMarkers = function() {
            for (var i = 0; i < self.markers.length; i++) {
                self.markers[i].setMap(null);
            }
            for (var k = 0; k < self.nearMarkers().length; k++) {
                self.nearMarkers()[k].setMap(null);
            }
            self.nearMarkers.removeAll();
        };




        self.getInfo = function(location, index) {

            if (showDesc() === false) {
                clearAllMarkers();
                self.showDesc(true);
                self.getPhotos(location);
                self.getFoursq(location);
                self.placeIndex(index);
            }
        };




        self.getPhotos = function(location) {
            //get the first photo of the location with Google Maps
            var html = '';
            html += '<img src="' + location.photos[0].getUrl({
                maxHeight: 400,
                maxWidth: 340
            }) + '">';
            self.photos(html);
        };




        self.getFoursq = function(location) {
            //get places around
            currentLoc = location;
            var placesHtml = document.getElementById('foursq');
            var client_id = '5CWHKEMR3L3IE243DGBN0F1I4AO2JB3RBRT0BF1SPO3AKL2K';
            var client_secret = 'WFYUAIRF0HPREFZLPBDVQAPC2KE5QPOAROWBWHALXNMTL0XZ';
            var limit = 5; //show first 5 venues for each category
            var radius = 5000; //radius in meters from location

            var url = 'https://api.foursquare.com/v2/venues/explore?client_id=' + client_id +
                '&client_secret=' + client_secret + '&ll=' + location.geometry.location.lat() +
                ',' + location.geometry.location.lng() + '&radius=' + radius + '&v=20161016&limit=' +
                limit + '&sortByDistance=1';


            var runs = 0;
            var errors = 0;

            for (var i = 1; i < self.filters().length; i++) {
                var newUrl = url + '&section=' + self.filters()[i];
                asyncload(newUrl, self.filters()[i]);
            }

            function asyncload(url, currFilter) {
                $.getJSON(url, function(data) {
                        $.each(data.response.groups[0].items, function(key, val) {
                            //push all venue's categories to filter array
                            var icon = val.venue.categories[0].icon.prefix + '32.png';
                            var latlng = new google.maps.LatLng(val.venue.location.lat, val.venue.location.lng);
                            var html = '<li class="place"><a class="place-link" href="#">' + val.venue.name + '</a><img class="icon" src="' + icon + '"></li> ';
                            var infoWin;
                            if (!val.venue.rating) {
                                infoWin = '<div class="rating">' + val.venue.name + '<br>Rating: Not Rated Yet<br><a href="http://foursquare.com/v/' + val.venue.id + '?ref=' + client_id + '" target="_blank"><img src="img/rsz_foursquare_logo.png"></a></div>';
                            } else {
                                infoWin = val.venue.name + '<br><div style="color:#' + val.venue.ratingColor + '" class="rating">Rating: ' + val.venue.rating + '<br><a href="https://foursquare.com/v/' + val.venue.id + '?ref=' + client_id + '" target="_blank"><img src="img/rsz_foursquare_logo.png"></a></div>';
                            }
                            self.createNearMarker(latlng, currFilter, html, infoWin);
                        });
                    })
                    .done(function() {
                        runs++;
                        if (runs === self.filters().length - 1) {
                            self.showMarkers(self.nearMarkers());
                        }
                    })
                    .fail(function(data) {
                        if (errors === 0) {  //show error only once
                          errors++;
                            alert("error: Failed load data from Foursquare");
                        }
                    });
            }
        };




        //show only relevant markers on the map
        self.updateFilters = function(filter) {
            if (currentInfoWindow) {
                currentInfoWindow.close();
            }
            for (var k = 0; k < self.nearMarkers().length; k++) {
                if (filter === 'All' || self.nearMarkers()[k].filter === filter) {
                    self.nearMarkers()[k].setMap(map);
                } else {
                    self.nearMarkers()[k].setMap(null);
                }
                self.nearMarkers()[k].setIcon('img/blue-dot.png');
            }
        };




        //for reset arrow
        self.reset = function() {
            self.clearAllMarkers();
            self.showMarkers(markers);
            self.showDesc(false);
            self.photos('');
            self.currentFilter('All');
        };




        self.initLocations(locations);

    };
}

function googleError() {
    alert('Error occurred during load of Google Maps API');
}


ko.applyBindings(ViewModel);
