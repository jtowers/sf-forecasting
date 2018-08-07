({
  init: function(component, event, helper) {
    console.log("doing init");
    var recordId = component.get("v.recordId");
    if ($A.util.isEmpty(recordId)) {
      helper.loadNewRecord(component);
    }
  },
  handleRecordUpdated: function(component, event, helper) {
    console.log("record loaded");
    helper.loadForecastRecord(component);
  },
  runSimulations: function(component, event, helper) {
    helper.runSimulations(component);
  },
  saveForecast: function(component, event, helper) {
    if (!component.get("v.simulationsRun")) {
      helper.runSimulations(component);
    }
    if (!$A.util.isEmpty(component.get("v.recordId"))) {
      var cont = confirm(
        "Saving this forecast will replace existing foreast data. Are you sure you want to do this?"
      );
      if (!cont) {
        return;
      }
    }

    helper.saveForecast(component);
  },
  cancel: function(component, event, helper) {
    if (!$A.util.isEmpty(component.get("v.recordId"))) {
      var navEvt = $A.get("e.force:navigateToSObject");
      navEvt.setParams({
        recordId: component.get("v.recordId")
      });
      navEvt.fire();
    } else {
      var homeEvent = $A.get("e.force:navigateToObjectHome");
      homeEvent.setParams({
        scope: "Feature_Forecast__c"
      });
      homeEvent.fire();
    }
  }
});
