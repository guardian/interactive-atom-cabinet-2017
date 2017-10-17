import xr from 'xr'
import Handlebars from 'handlebars/dist/handlebars'
import * as d3 from "d3"
import svgPicTemplate from '../templates/svgPic.html'

const silhouetteURL = 'https://media.guim.co.uk/e989b6d5e1166a8cb5a3cd71be2189d97473aab3/15_16_170_170/170.jpg';


// import {scaleOrdinal} from "d3-scale";
// import {line} from "d3-line"
// import {select} from "d3-select";    

var containerDiv = d3.select(".gv-chart");

//var dimensionsDiv = document.querySelector(".gv-chart");
var embedWidth = containerDiv.node().getBoundingClientRect().width;
var width = embedWidth
var height = containerDiv.node().getBoundingClientRect().height;
var margin, circleRadius, textWrapVal;

var plotBgH = 0;

 if(width <= 380){
      circleRadius = 15;
      margin = {top: 20, right: 0, bottom: 40, left: 80};
      textWrapVal = 70;
    }else if(width <= 620){
      circleRadius = 20;
      margin = {top: 24, right: 100, bottom: 50, left: 100};
      textWrapVal = 80;
    }else{
      circleRadius = 22;
      margin = {top: 30, right: 100, bottom: 50, left: 100};
      textWrapVal = 100;
    }

    width = width - margin.left - margin.right,
    height = height - margin.top - margin.bottom;

xr.get('https://interactive.guim.co.uk/docsdata-test/1VXBeHCsgJB-SUXjgIlfZk2W8qdZicCw7vs4JWd4lkJY.json').then((resp) => {
    let d = resp.data.sheets;
    var newObj = {};
    newObj = formatData(d.Sheet1);

    buildView(newObj)

});

function buildView(newObj){

  var svgHTML = addSvgBackgrounds(newObj);

  document.querySelector(".gv-img-holder").innerHTML = svgHTML;

  drawChart(newObj);  
}

function addSvgBackgrounds(d){
    var svgObj = {};

    svgObj.objArr = d.uniqueNames;

    Handlebars.registerPartial({
        'svgPic': svgPicTemplate
    });

    var content = Handlebars.compile(
        svgPicTemplate, {
            compat: true
        }
    );

    var newHTML = content(svgObj);

    return newHTML


}

