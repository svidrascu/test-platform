import React from 'react'
import d3 from 'd3'

class MainChart extends React.Component{
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        var margin = {top: 20, right: 80, bottom: 30, left: 50},
            width = 960 - margin.left - margin.right,
            height = 500 - margin.top - margin.bottom;

        var x = d3.time.scale()
            .range([0, width]);

        var parseDate = d3.time.format("%d/%m/%Y").parse;

        var y = d3.scale.linear()
            .range([height, 0]);

        var color = d3.scale.category10();

        var xAxis = d3.svg.axis()
            .scale(x)
            .orient("middle");

        var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left").innerTickSize(-width)
            .outerTickSize(0)
            .tickPadding(10);

        var yScale = d3.scale.linear();

        var line = d3.svg.line()
            .interpolate("basis")
            .x(function(d) { return x(d.date); })
            .y(function(d) { return y(d.itemCount); });

        var svg = d3.select("div#svg-alfresco").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
            d3.json(this.props.url, function(error, data) {
                if (error) throw error;
                color.domain(d3.keys(data[0]).filter(function(key) {
                    return key !== "date";
                }));

                data.forEach(function(d) {
                    d.date = parseDate(d.date);
                });

                var lines = color.domain().map(function(name) {
                return {
                  name: name,
                  values: data.map(function(d) {
                    return {
                        date: d.date,
                        itemCount: +d[name]
                    };
                  })
                };
            });

            x.domain(d3.extent(data, function(d) {
                return d.date;
            }));

            y.domain([
                d3.min(lines, function(c) { return d3.min(c.values, function(v) {
                    return v.itemCount; });
                }),
                d3.max(lines, function(c) { return d3.max(c.values, function(v) {
                    return v.itemCount;
                });
                })
            ]);

            function Y0() {
                return (height/2)+6;
            }

            svg.append("g")
              .attr("class", "x axis")
              .attr("transform", "translate(0," + height + ")")
              .call(xAxis);
            // zero line
            svg.append("g")
              .attr("class", "x axis")
              .attr("transform", "translate(0," + Y0() + ")")
              .call(xAxis.tickFormat("").tickSize(0));

            svg.append("g")
              .attr("class", "y axis")
              .call(yAxis)

            var lines = svg.selectAll(".lines")
              .data(lines)
              .enter().append("g")
              .attr("class", "lines");

            lines.append("path")
              .attr("class", "line")
              .attr("d", function(d) {
                  return line(d.values);
              }).each(function(d){
                  if(d.name === "plannedDefectReduction" || d.name === "actualDefectReduction"){
                      d3.select(this).style('stroke', 'orange');
                  }
              }).each(function(d){
                  if("plannedDefectReduction" === d.name || "planTestRun" === d.name){
                      d3.select(this).style('stroke-dasharray',('3, 3'));
                  }
              });

            var legend = svg.selectAll(".legend")
                .data(color.domain().slice())
                .enter().append("g")
                .attr("class", "legend")
                .attr("transform", function(d, i) {
                  return "translate(0," + i * 20 + ")";
                });


            legend.append("line")
                .attr("x1", width - 28)
                .attr("x2", width)
                .attr("y1", 10)
                .attr("y2", 10)
                .each(function(name){
                    if("testNotRun" === name || "planTestRun" === name){
                        d3.select(this).style('stroke', 'steelblue');
                    } else {
                        d3.select(this).style('stroke', 'orange');
                    }
                })
                .each(function(d){
                    if("plannedDefectReduction" === d || "planTestRun" === d){
                        d3.select(this).style("stroke-dasharray","5,5");
                    }

                });

            legend.append("text")
                .attr("x", width - 34)
                .attr("y", 9)
                .attr("dy", ".35em")
                .style("text-anchor", "end")
                .text(function(d) {
                    var label = ""
                    switch (d) {
                        case "plannedDefectReduction":
                            label =  "Plan for Defect Reduction";
                            break;
                        case "actualDefectReduction":
                            label = "Actual Defect Reduction";
                            break;
                        case "planTestRun":
                            label = "Plan for tests to be run (x100)";
                            break;
                        case "testNotRun":
                            label = "Actual Tests not yet Run (x100)";
                            break;
                        default:
                            label = ""
                    }
                    return label;
                });
        });
    }

    render(){
        return(
            <div id="svg-alfresco"></div>
        )
    }
}

export default MainChart
