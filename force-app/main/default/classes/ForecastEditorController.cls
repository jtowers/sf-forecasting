/**
 * @author John Towers
 * @date 2018-08-10
 * @group API
 * @description Aura API class for creating, editing, and loading forecasts and related records
 */
public with sharing class ForecastEditorController {
@AuraEnabled
/**
 * API method to upsert a forecast and related records. On edit, related records are deleted and reinserted.
 * @param forecast forecast to create or update
 * @param simulationWeeks list of simulated weeks
 * @param simulationBurns list of simulated burndowns
 * @param simulationBurnWeeks stringified list of list of weeks
 * @param risks list of risks
 * @return   map of affected records
 */
public static Map<String, Object> EditForecast(Feature_Forecast__c forecast,
                                               List<Simulation_Week__c> simulationWeeks,
                                               List<Simulation_Burndown__c> simulationBurns,
                                               String simulationBurnWeeks,
                                               List<Risk__c> risks){
	Map<String, Object> results = new Map<String, Object>();
	forecast = SaveForecast(forecast);
	results.put('forecast', forecast);
	DeleteRelatedRecords(forecast.Id);
	simulationWeeks = CreateSimulationWeeks(simulationWeeks, forecast.Id);
	results.put('simulationWeeks', simulationWeeks);
	simulationBurns = CreateSimulationBurndowns(simulationBurns, forecast.Id);
	results.put('simulationBurns', simulationBurns);
	List<List<Simulation_Burndown_Week__c> > burnWeeks = CreateSimulationBurndownWeeks(simulationBurnWeeks, simulationBurns);
	results.put('simulationBurnWeeks', burnWeeks);
	risks = CreateRisks(risks, forecast.Id);
	results.put('risks', risks);
	return results;
}

@testVisible
private static Feature_Forecast__c SaveForecast(Feature_Forecast__c forecast){
	upsert forecast;
	return forecast;
}

@testVisible
private static void DeleteRelatedRecords(String recordId){
	delete [SELECT Id From Simulation_Week__c WHERE Feature_Forecast__c = : recordId];
	delete [SELECT Id FROM Simulation_Burndown_Week__c WHERE Simulation_Burndown__r.Feature_Forecast__c = : recordId];
	delete [SELECT Id FROM Simulation_Burndown__c WHERE Feature_Forecast__c = : recordId];
	delete [SELECT Id From Risk__c WHERE Feature_Forecast__c = : recordId];
}

@testVisible
private static List<Simulation_Week__c> CreateSimulationWeeks(List<Simulation_Week__c> simulationWeeks, String recordId){
	for(Simulation_Week__c simulationWeek : simulationWeeks) {
		simulationWeek.Feature_Forecast__c = recordId;
	}
	insert simulationWeeks;
	return simulationWeeks;
}

@testVisible private static List<Simulation_Burndown__c> CreateSimulationBurndowns(List<Simulation_Burndown__c> simulationBurns, String recordId){
	for(Simulation_Burndown__c simulationBurn : simulationBurns) {
		simulationBurn.Feature_Forecast__c = recordId;
	}
	insert simulationBurns;
	return simulationBurns;
}

@testVisible private static List<List<Simulation_Burndown_Week__c> > CreateSimulationBurndownWeeks(String simulationBurnWeeks, List<Simulation_Burndown__c> simulationBurns){
	List<Simulation_Burndown_Week__c> burnWeeks = new List<Simulation_Burndown_Week__c>();
	List<List<Simulation_Burndown_Week__c> > desWeeks = (List<List<Simulation_Burndown_Week__c> >)JSON.deserialize(simulationBurnWeeks, List<List<Simulation_Burndown_Week__c> >.class);
	List<List<Simulation_Burndown_Week__c> > results = new List<List<Simulation_Burndown_Week__c> >();
	for(Integer i = 0; i < desWeeks.size(); i++) {
		Simulation_Burndown__c burn = simulationBurns[i];
		List<Simulation_Burndown_Week__c> weeks = desWeeks[i];

		for(Simulation_Burndown_Week__c burnWeek : weeks) {
			burnWeek.Simulation_Burndown__c = burn.Id;
			burnWeeks.add(burnWeek);
		}
	}
	insert burnWeeks;
	return desWeeks;
}

@testVisible private static List<Risk__c> CreateRisks(List<Risk__c> risks, String recordId){
	for(Risk__c risk : risks) {
		risk.Feature_Forecast__c = recordId;
	}
	insert risks;
	return risks;
}


@AuraEnabled
/**
 * Loads related records for a forecast
 * @param  recordId Id for the forecast to load
 * @return          returns a map with the related forecast records
 */
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
/**
 * Retrieves the simulated burndown records for a forecst
 * @param  recordId forecast id
 * @return          list of simulation burndowns with weeks
 */
public static List<Simulation_Burndown__c> GetBurndowns(String recordId){
	return [SELECT Id, Feature_Forecast__c, (SELECT Id, Simulation_Burndown__c, Remaining_Stories__c, Week__c FROM Simulation_Burndown_Weeks__r ORDER BY Week__c) FROM Simulation_Burndown__c WHERE Feature_Forecast__c = : recordId];
}

@AuraEnabled
/**
 * Retrieves the simulation week results for a forecast
 * @param  recordId forecast id
 * @return          list of simulation weeks
 */
public static List<Simulation_Week__c> GetSimulationWeeks(String recordId){
	return [SELECT Id, Frequency__c, Probability__c, Week_Number__c, Week__c FROM Simulation_Week__c WHERE Feature_Forecast__c = : recordId ORDER BY Probability__c desc];
}

@AuraEnabled
/**
 * Retrieves the actual burndown results for a forecast
 * @param  recordId forecast id
 * @return          list of actual burndown weeks
 */
public static List<Actual_Burndown_Week__c> GetActualBurndownWeeks(String recordId){
	return [SELECT Id, Week__c, Remaining_Stories__c FROM Actual_Burndown_Week__c ORDER BY Week__c];
}

@AuraEnabled
/**
 * Retrieves list of risks for a forecast
 * @param  recordId forecast id
 * @return          list of risks
 */
public static List<Risk__c> GetRisks(String recordId){
	return [SELECT Id, Name, Probability__C, Low_Impact__c, High_Impact__c, Description__c, Combined_Impact__c FROM Risk__c WHERE feature_Forecast__c = : recordId ORDER BY Combined_Impact__c desc];
}

@AuraEnabled
/**
 * Retrieves import plugins for editor
 * @return   returns list of editor plugins
 */
public static List<ForecastEditorImportPlugin__mdt> GetImportPlugins(){
	return [SELECT Id, MasterLabel, Component_API_Name__c FROM ForecastEditorImportPlugin__mdt WHERE Active__c = true];
}



}
