Markers = new Mongo.Collection("markers");
Impressions = new Mongo.Collection("impression");

Router.route('/', {
  name: '/',
  template: 'homepage',

  waitOn: function() {
    Session.set('city', 'New York')
    Session.set('from_date', '01/01/2015')
    Session.set('to_date', '01/01/2015')
    Session.set('heat', 'false')
    return Meteor.subscribe("subsetMarkers", {city: "New York", w1: 101, w2: 101});
  }
});

Router.route('/:city/:m1/:d1/:m2/:d2', {
  name: 'custom',
  template: "homepage",
  // waitOn makes sure that this publication is ready before rendering your template
  waitOn: function() {
    function dayDist(f_day, f_mon, s_day, s_mon) {
      if (f_mon > s_mon) {return -1}
      counts = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31, 30, 31]
      count = 0
      for (i = f_mon; i < s_mon; i++) {count += counts[i]}
      return count + s_day - f_day
    }

    var city = this.params.city;
    var m1 = parseInt(this.params.m1)
    var d1 = parseInt(this.params.d1)
    var m2 = parseInt(this.params.m2)
    var d2 = parseInt(this.params.d2)
    
    Session.set('city', city);
    Session.set('from_date', "" + this.params.m1 + "/" + this.params.d1 + "/2015")
    Session.set('to_date', "" + this.params.m2 + "/" + this.params.d2 + "/2015")

    impressionsQuery = {city: city}
    Meteor.subscribe('subsetImpressions', impressionsQuery)
    measure1 = parseInt("" + this.params.m1 + this.params.d1)
    measure2 = parseInt("" + this.params.m2 + this.params.d2)
    
    if (dayDist(d1, m1 - 1, d2, m2 - 1) < 3) {
      Session.set('heat', 'false');
    }
    else if (dayDist(d1, m1 - 1, d2, m2 - 1) < 8) {
      Session.set('heat', 'true');
    }
    else {
      Session.set('heat', 'false')
      return;
    }
    
    return Meteor.subscribe("subsetMarkers", markerQuery = {city: city, w1: measure1, w2: measure2}
    );
  }
});

