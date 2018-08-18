({
  init: function(component, event, helper) {
    console.log("doing init");
    var recordId = component.get("v.recordId");
    if ($A.util.isEmpty(recordId)) {
      helper.loadNewRecord(component);
    }
    helper.getImportPlugins(component);
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
  },
  handlePluginChange: function(component, event, helper) {
    var selected = event.getParam("value");
    component.set("v.selectedPlugin", selected);
  },
  importData: function(component, event, helper) {
    helper.importData(component);
  },
  cancelImport: function(component, event, helper) {
    helper.hideModal(component);
  },
  doImport: function(component, event, helper) {
    console.log("starting import");
    component.get("v.body")[0].doImport();
  },
  handleImportComplete: function(component, event, helper) {
    console.log("import complete");
    var success = event.getParam("success");
    if (success) {
      var updatedForecastValues = event.getParam("updatedForecastValues");
      if (!$A.util.isEmpty(updatedForecastValues)) {
        var forecast = component.get("v.forecast");
        forecast = Object.assign(forecast, updatedForecastValues);
        component.set("v.forecast", forecast);
      }
      helper.hideModal(component);
      component.find("notifLib").showToast({
        variant: "success",
        title: "Success",
        message: "Your import was completed successfully"
      });
    }
  }
});
