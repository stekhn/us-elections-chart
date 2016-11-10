(function() {

  'strict';

  (function init() {

    var plot = draw();

    queue()
      .defer(d3.tsv, 'data/polls.tsv')
      .await(function (error, data) {

        if (error) { throw error; }

        data = transform(data);
        d3.select('#vis')
          .datum(data)
          .call(plot);
      });
  })();

  function transform(data) {

    data.forEach(function (d) {

      d.month = parseInt(d.month);
      d.result = parseInt(d.result);
    });

    var nest = d3.nest()
      .key(function (d) { return d.year; })
      .key(function (d) { return d.candidate; })
      .sortValues(function(a, b) {

        return d3.ascending(a.month, b.month);
      })
      .entries(data);

    return nest;
  }

  function draw() {

    var width = 150;
    var height = 120;
    var margin = {
      top: 15,
      right: 10,
      bottom: 40,
      left: 35
    };

    var circle = null;
    var caption = null;
    var curYear = null;

    var bisect = d3.bisector(function (d) {

      return d.month;
    }).left;

    var xScale = d3.scale.linear()
      .range([0, width])
      .domain([1, 5]);
    var yScale = d3.scale.linear()
      .range([height, 0])
      .domain([0, 100]);

    var yAxis = d3.svg.axis()
      .scale(yScale)
      .orient('left')
      .ticks(4)
      .outerTickSize(0)
      .tickSubdivide(1)
      .tickSize(-width)
      .tickFormat(function (d) { return d + '%'; });

    var line = d3.svg.line()
      .interpolate('cardinal')
      .x(function (d) { return xScale(d.month); })
      .y(function (d) { return yScale(d.result); });

    function chart(selection) {

      return selection.each(function (data) {

        var div = d3.select(this).selectAll('.chart')
          .data(data);

        div.enter()
          .append('div')
            .attr('class', 'chart')
          .append('svg')
          .append('g');

        var svg = div.select('svg')
          .attr('width', width + margin.left + margin.right)
          .attr('height', height + margin.top + margin.bottom);

        var g = svg.select('g')
          .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

        g.append('g')
          .attr('class', 'y axis')
          .call(yAxis);

        g.append('text')
          .attr('class', 'title')
          .attr('text-anchor', 'middle')
          .attr('y', height)
          .attr('dy', margin.bottom / 2 + 5)
          .attr('x', width / 2)
          .attr('font-weight', 'bold')
          .text(function (c) { return c.key; });

        var lines = g.selectAll('.lines')
          .data(function (c) { return c.values; })
          .enter()
          .append('g')
            .attr('class', 'lines');

        lines.append('path')
          .attr('class', function (c) {

            return 'line ' + c.values[0].party.toLowerCase();
          })
          .attr('d', function (c) { return line(c.values); })
          .style('pointer-events', 'none');

        var circle = lines.append('circle')
          .attr('class', function (c) {

            return c.values[0].party.toLowerCase();
          })
          .attr('cx', function (c) { return xScale(c.values[4].month); })
          .attr('cy', function (c) { return yScale(c.values[4].result); })
          .attr('r', 3.5);

        var result = lines.append('text')
          .attr('text-anchor', 'end')
          .attr('x', function (c) { return xScale(c.values[4].month); })
          .attr('y', function (c) { return yScale(c.values[4].result); })
          .attr('dx', 5)
          .attr('dy', function (c, i) {
            return i ? 17 : -10;
          })
          .text(function (c) {

            var delta = c.values[4].result - c.values[3].result;
            if (delta > 0) { delta = '+' + delta; }
            return delta + '%';
          });

        var legend = lines.append('g')
          .attr('class', 'legend');

        legend.append('text')
          .attr('class', function (c) {

            return c.values[0].party.toLowerCase();
          })
          .attr('x', 5)
          .attr('dy', 3)
          .attr('y', function (c, i) {
            return i * 12;
          })
          .text(function (c) {
            return c.key;
          });
      });
    }

    return chart;
  }
})();
