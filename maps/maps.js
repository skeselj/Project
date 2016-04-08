Markers = new Mongo.Collection('markers');

if (Meteor.isClient) {
  Template.map.onCreated(function() {
    GoogleMaps.ready('map', function(map) {
      // makes clicks add points - comment out to remove function
      //google.maps.event.addListener(map.instance, 'click', function(event) {
      //  Markers.insert({ lat: event.latLng.lat(), lng: event.latLng.lng(), typ: "theft", tim: "21:31:54", dat: "03/31/16", mag: 3});
      //});
      var markers = {};
      function getScaleFactor(zoom) {
            return zoom*zoom*zoom/12/12/10
      };
      Markers.find().observe({
        added: function (document) {
          var marker = new google.maps.Marker({
            position: new google.maps.LatLng(document.latitude, document.longitude),
            //animation: google.maps.Animation.DROP,
            map: map.instance,
            draggable: false,
            magnitude: document.magnitude,
            id: document._id,
            // icon:
            opacity: 0.73,
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: getScaleFactor(map.instance.getZoom())*document.magnitude,
              strokeColor: '#FF8000',
              fillColor: '#FF8000',
              fillOpacity: 1,  
            },
          });
          // every time a point is dragged, update its position
          //google.maps.event.addListener(marker, 'dragend', function(event) {
          //  Markers.update(marker.id, { $set: { lat: event.latLng.lat(), lng: event.latLng.lng() }});
          //});
          // every time the zoom is changed, adjust marker sizes
          google.maps.event.addListener(map.instance, 'zoom_changed', function(event) {
            marker.setIcon({
                path: google.maps.SymbolPath.CIRCLE,
                scale: getScaleFactor(map.instance.getZoom())*marker.magnitude,
                strokeColor: '#FF8000',
                fillColor: '#FF8000',
                fillOpacity: 1,   
            });
          });

          markers[document._id] = marker;
        },
        //changed: function (newDocument, oldDocument) {
        //  markers[newDocument._id].setPosition({ lat: newDocument.lat, lng: newDocument.lng });
        //},
        //removed: function (oldDocument) {
        //  markers[oldDocument._id].setMap(null);
        //  google.maps.event.clearInstanceListeners(markers[oldDocument._id]);
        //  delete markers[oldDocument._id];
        //},
      });

      // experimental: iterate through the markers (problem)
      //var markerCursor = Markers.find({});
      //var markers = markerCursor.fetch();
      //for (var i=0; i<markers.length; i++) {
      //  console.log( markers[i].tim );
      //}

    });
  });
  
  Template.board.helpers({
    'marker': function() {
      return Markers.find({}, {sort: {year:1, month:1, day:1, time:1}});
    }
  });

  Meteor.startup(function() {
    Meteor.startup(function() {
    GoogleMaps.load();
    var counter = new Object();
    var rows = [];
    var cursor = Markers.find({});

    cursor.forEach(function(markers) {
      if (counter[markers.offense] == undefined)
        counter[markers.offense] = 1;
      else
        counter[markers.offense]++;
    })
    
    for (var offense in counter) {
      rows.push([offense, counter[offense]]);
    }

    chart = {
      target: 'chart1',
      type: 'PieChart',
      columns: [
        ['string', 'Type'],
        ['number', 'Frequency']
      ],
      rows: rows,
      options: {title: 'Crimes by Type', legend: 'none'}
    };

    drawChart(chart);
  });
  });

  Template.map.helpers({
    mapOptions: function() {
      if (GoogleMaps.loaded()) {
        return {
          center: new google.maps.LatLng(40.7148544,-74.0166855),
          zoom: 12,
          disableDefaultUI: true,
          zoomControl: true,
          zoomControlOptions: {
            position: google.maps.ControlPosition.LEFT_CENTER
          },

          // Styles found on Snazzy Maps.
          styles: [{
              "featureType": "water",
              "elementType": "geometry",
              "stylers": [{
                 "color": "#333333"
             }, {
                 "lightness": 17
             }]
          }, {
              "featureType": "landscape",
             "elementType": "geometry",
              "stylers": [{
                  "color": "#777777"
              }, {
                  "lightness": 20
              }]
          }, {
              "featureType": "road.highway",
              "elementType": "geometry.fill",
              "stylers": [{
                  "color": "#000000"
              }, {
                  "lightness": 17
             }]
         }, {
              "featureType": "road.highway",
              "elementType": "geometry.stroke",
              "stylers": [{
                  "color": "#000000"
              }, {
                  "lightness": 29
              }, {
                  "weight": 0.2
             }]
          }, {
              "featureType": "road.arterial",
              "elementType": "geometry",
              "stylers": [{
                  "color": "#000000"
              }, {
                 "lightness": 18
              }]
         }, {
             "featureType": "road.local",
             "elementType": "geometry",
             "stylers": [{
                 "color": "#000000"
             }, {
                 "lightness": 16
             }]
         }, {
             "featureType": "poi",
             "elementType": "geometry",
             "stylers": [{
                 "color": "#000000"
             }, {
                 "lightness": 21
             }]
         }, {
             "elementType": "labels.text.stroke",
             "stylers": [{
                 "visibility": "on"
             }, {
                 "color": "#000000"
             }, {
                  "lightness": 16
             }]
         }, {
             "elementType": "labels.text.fill",
             "stylers": [{
                 "saturation": 36
             }, {
                 "color": "#000000"
             }, {
                 "lightness": 40
             }]
         }, {
             "elementType": "labels.icon",
             "stylers": [{
                 "visibility": "off"
             }]
         }, {
             "featureType": "transit",
             "elementType": "geometry",
             "stylers": [{
                 "color": "#000000"
             }, {
                 "lightness": 19
             }]
         }, {
              "featureType": "administrative",
             "elementType": "geometry.fill",
             "stylers": [{
                 "color": "#000000"
              }, {
                 "lightness": 20
             }]
         }, {
             "featureType": "administrative",
              "elementType": "geometry.stroke",
              "stylers": [{
                 "color": "#000000"
             }, {
                  "lightness": 17
              }, {
                 "weight": 1.2
              }]
            }]
          };
        }
      }
    });
}

if (Meteor.isServer) {
  // Debugging helper as we figure out how to insert data points
  Meteor.startup(function() {
    return Meteor.methods({
      removeAllMarkers: function() {
        return Markers.remove({});
      }
    });
  });
}

