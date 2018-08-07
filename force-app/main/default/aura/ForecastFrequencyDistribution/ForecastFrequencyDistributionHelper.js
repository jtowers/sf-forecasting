({
  buildChart: function(component) {
    var chart = component.get("v.chart");
    if ($A.util.isEmpty(chart)) {
      chart = this.createNewConfig(component);
    }
    chart.config.data.datasets = this.formatData(
      component,
      chart.config.data.labels
    );
    chart.update();
    component.set("v.chart", chart);
  },
  createNewConfig: function(component) {
    var ctxCmp = component.find("chartArea");
    var ctx = ctxCmp.getElement().getContext("2d");
    ctx.canvas.width = 1000;
    ctx.canvas.height = 300;

    var cfg = {
      type: "bar",
      data: {
        labels: [],
        datasets: []
      },
      options: {
        title: {
          display: true,
          position: "top",
          text: "Feature Completion Distribution"
        },
        legend: {
          display: false
        },
        scales: {
          xAxes: [
            {
              type: "time",
              distribution: "series",
              ticks: {
                source: "labels"
              },
              time: {
                unit: "day"
              }
            }
          ],
          yAxes: [
            {
              scaleLabel: {
                display: true,
                labelString: "Frequency"
              }
            }
          ]
        }
      }
    };
    var burndownChart = new Chart(ctx, cfg);
    return burndownChart;
  },
  formatData: function(component, labels) {
    var data = component.get("v.simulationWeeks");

    var dataSet = {
      type: "bar",
      data: [],
      pointRadius: 0,
      fill: false,
      lineTension: 0,
      borderWidth: 2
    };
    for (var i = 0; i < data.length; i++) {
      var dataPoint = data[i];
      dataSet.data.push({
        y: dataPoint.Frequency__c,
        t: dataPoint.Week__c
      });
      if (labels.indexOf(dataPoint.Week__c) == -1) {
        labels.push(dataPoint.Week__c);
      }
    }

    return [dataSet];
  }
});
