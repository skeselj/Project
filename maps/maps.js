PointsList = new Mongo.Collection('points')


if (Meteor.isClient) {
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
        long: longVar,
        lat: latVar
      });
    }
  });
}
