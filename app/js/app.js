define([
  'angular',
  'angular-sanitize',
  'angular-ui-router',
  'angular-credit-cards',
  'ngstorage',
  'angular-cookies',
  'config',
  './controllers/index',
  './directives/index',
  './filters/index',
  './services/index',
  'satellizer',
], function (ng) {

  return ng.module('app', [
    'app.config',
    'app.services',
    'app.controllers',
    'app.filters',
    'app.directives',
    'ngSanitize',
    'ui.router',
    'credit-cards',
    'satellizer',
    'ngStorage',
    'ngCookies'
  ]);
});
