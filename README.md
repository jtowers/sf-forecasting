# sf-forecasting

Probabilistic forecasting app for Salesforce based on Troy Magennis's [forecasting model](http://focusedobjective.com/category/forecasting/) for using Monte Carlo simulations to estimate probable end dates for projects given a set of assumptions about the project.

Installing creates a Feature Forecast object and related metadata to generate and store project forecasts.

## Installation Instructions

### Unmanaged package

Use the button below to deploy the unmanaged package into a test environment.

<a href="https://githubsfdeploy.herokuapp.com">
  <img alt="Deploy to Salesforce"
       src="https://raw.githubusercontent.com/afawcett/githubsfdeploy/master/deploy.png">
</a>

Or deploy the contents of the `dist` directory using the Ant Migration Tool, workbench, etc.

### DX

If you have a DX dev hub set up you can also clone this repo and use this project to create a package and install it into your org.

## Todo:

- Finish README
  - Finish description
  - Add instructions for use with screenshots
- Add Lightning tests
- Add classic support