if (Meteor.isClient) {

  // initialization 
  Meteor.startup(function() {
    GoogleMaps.load({
      libraries: 'places,visualization'
    });
    //Session.setPersistent('city', 'NewYork');
  });

  // map functionality
  Template.map.onCreated(function() {
    GoogleMaps.ready('map', function(map) {
      city = Session.get('city'); 
      map.instance.setCenter(getCityLocation(city));
      var markers = {};
      var allData = [];


      function getScaleFactor(zoom) {
        return zoom*zoom*zoom/12/12/10
      };
      function getColor(offense) {
        city = Session.get('city');
        if (city.localeCompare("New York") == 0) {
          if (offense.localeCompare("Grand Larceny")==0) {return '#FF9933'}
          if (offense.localeCompare("Motor Larceny")==0) {return '#E3DA96'}
          if (offense.localeCompare("Robbery")==0) {return '#ADD681'}
          if (offense.localeCompare("Burglary")==0) {return '#81D6BE'}
          if (offense.localeCompare("Felony Assault")==0) {return '#B781D6'}
          if (offense.localeCompare("Rape")==0) {return '#D4576E'}
          if (offense.localeCompare("Murder")==0) {return '#3399ff'}
        }
        if (city.localeCompare("Chicago") == 0) {
          if (offense.localeCompare("Drug/Alcohol")==0) {return '#FF9933'}
          if (offense.localeCompare("Theft")==0) {return '#E3DA96'}
          if (offense.localeCompare("Criminal Damage")==0) {return '#ADD681'}
          if (offense.localeCompare("Minor Offense")==0) {return '#81D6BE'}
          if (offense.localeCompare("Assault")==0) {return '#B781D6'}
          if (offense.localeCompare("Weapons Violation")==0) {return '#D4576E'}
          if (offense.localeCompare("Fraud")==0) {return '#3399ff'}
          if (offense.localeCompare("Offense Involving Children")==0) {return '#33cc33'}
          if (offense.localeCompare("Sexual Assault")==0) {return '#ffff00'}
          if (offense.localeCompare("Sex/Prostitution")==0) {return '#996600'}
          if (offense.localeCompare("Trafficking")==0) {return '#ff33cc'}
          if (offense.localeCompare("Homicide")==0) {return '#a6a6a6'}

        }
        if (city.localeCompare("Los Angeles") == 0) {
          if (offense.localeCompare("Drug/Alcohol")==0) {return '#FF9933'}
          if (offense.localeCompare("Assault")==0) {return '#E3DA96'}
          if (offense.localeCompare("Minor Offense")==0) {return '#ADD681'}
          if (offense.localeCompare("Theft")==0) {return '#81D6BE'}
          if (offense.localeCompare("Fraud")==0) {return '#B781D6'}
          if (offense.localeCompare("Sex/Prostitution")==0) {return '#D4576E'}
          if (offense.localeCompare("Rape")==0) {return '#3399ff'}
          if (offense.localeCompare("Homicide")==0) {return '#33cc33'}
        }
        else
          return "#CCFF66"
      }
      Markers.find().observe({
        added: function (document) {
          if (Session.get('heat').localeCompare('false') == 0) {
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
          }
          
          else if (Session.get('heat').localeCompare('true') == 0) {
            allData.push(new google.maps.LatLng(document.latitude, document.longitude));
          }
        
        },
        /*
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
        */
      });

      
      if (Session.get('heat').localeCompare('true') == 0) {
        var Xdata = new google.maps.MVCArray(allData);
        var heatMapLayer = new google.maps.visualization.HeatmapLayer({
          data: Xdata,
          radius: 20
        });
        heatMapLayer.setMap(map.instance);
      }
      
    });
  });

  // search bar
  Template.search.helpers({
    currentCity: function() {
      return Session.get('city')
    }
  })

  // from selector
  Template.from_date.onRendered(function() {
    this.$('.datetimepicker1').datetimepicker({
      defaultDate: Session.get('from_date'),
      format: "MM/DD/YYYY"
    });
  });
  // to selector 
  Template.to_date.onRendered(function() {
    this.$('.datetimepicker2').datetimepicker({
      defaultDate: Session.get('to_date'),
      format: "MM/DD/YYYY"
    });
  });

  Template.from_date.events({
    'submit form': function(event) {
    }
  })

  // go (submit button)
  Template.go.events({
    'submit form': function(event) {
      event.preventDefault();
      date1 = $('.datetimepicker1').datetimepicker().data().date
      date2 = $('.datetimepicker2').datetimepicker().data().date
      if (date1 == undefined || date2 == undefined) {
        Router.go('/');
      }
      else {
        d1 = date1.split("/")
        d2 = date2.split("/")
        Router.go('custom', {city: $("#searchbarid").val(), m1: d1[0], d1: d1[1], m2: d2[0], d2: d2[1]})
      }
      /**
      var from_date = $('.datetimepicker1').datetimepicker().data().date;
      Session.setPersistent('from_date', from_date);
      var to_date = $('.datetimepicker2').datetimepicker().data().date;
      Session.setPersistent('to_date', to_date);
      city = $("#searchbarid").val();
      Session.setPersistent('city', city);
      **/
    }
  })

  // data
  Template.board.helpers({
    'marker': function() {
      //var city = Router.current().params.query.city;  
      //if (city == null) {city = "New York, NY"}
      return Markers.find({}, {sort: {year:1, month:1, day:1, time:1}});
    }
  });

  // impressions
  Template.addImpressionForm.events({
    'submit form': function(){
        event.preventDefault();
        var impVar = event.target.impressiontext.value;
        var city = Session.get('city');
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

  Template.newlogin.events({
    'click .btnLogin': function() {
      event.preventDefault();
      var logEmail = document.loginform.logemail.value;
      var logPassword = document.loginform.logpassword.value;
      Meteor.loginWithPassword(logEmail, logPassword);
    },
    'click .btnSignUp': function() {
      event.preventDefault();
      var regEmail = document.registerform.regemail.value;
      var regUsername = document.registerform.regusername.value;
      var regPassword = document.registerform.regpassword.value;
      Accounts.createUser({
        email: regEmail,
        password: regPassword, 
        username: regUsername
      })
    }
  });

  Template.dashboard.events({
    'click .logout': function(event){
      event.preventDefault();
      Meteor.logout();
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
      if (GoogleMaps.loaded()) {
        city = Session.get('city')
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
    //Tracker.autorun(function() {
      city = Session.get('city')
      var ctx = document.getElementById("doughnutChart").getContext("2d")
      if (city.localeCompare("New York") == 0) {
        var data = [
        {
            value: Markers.find({"offense": "Grand Larceny"}).count(),
            color: "#FF9933",
            label: "Grand Larceny"
        }, {
            value: Markers.find({"offense": "Motor Larceny"}).count(),
            color: "#E3DA96",
            label: "Motor Larceny"
        }, {
            value: Markers.find({"offense": "Robbery"}).count(),
            color: "#ADD681",
            label: "Robbery"
        }, {
            value: Markers.find({"offense": "Burglary"}).count(),
            color: "#81D6BE",
            label: "Burglary"
        }, {
            value: Markers.find({"offense": "Felony Assault"}).count(),
            color: "#B781D6",
            label: "Felony Assault"
        }, {
            value: Markers.find({"offense": "Rape"}).count(),
            color: "#D4576E",
            label: "Rape"
        }, {
            value: Markers.find({"offense": "Murder"}).count(),
            color: "#3399ff",
            label: "Murder"
        }]
      }
      else if (city.localeCompare("Chicago") == 0) {
        var data = [
        {
            value: Markers.find({"offense": "Drug/Alcohol"}).count(),
            color: "#FF9933",
            label: "Drug/Alcohol"
        }, {
            value: Markers.find({"offense": "Theft"}).count(),
            color: "#E3DA96",
            label: "Theft"
        }, {
            value: Markers.find({"offense": "Criminal Damage"}).count(),
            color: "#ADD681",
            label: "Criminal Damage"
        }, {
            value: Markers.find({"offense": "Minor Offense"}).count(),
            color: "#81D6BE",
            label: "Minor Offense"
        }, {
            value: Markers.find({"offense": "Assault"}).count(),
            color: "#B781D6",
            label: "Assault"
        }, {
            value: Markers.find({"offense": "Weapons Violation"}).count(),
            color: "#D4576E",
            label: "Weapons Violation"
        }, {
            value: Markers.find({"offense": "Fraud"}).count(),
            color: "#3399ff",
            label: "Fraud"
        }, {
            value: Markers.find({"offense": "Offense Involving Children"}).count(),
            color: "#33cc33",
            label: "Offense Involving Children"
        }, {
            value: Markers.find({"offense": "Sexual Assault"}).count(),
            color: "#ffff00",
            label: "Sexual Assault"
        }, {
            value: Markers.find({"offense":"Sex/Prostitution"}).count(),
            color: "#996600",
            label: "Sex/Prostitution"
        }, {
            value: Markers.find({"offense": "Trafficking"}).count(),
            color: "#ff33cc",
            label: "Trafficking"
        }, {
            value: Markers.find({"offense": "Homicide"}).count(),
            color: "#a6a6a6",
            label: "Homicide"
        }]
      }
      else if (city.localeCompare("Los Angeles") == 0) {
        var data = [
        {
            value: Markers.find({"offense": "Drug/Alcohol"}).count(),
            color:"#FF9933",
            label: "Drug/Alcohol"
        }, {
            value: Markers.find({"offense": "Assault"}).count(),
            color:"#E3DA96",
            label: "Assault"
        }, {
            value: Markers.find({"offense": "Minor Offense"}).count(),
            color:"#ADD681",
            label: "Minor Offense"
        }, {
            value: Markers.find({"offense": "Theft"}).count(),
            color:"#81D6BE",
            label: "Theft"
        }, {
            value: Markers.find({"offense": "Fraud"}).count(),
            color:"#B781D6",
            label: "Fraud"
        }, {
            value: Markers.find({"offense": "Sex/Prostitution"}).count(),
            color:"#D4576E",
            label: "Sex/Prostitution"
        }, {
            value: Markers.find({"offense": "Rape"}).count(),
            color:"#3399ff",
            label: "Rape"
        }, {
            value: Markers.find({"offense": "Homicide"}).count(),
            color: "#33cc33",
            label: "Homicide"
        }]
      }
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
      document.getElementById('js-legend').innerHTML = myDoughnutChart.generateLegend();
    });
  //});
}

// ****************************************************************************************

Meteor.methods({
  'createImpression': function(impVar, cityVar){
    var currentUser = Meteor.user().username;
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
      Markers.find({"city": parameters.city, "weight": {$gte: parameters.w1, $lte: parameters.w2}}, {
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
          "weight": 1
        }   
      })
      //Markers.find({})
    ];
    if (data) {
      return data;
    }
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

