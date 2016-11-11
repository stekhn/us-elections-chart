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

    var nested;

    data.forEach(function (d, i) {

      if (i % 2 === 0) {
        if (data[i].result >= data[i + 1].result) {

          data[i].upper = true;
          data[i + 1].upper = false;
        } else {

          data[i + 1].upper = true;
          data[i].upper = false;
        }
      }

      d.month = parseInt(d.month);
      d.result = parseInt(d.result);
    });

    nested = d3.nest()
      .key(function (d) { return d.year; })
      .key(function (d) { return d.candidate; })
      .sortValues(function(a, b) { return d3.ascending(a.month, b.month); })
      .entries(data);

    return nested;
  }

  function draw() {

    var width, height, margin, marker,
      xScale, yScale, yAxis, line;

    width = 150;
    height = 120;
    margin = {
      top: 15,
      right: 10,
      bottom: 40,
      left: 35
    };

    xScale = d3.scale.linear()
      .range([0, width])
      .domain([1, 5]);

    yScale = d3.scale.linear()
      .range([height, 0])
      .domain([0, 100]);

    yAxis = d3.svg.axis()
      .scale(yScale)
      .orient('left')
      .ticks(4)
      .outerTickSize(0)
      .tickSubdivide(1)
      .tickSize(-width)
      .tickFormat(function (d) { return d + '%'; });

    line = d3.svg.line()
      .interpolate('cardinal')
      .x(function (d) { return xScale(d.month); })
      .y(function (d) { return yScale(d.result); });

    function chart(selection) {

      return selection.each(function (data) {

        var div, svg, defs, filter, group, lines, result, legend;

        div = d3.select(this).selectAll('.chart')
          .data(data);

        div.enter()
          .append('div')
            .attr('class', 'chart')
          .append('svg')
          .append('g');

        svg = div.select('svg')
          .attr('width', width + margin.left + margin.right)
          .attr('height', height + margin.top + margin.bottom);

        defs = svg.append('defs');

        filter = defs.append('filter')
          .attr('id', 'background')
          .attr('x', '-25%')
          .attr('height', 1.2)
          .attr('width', 1.4);

        filter.append('feFlood')
            .attr('flood-color', 'white');

        filter.append('feComposite')
            .attr('in', 'SourceGraphic');

        group = svg.select('g')
          .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

        group.append('rect')
          .attr('class', 'background')
          .style('pointer-events', 'all')
          .attr('width', width + margin.right)
          .attr('height', height)
          .on('mouseover', mouseover)
          .on('mousemove', mousemove)
          .on('mouseout', mouseout);

        group.append('text')
          .attr('class', 'year')
          .attr('text-anchor', 'middle')
          .attr('y', height)
          .attr('dy', margin.bottom / 2 + 5)
          .attr('x', width / 2)
          .attr('font-weight', 'bold')
          .text(function (d) { return d.key; });

        group.append('g')
          .attr('class', 'y axis')
          .call(yAxis);

        lines = group.selectAll('.line')
          .style('pointer-events', 'none')
          .data(function (d) { return d.values; })
          .enter()
          .append('g')
            .attr('class', 'line');

        lines.append('path')
          .style('pointer-events', 'none')
          .attr('class', getParty)
          .attr('d', function (d) { return line(d.values); });

        result = lines.append('g')
          .classed('result', true);

        result.append('circle')
          .style('pointer-events', 'none')
          .attr('class', getParty)
          .attr('cx', function (d) { return xScale(d.values[4].month); })
          .attr('cy', function (d) { return yScale(d.values[4].result); })
          .attr('r', 3.5);

        result.append('text')
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

        legend = lines.append('g')
          .attr('class', 'legend');

        legend.append('text')
          .style('pointer-events', 'none')
          .attr('class', getParty)
          .attr('x', 5)
          .attr('dy', 3)
          .attr('y', function (d, i) { return i * 12; })
          .text(function (d, i) { return d.key + (i ? '' : ' ★' ); });

        marker = lines.append('g')
          .classed('marker', true)
          .attr('opacity', 0);

        marker.append('circle')
          .style('pointer-events', 'none')
          .attr('class', getParty)
          .attr('r', 2.2);

        marker.append('text')
          .style('pointer-events', 'none')
          .attr('class', getParty)
          .attr('text-anchor', 'middle')
          .attr('filter', 'url(#background)')
          .attr('font-weight', 'bold');
      });
    }

    function mouseover() {

      marker.attr('opacity', 1);

      return mousemove.call(this);
    }

    function mousemove() {

      var month, index;

      month = xScale.invert(d3.mouse(this)[0]);
      index = Math.min(Math.round(month) - 1, 4);

      marker.selectAll('circle')
        .attr('cx', function (d) {

          return xScale(d.values[index].month);
        })
        .attr('cy', function (d) {

          return yScale(d.values[index].result);
        });

      marker.selectAll('text')
        .attr('x', function (d) {

          return xScale(d.values[index].month);
        })
        .attr('y', function (d) {

          return yScale(d.values[index].result);
        })
        .attr('dy', function (d) {

          return d.values[index].upper ? -10 : 17;
        })
        .text(function (d) {

          return d.values[index].result + '%';
        });
    }

    function mouseout() {

      marker.attr('opacity', 0);
      marker.selectAll('text')
        .text('');
    }

    function getParty (d) {

      return d.values[0].party.toLowerCase();
    }

    return chart;
  }
})();
