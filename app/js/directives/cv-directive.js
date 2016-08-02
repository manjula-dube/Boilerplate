define(['./index'], function (directives) {
    directives.directive("cvTrim", [function () {
      return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            element.bind('blur', function () {
                scope.$apply(function (){
                    element.val(element.val().trim().replace(/\s+/, ' '));
                });
            });
        }
      };
    }]);
});
