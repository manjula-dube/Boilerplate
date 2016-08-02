/*global define */

define(['angular'], function(angular) {
    return angular.module('app.config', ['satellizer'])
        .constant('VERSION', '0.0.1')
        .constant('ENV_PROD', {
            'PRODUCTURL': 'http://www.craftsvilla.com/catalog/product/view/id/',
            'HOST': 'https://securestatic.craftsvilla.com',
            'IMGHOST': 'https://secureimg1.craftsvilla.com',
            'LSTATIC': 'https://securelstatic1.craftsvilla.com/',
            'GTM_ID': 'GTM-5W7X48'
        })
        .constant('ENV_DEV', {
            'PRODUCTURL': 'https://securedev' + env_id + '.craftsvilla.com/catalog/product/view/id/',
            'HOST': 'https://securedev' + env_id + '.craftsvilla.com',
            'IMGHOST': 'https://secureimg1.craftsvilla.com',
            'LSTATIC': 'https://securelstatic1.craftsvilla.com/',
            'GTM_ID': 'GTM-NZFVN6'
        })
        .constant('ENVIRONMENT', 'production')
        // .constant('ENVIRONMENT', 'development')
        .constant('VIEWS', {
            footer: 'partials/footer.html'
        })
        .config(['$httpProvider', function($httpProvider) {
            $httpProvider.defaults.withCredentials = true;
            $httpProvider.defaults.headers.common = {};
            $httpProvider.defaults.headers.post = {};
            $httpProvider.defaults.headers.put = {};
            $httpProvider.defaults.headers.patch = {};
            $httpProvider.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded";
            delete $httpProvider.defaults.headers.common['X-Requested-With'];
        }])
        .config(['$authProvider', 'ENVIRONMENT', 'ENV_DEV', 'ENV_PROD', function($authProvider, ENVIRONMENT, ENV_DEV, ENV_PROD) {
            var HOST;
            if (ENVIRONMENT == 'development') {
                HOST = ENV_DEV.HOST;
            }
            if (ENVIRONMENT == 'production') {
                HOST = ENV_PROD.HOST;
            }

            $authProvider.baseUrl = HOST;
            $authProvider.withCredentials = true;

            $authProvider.facebook({
                clientId: '1668947976707075',
                responseType: 'token',
                url: '/checkoutService/index/socialLogin',
                skipAuthorization: true,
            });

            $authProvider.google({
                clientId: '284180597119-51glidbrmd6u9lg77hjvqhbq69vl62j9.apps.googleusercontent.com',
                url: '/checkoutService/index/socialLogin',
                skipAuthorization: true,
                redirectUri: window.location.origin ? window.location.origin + '/buy/login' : window.location.protocol + '//' + window.location.host + '/buy/login',
            });
        }]);
});
