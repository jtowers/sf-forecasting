({
  init: function(component, event, helper) {
    var columns = [
      {
        label: "Probability",
        fieldName: "Probability__c",
        type: "percent",
        sortable: true,
        typeAttributes: {
          maximumFractionDigits: "3"
        }
      },
      {
        label: "Week",
        fieldName: "Week__c",
        type: "date",
        sortable: true
      }
    ];

    component.set("v.tableColumns", columns);
    if (
      !$A.util.isEmpty(component.get("v.recordId")) &&
      $A.util.isEmpty(component.get("v.simulationWeeks"))
    ) {
      helper.loadData(component);
    }
  },
  handleSort: function(component, event, helper) {
    console.log("sorting");
    var fieldName = event.getParam("fieldName");
    var sortDirection = event.getParam("sortDirection");

    component.set("v.sortedBy", fieldName);
    component.set("v.sortedDirection", sortDirection);
    helper.sortData(component, fieldName, sortDirection);
  }
});
