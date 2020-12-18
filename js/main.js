/*	PostGIS and Leaflet demo for Cart Lab Education Series, April 17, 2015	**
**	By Carl Sack, CC-BY-3.0													*/

//global variables
var map,
	fields = ["id", "latitud", "longitud", "centro", "asic", "tipocentroabreviado", "estadosiglas", "municipio", "parroquia", "direccion", "geoubicado"], 
	autocomplete = [];

$(document).ready(initialize);

function initialize(){
	$("#map").height($(window).height());

	map = L.map("map", {
		center: L.latLng(10.48801, -66.87919),
		zoom: 7
	});

	var tileLayer = L.tileLayer("http://{s}.acetate.geoiq.com/tiles/acetate/{z}/{x}/{y}.png").addTo(map);
var basemap = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
                subdomains: 'abcd',
                maxZoom: 19
            }).addTo(map);
	//next: add features to map
	getData();
};



function getData(){
	$.ajax("php/getData.php", {
		data: {
			table: "asics",
			fields: fields
		},
		success: function(data){
			mapData(data);
		}
	})
};

function mapData(data){
	//remove existing map layers
	map.eachLayer(function(layer){
		//if not the tile layer
		if (typeof layer._url === "undefined"){
			map.removeLayer(layer);
		}
	});

	//create geojson container object
	var geojson = {
		"type": "FeatureCollection",
		"features": []
	};

	//split data into features
	var dataArray = data.split(", ;");
	dataArray.pop();
    
    //console.log(dataArray);
	
	//build geojson features
	dataArray.forEach(function(d){
		d = d.split(", "); //split the data up into individual attribute values and the geometry

		//feature object container
		var feature = {
			"type": "Feature",
			"properties": {}, //properties object container
			"geometry": JSON.parse(d[fields.length]) //parse geometry
		};

		for (var i=0; i<fields.length; i++){
			feature.properties[fields[i]] = d[i];
		};

		//add feature names to autocomplete list
		if ($.inArray(feature.properties.centro, autocomplete) == -1){
			autocomplete.push(feature.properties.centro);
		};

		geojson.features.push(feature);
	});
	
    console.log(geojson);
    
    //activate autocomplete on featname input
/*
    $("input[name=centro]").autocomplete({
        source: autocomplete
    });

*/
	var mapDataLayer = L.geoJson(geojson, {
		pointToLayer: function (feature, latlng) {
			var markerStyle = { 
				fillColor: "#CC9900",
				color: "#FFF",
				fillOpacity: 0.5,
				opacity: 0.8,
				weight: 1,
				radius: 8
			};

			return L.circleMarker(latlng, markerStyle);
		},
		onEachFeature: function (feature, layer) {
			var html = "";
			for (prop in feature.properties){
				html += prop+": "+feature.properties[prop]+"<br>";
			};
	        layer.bindPopup(html);
	    }
	}).addTo(map);
};

    var layers = {
        'Topographic': source.getLayer("TOPO-WMS").addTo(map),
        'OSM Overlay': source.getLayer("OSM-Overlay-WMS").addTo(map)
    };

    // Create layer control
    L.control.layers(basemaps, layers).addTo(map);

L.Control.GroupedLayers.include({
    addOverlays: function () {
        for (var i in this._layers) {
            if (this._layers[i].overlay) {
                if (!this._map.hasLayer(this._layers[i].layer)) {
                    this._map.addLayer(this._layers[i].layer);
                }
            }
        }
    },
    removeOverlays: function () {
        for (var i in this._layers) {
            if (this._layers[i].overlay) {
                if (this._map.hasLayer(this._layers[i].layer)) {
                    this._map.removeLayer(this._layers[i].layer);
                }
            }
        }
    }
});





function submitQuery(){
	//get the form data
	var formdata = $("form").serializeArray();

	//add to data request object
	var data = {
		table: "asics",
		fields: fields
	};
	formdata.forEach(function(dataobj){
		data[dataobj.name] = dataobj.value;
	});

	//call the php script
	$.ajax("php/getData.php", {
		data: data,
		success: function(data){
			mapData(data);
		}
	})
};
