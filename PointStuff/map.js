var map;

  function initialize() {
    var mapOptions = {
      zoom: 12,
      center: {lat: 40.7148544, lng: -74.0166855},
      mapTypeId: google.maps.MapTypeId.TERRAIN
    };

    map = new google.maps.Map(document.getElementById('map'),
        mapOptions);

    // Create a <script> tag 
    var script = document.createElement('script');
    script.src = 'sampledata.geojson';
    document.getElementsByTagName('head')[0].appendChild(script);
}

