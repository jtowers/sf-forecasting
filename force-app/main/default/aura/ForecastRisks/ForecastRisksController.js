({
  init: function(component, event, helper) {
    if (
      !$A.util.isEmpty(component.get("v.recordId")) &&
      $A.util.isEmpty(component.get("v.forecastRisks"))
    ) {
      helper.loadData(component);
    }
  },
  addRisk: function(component, event, helper) {
    var risks = component.get("v.forecastRisks");
    if ($A.util.isUndefined(risks)) {
      risks = [];
    }
    risks.push({
      Name: "New Risk",
      Probability__c: 0,
      Low_Impact__c: 0,
      High_Impact__c: 0,
      Description__c: ""
    });
    component.set("v.forecastRisks", risks);
  },
  removeRisks: function(component, event, helper) {
    console.log("removing risks");
    var risks = component.get("v.forecastRisks");
    var riskChecks = component.find("rowSelection");
    if (!$A.util.isArray(riskChecks)) {
      riskChecks = [riskChecks];
    }
    var removeRows = [];
    for (var i = 0; i < riskChecks.length; i++) {
      var riskCheck = riskChecks[i];
      if (riskCheck.get("v.checked")) {
        removeRows.push(riskCheck.get("v.value"));
      }
    }
    removeRows.sort().reverse();
    for (var i = 0; i < removeRows.length; i++) {
      risks.splice(removeRows[i], 1);
    }
    component.set("v.forecastRisks", risks);
  },
  selectAll: function(component, event, helper) {
    var selectAll = component.find("selectAll");
    var selected = selectAll.get("v.checked");
    var riskChecks = component.find("rowSelection");

    for (var i = 0; i < riskChecks.length; i++) {
      var riskCheck = riskChecks[i];
      riskCheck.set("v.checked", selected);
    }
  }
});
