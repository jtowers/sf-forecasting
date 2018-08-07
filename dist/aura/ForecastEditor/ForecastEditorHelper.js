({
  loadNewRecord: function(component) {
    component.find("recordLoader").getNewRecord(
      "Feature_Forecast__c",
      null,
      false,
      $A.getCallback(function() {
        console.log(component.get("v.forecast"));
      })
    );
  },
  forecastIsValid: function(component) {
    var allValid = component
      .find("field")
      .reduce(function(validSoFar, inputCmp) {
        inputCmp.reportValidity();
        return validSoFar && inputCmp.checkValidity();
      }, true);

    return allValid;
  },
  runSimulations: function(component) {
    if (!this.forecastIsValid(component)) {
      return;
    }
    this.showSpinner(component);
    var forecast = component.get("v.forecast");
    var numSimulations = forecast.Number_of_Simulations__c;
    var weeksToZero = [];
    var trials = {};
    var trialResults = [];
    for (var i = 1; i <= numSimulations; i++) {
      var trial = this.conductTrial(forecast, i, weeksToZero);
      trialResults.push(trial);
      var existingTrial = trials[trial.weeksToZero];
      if (typeof existingTrial == "undefined") {
        existingTrial = {
          trials: [],
          Frequency__c: 0,
          Week__c:
            trial.Simulation_Burndown_Weeks__r[
              trial.Simulation_Burndown_Weeks__r.length - 1
            ].Week__c,
          Week_Number__c: trial.weeksToZero
        };
      }
      existingTrial.trials.push(trial);
      existingTrial.Frequency__c += 1;
      trials[trial.weeksToZero] = existingTrial;
    }
    console.log(trials);
    weeksToZero.sort(function(a, b) {
      return parseInt(a) - parseInt(b);
    });
    var simulationWeeks = [];
    for (var key in trials) {
      var trial = trials[key];
      trial.Probability__c = this.percentRank(
        weeksToZero,
        trial.Week_Number__c
      );
      simulationWeeks.push(trial);
    }
    simulationWeeks.sort(function(a, b) {
      return b.Probability__c - a.Probability__c;
    });
    component.set("v.simulationWeeks", simulationWeeks);
    this.formatBurndowns(component, trialResults);
    this.hideSpinner(component);
    component.set("v.simulationsRun", true);
  },
  conductTrial: function(forecast, i, weeksToZero) {
    var startDate = moment(forecast.Estimated_Start_Date__c);
    var storyEstimateLow = parseInt(forecast.Low_Story_Estimate__c);
    var storyEstimateHigh = parseInt(forecast.High_Story_Estimate__c);
    var splitLow = parseInt(forecast.Story_Split_Low__c);
    var splitHigh = parseInt(forecast.Story_Split_High__c);
    var throughputDays = parseInt(forecast.Sprint_Days__c);
    var throughputEstimateLow = parseInt(forecast.Sprint_Throughput_Low__c);
    var throughputEstimateHigh = parseInt(forecast.Sprint_Throughput_High__c);
    var trial = {};
    trial.number = i;
    var storyEstimate =
      Math.floor(Math.random() * (storyEstimateHigh - storyEstimateLow)) +
      storyEstimateLow;
    var splitRate = Math.random() * (splitHigh - splitLow) + splitLow;
    trial.totalSize = Math.ceil(storyEstimate + splitRate);
    trial.Simulation_Burndown_Weeks__r = [
      {
        Week__c: startDate,
        Remaining_Stories__c: trial.totalSize
      }
    ];
    var sizeRemaining = trial.totalSize;
    var nextDate = moment(startDate);
    while (sizeRemaining > 0) {
      var thisWeek = moment(nextDate.add(throughputDays, "d"));
      let weekThroughput =
        Math.floor(
          Math.random() * (throughputEstimateHigh - throughputEstimateLow)
        ) + throughputEstimateLow;
      sizeRemaining -= weekThroughput;
      if (sizeRemaining < 0) {
        sizeRemaining = 0;
      }
      trial.Simulation_Burndown_Weeks__r.push({
        Week__c: thisWeek,
        Remaining_Stories__c: sizeRemaining,
        throughput: weekThroughput
      });
    }
    trial.weeksToZero = trial.Simulation_Burndown_Weeks__r.length;
    weeksToZero.push(trial.weeksToZero);
    return trial;
  },
  percentRank: function(arr, v) {
    if (typeof v !== "number") throw new TypeError("v must be a number");
    for (var i = 0, l = arr.length; i < l; i++) {
      if (v <= arr[i]) {
        while (i < l && v === arr[i]) i++;
        if (i === 0) return 0;
        if (v !== arr[i - 1]) {
          i += (v - arr[i - 1]) / (arr[i] - arr[i - 1]);
        }
        return i / l;
      }
    }
    return 1;
  },
  formatBurndowns: function(component, trials) {
    var trialResults = trials.slice(0);
    var burndownTrials = [];
    for (var i = 0; i < 50; i++) {
      var sampleIndex = Math.floor(Math.random() * trialResults.length - 1);
      burndownTrials.push(trialResults.splice(sampleIndex, 1)[0]);
    }
    component.set("v.simulationBurndowns", burndownTrials);
  },
  formatSimulationWeeksForSave: function(component) {
    var simulationWeeks = component.get("v.simulationWeeks");
    var formatted = [];
    for (var i = 0; i < simulationWeeks.length; i++) {
      var simulationWeek = simulationWeeks[i];
      var week = {
        Frequency__c: simulationWeek.Frequency__c,
        Week__c: simulationWeek.Week__c.format("YYYY-MM-DD"),
        Week_Number__c: simulationWeek.Week_Number__c,
        Probability__c: simulationWeek.Probability__c * 100,
        sobjectType: "Simulation_Week__c"
      };
      formatted.push(week);
    }
    return formatted;
  },
  formatSimulationBurndownsForSave: function(component) {
    var simulationBurndowns = component.get("v.simulationBurndowns");
    var formatted = [];
    for (var i = 0; i < simulationBurndowns.length; i++) {
      var formattedBurndown = {
        sobjectType: "Simulation_Burndown__c"
      };
      formatted.push(formattedBurndown);
    }
    return formatted;
  },
  formatSimulationBurndownWeeksForSave: function(component) {
    var simulationBurndowns = component.get("v.simulationBurndowns");
    var formatted = [];
    for (var i = 0; i < simulationBurndowns.length; i++) {
      var burnWeeks = simulationBurndowns[i].Simulation_Burndown_Weeks__r;
      var weeks = [];
      for (var j = 0; j < burnWeeks.length; j++) {
        var burnWeek = burnWeeks[j];
        var formattedWeek = {
          sobjectType: "Simulation_Burndown_Week__c",
          Week__c: burnWeek.Week__c.format("YYYY-MM-DD"),
          Remaining_Stories__c: burnWeek.Remaining_Stories__c
        };
        weeks.push(formattedWeek);
      }
      formatted.push(weeks);
    }
    return formatted;
  },
  formatForecastForSave: function(component) {
    var forecast = component.get("v.forecast");
    var newForecast = Object.assign(forecast);
    return newForecast;
  },
  saveForecast: function(component) {
    if (!this.forecastIsValid(component)) {
      return;
    }
    this.showSpinner(component);
    var helper = this;
    var action = component.get("c.EditForecast");
    action.setParams({
      forecast: this.formatForecastForSave(component),
      simulationWeeks: this.formatSimulationWeeksForSave(component),
      simulationBurns: this.formatSimulationBurndownsForSave(component),
      simulationBurnWeeks: JSON.stringify(
        this.formatSimulationBurndownWeeksForSave(component)
      )
    });
    helper
      .executeAction(action)
      .then(
        $A.getCallback(function(result) {
          var navEvt = $A.get("e.force:navigateToSObject");
          navEvt.setParams({
            recordId: result.forecast.Id
          });
          navEvt.fire();
        })
      )
      .catch(
        $A.getCallback(function(err) {
          console.log(err);
          helper.hideSpinner(component);
        })
      );
  },
  formatLoadedSimulationWeeks: function(component, simulationWeeks) {
    for (var i = 0; i < simulationWeeks.length; i++) {
      simulationWeeks[i].Probability__c =
        simulationWeeks[i].Probability__c / 100;
    }
    component.set("v.simulationWeeks", simulationWeeks);
  },
  loadForecastRecord: function(component) {
    var helper = this;
    var action = component.get("c.LoadForecast");
    action.setParams({
      recordId: component.get("v.recordId")
    });
    this.executeAction(action)
      .then(
        $A.getCallback(function(results) {
          helper.formatLoadedSimulationWeeks(
            component,
            results.simulationWeeks
          );
          component.set("v.actualBurndownWeeks", results.actualBurndownWeeks);
          component.set("v.simulationBurndowns", results.simulationBurndowns);
        })
      )
      .catch(
        $A.getCallback(function(err) {
          console.log(err);
        })
      );
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
  },
  showSpinner: function(component) {
    $A.util.removeClass(component.find("spinner"), "slds-hide");
  },
  hideSpinner: function(component) {
    $A.util.addClass(component.find("spinner"), "slds-hide");
  }
});
