var margin = {top: 50, right: 120, bottom: 20, left: 120},
    width = 960 - margin.right - margin.left,
    height = 800 - margin.top - margin.bottom;
var i = 0,
    duration = 750,
    root;
var tree = d3.layout.tree()
    .size([height, width]);
var diagonal = d3.svg.diagonal()
    .projection(function(d) { return [d.x, d.y]; });
var svg = d3.select("body").append("svg")
    .attr("width", width + margin.right + margin.left)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
d3.json("treeData.json", function(error, flare) {
  if (error) throw error;
  root = flare[0];
  root.x0 = height / 2;
  root.y0 = 0;
  function collapse(d) {
    if (d.children) {
      d._children = d.children;
      d._children.forEach(collapse);
      d.children = null;
    }
  }
  root.children.forEach(collapse);
  update(root);
});
d3.select(self.frameElement).style("height", "800px");

function update(source) {
  // Compute the new tree layout.
  var nodes = tree.nodes(root).reverse(),
      links = tree.links(nodes);
  nodes.forEach(function(d) { d.y = d.depth * 100; });
  var node = svg.selectAll("g.node")
      .data(nodes, function(d) { return d.id || (d.id = ++i); });
  // Enter any new nodes at the parent's previous position.
  var nodeEnter = node.enter().append("g")
      .attr("class", "node")
      .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
      .on("click", click);
  nodeEnter.append("circle")
      .attr("r", 10)
      .style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; });
  nodeEnter.append("text")
      .attr("y", function(d) { return d.children || d._children ? -20 : 20; })
      .attr("dy", ".35em")
      .attr("text-anchor", function(d) { return d.children || d._children ? "end" : "start"; })
      .text(function(d) { return d.name; })
      .style("fill-opacity", 1);
  // Transition nodes to their new position.
  var nodeUpdate = node.transition()
      .duration(duration)
      .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
  nodeUpdate.select("circle")
      .attr("r", 10)
      .style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; });
  nodeUpdate.select("text")
      .style("fill-opacity", 1);
  // Transition exiting nodes to the parent's new position.
  var nodeExit = node.exit().transition()
      .duration(duration)
      .attr("transform", function(d) { return "translate(" + source.y + "," + source.x + ")"; })
      .remove();
  nodeExit.select("circle")
      .attr("r", 1e-6);
  nodeExit.select("text")
      .style("fill-opacity", 1e-6);
  // Update the links…
  var link = svg.selectAll("path.link")
      .data(links, function(d) { return d.target.id; });
  link.enter().insert("path", "g")
      .attr("class", "link")
      .attr("d", diagonal);
  link.transition()
      .duration(duration)
      .attr("d", diagonal);
  link.exit().transition()
      .duration(duration)
      .attr("d", function(d) {
        var o = {x: source.y, y: source.y};
        return diagonal({source: o, target: o});
      })
      .remove();
  nodes.forEach(function(d) {
    d.x0 = d.x;
    d.y0 = d.y;
  });
}

function click(d) {
  if (d.children) {
    d._children = d.children;
    d.children = null;
  } else {
    d.children = d._children;
    d._children = null;
  }
  update(d);
}
