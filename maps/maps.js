Markers = new Mongo.Collection('markers');
Impressions = new Mongo.Collection('impression');

Router.route("/", {
  name: "/",
  template: "homepage",
  // waitOn makes sure that this publication is ready before rendering your template
  waitOn: function(){
    city = Router.current().params.query.city;
    if (city == null) {city = "New York"}
    
    impressionsQuery = {city: city}
    Meteor.subscribe('subsetImpressions', impressionsQuery);

    date = Session.get('date');
    if (date != null) {
      dates = date.split(" ");
      date1 = dates[0].split("/");
      month = parseInt(date1[0]);
      day = parseInt(date1[1]);
      year = parseInt(date1[2]);
      markerQuery = {year: year, month: month, day: day, city: city}
    }
    else {
      markerQuery = {year: 2014, month: 2, day: 13, city: city}
    }
    return Meteor.subscribe("subsetMarkers", markerQuery);
  }
});

if (Meteor.isClient) {

  // initialization 
  Meteor.startup(function() {
    GoogleMaps.load();
    //Session.setPersistent('city', 'NewYork');
  });

  // map functionality
  Template.map.onCreated(function() {
    GoogleMaps.ready('map', function(map) {
      city = Router.current().params.query.city;
      if (city == null) {city = "New York"}
      map.instance.setCenter(getCityLocation(city));
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

        changed: function(newDocument, oldDocument) {
          markers[newDocument._id].setPosition({ lat: newDocument.lat, lng: newDocument.lng });
        },

        removed: function(oldDocument) {
          // Remove the marker from the map
          markers[oldDocument._id].setMap(null);
          // Clear the event listener
          google.maps.event.clearInstanceListeners(markers[oldDocument._id]);
          // Remove the reference to this marker instance
          delete markers[oldDocument._id];
        }
      });
    });
  });

  // search bar
  Template.search.events({
    'submit form': function(event) {
      //Session.setPersistent('city', event.target.city.value);
      var date = $('.datetimepicker').datetimepicker().data().date;
      Session.setPersistent('date', date);
      //console.log(Session.get('date'));
    }
  })

  // date selector
  Template.date.onRendered(function() {
    this.$('.datetimepicker').datetimepicker();
  });

  Template.date.events({
    'submit form': function(event) {
      //console.log(date);
    }
  })

  // data
  Template.board.helpers({
    'marker': function() {
      //var city = Router.current().params.query.city;  
      //if (city == null) {city = "New York"}
      return Markers.find({}, {sort: {year:-1, month:-1, day:-1, time:-1}});
    }
  });

  // impressions
  Template.addImpressionForm.events({
    'submit form': function(){
        event.preventDefault();
        var impVar = event.target.impressiontext.value;
        var city = Router.current().params.query.city;  
        if (city == null) {city = "New York"}
        Meteor.call('createImpression', impVar, city);
        event.target.impressiontext.value = "";
    }
  });
  Template.impressions.helpers({
    'implist': function(){
      var currentUserId = Meteor.userId();
      return Impressions.find({});
    }
  });

  // map styling
  function getCityLocation(name) {
    if (name.localeCompare("New York")==0) {return new google.maps.LatLng(40.7148544,-74.0166855)}
    if (name.localeCompare("Chicago")==0) {return new google.maps.LatLng(41.848739,-87.7596537)}
    if (name.localeCompare("Los Angeles")==0) {return new google.maps.LatLng(33.9800488,-118.349971)}  
  }
  Template.map.helpers({
    mapOptions: function() {
      var city = Router.current().params.query.city;  
      if (city == null) {city = "New York"}
      if (GoogleMaps.loaded()) {
        return {
          center: getCityLocation(city),
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

  // analytics
  Template.charts.onRendered(function() {
    Tracker.autorun(function() {
      var ctx = document.getElementById("doughnutChart").getContext("2d");
      var data = [
      {
          value: Markers.find({"offense": "Grand Larceny"}).count(),
          color:"#FF9933",
          label: "Grand Larceny"
      },
      {
          value: Markers.find({"offense": "Motor Larceny"}).count(),
          color:"#E3DA96",
          label: "Motor Larceny"
      },
      {
          value: Markers.find({"offense": "Robbery"}).count(),
          color:"#ADD681",
          label: "Robbery"
      },
      {
          value: Markers.find({"offense": "Burglary"}).count(),
          color:"#81D6BE",
          label: "Burglary"
      },
      {
          value: Markers.find({"offense": "Felony Assault"}).count(),
          color:"#B781D6",
          label: "Felony Assault"
      },
      {
          value: Markers.find({"offense": "Rape"}).count(),
          color:"#D4576E",
          label: "Rape"
      }]
      var options = {
        //Boolean - Whether we should show a stroke on each segment
        segmentShowStroke : true,

        //String - The colour of each segment stroke
        segmentStrokeColor : "#fff",

        //Number - The width of each segment stroke
        segmentStrokeWidth : 2,

        //Number - The percentage of the chart that we cut out of the middle
        percentageInnerCutout : 50, // This is 0 for Pie charts

        //Number - Amount of animation steps
        animationSteps : 100,

        //String - Animation easing effect
        animationEasing : "easeOutBounce",

        //Boolean - Whether we animate the rotation of the Doughnut
        animateRotate : true,

        //Boolean - Whether we animate scaling the Doughnut from the centre
        animateScale : false,

        //String - A legend template
        legendTemplate : "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<segments.length; i++){%><li><span style=\"background-color:<%=segments[i].fillColor%>\"></span><%if(segments[i].label){%><%=segments[i].label%><%}%></li><%}%></ul>"

      }
      var myDoughnutChart = new Chart(ctx).Doughnut(data,options);
      myDoughnutChart.update();
    });
  });
}

// ****************************************************************************************

Meteor.methods({
  'createImpression': function(impVar, cityVar){
    var currentUser = Meteor.user().emails[0].address;
    var date = new Date();
    if(currentUser && impVar.replace(/\s+/, "")){
        Impressions.insert({
          impsn: impVar,
          time: date.toString().substring(4, 21),
          createdBy: currentUser,
          city: cityVar,
      });
    }
  }
});

// ****************************************************************************************

if (Meteor.isServer) {
  Meteor.publish('subsetMarkers', function(parameters) {
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
          "time": 1,
          "city": 1,
        }   
      })
      //Markers.find({})
    ];
    if (data) {
      return data;
    }
    //console.log(this.ready());
    return this.ready();
  });

  Meteor.publish('subsetImpressions', function(parameters){
    var currentUserId = this.userId;
    data = [
      Impressions.find({"city": parameters.city})
    ];
    if (data) {
      return data;
    }
    return this.read();
    });


  // Debugging helper as we figure out how to insert data points
  Meteor.startup(function() {
    return Meteor.methods({
      removeAllMarkers: function() {
        return Markers.remove({});
      },
      removeAllImpressions: function() {
        return Impressions.remove({});
      }
    });
  });
}

