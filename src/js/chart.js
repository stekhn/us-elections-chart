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
      // .interpolate('cardinal')
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

        g.append('rect')
          .attr('class', 'background')
          .style('pointer-events', 'all')
          .attr('width', width + margin.right)
          .attr('height', height)
          .on('mouseover', mouseover)
          .on('mousemove', mousemove)
          .on('mouseout', mouseout);

        g.append('g')
          .attr('class', 'y axis')
          .call(yAxis);

        g.append('text')
          .attr('class', 'year')
          .attr('text-anchor', 'middle')
          .attr('y', height)
          .attr('dy', margin.bottom / 2 + 5)
          .attr('x', width / 2)
          .attr('font-weight', 'bold')
          .text(function (d) { return d.key; });

        var lines = g.selectAll('.lines')
          .style('pointer-events', 'none')
          .data(function (d) { return d.values; })
          .enter()
          .append('g')
            .attr('class', 'lines');

        lines.append('path')
          .style('pointer-events', 'none')
          .attr('class', getParty)
          .classed('line', true)
          .attr('d', function (d) { return line(d.values); });

        lines.append('circle')
          .style('pointer-events', 'none')
          .attr('class', getParty)
          .attr('cx', function (d) { return xScale(d.values[4].month); })
          .attr('cy', function (d) { return yScale(d.values[4].result); })
          .attr('r', 3.5);

        lines.append('text')
          .style('pointer-events', 'none')
          .attr('text-anchor', 'end')
          .attr('x', function (d) { return xScale(d.values[4].month); })
          .attr('y', function (d) { return yScale(d.values[4].result); })
          .attr('dx', 5)
          .attr('dy', function (d, i) {
            return i ? 17 : -10;
          })
          .attr('font-weight', 'bold')
          .text(function (d) {

            var delta = d.values[4].result - d.values[3].result;
            if (delta > 0) { delta = '+' + delta; }
            return delta + '%';
          });

        var legend = lines.append('g')
          .attr('class', 'legend');

        legend.append('text')
          .style('pointer-events', 'none')
          .attr('class', getParty)
          .attr('x', 5)
          .attr('dy', 3)
          .attr('y', function (d, i) { return i * 12; })
          .text(function (d, i) { return d.key + (i ? '' : ' ★' ); });

        lines.append('text')
          .style('pointer-events', 'none')
          .attr('class', 'value')
          .attr('text-anchor', 'end')
          .attr('dy', 13)
          .attr('y', height)
          .attr('x', width);

        circle = lines.append('circle')
          .attr('class', getParty)
          .attr('r', 2.2)
          .style('pointer-events', 'none');

        caption = lines.append('text')
          .style('pointer-events', 'none')
          .classed('caption', true)
          .attr('class', getParty)
          .attr('text-anchor', 'middle')
          .attr('dy', function (d, i) { return i ? 17 : -10; });
      });
    }

    function mouseover() {

      circle.attr('opacity', 1.0);
      d3.selectAll('.value')
        .classed('hidden', true);

      return mousemove.call(this);
    }

    function mousemove() {

      var month = xScale.invert(d3.mouse(this)[0]);
      var index = Math.min(Math.round(month) - 1, 4);

      circle
        .attr('cx', function (d) {

          return xScale(d.values[index].month);
        })
        .attr('cy', function (d) {

          return yScale(d.values[index].result);
        });

      caption
        .attr('x', function (d) {

          return xScale(d.values[index].month);
        })
        .attr('y', function (d) {

          return yScale(d.values[index].result);
        })
        .text(function (d) {

          return d.values[index].result + '%';
        });
    }

    function mouseout() {

      d3.selectAll('.static_year').classed('hidden', false);
      circle.attr('opacity', 0);
      caption.text('');
    }

    function getParty (d) {

      return d.values[0].party.toLowerCase();
    }

    return chart;
  }
})();
