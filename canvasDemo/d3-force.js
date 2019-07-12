importScripts("https://d3js.org/d3.v5.min.js");
onmessage = function (event) {

  var data = event.data.dataBase,
    graphWidth = event.data.graphWidth,
    height = event.data.height

  var simulation = d3.forceSimulation()
    .force("center", d3.forceCenter(graphWidth / 2, height / 2))
    .force("x", d3.forceX(graphWidth / 2).strength(0.01))
    .force("y", d3.forceY(height / 2).strength(0.01))
    .force("charge", d3.forceManyBody().strength(-200))
    .force("link", d3.forceLink().strength(1).id(function (d) {
      return d.id;
    }))
    .alphaTarget(0)
    .alphaDecay(0.05)

  simulation.nodes(data.nodes)

  simulation.force("link")
    .links(data.edges);


  for (var i = 0, n = Math.ceil(Math.log(simulation.alphaMin()) / Math.log(1 - simulation.alphaDecay())); i < n; ++i) {
    simulation.tick();
    postMessage({
      type: "tick",
      update: {
        progress: simulation.alpha(),
        data
      }
    })
  }
}