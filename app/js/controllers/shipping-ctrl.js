define(['./index'], function(controllers) {
  controllers.controller('shippingCtrl', ['$scope', '$state', 'craftsvillaService', 'ErrorMessages',  function($scope, $state, craftsvillaService, ErrorMessages) {
    //Variables
    $scope.addNew = {};
    $scope.billingID = null;
    $scope.shippingID = null;
    $scope.popupEditAddress = true;
    $scope.displayAddress = true;
    $scope.displayAddresscheckbox = false;
    $scope.addBilingaddreshideshow = true;
    $scope.chkStatusBilling = true;
    $scope.mform = false;
    $scope.selectedBillingID = null;
    $scope.selectedShippingID = null;
    $scope.shipping = {};
    $scope.addNewBilling = {};
    $scope.noshippingSelected = false;
    $scope.addressExists = false;
    $scope.citystateWait = false;
    $scope.tempBilling = null;
    $scope.tempShipping = null;
    $scope.everChanged = false;

    $scope.forms = {};

    // All Functions

    /*----Fetech Country---*/



    $scope.fetchCountries = function() {
      $scope.currentCountries;

      craftsvillaService.getCountry()
          .success(function(response) {
            if(response.s == 0) {
              alert(ErrorMessages.shipping.getCountry);
              return;
            }
            $scope.countries = response.d;
            $scope.addnewcountry_shipping = angular.copy($scope.countries[0]);
            $scope.addnewcountry_billing = angular.copy($scope.countries[0]);
          })

    }

    //Icon Edit popup view
    $scope.shippingEdit = function(address) {
      //console.log(address);
      $scope.popupEditAddress = false;
      $scope.editAddr = angular.copy(address);
      $scope.editAddr.postcode = isNaN(parseInt($scope.editAddr.postcode)) ? $scope.editAddr.postcode : +$scope.editAddr.postcode;
      $scope.editAddr.telephone = +$scope.editAddr.telephone;

      $scope.countries.map(function (country) {
        country.country_name = country.country_name || '';
        if(country.country_name.toLowerCase() === $scope.editAddr.country.toLowerCase()) {
          $scope.addnewcountry_popup = country;
        }
      })

    }
    //Edit popup form close
    $scope.formclose = function() {
      //console.log('working');
      $scope.popupEditAddress = true;
    };

    $scope.checkSameOrNot = function(addId, chkStatus) {
      //console.log(addId, chkStatus)
      $scope.shippingID = addId;

      if ($scope.chkStatus == true) {
        $scope.billingID = addId;
      }
    }

    //Checkbox view address hide address
    $scope.checkStatus = function(value) {
      if (value) {
        $scope.everChanged = !$scope.everChanged;
        $scope.displayAddress = true;
        $scope.displayAddresscheckbox = false;
        $scope.selectedShippingID = $scope.shippingID;
        $scope.billingID = $scope.selectedShippingID;
        //console.log("billing:" + $scope.billingID)
        $scope.tempBilling = $scope.billingID;
        $scope.tempShipping = $scope.shippingID;
        if ($scope.noshippingSelected)
          $scope.noshippingSelected = !$scope.noshippingSelected;
      } else {
        $scope.everChanged = !$scope.everChanged;
        $scope.selectedShippingID = $scope.shippingID;
        $scope.billingID = null;
        $scope.tempBilling = null;
        $scope.tempShipping = $scope.shippingID;
        $scope.displayAddress = false;
        $scope.displayAddresscheckbox = true;
      }
    };


    $scope.checkStatusBilling = function() {
      if ($scope.chkStatusBilling) {
        //alert('checked:show');
        $scope.addBilingaddreshideshow = true;

      } else {
        //alert('unchecked: hide');
        $scope.addBilingaddreshideshow = false;


      }
    }

    //add data
    $scope.addnewsubmit = function(chkStatusBilling) {
      if(typeof dataLayer != "undefined") {
        dataLayer.push({'event':'TappedButtonEvent','eventName':'TappedButton','type':'ConfirmedAnAddress'});
      }
      if(typeof _satellite != "undefined") {
        _satellite.track('new-checkout-step-1');
      }
      if ($scope.addnewForm.$valid) {
        if (chkStatusBilling == true) {
          $scope.shipping.isSame = 1;
          $scope.shipping.countryName = $scope.addnewcountry_shipping.country_name;
          //console.log($scope.shipping)
          $scope.shipping.pincode = $scope.shipping.postcode;
          $scope.saveAndContinueLoader = true;
          craftsvillaService.addAddress($scope.shipping, $scope.shipping)
              .success(function(response) {
                $scope.saveAndContinueLoader = false;
                if(response.s == 0) {
                  //     alert(response.m);
                  alert(ErrorMessages.shipping.addAddress)
                  return;
                }
                if (response.s == 1) {
                  $scope.addressProceed();
                }
              })

              .error(function(error) {
                //console.log('Error');
                $scope.saveAndContinueLoader = false;
              });
        }
      }
    };


    //Edit address
    $scope.changePincode = function(postcode, address) {
      if ($scope.addnewcountry_shipping.country_name == "India" && $scope.addnewcountry_billing.country_name == "India") {
        $scope.citystateWait = true;

        craftsvillaService.getAddressFromPincode(postcode)
            .success(function(response) {
              $scope.citystateWait = false;
              //console.log(response);
              if (response.s == 1) {
                address.city = response.d[0].city;
                address.state = response.d[0].state;
                address.region = response.d[0].state;


              }
            })
            .error(function(error) {
              //console.log('Error');
            });
      }
    }
    //Edit address
    $scope.changePincodeMobile = function(postcode) {
      //console.log($scope.addnewcountry.country_name)
      if ($scope.addnewcountry.country_name == "India") {
        $scope.citystateWait = true;

        craftsvillaService.getAddressFromPincode(postcode)
            .success(function(response) {
              $scope.citystateWait = false;
              //console.log(response);
              if (response.s == 1) {
                $scope.editAddr.city = response.d[0].city;
                $scope.editAddr.state = response.d[0].state;
                $scope.editAddr.region = response.d[0].state;

              }
            })
            .error(function(error) {
              //console.log('Error');
            });
      }
    }
    $scope.changePincodeBilling = function(postcode) {
      //console.log("&&&&& ----- -&&&&&")
      //console.log($scope.addnewcountry_billing.country_name)
      if ($scope.addnewcountry_billing.country_name == "India")
        craftsvillaService.getAddressFromPincode(postcode)
            .success(function(response) {
              //console.log(response);
              if (response.s == 1) {
                $scope.addNewBilling.city = response.d[0].city;
                $scope.addNewBilling.state = response.d[0].state;

              } else {}

            })

            .error(function(error) {
              //console.log('Error');
            });

    }

    //Edit address
    $scope.editsubmitForm = function() {
      //alert("saefgs")

      //console.log($scope.editAddr);


      var addId = $scope.editAddr.entity_id;
      var firstname = $scope.editAddr.firstname;
      var lastname = $scope.editAddr.lastname;
      var _address = $scope.editAddr.street;
      var postcode = $scope.editAddr.postcode;
      var city = $scope.editAddr.city;
      var country = $scope.addnewcountry_popup.country_name;
      var state = $scope.editAddr.region;
      var phonenumber = $scope.editAddr.telephone;
      craftsvillaService.updateAddress(firstname, lastname, _address, city, state, postcode, country, phonenumber, addId)
          .success(function(response) {
            //console.log(response);
            if(response.s == 0) {
              // alert(response.m);
              alert(ErrorMessages.shipping.updateAddress);
              return;
            }
            else {
              $scope.formclose();
              $scope.viewaddress();
            }
          })
          .error(function(error) {
            //console.log('Error');
          });

    };





    $scope.viewaddress = function() {
      $scope.addressTracker();
      craftsvillaService.getAddress()
          .success(function(response) {
            if (response.s == 1) {
              $scope.addressExists = true;
              $scope.addresses = response.d;
              $scope.shippingID = $scope.addresses[0].entity_id;
              $scope.billingID = $scope.addresses[0].entity_id;
            } else {
              $scope.mform = true;
              $scope.noresponse = true;
            }
          })
    }


    $scope.addnewsubmitBilling = function(address, chkStatusBilling) {

      $scope.addnewForm.$submitted = true;

      if(typeof dataLayer != "undefined") {
        dataLayer.push({'event':'TappedButtonEvent','eventName':'TappedButton','type':'ConfirmedAnAddress'});
      }
      if(typeof _satellite != "undefined") {
        _satellite.track('new-checkout-step-1');
      }

      if(!$scope.BillingADDForm.$valid)
        return;


      // var fullname = $scope.addNewBilling.fullname;
      var address = $scope.addNewBilling.address;
      var postcode = $scope.addNewBilling.postcode;
      var city = $scope.addNewBilling.city;
      var state = $scope.addNewBilling.state;
      var phonenumber = $scope.addNewBilling.phonenumber;
      $scope.shipping.countryName = $scope.addnewcountry_shipping.country_name;
      $scope.addNewBilling.countryName = $scope.addnewcountry_billing.country_name;
      $scope.saveAndContinueLoader = true;
      craftsvillaService.addAddress($scope.shipping, $scope.addNewBilling)
          .success(function(response) {
            $scope.saveAndContinueLoader = false;
            if (response.s == 1) {
              $scope.addressProceed();
            }

            if(response.s == 0) {
              // alert(response.m);
              alert(ErrorMessages.shipping.addAddress)
              return;
            }

          })

          .error(function(error) {
            //console.log('Error');
            $scope.saveAndContinueLoader = false;
          });

    }

    $scope.chkbill = true;
    $scope.checkBilling = function() {

      if ($scope.chkbill) {
        $scope.showbilling = false;
      } else {
        $scope.showbilling = true;
      }
    };

    $scope.chkStatus = true;

    $scope.setbillingID = function(addId) {
      $scope.billingID = addId;
      $scope.tempBilling = addId;
      //console.log($scope.billingID, $scope.tempBilling)
      $scope.noshippingSelected = false;
    }

    $scope.addressProceed = function() {
      $state.go('payment', {
        platform: 'web'
      });
    }

    $scope.proceed = function() {
      if(typeof dataLayer != "undefined") {
        dataLayer.push({'event':'TappedButtonEvent','eventName':'TappedButton','type':'ConfirmedAnAddress'});
      }
      if(typeof _satellite != "undefined") {
        _satellite.track('new-checkout-step-1');
      }
      var goahead = false;
      //console.log($scope.billingID, $scope.shippingID, $scope.tempBilling, $scope.tempShipping)

      if ($scope.everChanged == false) {
        //console.log("yes 1st")
        if ($scope.billingID !== null && $scope.shippingID !== null)
          goahead = true;
      } else {
        //console.log(" 2nd")
        if ($scope.billingID !== null && $scope.shippingID !== null && $scope.tempBilling !== null)
          goahead = true;
      }

      if (goahead) {
        $scope.proceedToPaymentLoader=true;
        $scope.deliverToAddress = true;
        craftsvillaService.assignAddressToQuote($scope.billingID, $scope.shippingID)
            .success(function(response) {
              $scope.deliverToAddress = false;
              if (response.s == 1) {
                $scope.proceedToPaymentLoader=false;
                $state.go('payment', {
                  platform: 'web'
                });
              }

              if(response.s == 0) {
                alert(response.m);
                return;
              }

            })
            .error(function(error) {
              $scope.proceedToPaymentLoader=false;
              //console.log(error);
              $scope.deliverToAddress = false;
            });
      } else {
        $scope.noshippingSelected = true;
      }

    }


    $scope.MaddnewAddress = function() {

      $scope.mform = !$scope.mform;
      //console.log($scope.mform);
    };
    $scope.addressTracker =function() {
      craftsvillaService.loadQuote()
          .success(function(response) {
            $scope.cartDetails = response.d;
            if($scope.cartDetails.product_list.length === 0) $state.go('cart');
            $scope.$emit('cartDetails');
          })
          .error(function (err){
            $state.go('cart');
          });
      $scope.$on('cartDetails', function () {
        var productIds =[];
        var allProducts = $scope.cartDetails.product_list;
        angular.forEach(allProducts, function(product) {
          productIds.push(Number(product.product_id));
        });
         if(typeof _satellite != "undefined") {
          console.log("view");
          digitalData.page={
            pageInfo:{
              pageName:"checkout:shipping",
            },
            category:{
              pageType:"checkout",
              primaryCategory: "shipping",
            },
            device:{
              deviceType:isMobile
            },
            currencycode:{
              currencyCode : 'INR',
            },
          }
          var count = productIds.length;
          var detail= [];
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
          var strProduct = productIds.toString();
          var transProduct = "[" + strProduct + "]";

          dataLayer.push({
            'pageLink':window.czURL,
            'title': "Craftsvilla - shipping",
            'userEmailAddress':window.czuser ? window.czuser.email : '',
            'type':'email',
            'loggedIn':$scope.isLoggedIn,
            'cartValue':$scope.cartDetails.total_qty,
            'cartItemsCount':$scope.cartDetails.total_items
          });
          dataLayer.push({
            'numberOfProductsInCart':$scope.cartDetails.total_qty,
            'countOfItemsInCart':$scope.cartDetails.total_items,
            'totalAmountOfProducts':$scope.cartDetails.grand_total,
            'totalCartAmount':$scope.cartDetails.grand_total,
            'cartProductIDs':transProduct,
            'event': 'AngPageView',
            'shippingAndHandlingCharges':$scope.cartDetails.shipping_amount
          });
        }

      });

    }

    $scope.initshipping = function() {
      $scope.viewaddress();
      $scope.fetchCountries();
      $scope.scrollToTop();

    }
    $scope.initshipping();
  }]);
});
