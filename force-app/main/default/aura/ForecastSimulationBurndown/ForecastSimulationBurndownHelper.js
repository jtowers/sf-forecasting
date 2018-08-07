({
  loadData: function(component) {
    var simulationsAction = component.get("c.GetBurndowns");
    simulationsAction.setParams({
      recordId: component.get("v.recordId")
    });
    var actions = [];
    actions.push(this.executeAction(simulationsAction));

    var actualsAction = component.get("c.GetActualBurndownWeeks");
    actions.push(this.executeAction(actualsAction));
    Promise.all(actions).then(
      $A.getCallback(function(results) {
        component.set("v.actualBurndowns", results[1]);
        component.set("v.simulationBurndowns", results[0]);
      })
    );
  },

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
      type: "line",
      data: {
        labels: [],
        datasets: []
      },
      options: {
        tooltips: {
          enabled: false
        },
        title: {
          display: true,
          position: "top",
          text: "Simulated Burn Downs vs Actual"
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
                labelString: "Stories Remaining"
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
    var data = component.get("v.simulationBurndowns");
    var dataSets = [];
    for (var i = 0; i < data.length; i++) {
      var dataSet = this.formatDataset(data[i], i, labels);
      dataSets.push(dataSet);
    }
    var actualData = component.get("v.actualBurndowns");
    if (!$A.util.isUndefined(actualData)) {
      dataSets.push(this.formatActualDataset(actualData, labels));
    }

    return dataSets;
  },
  formatActualDataset: function(data, labels) {
    var dataSet = {
      type: "line",
      pointRadius: 3,
      borderColor: "#ff6384",
      pointBackgroundColor: "#ff6384",
      fill: false,
      lineTension: 0,
      borderWidth: 2,
      label: "Actual",
      data: []
    };
    for (var i = 0; i < data.length; i++) {
      var actualWeek = data[i];
      var dataPoint = {
        t: actualWeek.Week__c,
        y: actualWeek.Remaining_Stories__c
      };
      dataSet.data.push(dataPoint);
      if (labels.indexOf(actualWeek.Week__c) == -1) {
        labels.push(actualWeek.Week__c);
      }
    }
    return dataSet;
  },
  formatDataset: function(data, i, labels) {
    var dataSet = {
      type: "line",
      pointRadius: 0,
      fill: false,
      lineTension: 0,
      borderWidth: 2,
      label: data.Id || "Trial " + i,
      data: []
    };
    for (var i = 0; i < data.Simulation_Burndown_Weeks__r.length; i++) {
      var burndownWeek = data.Simulation_Burndown_Weeks__r[i];
      var dataPoint = {
        t: burndownWeek.Week__c,
        y: burndownWeek.Remaining_Stories__c
      };
      if (labels.indexOf(burndownWeek.Week__c) == -1) {
        labels.push(burndownWeek.Week__c);
      }
      dataSet.data.push(dataPoint);
    }
    return dataSet;
  },
  executeAction: function(action) {
    return new Promise(function(resolve, reject) {
      action.setCallback(this, function(response) {
        var state = response.getState();
        if (state === "SUCCESS") {
          var retVal = response.getReturnValue();
          resolve(retVal);
        } else if (state === "ERROR") {
          var errors = response.getError();
          if (errors) {
            if (errors[0] && errors[0].message) {
              reject(Error("Error message: " + errors[0].message));
            }
          } else {
            reject(Error("Unknown error"));
          }
        }
      });
      $A.enqueueAction(action);
    });
  }
});
