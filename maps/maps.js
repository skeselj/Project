Markers = new Mongo.Collection('markers');
//var query = {"year":2006, "month":2, "day":22};
var parameters = {year: 2006, month: 2, day: 22}

if (Meteor.isClient) {

  Template.map.onCreated(function() {
    var self = this;

    GoogleMaps.ready('map', function(map) {
      var markers = {}
      function getScaleFactor(zoom) {
        return zoom*zoom*zoom/12/12/10
      };
      function getColor(offense) {
        if (offense.localeCompare("Grand Larceny")==0) {return '#FF9933'}
        if (offense.localeCompare("Motor Larceny")==0) {return '#E3DA96'}
        if (offense.localeCompare("Robbery")==0) {return '#ADD681'}
        if (offense.localeCompare("Burglary")==0) {return '#81D6BE'}
        if (offense.localeCompare("Felony Assault")==0) {return '#B781D6'}
        if (offense.localeCompare("Rape")==0) {return '#D4576E'}
        return "FFFFFF"
      }
      self.autorun(function() {
        var handle = Meteor.subscribe('subsets', parameters);
        if (handle.ready()) {
          var documents = Markers.find().fetch();

          _.each(documents, function(document) {
            var marker = new google.maps.Marker({
            position: new google.maps.LatLng(document.latitude, document.longitude),
            map: map.instance,
            draggable: false,
            magnitude: document.magnitude,
            id: document._id,
            infowindow: new google.maps.InfoWindow({
              content: document.offense.concat(" at ",document.time," on ",document.month,"/",document.day,"/",document.year)
            }),
            // icon:
            opacity: 0.73,
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: getScaleFactor(map.instance.getZoom()) * (document.magnitude),
              strokeColor: getColor(document.offense),
              fillColor: getColor(document.offense),
              fillOpacity: 1,  
            },
          });
          // every time the zoom is changed, adjust marker sizes
          google.maps.event.addListener(map.instance, 'zoom_changed', function(event) {
            marker.setIcon({
                path: google.maps.SymbolPath.CIRCLE,
                scale: getScaleFactor(map.instance.getZoom())*marker.magnitude,
                strokeColor: getColor(document.offense),
                fillColor: getColor(document.offense),
                fillOpacity: 1,   
            });
          });
          // if a marker is clicked, display information about it
          google.maps.event.addListener(marker, 'click', function(event) {
            marker.infowindow.open(map.instance, marker);
          });

          markers[document._id] = marker;

          })
        }
      })
      






      /**
      var markers = {};
      function getScaleFactor(zoom) {
        return zoom*zoom*zoom/12/12/10
      };
      function getColor(offense) {
        if (offense.localeCompare("Grand Larceny")==0) {return '#FF9933'}
        if (offense.localeCompare("Motor Larceny")==0) {return '#E3DA96'}
        if (offense.localeCompare("Robbery")==0) {return '#ADD681'}
        if (offense.localeCompare("Burglary")==0) {return '#81D6BE'}
        if (offense.localeCompare("Felony Assault")==0) {return '#B781D6'}
        if (offense.localeCompare("Rape")==0) {return '#D4576E'}
        return "FFFFFF"
      }
      Markers.find().observe({
        added: function (document) {

          var marker = new google.maps.Marker({
            position: new google.maps.LatLng(document.latitude, document.longitude),
            map: map.instance,
            draggable: false,
            magnitude: document.magnitude,
            id: document._id,
            infowindow: new google.maps.InfoWindow({
              content: document.offense.concat(" at ",document.time," on ",document.month,"/",document.day,"/",document.year)
            }),
            // icon:
            opacity: 0.73,
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: getScaleFactor(map.instance.getZoom())*document.magnitude,
              strokeColor: getColor(document.offense),
              fillColor: getColor(document.offense),
              fillOpacity: 1,  
            },
          });
          // every time the zoom is changed, adjust marker sizes
          google.maps.event.addListener(map.instance, 'zoom_changed', function(event) {
            marker.setIcon({
                path: google.maps.SymbolPath.CIRCLE,
                scale: getScaleFactor(map.instance.getZoom())*marker.magnitude,
                strokeColor: getColor(document.offense),
                fillColor: getColor(document.offense),
                fillOpacity: 1,   
            });
          });
          // if a marker is clicked, display information about it
          google.maps.event.addListener(marker, 'click', function(event) {
            marker.infowindow.open(map.instance, marker);
          });

          markers[document._id] = marker;
        },
      }); **/
    });
  });

  // Table
  Template.board.helpers({
    'marker': function() {
      return Markers.find({}, {sort: {year:-1, month:-1, day:-1, time:-1}});
    }
  });

  // Pie chart
  Meteor.startup(function() {
  
    GoogleMaps.load();
    /**
    var counter = new Object();
    var rows = [];
    var cursor = Markers.find({});
    

    cursor.forEach(function(markers) {
      if (counter[markers.offense] == undefined)
        counter[markers.offense] = 1;
      else
        counter[markers.offense]++;
    })
    console.log(counter);
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
    **/
  });

  // Map style
  Template.map.helpers({
    mapOptions: function() {
      if (GoogleMaps.loaded()) {
        return {
          center: new google.maps.LatLng(40.7148544,-74.0166855),
          zoom: 12,
          disableDefaultUI: true,
          zoomControl: true,
          zoomControlOptions: {
            position: google.maps.ControlPosition.LEFT_TOP
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
   Meteor.publish('subsets', function(parameters) {
    data = [
      Markers.find({"year": parameters.year, "month": parameters.month, "day": parameters.day}, {
        fields: {
          "year": 1,
          "month": 1,
          "day": 1,
          "offense": 1,
          "latitude": 1,
          "longitude": 1,
          "magnitude": 1,
          "time": 1
        }
      })
    ];
    if (data) {
      return data;
    }
    return this.ready();
  });


  // Debugging helper as we figure out how to insert data points
  Meteor.startup(function() {
    return Meteor.methods({
      removeAllMarkers: function() {
        return Markers.remove({});
      }
    });
  });
}

