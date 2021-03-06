(function() {

  'strict';

  (function init() {

    d3.queue()
      .defer(d3.tsv, 'data/polls.tsv')
      .await(function (error, data) {

        if (error) { throw error; }

        data = transform(data);
        draw(data);
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

  function draw(data) {

    var width, height, margin,
      vis, marker, xScale, yScale, yAxis, line,
      div, svg, group, lines, result, legend;

    width = 150;
    height = 120;
    margin = {
      top: 20,
      right: 30,
      bottom: 20,
      left: 40
    };

    vis = d3.select('#vis');

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

    div = vis.selectAll('.chart')
      .data(data);

    div.enter()
      .append('div')
        .attr('class', 'chart')
      .append('svg')
      .append('g');

    svg = div.select('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom);

    group = svg.select('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    group.append('rect')
      .attr('class', 'background')
      .style('pointer-events', 'all')
      .attr('width', width + margin.right)
      .attr('height', height);

    group.append('text')
      .attr('class', 'year')
      .attr('text-anchor', 'middle')
      .attr('y', height)
      .attr('dy', margin.bottom / 2)
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
      .attr('class', getParty)
      .attr('text-anchor', 'end')
      .attr('font-weight', 'bold')
      .attr('x', function (d) { return xScale(d.values[4].month); })
      .attr('y', function (d) { return yScale(d.values[4].result); })
      .attr('dx', 5)
      .attr('dy', function (d, i) {
        return i ? 17 : -10;
      })
      .text(function (d) {

        var delta = d.values[4].result - d.values[3].result;
        if (delta > 0) { delta = '+' + delta; }
        return delta + '%';
      });

    legend = lines.append('g')
      .attr('class', 'legend');

    legend.append('text')
      .attr('class', getParty)
      .attr('x', 5)
      .attr('dy', 5)
      .attr('y', function (d, i) { return i * 14; })
      .text(function (d, i) { return d.key + (i ? '' : ' ★' ); });

    marker = lines.append('g')
      .classed('marker', true);

    marker.append('circle')
      .style('pointer-events', 'none')
      .attr('class', getParty)
      .attr('r', 2.2)
      .attr('cx', function (d) { return xScale(d.values[3].month); })
      .attr('cy', function (d) { return yScale(d.values[3].result); });

    marker.append('text')
      .style('pointer-events', 'none')
      .attr('class', getParty)
      .attr('text-anchor', 'middle')
      .attr('font-weight', 'bold')
      .attr('x', function (d) { return xScale(d.values[3].month); })
      .attr('y', function (d) { return yScale(d.values[3].result); })
      .attr('dy', function (d) { return d.values[3].upper ? -10 : 17; })
      .text(function (d) { return d.values[3].result + '%'; });
  }

  function getParty(d) {

    return d.values[0].party.toLowerCase();
  }
})();
