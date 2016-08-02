/**
 * Defines the main routes in the application.
 */
define(['./app'], function (app) {
   app.config(['$stateProvider', '$locationProvider', '$urlRouterProvider', function ($stateProvider, $locationProvider, $urlRouterProvider) {

    $locationProvider.html5Mode(true).hashPrefix('!');

    $stateProvider
        .state('login', {
          url: "/buy/login",
          templateUrl: 'partials/login.html',
          controller: 'loginCtrl',
          title: 'Login',
          authenticate: false
        })
        .state('shipping', {
          url: "/buy/shipping",
          templateUrl: 'partials/shipping.html',
          controller: 'shippingCtrl',
          title: 'Shipping',
          authenticate: true
        })
        .state('payment', {
          url: "/buy/payment?error",
          templateUrl: 'partials/payment.html',
          controller: 'paymentCtrl',
          title: 'Payment',
          authenticate: false,
        })
        .state('payments-success', {
          url: "/buy/payment-success",
          cache: false,
          templateUrl: 'partials/payment-success.html',
          controller: 'paymentSuccessCtrl',
          title: 'Success',
          authenticate: false
        })
        .state('cart', {
          url: "/buy/cart",
          templateUrl: 'partials/checkout-cart.html',
          controller: 'checkoutCartCtrl',
          title: 'Shopping Cart',
          authenticate: false
        });
    $urlRouterProvider.otherwise("/buy/cart");
  }]);
});
