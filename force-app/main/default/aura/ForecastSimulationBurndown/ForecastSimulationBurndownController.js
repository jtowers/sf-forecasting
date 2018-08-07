({
  init: function(component, event, helper) {
    console.log("init burndown component");
    if (
      !$A.util.isEmpty(component.get("v.recordId")) &&
      $A.util.isEmpty(component.get("v.simulationBurndowns"))
    ) {
      helper.loadData(component);
    } else {
      helper.buildChart(component);
    }
  },
  handleDataChange: function(component, event, helper) {
    helper.buildChart(component);
  }
});
