@IsTest
public class ForecastEditorControllerTests {


static Feature_Forecast__c GenerateForecast(){
	Feature_Forecast__c testForecast = new Feature_Forecast__c(
		Estimated_Start_Date__c = Date.today(),
		High_Story_Estimate__c = 60,
		Low_Story_Estimate__c = 20,
		Number_of_Simulations__c = 500,
		Sprint_Days__c = 14,
		Sprint_Throughput_High__c = 15,
		Sprint_Throughput_Low__c = 5,
		Story_Split_High__c = 2,
		Story_Split_Low__c = 1
		);
	return testForecast;
}
static Simulation_Week__c GenerateSimulationWeek(){
	Simulation_Week__c testWeek = new Simulation_Week__c(
		Frequency__c = Math.floor(Math.random() * 500) + 1,
		Probability__c = Math.floor(Math.random() * 100),
		Week__c = Date.today()
		);
	return testWeek;
}

static List<Simulation_Week__c> GenerateSimulationWeeks(Integer count){
	List<Simulation_Week__c> testWeeks = new List<Simulation_Week__c>();
	for(Integer i = 0; i < count; i++) {
		Simulation_Week__c testWeek = GenerateSimulationWeek();
		testWeeks.add(testWeek);
	}
	return testWeeks;
}

static Simulation_Burndown__c GenerateSimulationBurndown(){
	Simulation_Burndown__c testBurn = new Simulation_Burndown__c();
	return testBurn;
}

static List<Simulation_Burndown__c> GenerateSimulationBurndowns(Integer count){
	List<Simulation_Burndown__c> simulationBurndowns = new List<Simulation_Burndown__c>();
	for(Integer i = 0; i < count; i++) {
		Simulation_Burndown__c simulationBurndown = GenerateSimulationBurndown();
		simulationBurndowns.add(simulationBurndown);
	}
	return simulationBurndowns;
}

static Simulation_Burndown_Week__c GenerateSimulationBurndownWeek(){
	Simulation_Burndown_Week__c testBurndownWeek = new Simulation_Burndown_Week__c(
		Remaining_Stories__c = Math.floor(Math.random() * 500) + 1,
		Week__c = Date.today()
		);
	return testBurndownWeek;
}

static List<List<Simulation_Burndown_Week__c> > GenerateSimulationBurndownWeeks(Integer burndownCount, Integer weekCount){
	List<List<Simulation_Burndown_Week__c> > testBurndownWeekList = new List<List<Simulation_Burndown_Week__c> >();
	for(Integer i = 0; i < burndownCount; i++) {
		List<Simulation_Burndown_Week__c> testBurndownWeeks = new List<Simulation_Burndown_Week__c>();
		for(Integer j = 0; j < weekCount; j++) {
			Simulation_Burndown_Week__c testBurndownWeek = GenerateSimulationBurndownWeek();
			testBurndownWeeks.add(testBurndownWeek);
		}
		testBurndownWeekList.add(testBurndownWeeks);
	}
	return testBurndownWeekList;
}

static Risk__c GenerateRisk(){
	Risk__c testRisk = new Risk__c(
		Description__c = 'test',
		Name = 'Test',
		High_Impact__c = Math.floor(Math.random() * 10) + 5,
		Low_Impact__c = Math.floor(Math.random() * 5) + 1,
		Probability__c = Math.floor(Math.random() * 100) + 1
		);
	return testRisk;
}

static List<Risk__c> GenerateRisks(Integer count){
	List<Risk__c> testRisks = new List<Risk__c>();
	for(Integer i = 0; i < count; i++) {
		Risk__c testRisk = GenerateRisk();
		testRisks.add(testRisk);
	}
	return testRisks;
}

@IsTest
static void SaveForecastShouldCreateNewForecast(){
	Feature_Forecast__c testForecast = GenerateForecast();
	test.startTest();
	Feature_Forecast__c insertedForecast = ForecastEditorController.SaveForecast(testForecast);
	test.stopTest();
	System.assert (insertedForecast.Id != null, 'Forecast should be inserted and have an id');
}

@IsTest
static void SaveForecastShouldUpsertExistingForecast(){
	Feature_Forecast__c testForecast = GenerateForecast();
	insert testForecast;
	test.startTest();
	Feature_Forecast__c insertedForecast = ForecastEditorController.SaveForecast(testForecast);
	test.stopTest();
	System.assert (insertedForecast.Id == testForecast.Id, 'Existing forecast should be updated when saved');
}


@IsTest
static void CreateSimluationWeeksShouldInsertAllSimulationWeeks(){
	Feature_Forecast__c testForecast = GenerateForecast();
	insert testForecast;
	List<Simulation_Week__c> testWeeks = GenerateSimulationWeeks(52);


	test.startTest();
	List<Simulation_Week__c> insertedWeeks = ForecastEditorController.CreateSimulationWeeks(testWeeks, testForecast.Id);
	test.stopTest();
	System.assert (insertedWeeks.size() == testWeeks.size(), 'All weeks should be inserted');
	for(Simulation_Week__c insertedWeek : insertedWeeks) {
		System.assert (insertedWeek.Feature_Forecast__c == testForecast.Id, 'Simulation week should have forecast as parent');
	}
}

@IsTest
static void CreateSimulationBurndownsShouldInsertSimulationBurndowns(){
	Feature_Forecast__c testForecast = GenerateForecast();
	insert testForecast;
	List<Simulation_Burndown__c> testSimulationBurndowns = GenerateSimulationBurndowns(50);
	test.startTest();
	List<Simulation_Burndown__c> insertedSimulationBurndowns = ForecastEditorController.CreateSimulationBurndowns(testSimulationBurndowns, testForecast.Id);
	test.stopTest();
	System.assert (testSimulationBurndowns.size() == insertedSimulationBurndowns.size(), 'All simulation burndowns should be inserted');
	for (Simulation_Burndown__c insertedSimulationBurndown : insertedSimulationBurndowns) {
		System.assert (insertedSimulationBurndown.Feature_Forecast__c == testForecast.Id, 'Simulation burndown should have forecast as parent');
	}
}

@IsTest
static void CreateSimulationBurndownWeeksShouldInsertSimulationBurndownWeeks(){
	Feature_Forecast__c testForecast = GenerateForecast();
	insert testForecast;
	List<Simulation_Burndown__c> testSimulationBurndowns = GenerateSimulationBurndowns(50);
	List<List<Simulation_Burndown_Week__c> > testBurndownWeeks = GenerateSimulationBurndownWeeks(testSimulationBurndowns.size(), 10);
	ForecastEditorController.CreateSimulationBurndowns(testSimulationBurndowns, testForecast.Id);

	test.startTest();
	List<List<Simulation_Burndown_Week__c> > insertedSimulationBurndownWeeks = ForecastEditorController.CreateSimulationBurndownWeeks(JSON.serialize(testBurndownWeeks), testSimulationBurndowns);
	test.stopTest();

}

@IsTest
static void CreateRisksShouldInsertRisks(){
	Feature_Forecast__c testForecast = GenerateForecast();
	insert testForecast;
	List<Risk__c> testRisks = GenerateRisks(10);
	test.startTest();
	List<Risk__c> insertedRisks = ForecastEditorController.CreateRisks(testRisks, testForecast.Id);
	test.stopTest();
	System.assert (insertedRisks.size() == testRisks.size(), 'All risks should be inserted');

	for (Risk__c insertedRisk : insertedRisks) {
		System.assert (insertedRisk.Feature_Forecast__c == testForecast.Id, 'Risk should have parent forecast set');
	}

}

@IsTest
static void DeleteRelatedRecordsShouldDeleteForecastData(){
	Feature_Forecast__c testForecast = GenerateForecast();
	insert testForecast;
	List<Simulation_Week__c> testWeeks = GenerateSimulationWeeks(52);
	ForecastEditorController.CreateSimulationWeeks(testWeeks, testForecast.Id);
	List<Simulation_Burndown__c> testSimulationBurndowns = GenerateSimulationBurndowns(50);
	List<List<Simulation_Burndown_Week__c> > testBurndownWeeks = GenerateSimulationBurndownWeeks(testSimulationBurndowns.size(), 10);
	ForecastEditorController.CreateSimulationBurndowns(testSimulationBurndowns, testForecast.Id);
	ForecastEditorController.CreateSimulationBurndownWeeks(JSON.serialize(testBurndownWeeks), testSimulationBurndowns);
	List<Risk__c> testRisks = GenerateRisks(10);
	ForecastEditorController.CreateRisks(testRisks, testForecast.Id);
	List<Simulation_Week__c> insertedWeeks = [SELECT Id, Feature_Forecast__c FROM Simulation_Week__c];
	System.assert (insertedWeeks.size() > 0);
	List<Simulation_Burndown__c> insertedBurndowns = [SELECT Id, Feature_Forecast__c FROM Simulation_Burndown__c];
	System.assert (insertedBurndowns.size() > 0);
	List<Simulation_Burndown_Week__c> insertedBurndownWeeks = [SELECT Id From Simulation_Burndown_Week__c];
	System.assert (insertedBurndownWeeks.size() > 0);
	List<Risk__c> insertedRisks = [SELECT Id, Feature_Forecast__c FROM Risk__c];
	System.assert (insertedRisks.size() > 0);
	test.startTest();
	ForecastEditorController.DeleteRelatedRecords(testForecast.Id);
	test.stopTest();
	insertedWeeks = [SELECT Id, Feature_Forecast__c FROM Simulation_Week__c];
	System.assert (insertedWeeks.size() == 0);
	insertedBurndowns = [SELECT Id, Feature_Forecast__c FROM Simulation_Burndown__c];
	System.assert (insertedBurndowns.size() == 0);
	insertedBurndownWeeks = [SELECT Id From Simulation_Burndown_Week__c];
	System.assert (insertedBurndownWeeks.size() == 0);
	insertedRisks = [SELECT Id, Feature_Forecast__c FROM Risk__c];
	System.assert (insertedRisks.size() == 0);
}

@IsTest
static void EditForecastShouldInsertAllNecessaryRecords(){
	Feature_Forecast__c testForecast = GenerateForecast();
	List<Simulation_Week__c> testWeeks = GenerateSimulationWeeks(52);
	List<Simulation_Burndown__c> testSimulationBurndowns = GenerateSimulationBurndowns(50);
	List<List<Simulation_Burndown_Week__c> > testBurndownWeeks = GenerateSimulationBurndownWeeks(testSimulationBurndowns.size(), 10);
	List<Risk__c> testRisks = GenerateRisks(10);
	test.startTest();
	ForecastEditorController.EditForecast(testForecast, testWeeks, testSimulationBurndowns, JSON.serialize(testBurndownWeeks), testRisks);
	test.stopTest();
	Feature_Forecast__c insertedForecast = [SELECT Id FROM Feature_Forecast__c];
	System.assert (insertedForecast != null);
	List<Simulation_Week__c> insertedWeeks = [SELECT Id, Feature_Forecast__c FROM Simulation_Week__c];
	System.assert (insertedWeeks.size() > 0);
	List<Simulation_Burndown__c> insertedBurndowns = [SELECT Id, Feature_Forecast__c FROM Simulation_Burndown__c];
	System.assert (insertedBurndowns.size() > 0);
	List<Simulation_Burndown_Week__c> insertedBurndownWeeks = [SELECT Id From Simulation_Burndown_Week__c];
	System.assert (insertedBurndownWeeks.size() > 0);
	List<Risk__c> insertedRisks = [SELECT Id, Feature_Forecast__c FROM Risk__c];
	System.assert (insertedRisks.size() > 0);
}

@IsTest
static void LoadForecastShouldReturnNecessaryRecords(){
	Feature_Forecast__c testForecast = GenerateForecast();
	List<Simulation_Week__c> testWeeks = GenerateSimulationWeeks(52);
	List<Simulation_Burndown__c> testSimulationBurndowns = GenerateSimulationBurndowns(50);
	List<List<Simulation_Burndown_Week__c> > testBurndownWeeks = GenerateSimulationBurndownWeeks(testSimulationBurndowns.size(), 10);
	List<Risk__c> testRisks = GenerateRisks(10);
	ForecastEditorController.EditForecast(testForecast, testWeeks, testSimulationBurndowns, JSON.serialize(testBurndownWeeks), testRisks);
	test.startTest();
	Map<String, Object> forecastResults = ForecastEditorController.LoadForecast(testForecast.Id);
	List<Risk__c> risks = ForecastEditorController.GetRisks(testForecast.Id);
	test.stopTest();

}

}