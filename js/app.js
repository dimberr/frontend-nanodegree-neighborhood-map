function ViewModel() {

    var self = this;
    var map;
    var currentLoc = null;
    self.markers = [];
    self.nearMarkers = [];
    self.photos = ko.observable();
    self.foursq = ko.observable();
    self.locationInfo = ko.observableArray();
    self.visible = ko.observable(false);
    self.filtersArr = ko.observableArray();
    self.showDesc = ko.observable(false);
    self.descArr = ko.observableArray();
    self.descClass = ko.observable('');



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
        placeId: 'ChIJ9Wtt1l9uIysRMCRnhVTydRE',
        name: 'Uluru (Australia)',
        location: null,
        description: 'World Heritage-listed Uluru is one of Australia’s most iconic symbols. Located in the heart of Uluru-Kata Tjuta National Park in Australia’s Red Centre, Uluru is an ancient landscape, rich in Australian indigenous culture and spirituality. There are many ways to experience the majesty of Uluru and the beauty of this unique desert landscape.'
    }, {
        placeId: 'ChIJLSea6ooWEDERjUGwVxGoqz4',
        name: 'Angkor Wat (Cambodia)',
        location: null,
        description: 'Angkor is one of the most important archaeological sites in South-East Asia. Stretching over some 400 km2, including forested area, Angkor Archaeological Park contains the magnificent remains of the different capitals of the Khmer Empire, from the 9th to the 15th century. They include the famous Temple of Angkor Wat and, at Angkor Thom, the Bayon Temple with its countless sculptural decorations.'
    }];


    //set description array to true
    for (var i = 0; i < locations.length; i++) {
        self.descArr.push(true);
    }


    //set filters
    self.filters = [{
        name: 'All',
        filter: null
    }, {
        name: 'Food',
        filter: 'food'
    }, {
        name: 'Drinks',
        filter: 'drinks'
    }, {
        name: 'Coffee',
        filter: 'coffee'
    }, {
        name: 'Shops',
        filter: 'shops'
    }, {
        name: 'Arts',
        filter: 'arts'
    }];

    //set filters to 'All'
    filtersArr.push(true);
    for (var i = 1; i < filters.length; i++) {
        filtersArr.push(false);
    }




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
            maxZoom: 15,
            backgroundColor: 'none'
        });

        var bounds = new google.maps.LatLngBounds();

        //init default locations to map
        self.initLocations = function(locations) {
            var locId = 0;
            var placeInfoService = new google.maps.places.PlacesService(map);
            var callback = function(place, status) {
                if (status == google.maps.places.PlacesServiceStatus.OK) {
                    self.locations[locId].location = place;
                    createMarker(place);
                    locId++;
                    if (locations.length == markers.length) {
                        showMarkers(markers);
                    }
                } else {
                    // throw error
                    alert('initLocations() error: ' + status);
                }
            };
            for (var i = 0; i < locations.length; i++) {
                placeInfoService.getDetails(locations[i], callback);
            }

        };



        self.createMarker = function(location, boolean) {
            // The following group uses the location array to create an array of markers on initialize.
            // Create a marker per location, and put into markers array.
            var animation;
            var icon;
            if (boolean) {
                animation = google.maps.Animation.BOUNCE;
                icon = 'img/position.png';

            } else {
                animation = google.maps.Animation.DROP;
            }
            var marker = new google.maps.Marker({
                map: map,
                position: location.geometry.location,
                placeId: location.place_id,
                title: location.name,
                location: location,
                animation: animation,
                icon: icon
            });

            // Push the marker to our array of markers.
            markers.push(marker);
            // Create an onclick event to show the route from user's location
            marker.addListener('click', function() {
                // drawRoute(this);
                self.getInfo(location);
            });
        };


        self.createNearMarker = function(location) {

            // The following group uses the location array to create an array of markers on initialize.
            // Create a marker per location, and put into markers array.
            var marker = new google.maps.Marker({
                map: map,
                position: location,
                animation: google.maps.Animation.DROP,
                icon: 'img/blue-dot.png'
            });
            // Push the marker to our array of markers.
            self.nearMarkers.push(marker);
            // Create an onclick event to show the route from user's location
            marker.addListener('click', function() {});
        };


        self.showMarkers = function(markers) {
            //clear all previous markers
            if (markers.length !== 0) {
                var bounds = new google.maps.LatLngBounds();
                for (var i = 0; i < markers.length; i++) {
                    markers[i].setMap(map);
                    bounds.extend(markers[i].position);
                }
                map.fitBounds(bounds);
            }
        };


        self.clearAllMarkers = function() {
            for (var i = 0; i < self.markers.length; i++) {
                self.markers[i].setMap(null);
            }
            for (var k = 0; k < nearMarkers.length; k++) {
                self.nearMarkers[k].setMap(null);
            }
            self.nearMarkers = [];
        };



        self.getInfo = function(location, index) {

            if (showDesc() === false) {
                clearAllMarkers();
                self.showDesc(true);
                self.createMarker(location, true);
                self.getPhotos(location);
                self.getFoursq(location);
                self.updateDesc(index);
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


        self.getFoursq = function(location, filter) {
            //get places around
            currentLoc = location;
            self.visible(true);
            var html = '';
            var placesHtml = document.getElementById('foursq');
            var client_id = '5CWHKEMR3L3IE243DGBN0F1I4AO2JB3RBRT0BF1SPO3AKL2K';
            var client_secret = 'WFYUAIRF0HPREFZLPBDVQAPC2KE5QPOAROWBWHALXNMTL0XZ';
            var limit = '20'; //show first 20 venues
            var radius = '2500'; //radius in meters from location

            var url = 'https://api.foursquare.com/v2/venues/explore?client_id=' + client_id +
                '&client_secret=' + client_secret + '&ll=' + location.geometry.location.lat() +
                ',' + location.geometry.location.lng() + '&radius=' + radius + '&v=20161016&limit=' +
                limit + '&sortByDistance=1';

            if (filter) {
                url += '&section=' + filter;
            } else {
                url += '&section=food,drinks,coffee,shops,arts';
            }

            $.getJSON(url, function(data) {

                    $.each(data.response.groups[0].items, function(key, val) {
                        //push all venue's categories to filter array
                        var icon = val.venue.categories[0].icon.prefix + '32.png';
                        var latlng = new google.maps.LatLng(val.venue.location.lat, val.venue.location.lng);
                        createNearMarker(latlng);
                        html += '<li class="place"><a class="place-link" href="https://foursquare.com/v/' + val.venue.id + '?ref=' + client_id + '"target="_blank">' + val.venue.name + '</a><img class="icon" src="' + icon + '"></li> ';
                    });
                })
                .done(function() {
                    if (html === '') {
                        html = 'Nothing found :(';
                    }
                    locationInfo(html);
                    showMarkers(self.nearMarkers);
                })
                .fail(function(data) {
                    alert("error:" + data);
                });
        };


        self.updateFilters = function(filter, index) {
            clearAllMarkers();
            self.createMarker(currentLoc, true);
            self.getFoursq(currentLoc, filter);
            for (var i = 0; i < self.filtersArr().length; i++) {
                if (i == index) {
                    self.filtersArr()[i] = true;
                } else {
                    self.filtersArr()[i] = false;
                }
            }
            self.filtersArr.valueHasMutated();
        };

        self.updateDesc = function(index) {
            for (var i = 0; i < self.descArr().length; i++) {
                if (i == index) {
                    self.descArr()[i] = true;
                } else {
                    self.descArr()[i] = false;
                }
            }
            self.descArr.valueHasMutated();
            self.descClass('desc nohover');
        };

        self.resetDesc = function() {
            for (var i = 0; i < self.descArr().length; i++) {
                self.descArr()[i] = true;
            }
            self.descArr.valueHasMutated();
        };


        //for reset arrow
        self.reset = function() {
            self.clearAllMarkers();
            self.markers = [];
            self.showDesc(false);
            self.descClass('');
            self.visible(false);
            self.photos('');
            self.foursq('');
            self.locationInfo('');
            self.resetDesc();
            initLocations(locations);
        };


        self.initLocations(locations);

    };
}

function googleError() {
    alert('Error occurred during load of Google Maps API');
}


ko.applyBindings(ViewModel);
