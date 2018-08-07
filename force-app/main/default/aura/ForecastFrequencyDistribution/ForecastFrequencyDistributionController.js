({
  init: function(component, event, helper) {
    console.log("init burndown component");
    helper.buildChart(component);
  },
  handleDataChange: function(component, event, helper) {
    helper.buildChart(component);
  }
});
