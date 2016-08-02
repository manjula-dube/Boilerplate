define(['./index'], function (controllers) {
    controllers.controller('paymentCtrl', ['$scope', '$state', '$stateParams', '$timeout', '$sce', '$filter', 'craftsvillaService','$cookies', 'ErrorMessages', function ($scope,$state,$stateParams,$timeout,$sce,$filter,craftsvillaService,$cookies, ErrorMessages) {
			var controllerRef = this;
			$scope.forms = {};
			$scope.credit = {};
			$scope.credit_mobile = {};
			$scope.debit = {};
			$scope.nb = {};
			$scope.imgHost = $scope.IMGHOST + '/thumb/166x166';
			$scope.showDetails = false;
			$scope.placeOrderLoader=false;
			$scope.successCoupon=false;
			// Repeat

			// Tabs
    	 	$scope.finalQuoteData = null;
    	 	$scope.shippingAdressData = null;
    	 	$scope.shippingAmountData = null;
  			$scope.changeSlide = function(obj) {
           $scope.changeName = obj.method;
				window.paymentMethods = $scope.changeName;
				// $scope.payUBankCode = obj.bank_code;
				if($scope.changeName.toLowerCase().indexOf('payu') > -1) {
					$scope.pg = 'Wallet';
				}
				else {
					$scope.pg = $scope.changeName.split(' ').map(function(_) {return _[0]}).join('').toUpperCase();
				}
			};
			// Cash On Delivery
			$scope.cashOn = function() {
				// alert("cashOn");
			};
			// Credit Card Pay

			$scope.toggleDetails = function () {
				$scope.showDetails = !$scope.showDetails;
			}

			$scope.pgTypes = {
				'NB': 'NB',
				'CC': 'CC',
				'DC': 'DC',
				'WALLET': 'Wallet'
			};

			$scope.cardTypes = {
				'Visa': {
					'CC': 'CC',
					'DC': 'VISA',
					'img': '../images/card-types/visa.svg'
				},
				'MasterCard': {
					'CC': 'CC',
					'DC': 'MAST',
					'img': '../images/card-types/mastercard.svg'
				},
				'American Express': {
					'CC': 'AMEX',
					'DC': 'AMEX',
					'img': '../images/card-types/american-express.svg'
				},
				'Diners Club': {
					'CC': 'DINR',
					'DC': 'DINR',
					'img': '../images/card-types/dinners-club.svg'
				},
				'Maestro': {
					'DC': 'MAES',
					'CC': 'MAES',
					'img': '../images/card-types/maestro.svg'
				},
				'Discover': {
					'DC': '',
					'CC': '',
					'img': '../images/card-types/discover.svg'
				}
			};

			$scope.getBankCode = function (type, pg) {
				return $scope.cardTypes[type][pg];
			};

			$scope.submitCOD = function () {
				var productId=$scope.finalQuoteData.map(function(_){return _.product_id});
		        var count = $scope.finalQuoteData.length;
		        if(typeof dataLayer != "undefined") {
					dataLayer.push({
			            'event':'PrechargedEvent',
			            'eventName':'PrechargedEventName',
			            'type':'PlacedOrder',
			            'productInfo':productId,
			            'finalAmount':$scope.shippingAmountData.grand_total,
			            'type':'Cash on Delivery'
			        });
				}
				if(typeof _satellite != "undefined") {
			        _satellite.track('new-checkout-step-2');
			        digitalData.transaction = {
			        	paymentMethod: 'Cash on Delivery',
			        }
			    }

					var json = {
						quoteId: $scope.quoteId,
						platform: $scope.platform,
						"appVersion": $scope.appVersion || "",
						"imei": $scope.imei || "",
						"customerId": $scope.customerId || ""
					}
				craftsvillaService.placeOrderCOD(json)
				.success(function (data) {
					// if($scope.isAndroid)
						//Android.showLog("REQ -> " + JSON.stringify(json) + "======== RES -> " + JSON.stringify(data));

					if(data.s == 1) {
						if($scope.isAndroid)
							Android.setOrderPrePaid($scope.isPrepaid);

            window.location = '/buy/payment-success';
					}
					else {
						// alert(data.m);
						alert(ErrorMessages.payment.placeOrder);
						$scope.placeOrderLoader=false;
						$state.go('payment', {
                 platform: $scope.platform
             });
					}
				})
				.error(function (error) {
					$scope.placeOrderLoader=true;
					$state.go('payment', {error: 1});
				});
			};

			$scope.submitCreditForm = function() {
				var productId=$scope.finalQuoteData.map(function(_){return _.product_id});
		        var count = $scope.finalQuoteData.length;
		        var detail= [];
		        if(typeof _satellite != "undefined") {
			        _satellite.track('new-checkout-step-2');
			        digitalData.transaction = {
			        	paymentMethod: 'Credit Card',
			        }
			    }
				if(typeof dataLayer != "undefined") {
					dataLayer.push({
			            'event':'PrechargedEvent',
			            'eventName':'PrechargedEventName',
			            'type':'PlacedOrder',
			            'productInfo':productId,
			            'finalAmount':$scope.shippingAmountData.grand_total,
			            'type':'Credit Card'
			        });
				}

				craftsvillaService.placeOrder({
					"pg": $scope.pg,
					"bankcode": $scope.getBankCode($scope.forms.creditForm.cardNumber.$ccType, $scope.pg),
					"ccnum": $scope.credit.cardNumber,
					"ccname": $scope.credit.cardName,
					"ccvv": $scope.credit.cardCvv || '',
					"ccexpmon": $scope.credit.cardMonth ? $scope.credit.cardMonth > 9 ? $scope.credit.cardMonth : '0' + $scope.credit.cardMonth : '',
					"ccexpyr": $scope.credit.cardYear || '',
					"gateway": 'payu',
					"quoteId": $scope.quoteId,
					"platform": $scope.platform,
					"appVersion": $scope.appVersion || "",
					"imei": $scope.imei || "",
					"customerId": $scope.customerId || ""
				})
				.success(function(data){
					// //console.log(data);
					// return;

					if(data.s == 0) {
						// alert(data.m);
						alert(ErrorMessages.payment.placeOrder);
						$scope.placeOrderLoader=false;
						return;
					}

					var form = document.createElement("form");
			    form.setAttribute("method", 'POST');
			    form.setAttribute("action", data.url);

			    for(var key in data.parameter) {
		        if(data.parameter.hasOwnProperty(key)) {
	            var hiddenField = document.createElement("input");
	            hiddenField.setAttribute("type", "hidden");
	            hiddenField.setAttribute("name", key);
	            hiddenField.setAttribute("value", data.parameter[key]);

	            form.appendChild(hiddenField);
		         }
			    }

					document.body.appendChild(form);
    			form.submit();

					if($scope.isAndroid)
						Android.setOrderPrePaid($scope.isPrepaid);

				})
				.error(function(err){
					$scope.placeOrderLoader=true;
					//console.log(err);
				});
			};

			$scope.submitDebitForm = function() {
				var productId=$scope.finalQuoteData.map(function(_){return _.product_id});
		        var count = $scope.finalQuoteData.length;
		        var detail= [];
				if(typeof dataLayer != "undefined") {
					dataLayer.push({
			            'event':'PrechargedEvent',
			            'eventName':'PrechargedEventName',
			            'type':'PlacedOrder',
			            'productInfo':productId,
			            'finalAmount':$scope.shippingAmountData.grand_total,
			            'type':'Debit Card'
			        });
				}
				if(typeof _satellite != "undefined") {
			        _satellite.track('new-checkout-step-2');
			       	digitalData.transaction = {
			        	paymentMethod: 'Debit Card',
			        }
			    }
				craftsvillaService.placeOrder({
					"pg": $scope.pg,
					"bankcode": $scope.getBankCode($scope.forms.debitForm.cardNumber.$ccType, $scope.pg),
					"ccnum": $scope.debit.cardNumber,
					"ccname": $scope.debit.cardName,
					"ccvv": $scope.debit.cardCvv || '',
					"ccexpmon":$scope.debit.cardMonth ? $scope.debit.cardMonth > 9 ? $scope.debit.cardMonth : '0' + $scope.debit.cardMonth : '',
					"ccexpyr": $scope.debit.cardYear || '',
					"gateway": 'payu',
					"quoteId": $scope.quoteId,
					"platform": $scope.platform,
					"appVersion": $scope.appVersion || "",
					"imei": $scope.imei || "",
					"customerId": $scope.customerId || ""
				})
				.success(function(data){
					if(data.s == 0) {
						// alert(data.m);
						alert(ErrorMessages.payment.placeOrder);
						$scope.placeOrderLoader=false;
						return;
					}

					var form = document.createElement("form");
			    form.setAttribute("method", 'POST');
			    form.setAttribute("action", data.url);

			    for(var key in data.parameter) {
		        if(data.parameter.hasOwnProperty(key)) {
	            var hiddenField = document.createElement("input");
	            hiddenField.setAttribute("type", "hidden");
	            hiddenField.setAttribute("name", key);
	            hiddenField.setAttribute("value", data.parameter[key]);

	            form.appendChild(hiddenField);
		         }
			    }

					document.body.appendChild(form);
    			form.submit();

					if($scope.isAndroid)
						Android.setOrderPrePaid($scope.isPrepaid);
				})
				.error(function(err){
					$scope.placeOrderLoader=true;
					//console.log(err);
				});
			};
			$scope.submitNBForm = function() {
				var productId=$scope.finalQuoteData.map(function(_){return _.product_id});
		        var count = $scope.finalQuoteData.length;
		        var detail= [];
				if(typeof dataLayer != "undefined") {
					dataLayer.push({
			            'event':'PrechargedEvent',
			            'eventName':'PrechargedEventName',
			            'type':'PlacedOrder',
			            'productInfo':productId,
			            'finalAmount':$scope.shippingAmountData.grand_total,
			            'type':'Netbanking'
			        });
				}
				if(typeof _satellite != "undefined") {
					_satellite.track('new-checkout-step-2');
			       	digitalData.transaction = {
			        	paymentMethod: 'Netbanking',
			        }
			    }

				craftsvillaService.placeOrder({
					"pg": $scope.pg,
					"bankcode":$scope.nb.netbanking,
					"ccnum": '',
					"ccname": '',
					"ccvv": '',
					"ccexpmon": '',
					"ccexpyr": '',
					"gateway": 'payu',
					"quoteId": $scope.quoteId,
					"platform": $scope.platform,
					"appVersion": $scope.appVersion || "",
					"imei": $scope.imei || "",
					"customerId": $scope.customerId || ""
				})
				.success(function(data){

					if(data.s == 0) {
						// alert(data.m);
						alert(ErrorMessages.payment.placeOrder);
						$scope.placeOrderLoader=false;
						return;
					}

					var form = document.createElement("form");
			    form.setAttribute("method", 'POST');
			    form.setAttribute("action", data.url);

			    for(var key in data.parameter) {
		        if(data.parameter.hasOwnProperty(key)) {
	            var hiddenField = document.createElement("input");
	            hiddenField.setAttribute("type", "hidden");
	            hiddenField.setAttribute("name", key);
	            hiddenField.setAttribute("value", data.parameter[key]);

	            form.appendChild(hiddenField);
		         }
			    }

					document.body.appendChild(form);
    			form.submit();

					if($scope.isAndroid)
						Android.setOrderPrePaid($scope.isPrepaid);
				})
				.error(function(err){
					$scope.placeOrderLoader=true;
					//console.log(err);
				});
			};
			$scope.submitPayUForm = function() {
				var productId=$scope.finalQuoteData.map(function(_){return _.product_id});
		        var count = $scope.finalQuoteData.length;
		        var  detail = [];
				if(typeof dataLayer != "undefined") {
					dataLayer.push({
			            'event':'PrechargedEvent',
			            'eventName':'PrechargedEventName',
			            'type':'PlacedOrder',
			            'productInfo':productId,
			            'finalAmount':$scope.shippingAmountData.grand_total,
			            'type':'Pay u'
			        });
				}
				if(typeof _satellite != "undefined") {
			        _satellite.track('new-checkout-step-2');
			        digitalData.transaction = {
			        	paymentMethod: 'payu',
			        }
			    }
				craftsvillaService.placeOrder({
					"pg": 'Wallet',
					"bankcode": 'payuw',
					"ccnum": '',
					"ccname": '',
					"ccvv": '',
					"ccexpmon": '',
					"ccexpyr": '',
					"gateway": 'payu',
					"quoteId": $scope.quoteId,
					"platform": $scope.platform,
					"appVersion": $scope.appVersion || "",
					"imei": $scope.imei || "",
					"customerId": $scope.customerId || ""
				})
				.success(function(data){
					// //console.log(data);
					// return;

					if(data.s == 0) {
						// alert(data.m);
						alert(ErrorMessages.payment.placeOrder);
						$scope.placeOrderLoader=false;
						return;
					}

					var form = document.createElement("form");
			    form.setAttribute("method", 'POST');
			    form.setAttribute("action", data.url);

			    for(var key in data.parameter) {
		        if(data.parameter.hasOwnProperty(key)) {
	            var hiddenField = document.createElement("input");
	            hiddenField.setAttribute("type", "hidden");
	            hiddenField.setAttribute("name", key);
	            hiddenField.setAttribute("value", data.parameter[key]);

	            form.appendChild(hiddenField);
		         }
			    }

					document.body.appendChild(form);
    			form.submit();

					if($scope.isAndroid)
						Android.setOrderPrePaid($scope.isPrepaid);
				})
				.error(function(err){
					$scope.placeOrderLoader=true;
					//console.log(err);
				});
			};

			$scope.submitPaypalForm = function() {
				craftsvillaService.placeOrder({
					"pg": '',
					"bankcode": '',
					"ccnum": '',
					"ccname": '',
					"ccvv": '',
					"ccexpmon": '',
					"ccexpyr": '',
					"gateway": 'paypal',
					"quoteId": $scope.quoteId,
					"platform": $scope.platform,
					"appVersion": $scope.appVersion || "",
					"imei": $scope.imei || "",
					"customerId": $scope.customerId || ""
				})
				.success(function(data){
					// //console.log(data);
					// return;

					if(data.s == 0) {
						// alert(data.m);
						alert(ErrorMessages.payment.placeOrder);
						$scope.placeOrderLoader=false;
						return;
					}

					var form = document.createElement("form");
			    form.setAttribute("method", 'POST');
			    form.setAttribute("action", data.url);

			    for(var key in data.parameter) {
		        if(data.parameter.hasOwnProperty(key)) {
	            var hiddenField = document.createElement("input");
	            hiddenField.setAttribute("type", "hidden");
	            hiddenField.setAttribute("name", key);

							if(data.parameter[key] instanceof Array) {
                hiddenField.setAttribute("value", JSON.stringify(data.parameter[key]));
              }
              else {
                  hiddenField.setAttribute("value", data.parameter[key]);
              }

	            form.appendChild(hiddenField);
		         }
			    }

					document.body.appendChild(form);
    			form.submit();

					if($scope.isAndroid)
						Android.setOrderPrePaid($scope.isPrepaid);

				})
				.error(function(err){
					$scope.placeOrderLoader=true;
					//console.log(err);
				});
			};
			// Debit Card
			$scope.debitCard = function() {
				$scope.pg = 'DC';
			};
			// Net Banking
			$scope.netBanking = function() {
				$scope.pg = 'NB';
			};
			// Pay U Money
			$scope.payUbtn = function() {
				// alert("Pay U Money");
			};
			// Pay U Money
			$scope.getPayments = function() {
				craftsvillaService.getPaymentMethods()
				.success( function(response) {
					//console.log(response);

					$scope.paymentMethods = response.d[0];
					$scope.changeName = $scope.paymentMethods[0].method;
					$scope.pg = 'CC';

					window.paymentMethods = $scope.changeName;

					console.log($scope.paymentMethods);
					$scope.finalQuoteDetails();
				})
				.error(function(err) {

				});
			};


			$scope.finalQuoteDetails = function() {
        var Authorization, XSession, customerId, quoteId, appVersion, imei, json;

        if($scope.platform !== "web" && $scope.isAndroid) {
						json = JSON.parse(Android.getQuoteDetails());

						Authorization = json.Authorization;

						customerId = json.customerId;
						$scope.customerId = customerId;

						quoteId = json.quoteId;
						$scope.quoteId = quoteId;

						appVersion = json.versionCode;
						$scope.appVersion = appVersion;

						imei = json.IMEI
						$scope.imei = imei;
        }

        $scope.waitingCartDatails = true;
        craftsvillaService.loadFinalQuote($scope.platform, Authorization,XSession,customerId,quoteId, appVersion, imei)
				.success(function(response) {
					if($scope.isAndroid) {
						//Android.showLog("REQ -> " + JSON.stringify(json) + "======== RES -> " + JSON.stringify(response));
						Android.cancelDialog();
					}
          $scope.waitingCartDatails = false;

					if(response.s == 0) {
						alert(response.m);
						$state.go('cart');
						return;
					}


					if(response.d.product_list.length === 0) $state.go('cart');
					$scope.finalQuoteData = response.d.product_list;


					$scope.currencyCodePayment=response.d.currency_code;


					$scope.shippingAdressData = response.d.shippingAddress;
					$scope.shippingAmountData = response.d;
					if($scope.shippingAmountData.totol_discount>0)
						$scope.successCoupon=true;


					window.userMobileNo = response.d.shippingAddress.telephone;
					$scope.paymentTracker();
					$scope.shippingAmountData.grand_total = +$scope.shippingAmountData.grand_total;
					$scope.discountPecent = ($scope.shippingAmountData.totol_discount / $scope.shippingAmountData.sub_total) * 100;
						if($scope.shippingAmountData.showCod === 0) {
						$timeout(function() {
							if($scope.paymentMethods) {
									$scope.changeName = $scope.paymentMethods[1].method;
							}
							else {
									$scope.changeName = 'Credit card';
							}
						})
					}
				})
				.error(function (err) {
					console.log(err);
					// if($scope.isAndroid) {
						//Android.showLog("ERROR REQ -> " + JSON.stringify(json) + "======== RES -> " + JSON.stringify(err));
					// }
					$state.go('cart');
				})
			};


			$scope.validate = function (element, form) {
				switch (element) {
					case 'cardNumber':
						return form[element].$invalid && !form[element].$pristine && form[element].$xblur;
					case 'cardName':
						return form[element].$invalid && !form[element].$pristine && form[element].$xblur;
					case 'cardExp': {
							if($scope.changeName == 'Credit card') {
								if($scope.oldCreditMaestroDetected) return false;
							}
							else if($scope.changeName == 'Debit Card') {
								if($scope.oldDebitMaestroDetected) return false;
							}
							// Both should be dirty
							var check1 = form.cardM.$dirty && form.cardY.$dirty;
							var check2 = form.cardM.$valid;
							var check3 = form.cardY.$valid;
							var check4 = true;//form.cardY.$xblur && form.cardM.$xblur;
							var check5 = new Date() > new Date(form.cardY.$modelValue, form.cardM.$modelValue);

							if(check1) {
								if(check4) {
									if(check2 && check3) {
										return check5;
									}
									else return true;
								}
								else return false
							}
							else return false;
					}
				case 'cardCVC': {
					if($scope.changeName == 'Credit card') {
						if($scope.oldCreditMaestroDetected) return false;
					}
					else if($scope.changeName == 'Debit Card') {
						if($scope.oldDebitMaestroDetected) return false;
					}
					return form[element].$invalid && !form[element].$pristine && form[element].$xblur
				}
				case 'payment':
					return form.$invalid || $scope.validate('cardExp', form);
				case 'nb':
					return $scope.nb.netbanking;
				default:
					return false;
				}
			}

			$scope.getCCTypeImage = function (ccType) {
				if(!$scope.cardTypes[ccType]) return '';
				return $scope.cardTypes[ccType].img;
			}
			$scope.paymentTracker = function() {
				if(typeof _satellite != "undefined") {
			  	digitalData.page={
		          pageInfo:{
		            pageName:"checkout:payment",
		          },
		          category:{
		            pageType:"checkout",
		            primaryCategory: "payment",
		          },
		          device:{
		            deviceType:isMobile
		          },
		          currencycode:{
		            currencyCode : 'INR',
		          },

		        }
			    var productIds = [];
				var allProducts = $scope.finalQuoteData;
				angular.forEach(allProducts, function(product) {
					productIds.push(product.product_id);

				});
				var detail=[];
		        var count = productIds.length;
		         for(var i = 0; i < count; i++){
			            detail[i]={
			                    productInfo:{
			                    productID: productIds[i], //PRODUCT ID
			                    }
			                };
			        }
			        digitalData.cart = {
			             item: detail
			            }
			        _satellite.track("page-load");


		    }
		    if(typeof dataLayer != "undefined") {
		    	dataLayer.push({
                   'pageLink':window.czURL,
                   'title': "Craftsvilla - Payment",
                   'userEmailAddress':window.czuser ? window.czuser.email : '',
                   'type':'email',
                   //'city':'<?php echo $city;?>',
                   'loggedIn':$scope.isLoggedIn,
                   'cartValue':count,
                   'cartItemsCount':count
                   });
            }
		}
			$scope.initPayment = function() {
				$scope.getPayments();
				$scope.scrollToTop();
				$scope.paymentErrorCode = $stateParams.error;

				if($scope.isAndroid && typeof paymentErrorCode === typeof undefined) {
	          Android.paymentTrackState(-1);
	      }
				else if($scope.isAndroid && typeof paymentErrorCode !== typeof undefined) {
            Android.paymentTrackState(0);

						if(typeof _satellite != "undefined") {
              digitalData.page={
                  pageInfo:{
                    pageName:"error:payment",
                  },
                  category:{
                    pageType:"error",
                    primaryCategory: "error:payment",
                  },
                  device:{
                    deviceType:isMobile
                  },
                  currencycode:{
                    currencyCode : 'INR',
                  },
                }
                _satellite.track("page-load");
		        }
        }


			};

			$scope.getPaymentError = function () {
				if($scope.shippingAmountData && $scope.shippingAmountData.showCod == 1)
					return ErrorMessages.payment.errors.cod;
				else
					return ErrorMessages.payment.errors.nonCod;
			}

			$scope.isValidDate = function(year, month) {
				return new Date(year, month) < new Date();
			}

			$scope.removeFromCart = function (product_id, product) {
				if (confirm('Are you sure you want to delete this Item?')) {
				product.waitingCartItem = true;
				craftsvillaService.removeQuoteItems([{
					productID: product_id
				}])
				.success(function(response) {
					if(response.s == 0) {
						// alert(response.m);
						alert(ErrorMessages.cart.removeQuoteItems);
						return;
					}
					$scope.finalQuoteDetails()
				})
				.error(function(error) {
	        //console.log(error);
				});
			}
		}

			$scope.placeOrder = function () {
				if(!$scope.changeName) return;
				var toSubmit = true;
				if($scope.isPaymentNotAllowed()){
					toSubmit = false;

					if($scope.changeName == 'Credit card' && $scope.oldCreditMaestroDetected) {
						toSubmit = true;
					}
					else if($scope.changeName == 'Debit Card' && $scope.oldDebitMaestroDetected) {
						toSubmit = true;
					}
				}
				else {
					$scope.placeOrderLoader=true;
				}
				$scope.isPrepaid = true;
				switch($scope.changeName.toLowerCase()) {
					case 'cash on delivery':
						if(toSubmit) {
							$scope.submitCOD();
							$scope.isPrepaid = false;
						}
						break;
					case 'credit card':
						if(toSubmit) $scope.submitCreditForm();
						else { $scope.forms.creditForm.$setSubmitted(); $scope.forms.creditForm_mobile.$setSubmitted(); }
						break;
					case 'debit card':
						if(toSubmit) $scope.submitDebitForm();
						else { $scope.forms.debitForm.$setSubmitted(); $scope.forms.debitForm_mobile.$setSubmitted(); }
						break;
					case 'net banking':
						if(toSubmit) $scope.submitNBForm();
						else { $scope.forms.NBForm.$setSubmitted(); $scope.forms.NBForm_mobile.$setSubmitted(); }
						break;
					case 'payu money':
						if(toSubmit) $scope.submitPayUForm();
						break;
					case 'paypal':
						if(toSubmit) $scope.submitPaypalForm();
						break;
				}

				if(toSubmit && $scope.isAndroid) {
					Android.trackActionPlaceOrder();
				}
			}

			$scope.isPaymentNotAllowed = function () {
				if(!$scope.changeName || !$scope.shippingAmountData) return true;
				switch($scope.changeName.toLowerCase()) {
					case 'cash on delivery':
						return !($scope.shippingAmountData && $scope.shippingAmountData.showCod == 1);
					case 'credit card':
						return $scope.validate('payment', $scope.forms.creditForm_mobile);
					case 'debit card':
						return $scope.validate('payment', $scope.forms.debitForm_mobile);
					case 'net banking':
						return !($scope.nb.netbanking);
					case 'payu money':
						return false;
					case 'paypal':
						return false;
					default:
						return true;
				}
			}

			$scope.getPlaceOrderText = function () {
				console.lgo('test');
				if(!$scope.changeName ||  !$scope.currencyCodePayment)  return 'LOADING...';
				switch($scope.changeName.toLowerCase()) {
					case 'cash on delivery':
						return 'PLACE ORDER';
					default:
						return $sce.trustAsHtml('PAY <span>'+ $scope.getCurrencySymbol($scope.currencyCodePayment) +'	</span>' + $filter('number')(($scope.shippingAmountData || {}).grand_total) + '</span> SECURELY');
					}
				}

				$scope.validateMaestro = function () {
					if($scope.changeName == 'Credit card') {
						var number = $scope.forms.creditForm.cardNumber.$modelValue || $scope.forms.creditForm_mobile.cardNumber.$modelValue;
						if(('' + number).length === 19) {
							$scope.oldCreditMaestroDetected = true;
						}
						else {
							$scope.oldCreditMaestroDetected = false;
						}
					}
					else if($scope.changeName == 'Debit Card') {
						var number = $scope.forms.debitForm.cardNumber.$modelValue || $scope.forms.debitForm_mobile.cardNumber.$modelValue;
						if(('' + number).length === 19) {
							$scope.oldDebitMaestroDetected = true;
						}
						else {
							$scope.oldDebitMaestroDetected = false;
						}
					}
				}

			$scope.initPayment();
    }]);
});
