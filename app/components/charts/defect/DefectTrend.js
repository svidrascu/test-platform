import React from 'react'
import d3 from 'd3'
import { Link } from 'react-router'


class DefectTrend extends React.Component{
    constructor(props) {
        super(props);
    }

    componentDidMount(){
        var margin = {top: 20, right: 20, bottom: 30, left: 50},
            width = 960 - margin.left - margin.right,
            height = 500 - margin.top - margin.bottom;

        var x = d3.time.scale()
            .range([0, width]);

        var y = d3.scale.linear()
            .range([height, 0]);

        var color = d3.scale.category20();

        var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom");

        var yAxis = d3.svg.axis()
                .scale(y)
                .orient("left").tickFormat(d3.format("d"))

        var area = d3.svg.area()
            .x(function(d) {
              return x(d.date);
            })
            .y0(function(d) { return y(d.y0); })
            .y1(function(d) { return y(d.y0 + d.y); });

        var stack = d3.layout.stack()
            .values(function(d) { return d.values; });

        var svg = d3.select("div#defect-trend").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        var color = d3.scale.ordinal()

        d3.json(this.props.url, function(error, data) {
          if (error) throw error;
          data.forEach(function(d) {
              d.date = new Date(d.date)
          });
          color.domain(['New CAT 1','New CAT 2','CAT 1 Pending','CAT 2 Pending'])
          .range(["#CC0000","#FF3333","#BEBEBE","#D3D3D3"]);

        var defcectType = stack(color.domain().map(function(name) {
        var value;
            var item = {
              name: name,
              values: data.map(function(d) {
                if (name === 'New CAT 1') {
                  value = d.open.blocker;
                }
                if (name === 'New CAT 2') {
                  value = d.open.critical;
                }
                if (name === 'CAT 1 Pending') {
                  value = d.pending.blocker;
                }
                if (name === 'CAT 2 Pending') {
                  value = d.pending.critical;
                }
                return {date: d.date, y: value };
              })
            }
            return item
          }));

          x.domain(d3.extent(data, function(d) { return d.date; }));

          function getMaxY(){
              var max = d3.max(data,function(d){
                  var val = (typeof d.total === 'undefined'? 0:d.total)
                  return val
              })
              //Add a buffer of another 20 units to fit the legends.
              return max + 40
          }
          var m = getMaxY();
          y.domain([0, m]);

          // y.domain([0, 80]);
          var defect = svg.selectAll(".defect")
              .data(defcectType)
            .enter().append("g")
              .attr("class", "defect");

          defect.append("path")
              .attr("class", "area")
              .attr("d", function(d) {
                return area(d.values);
              })
              .style("fill", function(d) {
                return color(d.name);
              });

          defect.append("text")
              .datum(function(d) {
                 return {name: d.name, value: d.values[d.values.length - 1]};
                })
              .attr("transform", function(d) {
                return "translate(" + x(d.value.date) + "," + y(d.value.y0 + d.value.y / 2) + ")";
              })
              .attr("x", -6)
              .attr("dy", ".35em");

          svg.append("g")
              .attr("class", "x axis")
              .attr("transform", "translate(0," + height + ")")
              .call(xAxis);

          svg.append("g")
              .attr("class", "y axis")
              .call(yAxis);
              var legend = svg.selectAll(".legend")
                .data(color.domain().slice().reverse())
                .enter().append("g")
                .attr("class", "legend")
                .attr("transform", function(d, i) {
                  return "translate(0," + i * 20 + ")";
                });

          legend.append("rect")
                .attr("x", width - 18)
                .attr("width", 18)
                .attr("height", 18)
                .style("fill", color);

          legend.append("text")
                .attr("x", width - 24)
                .attr("y", 9)
                .attr("dy", ".35em")
                .style("text-anchor", "end")
                .text(function(d) {
                  return d;
                });
        });
    }
    render(){
        return(
            <div id="defect-trend"></div>
        )
    }
}
export default DefectTrend
