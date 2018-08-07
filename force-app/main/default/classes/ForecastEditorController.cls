public with sharing class ForecastEditorController {
@AuraEnabled
public static Map<String, Object> EditForecast(Feature_Forecast__c forecast, List<Simulation_Week__c> simulationWeeks, List<Simulation_Burndown__c> simulationBurns, String simulationBurnWeeks){
	Map<String, Object> results = new Map<String, Object>();
	upsert forecast;
	results.put('forecast', forecast);
	delete [SELECT Id From Simulation_Week__c WHERE Feature_Forecast__c = : forecast.Id];
	for(Simulation_Week__c simulationWeek : simulationWeeks) {
		simulationWeek.Feature_Forecast__c = forecast.Id;
	}
	insert simulationWeeks;
	results.put('simulationWeeks', simulationWeeks);
	delete [SELECT Id FROM Simulation_Burndown_Week__c WHERE Simulation_Burndown__r.Feature_Forecast__c = : forecast.Id];
	delete [SELECT Id FROM Simulation_Burndown__c WHERE Feature_Forecast__c = : forecast.Id];
	System.debug(simulationBurns);
	for(Simulation_Burndown__c simulationBurn : simulationBurns) {
		simulationBurn.Feature_Forecast__c = forecast.Id;
	}
	insert simulationBurns;
	System.debug(simulationBurnWeeks);
	List<Simulation_Burndown_Week__c> burnWeeks = new List<Simulation_Burndown_Week__c>();
	List<List<Simulation_Burndown_Week__c> > desWeeks = (List<List<Simulation_Burndown_Week__c> >)JSON.deserialize(simulationBurnWeeks, List<List<Simulation_Burndown_Week__c> >.class);
	for(Integer i = 0; i < desWeeks.size(); i++) {
		Simulation_Burndown__c burn = simulationBurns[i];
		System.debug(desWeeks[i]);
		List<Simulation_Burndown_Week__c> weeks = desWeeks[i];

		for(Simulation_Burndown_Week__c burnWeek : weeks) {
			burnWeek.Simulation_Burndown__c = burn.Id;
			burnWeeks.add(burnWeek);
		}


	}
	insert burnWeeks;
	return results;
}

@AuraEnabled
public static Map<String, Object> LoadForecast(String recordId){
	Map<String, Object> results = new Map<String, Object>();
	List<Simulation_Week__c> simulationWeeks = GetSimulationWeeks(recordId);
	results.put('simulationWeeks', simulationWeeks);
	List<Simulation_Burndown__c> simulationBurndowns = GetBurndowns(recordId);
	results.put('simulationBurndowns', simulationBurndowns);
	List<Actual_Burndown_Week__c> actualBurndownWeeks = GetActualBurndownWeeks(recordId);
	results.put('actualBurndownWeeks', actualBurndownWeeks);
	return results;
}

@AuraEnabled
public static List<Simulation_Burndown__c> GetBurndowns(String recordId){
	return [SELECT Id, Feature_Forecast__c, (SELECT Id, Simulation_Burndown__c, Remaining_Stories__c, Week__c FROM Simulation_Burndown_Weeks__r ORDER BY Week__c) FROM Simulation_Burndown__c WHERE Feature_Forecast__c = : recordId];
}

@AuraEnabled
public static List<Simulation_Week__c> GetSimulationWeeks(String recordId){
	return [SELECT Id, Frequency__c, Probability__c, Week_Number__c, Week__c FROM Simulation_Week__c WHERE Feature_Forecast__c = : recordId ORDER BY Probability__c desc];
}

@AuraEnabled
public static List<Actual_Burndown_Week__c> GetActualBurndownWeeks(String recordId){
	return [SELECT Id, Week__c, Remaining_Stories__c FROM Actual_Burndown_Week__c ORDER BY Week__c];
}



}
