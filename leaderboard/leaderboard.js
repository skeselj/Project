PointsList = new Mongo.Collection('points')

if (Meteor.isClient) {
  Meteor.startup(function() {
    GoogleMaps.load();
  });

  Template.body.helpers({
  mapOptions: function() {
    // Make sure the maps API has loaded
    if (GoogleMaps.loaded()) {
      // Map initialization options
      return {
        center: new google.maps.LatLng(40.6842763,-74.0127941),
        zoom: 12
      };
    }
  }
});

  Template.body.onCreated(function() {
  // We can use the `ready` callback to interact with the map API once the map is ready.
    GoogleMaps.ready('safecity', function(map) {
    // Add a marker to the map once it's ready


    var cursor = PointsList.find({});

    cursor.forEach(function(points) {
      var marker = new google.maps.Marker({
      position: new google.maps.LatLng(points.lat, points.long),
      map: map.instance
    });    
    });

    //console.log(PointsList.find({}).fetch());

  });
});

  Template.board.helpers({
    'point': function() {
      return PointsList.find({}, {sort: {long: 1}});
    }
  });  

  Template.board.events({
    'click .point': function() {
      var pointId = this._id;
      Session.set('selectedPoint', pointId);
    },
    'click .remove': function() {
      var selectedPoint = Session.get('selectedPoint');
      PointsList.remove(selectedPoint);
    }
  })

  Template.addPointForm.events({
    'submit form': function(event) {
      event.preventDefault();
      var longVar = event.target.pointLong.value;
      var latVar = event.target.pointLat.value;
      PointsList.insert({
        lat: latVar,
        long: longVar
      });
    }
  });
}
