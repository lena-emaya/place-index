var params = {
  vegetation: 34,
  air: 33,
  transport: 33
};

mapboxgl.accessToken =
  "pk.eyJ1IjoibGVuYWVtYXlhIiwiYSI6ImNpa3VhbXE5ZjAwMXB3eG00ajVyc2J6ZTIifQ.kmZ4yVcNrupl4H8EonM3aQ";

var map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/lenaemaya/cjpjv5ll50l032ss2fo7r6tk0",
    center: [37.554967,55.717137],
    zoom: 12
  });

map.on("load", ()=>{

  map.addSource("bld",{type: "geojson", data: {type: "FeatureCollection", features: [] }});
  map.addLayer({
    id: "bld",
    source: "bld",
    type: "fill",
    paint: {
      "fill-antialias": false,
      "fill-color": [
        "interpolate",
        ["exponential", 1.25],
        ["get", "index"],
        1,
        "#05ff7a",
        5,
        "#03ffa2",
        12,
        "#01ffca",
        18,
        "#00fdf2",
        24,
        "#00ddfb",
        31,
        "#009cfa",
        45,
        "#0044fa",
        51,
        "#1400fa",
        65,
        "#6c00fa",
        78,
        "#c400fa"
      ],
      "fill-opacity": 1
    }
  });





    // Create a popup, but don't add it to the map yet.
     var popup = new mapboxgl.Popup({
         closeButton: false,
         closeOnClick: false
     });

     map.on('mousemove', 'bld', function(e) {
         // Change the cursor style as a UI indicator.
         if(e.features.length>0) {
           map.getCanvas().style.cursor = 'pointer';
           var coordinates = {lng: e.lngLat.lng, lat: e.lngLat.lat};
           var props = [];
           var f = e.features[0];
           for(p in f.properties) {
             props.push(p + ": " + f.properties[p] + "<br/>");
           }
           var description = props.join("");

           popup.setLngLat(coordinates)
               .setHTML(description)
               .addTo(map);
         } else {
           map.getCanvas().style.cursor = '';
           popup.remove();
         }

     });

     map.on('mouseleave', 'bld', function() {
         map.getCanvas().style.cursor = '';
         popup.remove();
     });


canvas = map.getCanvasContainer();

setParamValue = (param,value) => {
  var v = +value
  if(param === "vegetation") { pa = "air"; pb = "transport"; }
  if(param === "air") { pa = "vegetation"; pb = "transport"; }
  if(param === "transport") { pa = "air"; pb = "vegetation"; }

  var ratio_a = params[pa]/(params[pa]+params[pb]);
  var ratio_b = params[pb]/(params[pa]+params[pb]);

//  var sum = params[param] + params[pa] + params[pb];
  console.log(ratio_a,ratio_b);
  params[pa] = (100-v)*ratio_a+1;
  params[pb] = (100-v)*ratio_b+1;
  params[param] = v;

  d3.select("#slider-"+pa).property("value", params[pa]);
  d3.select("#slider-"+pb).property("value", params[pb]);
  d3.select("#slider-"+param).property("value", v);

  d3.select("#slider-value-"+pa).text(Math.floor(params[pa]-1));
  d3.select("#slider-value-"+pb).text(Math.floor(params[pb]-1));
  d3.select("#slider-value-"+param).text(Math.floor(v));

  console.log(params); // а вот тут можно делать всё что угодно играться с параметрами типа


  var recalculatedFeatures = data.features.map((f)=>{
    return {
      type: "Feature",
      geometry: f.geometry,
      properties: {
        index: f.properties.green_ratio*(params.vegetation/100)+f.properties.transport_ratio*(params.transport/100)+f.properties.air_ratio*(params.air/100),
        green_ratio: f.properties.green_ratio,
        green_ratio_calculated: f.properties.green_ratio*(params.vegetation/100),
        transport_ratio: f.properties.transport_ratio,
        transport_ratio_calculated: f.properties.transport_ratio*(params.transport/100),
        air_ratio: f.properties.air_ratio,
        air_ratio_calculated: f.properties.air_ratio*(params.air/100)
      }
    }
  });

//  console.log(recalculatedFeatures);

  //recalculate data
  map.getSource("bld").setData({type: "FeatureCollection", features: recalculatedFeatures });


}

//set event handlers for sliders
  d3.select("#slider-vegetation").on("input", ()=>{ setParamValue("vegetation",document.getElementById("slider-vegetation").value); });
  d3.select("#slider-air").on("input", ()=>{ setParamValue("air",document.getElementById("slider-air").value); });
  d3.select("#slider-transport").on("input", ()=>{ setParamValue("transport",document.getElementById("slider-transport").value); });


  fetch("https://raw.githubusercontent.com/lena-emaya/place-index/master/data/bld_index.geojson")
  .then(function(response) {
    return response.json();
  })
  .then(function(json) {
    data = json;
    //initial start
    setParamValue("transport",document.getElementById("slider-transport").value);
  });

});
