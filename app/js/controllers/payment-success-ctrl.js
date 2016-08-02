define(['./index'], function (controllers) {
     controllers.controller('paymentSuccessCtrl', ['$scope', '$state' ,'craftsvillaService', '$cookies', '$window', function ($scope, $state, craftsvillaService, $cookies,$window) {

      $scope.norecommendation = false;
      $scope.waitingOrderDatails=true;
       var cartValues =[];

    $scope.onSuccessDetails = function() {
      craftsvillaService.getOrderDetails()
      .success(function (response) {

          if($scope.isAndroid) {
              //Android.showLog(JSON.stringify(response) + "--------" + isArray + "-----" + window.location.href);
              console.log("FROM WEBVIEW : Logger step 1");
              Android.trackStateOrderConfirmationScreen(response.d.Order_number);
              console.log("FROM WEBVIEW : Logger step 2");
          }

          if(response.s == 0) {
              $state.go('cart');
              return;
          }

      $scope.waitingOrderDatails=false;
				//console.log(response.d.product_list);
				$scope.orderDetails=response.d.product_list;
				$scope.order=response.d;
				$scope.orderNo=response.d.Order_number;
				$scope.shippingDetails=$scope.order.shippingAddress;
        $scope.subTotal=$scope.order.sub_total;
        $scope.grandTotal=$scope.order.grand_total;
        $scope.couponCode=$scope.order.coupon_code;
 				$scope.shippingAmount=$scope.order.shipping_amount;
				$scope.totalPayable=$scope.subTotal-$scope.couponCode+$scope.shippingAmount;
        $scope.orderDetailsTracker($scope.orderDetails,$scope.order.shippingAddress.email);
        $scope.sendAffiliateData();
		})
		.error(function (err) {
 			throw new Error(err);
		})
    	};

    $scope.getSubTotal = function(){
     	$scope.subTotal = 0;
     	for(var i = 0; i <$scope.orderDetails.length; i++){
    		 var product = $scope.orderDetails[i];
        	$scope.subTotal += parseInt(product.product_price);
    }
     //console.log($scope.subTotal);
    return $scope.subTotal;

}


      $scope.getRecommendation = function() {
        craftsvillaService.getRecommendation()
            .success(function (response) {
              if (response.s==1)
                $scope.recommendProducts = response.d;
              else
                $scope.norecommendation = true
            })
            .error(function (error) {
                //console.log(error);
            });
      };
      $scope.orderDetailsTracker = function(orderDetails,email) {
          $scope.orderDetailsVal = orderDetails;
      //     $scope.$emit('orderDetailsLoaded');
      //   });
      // $scope.$on('orderDetailsLoaded', function () {
        var productIds = $scope.orderDetailsVal.map(function(_){return Number(_.product_id)});
        var strProduct = productIds.toString();
        var transProduct = "[" + strProduct + "]";

        var quantities = $scope.orderDetailsVal.map(function(_){return _.product_qty});
            var productPrices = $scope.orderDetailsVal.map(function(_){return _.product_price});
            var productTotalQty = $scope.orderDetailsVal.total_qty;
            var productSubTotal = $scope.subTotal
            var productGrandTotal=$scope.grandTotal;
            var count=productIds.length;

            if(typeof _satellite != "undefined") {
                digitalData.page={
                    pageInfo:{
                      pageName:"order complete",
                    },
                    category:{
                      pageType:"order complete",
                      primaryCategory: "order complete",
                    },
                    device:{
                      deviceType:isMobile
                    },
                    currencycode:{
                      currencyCode : 'INR',
                    },
                  }
              var tempItem= [];
              var orderId = $scope.orderNo;
              for(var i = 0; i < count; i++){
              tempItem[i]=  {
                    quantity: quantities[i],
                    price: {
                      basePrice: quantities[i] * productPrices[i]
                    },
                    productInfo:{
                      productID: productIds[i] //SKU
                    }
                    }

                  }
                  //alert(JSON.stringify(tempItem));
                 digitalData.transaction = {
                    purchaseID: orderId,
                    paymentMethod: window.paymentMethods,
                    totalOrderValue : productGrandTotal,
                    orderEmail : window.userEmail,
                    mobileNo : window.userMobileNo,
                    item:tempItem,
                }
                digitalData.totalOrderValue = productGrandTotal;
                _satellite.track("page-load");
                _satellite.track("purchase");
            }

            if(typeof MSDtrack != "undefined") {
                MSDtrack({
                  'event':'buy',
                  'sourceProdID':productIds,
                  //'sourceCatgID':'<?php echo $msdSourceCatgID;?>',
                  'prodPrice': productPrices,
                  'prodQty': quantities
                });
            }
            if(typeof dataLayer != "undefined") {
                var cartValues =[];
    			var cartVal = {};
    			var productIdsInCart = [];
    			var productNames = [];
    			var productQuantity= [];
    			var productPrice =[];
    			var productImage =[];
    			var productUrl = [];
    			angular.forEach($scope.orderDetailsVal, function(product) {
    				productIdsInCart.push(product.product_id);
    				productNames = product.product_name;
    				productUrl = product.url;
    				productImage = product.product_image;
    				productPrice = product.product_price ;
    				productQuantity = product.product_qty;
    				 var cartVal ={'prodName' : productNames,
    						  'prodURL'  : productUrl,
    			 			  'imageURL' : productImage,
        					  'prodPrice': productPrice,
    			 			  'prodQty'  : productQuantity
    			 			};

    			 	cartValues.push(cartVal);
    			});

                dataLayer.push({
                   'pageLink':window.czURL,
                   'title': "Craftsvilla - Success",
                   'userEmailAddress':email,
                   'type':'email',
                   //'city':'<?php echo $city;?>',
                   'loggedIn':$scope.isLoggedIn,
                   'cartValue':quantities.toString(),
                   'cartItemsCount':count,
                   'products': JSON.stringify(cartValues),
                  //'event':'ChargedEvent',
                  //'eventName':'Charged',
                  'chargedId': $scope.orderNo,
                  'chargedAmount': productSubTotal,
                  'totalCartAmount': productGrandTotal,
                  'cartProductIDs':transProduct,
                  'email':window.czuser ? window.czuser.email : '',
                  'pageType': 'new',
                  'event': 'AngPageView'
                });
            }
      }

      $scope.sendAffiliateData = function() {

        Number.prototype.padLeft = function(base,chr){
         var  len = (String(base || 10).length - String(this).length)+1;
         return len > 0? new Array(len).join(chr || '0')+this : this;
        };

        var d = new Date,
        dformat = [
          d.getFullYear(),
          (d.getMonth()+1).padLeft(),
          d.getDate().padLeft()
          ].join('-')+
          ' ' +
        [ d.getHours().padLeft(),
          d.getMinutes().padLeft(),
          d.getSeconds().padLeft()].join(':');

        var affiliateName = '';
        var utmMedium = '';
        if($cookies.get('Affiliate')) {
          affiliateName = $cookies.get('Affiliate');
        }
        if($cookies.get('utm_medium')) {
          utmMedium = $cookies.get('utm_medium');
        }
        craftsvillaService.sendAffiliateData(dformat, affiliateName, $scope.orderNo, $scope.grandTotal, utmMedium)
        .success(function(response) {
          //console.log(response);
        })
        .error(function(err) {
          throw new Error(err);
        });
      }

      $scope.showHomeScreen = function () {
            if($scope.isAndroid) {
                Android.showHomeScreen();
            }
      }

      $scope.initPaymentSuccess = function() {
        //   $scope.onSuccessDetails();
          $scope.getRecommendation();
          $scope.scrollToTop();

          if($scope.isAndroid) {
              Android.paymentTrackState(1);
          }
	};
	$scope.initPaymentSuccess();

    }]);
});
