import xr from 'xr'
import * as d3 from "d3"

// import {scaleOrdinal} from "d3-scale";
// import {line} from "d3-line"
// import {select} from "d3-select";    

var containerDiv = d3.select(".gv-chart");

var margin = {top: 20, right: 20, bottom: 50, left: 70},
    width = 500 - margin.left - margin.right,
    height = 1000 - margin.top - margin.bottom;

xr.get('https://interactive.guim.co.uk/docsdata-test/1VXBeHCsgJB-SUXjgIlfZk2W8qdZicCw7vs4JWd4lkJY.json').then((resp) => {
    let d = resp.data.sheets;
    var newObj = {};
    newObj = formatData(d.Sheet1);

    drawChart(newObj)  

});



function drawChart(d){
    var x = d3.scaleLinear().range([0, width]);
    var y = d3.scaleLinear().range([height, 0]);
    var z = d3.scaleOrdinal(d3.schemeCategory10);

    var svg = containerDiv.append("svg").attr("width", "1000px").attr("height", "1200px"),
    g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    x.domain([0, (d.max_x + 2)]);

    y.domain([0, d.max_y]);

    z.domain(d.ministries.map(function(c) {  return Number(c.sortOn); }));

    var tickLabelsY = d.ministries.reverse();

    console.log(tickLabelsY)

    var politicians = d.politicians.map(function(obj) {

      return {    
        id: obj.sortOn,
        jobTitle: obj.objArr[0].Name,
        values: obj.objArr.map(function(d) {
          return { X: d.xPlot, Y: d.yPlot, id: obj.sortOn, jobTitle: obj.objArr[0].Title };
        })
      };
    });


  var lineFunction = d3.line()
      .x(function(d) { return d.X; })
      .y(function(d) { return d.Y; })
      .curve(d3.curveCardinal);

    // var line = d3.line()
    // .x(function(d, i) { return x(10); }) // set the x values for the line generator
    // .y(function(d) { return y(20); }) // set the y values for the line generator 
    // .curve(d3.curveMonotoneX) // apply smoothing to the line

    g.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));




  g.append("g")
      .attr("class", "axis axis--y")
      .attr("transform", "translate(" + x(0.5) + ",0)")
      
      .call(d3.axisLeft(y).ticks(tickLabelsY.length)
      .tickFormat(function(d,i){ return tickLabelsY[i].jobTitle }))
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", "0.71em")
      .attr("fill", "#000")
      .text("Cameron");

  // g.append("g")
  //     .attr("class", "axis axis--y no-ticks")
  //     .attr("transform", "translate(" + x(1.5) + ",0)")
  //     .call(d3.axisLeft(y))
  //   .append("text")
  //     .attr("transform", "rotate(-90)")
  //     .attr("y", 6)
  //     .attr("dy", "0.71em")
  //     .attr("fill", "#000")
  //     .text("May v1");

  //  g.append("g")
  //     .attr("class", "axis axis--y  no-ticks")
  //     .attr("transform", "translate(" + x(2.5) + ",0)")
  //     .call(d3.axisLeft(y))
  //   .append("text")
  //     .attr("transform", "rotate(-90)")
  //     .attr("y", 6)
  //     .attr("dy", "0.71em")
  //     .attr("fill", "#000")
  //     .text("May v2");

  var city = g.selectAll(".city")
    .data(politicians)
    .enter().append("g")
      .attr("transform", "translate(" + x(0.5) + ",0)")
      .attr("class", "city");

  city.append("path")
      .attr("class", "gv-line")
      .attr("d", function(d) { return lineFunction(d.values) });

   city.append("g").selectAll("circle")
      .data(function(d){ return d.values}) 
      .enter()
      .append("circle")
      .attr("r", 15)
      .attr("data-name", function(dd){ return dd.id })
      .attr("data-job", function(dd){ return dd.jobTitle })
      .attr("cx", function(dd){ return dd.X })
      .attr("cy", function(dd){return dd.Y })
      .style("fill", "url(#image)")
      .attr("class","gv-graph-photo-circle");
//console.log(d.values);
  // city.append("text")
  //     .datum(function(d) { return {id: d.id, value: d.values[d.values.length - 1]}; })
  //     .attr("transform", function(d) { return "translate(" + x(d.value._X) + "," + y(d.value._Y) + ")"; })
  //     .attr("x", 3)
  //     .attr("dy", "0.35em")
  //     .style("font", "10px sans-serif")
  //     .text(function(d) { return d.id; });

}



function formatData(data) {
    var newObj = {};
    let count = 0;

    // get unique job refs
    var unique = [...new Set(data.map(item => item.Title))];
    var jobTitlesArr = [];
    var a = [];

    unique.map((item, k) => {
        var newObj = {}
        newObj.Title = item;
        newObj.jobRef = k;
        jobTitlesArr.push (newObj);
    })

    //allocate job refs
    data.map((obj) => {
        jobTitlesArr.map((job) => {
          if(obj.Title == job.Title){
            obj.jobRef = job.jobRef;
          }
        })
    })

    //get cabinet
    let groups = groupBy(data, 'Cabinet');

    groups = sortByKeys(groups);

    groups.map((obj, k) => {
    	obj.groupRef = k;
        obj.objArr.map((ob) => {
        	ob.cabinetRef = obj.groupRef;
        	a.push(ob);
        })
    });

    var maxPlotJob = Math.max(...a.map(o => o.jobRef));
    var maxPlotCabinet = Math.max(...a.map(o => o.cabinetRef));
    var plotUnitJob = height/maxPlotJob;
    var plotUnitCabinet = width/maxPlotCabinet;

    a.map((o) => {
        o.xPlot = o.cabinetRef * plotUnitCabinet;
        o.yPlot = o.jobRef * plotUnitJob;
    })

    let politicians =  groupBy(a, 'Name');
    politicians = sortByKeys(politicians);
    let tmp = [];
    politicians.map((o) => {
        if(o.sortOn!="TBC"){ tmp.push(o)}
    })
    politicians = tmp;

    let ministries = groupBy(a, 'jobRef');
    ministries = sortByKeys(ministries);
    ministries.map((o) => {
      o.jobTitle = o.objArr[0].Title;  
    })
    
    newObj.flatArr = a;
    newObj.groups = groups;
    newObj.jobsArr = jobTitlesArr;
    newObj.max_x = maxPlotCabinet;
    newObj.max_y = maxPlotJob;
    newObj.ministries = ministries;
    newObj.politicians = politicians;

    return newObj;
}


function groupBy(xs, key) {
  return xs.reduce(function(rv, x) {
    (rv[x[key]] = rv[x[key]] || []).push(x);
    return rv;
  }, {});
}


function sortByKeys(obj) {
    let keys = Object.keys(obj), i, len = keys.length;
    keys.sort();

    var a = []

    for (i = 0; i < len; i++) {
        let k = keys[i];
        let t = {}
        t.sortOn = k;
        t.objArr = obj[k]
        a.push(t);
    }

    return a;
}