function drawChart(dataIn){
    var x = d3.scaleLinear().range([0, width]);
    var y = d3.scaleLinear().range([height, 0]);
    var z = d3.scaleOrdinal(d3.schemeCategory10);

    var svg = containerDiv.append("svg").attr("width",  margin.left+margin.right+width+"px").attr("height", margin.top+margin.bottom+height+"px"),
    g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    x.domain([0, (dataIn.max_x + 2)]);

    y.domain([0, dataIn.max_y]);

    z.domain(dataIn.ministries.map(function(c) {  return Number(c.sortOn); }));

    var tickLabelsY = dataIn.tickLabelsY.reverse();

    var politicians = dataIn.politicians.map(function(obj) {
       obj.jobChange ? obj.changeClass = "change" :  obj.changeClass = "nochange" ;

      return {    
        id: obj.sortOn,
        jobTitle: obj.objArr[0].Name,
        changeClass: obj.changeClass, 
        values: obj.objArr.map(function(d) {
          return { X: d.xPlot, Y: d.yPlot, changeClass: obj.changeClass, id: obj.sortOn, jobTitle: obj.objArr[0].Title };
        })
      };
    });


    var lineFunction = d3.line()
        .x(function(d) { return d.X; })
        .y(function(d) { return d.Y; })
        // .curve(d3.curveStepAfter);

    // var line = d3.line()
    // .x(function(d, i) { return x(10); }) // set the x values for the line generator
    // .y(function(d) { return y(20); }) // set the y values for the line generator 
    // .curve(d3.curveMonotoneX) // apply smoothing to the line

  //   var city = g.selectAll(".city")
  //   .data(politicians)
  //   .enter().append("g")
  //     .attr("transform", "translate(" + x(0.5) + ",0)")
  //     .attr("class", "city");

  // city.append("path")
  //     .attr("class", function(d){ return "gv-line "+d.changeClass})
  //     .attr("data-name", function(d) { return d.jobTitle.split(" ").join("-").toLowerCase() })
  //     .attr("d", function(d) { return lineFunction(d.values) });

    // city.append("g").selectAll("circle")
    //   .data(function(d){ return d.values}) 
    //   .enter()
    //   .append("circle")
    //   .attr("r", circleRadius)
    //   .attr("data-name", function(dd){ return dd.id.split(" ").join("-").toLowerCase() })
    //   .attr("data-job", function(dd){ return dd.jobTitle })
    //   .attr("cx", function(dd){ return dd.X })
    //   .attr("cy", function(dd){return dd.Y })
    //   .style("fill", function(dd){ return "url(#image-"+ dd.id.split(" ").join("-").toLowerCase() +")"} )
    //   .attr("class",function(dd){ return "gv-graph-photo-circle "+dd.changeClass});
    

    var bg = g.selectAll(".chart-background")
    .data(tickLabelsY)
    .enter().append("g")
      .attr("transform", "translate(0 ,0)")
      .attr("class", "bg-rects");

    bg.append("rect")
      .attr("class", function (d,i) { var className; i % 2 == 0 ? className ="background-rect even" :  className ="background-rect odd" ;  return className})
      .attr("width", embedWidth)
      .attr("height", dataIn.plotUnitJob)
      .attr("x",0 - margin.left)
      .attr("y", function(d,i) { return (i*(dataIn.plotUnitJob))-(margin.top) });

  svg.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));

  svg.append("g")
      .attr("class", "axis axis--y labels")
      .attr("transform", "translate(3,0)")   
      .call(d3.axisLeft(y).ticks(tickLabelsY.length)
      .tickFormat(function(d,i){ return tickLabelsY[i] }))
      .selectAll(".tick")
      .attr("y", 6)
      .attr("x", 6)
      .selectAll(".tick text")
      .attr("y", 9)
      .attr("x", 6)
      .style("text-anchor", "start")
      .call(wrap, textWrapVal)    

  svg.append("g")
      .attr("class", "axis axis--y labels right-side")
      .attr("transform", "translate("+(embedWidth-margin.left)+",0)")   
      .call(d3.axisLeft(y).ticks(tickLabelsY.length)
      .tickFormat(function(d,i){ return tickLabelsY[i] }))
      .selectAll(".tick")
      .attr("y", 6)
      .attr("x", 6)
      .selectAll(".tick text")
      .attr("y", 9)
      .attr("x", 6)
      .style("text-anchor", "start")
      .call(wrap, textWrapVal)

  // svg.append("g")
  //     .attr("class", "axis axis--y blank")
  //     .attr("transform", "translate("+(embedWidth/3)+",0)")   
  //     .call(d3.axisLeft(y).ticks(tickLabelsY.length)
  //     .tickFormat(function(d,i){ return tickLabelsY[i] }))
  //     .selectAll(".tick")
  //     .attr("y", 6)
  //     .attr("x", 6)
      



  // g.append("g")
  //     .attr("class", "axis axis--y cabinet")
  //     .attr("transform", "translate(" + x(0.5) + ",0)")   
  //     .call(d3.axisLeft(y))
  //   .append("text")
  //     .attr("transform", "rotate(-90)")
  //     .attr("y", 0)
  //     .attr("dy", "0.71em")
  //     .attr("fill", "#000")
  //     .text("Cameron");

  // g.append("g")
  //     .attr("class", "axis axis--y cabinet")
  //     .attr("transform", "translate(" + x(2.5) + ",0)")
  //     .call(d3.axisLeft(y))
  //   .append("text")
  //     .attr("transform", "rotate(-90)")
  //     .attr("y", 6)
  //     .attr("dy", "0.71em")
  //     .attr("fill", "#000")
  //     .text("May v1");

  //  g.append("g")
  //     .attr("class", "axis axis--y  cabinet")
  //     .attr("transform", "translate(" + (x(4.5))  + ",0)")
  //     .call(d3.axisLeft(y))
  //   .append("text")
  //     .attr("transform", "rotate(-90)")
  //     .attr("y", 6)
  //     .attr("dy", "0.71em")
  //     .attr("fill", "#000")
  //     .text("May v2");

  var valsO;

  var city = g.selectAll(".city")
    .data(politicians)
    .enter().append("g")
      .attr("transform", "translate(" + x(0.5) + ",0)")
      .attr("class", "city");

  city.append("path")
      .attr("class", function(d){ return "gv-line "+d.changeClass})
      .attr("data-name", function(d) { return d.jobTitle.split(" ").join("-").toLowerCase() })
      .attr("d", function(d) { return lineFunction(d.values) });

  city.append("g").selectAll("circle")
      .data(function(d,i){ return d.values}) 
      .enter()
      .append("circle")
      .attr("r", circleRadius)
      .attr("data-name", function(dd){ return dd.id.split(" ").join("-").toLowerCase() })
      .attr("data-display-name", function(dd){  return dd.id })
      .attr("data-job", function(dd){ return dd.jobTitle })
      .attr("cx", function(dd){ return dd.X })
      .attr("cy", function(dd){ return dd.Y })
      .style("fill", function(dd){ return "url(#image-"+ dd.id.split(" ").join("-").toLowerCase() +")"} )
      .attr("class",function(dd){ return "gv-graph-photo-circle "+ dd.changeClass });    


  city.each(function(d, i) {
            d3.select(this).selectAll('text')
                    .data(function(d){console.log(d); return d.values })
                .enter()
                    .append('text')
                    .attr('class', 'nodeTxt')
                    .attr("text-anchor","middle")
                    .attr("x", function(d){ console.log(d); return (d.X) })
                    .attr("y", function(d){ return (d.Y) })
                    .text(function(dd) { return (d.id) })

        });    
  // forEach(dd)    
  // city.append("text")
  //     // .data(function(dd,i){ console.log(dd); return d.values}) 
  //     .attr("class", "nodetext")
  //     .attr("dx", function(dd){ console.log(dd.values.length); return 20 })
  //     .attr("dy", function(dd){ return (dd.values[0].Y+20) })
  //     .text(function(d) { return "kno" });




   //addLabels();
     
    
    // .attr("text-anchor","middle")
    //.attr("class","circle-label")
    

    // .attr("dx", 6)
    // .text(function(d) { return d.id; });

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
    var tickLabelsY = [];


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
        obj.objArr.map((ob,i) => {
          
        	ob.cabinetRef = obj.groupRef;
        	a.push(ob);
        })
    });

    var maxPlotJob = Math.max(...a.map(o => o.jobRef));
    var maxPlotCabinet = Math.max(...a.map(o => o.cabinetRef)) +1;
    var plotUnitJob = height / maxPlotJob;
    var plotUnitCabinet = width / maxPlotCabinet;

    a.map((o, k) => {
        o.xPlot = o.cabinetRef * plotUnitCabinet;
        o.yPlot = o.jobRef * plotUnitJob;
        o.dataRef = o.Name.split(" ").join("-").toLowerCase();
        if (!o.Photo){ o.Photo = silhouetteURL }
          
        if(k < 27){
          tickLabelsY.push(o.Title)
        }
    })

    var uniqueNames = [...new Set(a.map(item => item.dataRef))];
    var tempArr = [];

    uniqueNames.map((uniq) => {
     let newUniq = {}; 
     newUniq.dataRef = uniq;

        a.map((o) => {
          if(newUniq.dataRef == o.dataRef){
            newUniq.imgPath = o.Photo; 
            newUniq.imgSize = circleRadius*2;
          }
        })

        tempArr.push(newUniq);
    })

    uniqueNames = tempArr;

    let politicians =  groupBy(a, 'Name');
    politicians = sortByKeys(politicians);
    let tmp = [];
    politicians.map((o) => {
     var tempJob = o.objArr[0].Title;

          o.objArr.map((item) => {
            o.jobChange = false;
              if(item.Title != tempJob){
                  o.jobChange = true;
              } 

          });

        if(o.sortOn!="TBC" && o.sortOn!="na" ){  tmp.push(o); }
        
        

    })
    politicians = tmp;
   let ministries = groupBy(a, 'jobRef');
    ministries = sortByKeys(ministries);
    ministries.map((o) => {
      o.jobTitle = o.objArr[0].Title;  
    })
    
    newObj.tickLabelsY = tickLabelsY;
    newObj.flatArr = a;
    newObj.groups = groups;
    newObj.jobsArr = jobTitlesArr;
    newObj.max_x = maxPlotCabinet;
    newObj.max_y = maxPlotJob;
    newObj.ministries = ministries;
    newObj.politicians = politicians;
    newObj.uniqueNames = uniqueNames;
    newObj.plotUnitJob = plotUnitJob;

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

function wrap(text, width) {
  text.each(function() {
    var text = d3.select(this),
        words = text.text().split(/\s+/).reverse(),
        word,
        line = [],
        lineNumber = 0,
        lineHeight = 1.1, // ems
        y = text.attr("y"),
        dy = parseFloat(text.attr("dy")),
        tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
    while (word = words.pop()) {
      line.push(word);
      tspan.text(line.join(" "));
      if (tspan.node().getComputedTextLength() > width) {
        line.pop();
        tspan.text(line.join(" "));
        line = [word];
        tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
      }
    }
  });
}
