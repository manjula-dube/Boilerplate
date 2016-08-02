/**
 * bootstraps angular onto the window.document node
 * NOTE: the ng-app attribute should not be on the index.html when using ng.bootstrap
 */
define([
    'require',
    'angular',
    'app',
    'jquery',
    'bootstrapJs',
    'routes',
    'impl'
], function (require, ng, app, $,bootstrapJs) {

    app.run(['$rootScope', '$state','$http', 'Auth','$location','$window', function ($rootScope, $state, _$http, Auth,$location,$window) {
        // any functions or variables to declare at runtime

        // change page title based on state
        $rootScope.$on('$stateChangeSuccess', function(event, toState) {
            if(toState.title) {
              $rootScope.pageTitle = toState.title;
            }

            var dataLayer = window.dataLayer || [];
            window.czURL = $location.absUrl();
        });

        $rootScope.$on("$stateChangeStart", function(event, toState, toParams, fromState, fromParams){
            //console.log(toState.authenticate, Auth.isLoggedIn(), fromState.authenticate);
            if (toState.authenticate && !Auth.isLoggedIn()){
              // User isn’t authenticated
              $state.go("login");
              event.preventDefault();
            }
        });

    }]);

    require(['domReady!'], function (document) {
      //$.getScript("//assets.adobedtm.com/0dd04ef8d8f7b48bfde56092d2c55a4c026cc844/satelliteLib-8f4eebff1f53ab4a2a65932a6636de2c2c1e5539.js");

      $(document).ready(function() {
        $(document).on('click', '.mobile-navbar', function(e) {
          $('#custom-header-dropdown').toggleClass('open');
        });

        $('.cv-loader').fadeOut();
      });

      return ng.bootstrap(document, ['app']);
    });
});
