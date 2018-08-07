({
  loadData: function(component) {
    var action = component.get("c.GetSimulationWeeks");
    action.setParams({
      recordId: component.get("v.recordId")
    });
    this.executeAction(action).then(
      $A.getCallback(function(result) {
        for (var i = 0; i < result.length; i++) {
          result[i].Probability__c = result[i].Probability__c / 100;
        }
        component.set("v.simulationWeeks", result);
      })
    );
  },
  sortData: function(component, fieldName, sortDirection) {
    var data = component.get("v.simulationWeeks");
    var reverse = sortDirection !== "asc";
    //sorts the rows based on the column header that's clicked
    data.sort(function(a, b) {
      var ret = 0;
      if (fieldName == "Probability__c") {
        ret = a.Probability__c - b.Probability__c;
      } else {
        ret = a.Week__c.getTime() - b.Week__c.getTime();
      }
      return reverse ? ret * -1 : ret;
    });
    component.set("v.simulationWeeks", data);
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
