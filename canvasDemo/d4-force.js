importScripts("https://d3js.org/d3.v5.min.js");
onmessage = function (event) {

  var data = event.data.dataBase,
    graphWidth = event.data.graphWidth,
    height = event.data.height,
    radius = 5,
    index,
    drag

  var graphCanvas = event.data.canvas
  var context = graphCanvas.getContext('2d');
  var simulation = d3.forceSimulation()
    .force("center", d3.forceCenter(graphWidth / 2, height / 2))
    .force("x", d3.forceX(graphWidth / 2).strength(0.1))
    .force("y", d3.forceY(height / 2).strength(0.1))
    .force("charge", d3.forceManyBody().strength(-50))
    .force("link", d3.forceLink().strength(1).id(function (d) {
      return d.id;
    }))
    .alphaTarget(0)
    .alphaDecay(0.05)

  var transform = d3.zoomIdentity;

  initGraph(data)
  this.postMessage('xxxx')

  function initGraph(tempData) {


    function zoomed() {
      console.log("zooming")
      transform = d3.event.transform;
      simulationUpdate();
    }

    d3.select(graphCanvas)
      .call(d3.drag().subject(dragsubject).on("start", dragstarted).on("drag", dragged).on("end", dragended))
      .call(d3.zoom().scaleExtent([1 / 10, 8]).on("zoom", zoomed))



    function dragsubject() {
      drag = true
      console.log("dragsubject start")
      var i,
        x = transform.invertX(d3.event.x),
        y = transform.invertY(d3.event.y),
        dx,
        dy;
      for (i = tempData.nodes.length - 1; i >= 0; --i) {
        node = tempData.nodes[i];
        dx = x - node.x;
        dy = y - node.y;

        if (dx * dx + dy * dy < radius * radius) {

          node.x = transform.applyX(node.x);
          node.y = transform.applyY(node.y);

          console.log(node)

          return node;
        }
      }

      console.log("dragsubject start +")
    }


    function dragstarted() {
      if (!d3.event.active) simulation.alphaTarget(0.3).restart();
      d3.event.subject.fx = transform.invertX(d3.event.x);
      d3.event.subject.fy = transform.invertY(d3.event.y);
    }

    function dragged() {
      d3.event.subject.fx = transform.invertX(d3.event.x);
      d3.event.subject.fy = transform.invertY(d3.event.y);

    }

    function dragended() {
      if (!d3.event.active) simulation.alphaTarget(0);
      d3.event.subject.fx = null;
      d3.event.subject.fy = null;
    }

    simulation.nodes(tempData.nodes)
      .on("tick", !console.log(1) && simulationUpdate);

    simulation.force("link")
      .links(tempData.edges);

    function simulationUpdate() {
      console.log(2)
      if (simulation.alpha() > 0.005) {
        if (data.nodes.length <= 1000) {
          index = (1 - simulation.alpha()) * 1500
        } else if (data.nodes.length <= 3000) {
          index = (1 - simulation.alpha()) * 3500
        } else if (data.nodes.length <= 5000) {
          index = (1 - simulation.alpha()) * 6000
        } else {
          index = (1 - simulation.alpha()) * 10000
        }
        context.clearRect(0, 0, graphWidth, height);
        // Draw the nodes
        tempData.nodes.forEach(function (d, i) {
          if (i > index) return
          context.beginPath();
          context.arc(d.x, d.y, radius, 0, 2 * Math.PI, true);
          context.fillStyle = d.col ? "red" : "black"
          context.fill();
        });

        context.restore();
      } else if (simulation.alpha() < 0.002 && drag) {
        drag = false
        console.log(simulation.alpha())
      } else {
        context.save();
        context.clearRect(0, 0, graphWidth, height);
        context.translate(transform.x, transform.y);
        context.scale(transform.k, transform.k);

        tempData.edges.forEach(function (d) {
          context.beginPath();
          context.moveTo(d.source.x, d.source.y);
          context.lineTo(d.target.x, d.target.y);
          context.stroke();
        });

        // Draw the nodes
        tempData.nodes.forEach(function (d, i) {

          context.beginPath();
          context.arc(d.x, d.y, radius, 0, 2 * Math.PI, true);
          context.fillStyle = d.col ? "red" : "black"
          context.fill();
        });

        context.restore();
      }
    }
  }
}