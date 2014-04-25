function WorldMap() {

	var mapJSON = {};
	
	var zoom = d3.behavior.zoom()
				.scaleExtent([1,6])
				.on("zoom",zoomed);
				
	
	var drag = d3.behavior.drag()
    .origin(function(d) { return d; })
    .on("dragstart", dragstarted)
    .on("drag", dragged)
    .on("dragend", dragended);
	
	var geofeatures,grids,boatPath = [],circles = [];
	
	var graticule = d3.geo.graticule();
	
	var width = 1296,
		height = 703;
		
		
	var data;
	
	var index = 0;
		
	var projection = d3.geo.mercator();

	var path = d3.geo.path()
		.projection(projection);
		
	var svg;
	
	var totalGeoEl = 0;
	
	
	function chart(selection) {
	
		selection.each(function(boats) {
			
		
			//Select svg if it exists in this DOM element
			svg = d3.select(this).selectAll("svg.choropleth").data([mapJSON.objects]);
			
			svg.enter().append("svg")
				.attr("width", width)
				.attr("height", height)
				.attr("class", "choropleth");
				
				//uncomment below if you want to draw meridians and parallels
			/*grids = svg.append("g").append("path")
		    .datum(graticule)
		    .attr("class", "graticule")
		    .attr("d", path);*/
				
			geofeatures = svg.append("g");
			
			svg.append("rect")
		    .attr("class", "overlay")
		    .attr("width", width)
		    .attr("height", height)
		    .call(zoom);

			var country = topojson.mesh(mapJSON, mapJSON.objects.countries);
			var countries = topojson.feature(mapJSON, mapJSON.objects.countries);
			//var state = countries.features.filter(function(d) { return +d.id === 7; })[0];

			projection
			  .scale(1)
			  .translate([0, 0]);

			  // Calculate the scale and translate values automatically from boundaries of shapefile
			  
			  var b = path.bounds(country),
			  s = .95 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height),
			  t = [(width - s * (b[1][0] + b[0][0])) / 2, (height - s * (b[1][1] + b[0][1])) / 2];

			  // update projection
		  projection
			  .scale(s)
			  .translate(t);
			  
			  // bind the geometry data
			 geofeatures.selectAll("path.choro_mesh")
			  .data(countries.features)
			  .enter().append("path")
			  .attr("class","choro_mesh")
			  .attr("d", path);
			  //.append("title").text(function(d){return +d.id;});
			  
			  /*var pathLine = d3.svg.line()
	        .interpolate("cardinal")
	        .x(function(d) { 
	        	return projection([d.lon, d.lat])[0]; })
	        .y(function(d) { 
	        	return projection([d.lon, d.lat])[1]; });
	        	
	        var colors = d3.scale.category20();
	        
	        boatPath = geofeatures.selectAll("path.boatPath")
	        			.data(boats)
	        			.enter().append("path")
	        			.attr("d",function(d){ return pathLine(boats[j]);})
			    		.attr("class","boatPath");
			   
			  for(var j=0;j<3;j++)
			  {
			  	circles[j] = geofeatures.append("circle")
			    .attr("r", 2)
			    .attr("transform", "translate(" + projection([boats[j][0].lon, boats[j][0].lat])[0] + ","+ projection([boats[j][0].lon, boats[j][0].lat])[1] +")")
			    .attr("fill",colors(j));

				boatPath[j] = geofeatures.append("path")
					.attr("d",pathLine(boats[j]))
			    	//.attr("d",pathLine([boats[i],boats[i+1]]))
			    	.attr("class","boatPath")
			    	.style("stroke",colors(j));
	    	}
	    	var a = 0;
	    	//animateBoatConstantSpeed(circles[0],boatPath[0]);
	    	for(var j=0;j<3;j++)
			  {
				    //index = 0;
				    animateBoatConstantSpeed(circles[j],boatPath[j]);
				    //animateBoatVariableSpeed(circles[j],boatPath[j][index++],boats[index].speed);
				}*/
	    
	    function animateBoatVariableSpeed(circle,path,speed) {
	  circle.transition()
	  .duration(500/+speed)
      .attrTween("transform", translateAlong(path.node()))
      .each("end", function() { 
      	if(index<boats.length){
      		animateBoatVariableSpeed(circle,boatPath[index++], boats[index].speed);
      	}
      	});
}

		function animateBoatConstantSpeed(circle,path) {
	  circle.transition()
	  .duration(10000)
      .attrTween("transform", translateAlong(path.node()));
		}
	  
	  function translateAlong(path) {
	  var l = path.getTotalLength();
	  return function(d, i, a) {
	    return function(t) {
	      var p = path.getPointAtLength(t * l);
	      return "translate(" + p.x + "," + p.y + ")";
    };
  };
  }
      		
		  
		  
			});
	  
	  }
	  
	  function zoomed()
	  {
	  	geofeatures.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
	  	//grids.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
	  	geofeatures.select("path.graticule").style("stroke-width", 0.5 / d3.event.scale);
	  	geofeatures.selectAll("path.choro_mesh").style("stroke-width", 0.8 / d3.event.scale);
	  }
	  
	  function dragstarted(d) {
	  d3.event.sourceEvent.stopPropagation();
	  d3.select(this).classed("dragging", true);
	  }

	function dragged(d) {
	  d3.select(this).attr("cx", d.x = d3.event.x).attr("cy", d.y = d3.event.y);
	  }
	
	function dragended(d) {
	  d3.select(this).classed("dragging", false);
	  }
	  
			
	chart.width = function(value) {
	  if (!arguments.length) return width;
	  width = value;
	  return chart;
	  };

	  chart.height = function(value) {
    if (!arguments.length) return height;
    height = value;
    return chart;};
	
	
	chart.intervalID = function(value) {
    if (!arguments.length) return intervalID;
    intervalID = value;
    return chart;};
	
	chart.mapJSON = function(value) {
    if (!arguments.length) return mapJSON;
    mapJSON = value;
    return chart;};
    
    chart.projection = function(value) {
    if (!arguments.length) return projection;
   	projection = value;
    return chart;};
    
    chart.mapGroup = function(value){
    if (!arguments.length) return geoFeatures;
    geoFeatures = value;
    return chart;};
	
	
	  return chart;

}