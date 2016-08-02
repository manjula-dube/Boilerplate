define(['./index'], function (controllers) {
 	controllers.controller('loginCtrl', ['$scope', '$state', '$auth', '$localStorage', 'craftsvillaService', 'ErrorMessages', function ($scope, $state ,$auth, $localStorage, craftsvillaService, ErrorMessages) {
	$scope.guestUser = false;
	$scope.forgotPasswd = false;
	$scope.sendPasswd= false;
	$scope.invalidCred=false;
	$scope.userForgot ={};
	$scope.userLogin={};

	$scope.changeGuest = function() {
		//console.log("click on continue as guest");
		$scope.guestUser = true;
	};
	$scope.changeGuestCheckout = function() {
		if ($scope.guestUserForm.$valid ) {
			$scope.guestCheckoutLoader = true;
      var emailId = $scope.guest.guestUserEmail;
			craftsvillaService.continueAsGuest(emailId)
			.success(function (response) {
        $scope.guestCheckoutLoader = false;
        if(response.s==1 )
				{
					//logindata = responjse.d
		  window.userEmail = response.d.email;
          $localStorage.loginData = response.d;
          if(typeof _satellite != "undefined") {
				_satellite.track("successful-login");
			}
          $state.go('shipping');

        }
				else{
					// alert(response.m);
          delete $localStorage.loginData;
				}
			})
			.error(function (err) {
				$scope.guestCheckoutLoader = false;
				//console.log('error');
				throw new Error(err);
			})
		}
	};
	$scope.signupFB = function() {
		//console.log("sign up FB");
	};
	$scope.signupGgle = function() {
		//console.log("sign up Google");
	};
	$scope.loginHere = function() {
		$scope.guestUser = false;
	};
	$scope.forgotPwd = function() {
		$scope.forgotPasswd = true;
	};

	$scope.forgtPwdClose = function() {
		$scope.forgotPasswd = false;
	};

	$scope.loginCred = function() {
		if ($scope.userLoginForm.$valid) {
			$scope.loginLoader = true;
			var emailId = $scope.userLogin.email;
			window.userEmail = $scope.userLogin.email;
			var password = $scope.userLogin.password;
			craftsvillaService.getLogin(emailId, password)
			.success(function (response) {
				$scope.loginLoader = false;
				if(response.s==0 )
				{
					delete $localStorage.loginData;
					$scope.invalidCred=true;

				}
				else{
					//loggedin  response.d
					window.userEmail = response.d[0].customerData.email;
					$localStorage.loginData = response.d;
					if(window.sticktocart==true)
						{
							$state.go('cart');
						}
						else {
							$state.go('shipping');
						}

				}
			})
			.error(function (err) {
				$scope.loginLoader = false;
				//console.log('error');
				throw new Error(err);
			})
		}
	};
	$scope.sendPassword = function() {


		if ($scope.sendPasswordForm.$valid ) {
			var emailId = $scope.userForgot.forgotEmail;
			craftsvillaService.forgotPassword(emailId)
			.success(function (response) {
				if (response.s==1) {
					$scope.forgotPasswd = false;
					$scope.sendPasswd=true;
				}
				else{
					// alert(response.m);
					alert(ErrorMessages.login.forgotPassword);
				}

			})
			.error(function (err) {
				//console.log('error');
				throw new Error(err);
			})
		}
	};
	$scope.sendPwdClose = function() {
			$scope.sendPasswd = false;
	};



	/*$scope.sendPassword = function() {
		//console.log("send paswword");
		//console.log($scope.userForgot.forgotEmail);

		if ($scope.sendPasswordForm.$valid && $scope.userForgot.forgotEmail) {
			//console.log($scope.userForgot);
			var emailId = $scope.userForgot.forgotEmail;
			craftsvillaService.forgotPassword(emailId)
			.success(function (response) {
				//console.log('send password');
				//console.log(response);
				//console.log("click on Send Password");
				$scope.sendPasswd = true;
			})
			.error(function (err) {
				//console.log('error');
				throw new Error(err);
			})
		}
	};*/

	$scope.authenticate = function(provider) {
		if(provider == 'google') {
			$scope.gLoader = true;
			$scope.fbLoader = false;
		}
		else {
			$scope.gLoader = false;
			$scope.fbLoader = true;
		}
		$auth.authenticate(provider)
			.then(function(data) {

				var json = {};
				json.sourceType = provider;
				json.accessToken = provider === 'facebook' ? data.access_token : undefined;
				json.clientCode = provider === 'google' ? data.config.data.code : undefined;
				json.clientId = provider === 'google' ? data.config.data.clientId : undefined;
				json.redirectUri = provider === 'google' ? data.config.data.redirectUri : undefined;

				 //console.log(provider);
				// return;

				craftsvillaService.socialAuth(json)
				.success(function (_data) {
					$scope.gLoader = false;
					$scope.fbLoader = false;
					if(_data.s === 1) {
						//login data
						$localStorage.loginData = _data.d[0];
						window.userEmail = _data.d[0].customerEmail;
						if(typeof _satellite != "undefined") {
							_satellite.track("successful-login");
						}
						$state.go('shipping');

					}
					else {
						$scope.gLoader = false;
						$scope.fbLoader = false;
						delete $localStorage.loginData;
						// alert(response.m);
						alert(ErrorMessages.login.socialAuth);
					}
				})
				.error(function (_err) {
					//console.log(_err);
				})
			})
			.catch(function(error) {
				//console.log(error);
			});
	};
	$scope.loginTracker = function() {
		craftsvillaService.loadQuote()
		.success(function(response) {
			$scope.cartDetailsVal = response.d;
			//$scope.$emit('cartDetailsLoaded');
			var emailId = $scope.userLogin.email;
			if(typeof _satellite != "undefined") {
				 digitalData.page={
		          pageInfo:{
		            pageName:"checkout:login",
		          },
		          category:{
		            pageType:"checkout",
		            primaryCategory: "login",
		          },
		          device:{
		            deviceType: isMobile
		          },
		          currencycode:{
		            currencyCode : 'INR',
		          }
		        }
		        _satellite.track("page-load");
		        _satellite.track("login");
		    }
		    if(typeof dataLayer != "undefined") {
		    	dataLayer = [{
			   'pageLink':window.czURL,
		       'title': "Craftsvilla - Login",
		       'userEmailAddress':window.czuser ? window.czuser.email : '',
		       'type':'email',
		       //'city':'<?php echo $city;?>',
		       'loggedIn':$scope.isLoggedIn,
		       'cartValue':$scope.cartDetailsVal.total_qty,
		       'cartItemsCount':$scope.cartDetailsVal.total_items
			   }];
			    dataLayer.push({
		            'event':'UserSignedUpEvent',
		            'eventName':'UserSignedUp',
		            'type':'email',
		            'cartValue': $scope.cartDetailsVal.total_items
		        });
			}
		    if(typeof clevertap != "undefined") {
		        clevertap.profile.push({
		            "Site": {
		                "Name":'',
		                "Email": emailId,
		                //"Phone": "+91" +
		            }
		        });
			}
		});
	}
    $scope.initLogin = function() {

			$scope.scrollToTop();
      		$scope.loginTracker();
      		//alert("Login Initialised");

    };

		$scope.IE = (function () {
	    "use strict";

	    var ret, isTheBrowser,
	        actualVersion,
	        jscriptMap, jscriptVersion;

	    isTheBrowser = false;
	    jscriptMap = {
	        "5.5": "5.5",
	        "5.6": "6",
	        "5.7": "7",
	        "5.8": "8",
	        "9": "9",
	        "10": "10",
					"11": "11"
	    };
	    jscriptVersion = new Function("/*@cc_on return @_jscript_version; @*/")();

	    if (jscriptVersion !== undefined) {
	        isTheBrowser = true;
	        actualVersion = jscriptMap[jscriptVersion];
	    }

	    ret = {
	        isTheBrowser: isTheBrowser,
	        actualVersion: actualVersion
	    };

	    return ret;
	}());
	$scope.initLogin();

	}]);
});
