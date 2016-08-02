define(['./index','jquery','typeahead','bloodhound'], function (controllers,$,typeahead,loodhound) {
 	controllers.controller('checkoutCartCtrl', ['$scope', '$localStorage', 'craftsvillaService', '$state', '$window', '$sce', 'ErrorMessages', function ($scope, $localStorage, craftsvillaService, $state, $window, $sce, ErrorMessages) {
		$scope.successCoupon = false;
		$scope.showFormNote = false;
		$scope.coupon = {};
		$scope.isLoggedIn = false;
  		$scope.couponMessage = null;
		$scope.proceedToCheckoutLoader=false;
		$scope.successCouponDetails=false;
		$scope.couponCodeHeader=false;

		$scope.searchEndPoint = $sce.trustAsResourceUrl($scope.HOST + '/searchresults');


		$scope.options = [
			{'id': 1, 'label': '1'},
			{'id': 2, 'label': '2'},
			{'id': 3, 'label': '3'},
			{'id': 4, 'label': '4'},
			{'id': 5, 'label': '5'},
			{'id': 6, 'label': '6'},
			{'id': 7, 'label': '7'},
			{'id': 8, 'label': '8'},
			{'id': 9, 'label': '9'},
		];

		$scope.outOfStockProducts = [];
		$scope.inStockCod = [];
		$scope.inStockNotCod = [];
		$scope.itemRemoved = 0;
		$scope.latestRemovedItem = null;
	$scope.couponWait=false;
	$scope.waitingCartItem=false;

		$scope.getCartDetails = function() {
	  $scope.waitingCartDatails=true;
			craftsvillaService.loadQuote()
			.success(function(response) {
				// TODO: fix it later
				if(response.s == 0) {
					$scope.items = 0;
					// alert(response.m);
					return;
				}
				if(response.d.product_list.length==0){
					$scope.items = 0;
					return;
				}
				$scope.getCartDetailsVal = response.d;

				$scope.currencyCode=$scope.getCartDetailsVal.currency_code;
				//alert('test'+$scope.currencyCode);

				$scope.cartTracking();

		$scope.waitingCartDatails=false;
	  //  $rootscope.sc = response.d.product_list;
		var _outOfStockProducts = [];
				var _inStockCod = [];
				var _inStockNotCod = [];

				angular.forEach(response.d.product_list, function(product) {
					if(!product.IsInStock) {
						_outOfStockProducts.push(product);
					} else {
						if(product.cod_available) {
							_inStockCod.push(product);
						} else {
							_inStockNotCod.push(product);
						}
					}
				});

				$scope.outOfStockProducts = _outOfStockProducts;
				$scope.inStockCod = _inStockCod;
				$scope.inStockNotCod = _inStockNotCod;

				updateTotals(response);
			})
			.error(function (err) {
				$scope.items = 0;
				$scope.waitingCartDatails=false;
				throw new Error(err);
			})
		};



		$scope.loginNow= function (){
		  window.sticktocart = true;
		  $state.go("login");
		};
		$scope.proceedToCheckout = function() {
			if ($scope.outOfStockProducts.length>0){
				alert(ErrorMessages.cart.proceedToCheckout);
				return;
			}
			$scope.proceedToCheckoutLoader=true;
			$scope.getCartDetailsVal;
			var productIds = [];
			var productName = [];
			var allProducts = $scope.getCartDetailsVal.product_list;
			angular.forEach(allProducts, function(product) {
				productIds.push(product.product_id);
				productName.push(product.product_name);
			});
			if(typeof dataLayer != "undefined") {
				dataLayer.push({
					'event':'CheckedOutEvent',
					'eventName':'CheckedOut',
					'eventAction':$scope.getCartDetailsVal.total_items,
					'itemsCount':$scope.getCartDetailsVal.total_items
				});
				dataLayer.push({
					'event':'TappedButtonEvent',
					'eventName':'TappedButton',
					'type':'ProceededToPayment',
					'productInfo':productName,
					'finalAmount':$scope.getCartDetailsVal.sub_total
				});

			}

			if(typeof MSDtrack != "undefined") {
				MSDtrack({
					'event':'placeOrder',
					'sourceProdID':productIds,
					//'sourceCatgID':'<?php echo $msdSourceCatgID;?>',
					'prodPrice':$scope.getCartDetailsVal.sub_total,
					'prodQty':$scope.getCartDetailsVal.total_qty
				});
			}

			if(typeof _satellite != "undefined") {
				_satellite.track('checkout-initiation');
			}

			craftsvillaService.loginCheck()
				.success(function (response) {
					if (response.s == 0) {
						delete $localStorage.loginData;
						$state.go('login');
						$scope.proceedToCheckoutLoader=false;
					}
					else {
						$localStorage.loginData = response.d;
						$state.go('shipping');
					}
				})
				.error(function (err) {
					throw new Error(err);
					$scope.proceedToCheckoutLoader=false;
				})
		};

		$scope.removeProductFromCart = function(product_id,data) {
	  data.waitingCartItem = true;
			var data = {
				productID: product_id
			};
			var productIds = [];
			productIds.push(data);
			craftsvillaService.removeQuoteItems(productIds)
			.success(function(response) {
					if(response.d.product_list.length==0){
					$scope.items = 0;
				}
				//console.log('hi remove');
		data.waitingCartItem = false;

		if(response.s == 0) {
			// alert(response.m);
			alert(ErrorMessages.cart.removeQuoteItems)
			return;
		}

		divideProducts(response);
				$scope.itemRemoved = 1;
				$scope.latestRemovedItem = product_id;
				updateTotals(response);
				document.body.scrollTop = 0;
			})
			.error(function(error) {
		data.waitingCartItem = false;
		//console.log(error);
			});

		};
		$scope.cartTracking = function() {
 			var cartValues =[];
			var cartVal = {};
			var productIdsInCart = [];
			var productNames = [];
			var productQuantity= [];
			var productPrice =[];
			var productImage =[];
			var productUrl = [];
			var allProductsList = $scope.getCartDetailsVal.product_list;
			angular.forEach(allProductsList, function(product) {
				productIdsInCart.push(Number(product.product_id));
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

			var couponCode = document.getElementById('couponCodeTextBox').value;
			  if(couponCode == ''){
			    var couponCode = 'NA';
			    var couponCodeApplied = 'no';
			  }else{
			    var couponCodeApplied = 'yes';
			  }
			  if(typeof _satellite != "undefined") {
				 digitalData.page={
					  pageInfo:{
						pageName:"cart",
					  },
					  category:{
						pageType:"cart",
						primaryCategory: "cart",
					  },
					  device:{
						deviceType:isMobile
					  },
					  currencycode:{
					  currencyCode : 'INR',
					},
				}
	            var productCount = productIdsInCart.length;
	            var detail= [];
	            for(var i = 0; i < productCount; i++){
	                detail[i]={
	                        productInfo:{
	                        productID: productIdsInCart[i], //PRODUCT ID
	                        }
	                    };
	            }
		        digitalData.cart = {
		             item: detail
		            }
		         _satellite.track("page-load");
				_satellite.track("cart-view");

			}
			if(typeof dataLayer != "undefined") {
        var strProduct = productIdsInCart.toString();
        var transProduct = "[" + strProduct + "]";
        dataLayer.push({
			    'numberOfProductsInCart':$scope.getCartDetailsVal.total_items,
			    'countOfItemsInCart':$scope.getCartDetailsVal.total_qty,
			    'totalAmountOfProducts':$scope.getCartDetailsVal.grand_total,
			   // 'totalTax':'<?php echo Mage::helper("checkout")->getQuote()->getShippingAddress()->getData("tax_amount"); ?>',
			    'totalCartAmount':$scope.getCartDetailsVal.grand_total,
			    'couponCode':couponCode,
			    'cartProductIDs':transProduct,
			    'couponCodeApplied':couponCodeApplied,
			    'cartItems':$scope.getCartDetailsVal.total_items,
          'pageLink': window.czURL,
 		       'title': 'Craftsvilla - Shopping Cart',
		       'userEmailAddress':window.czuser ? window.czuser.email : '',
		       'type':'email',
		       //'city':'<?php echo $city;?>',
		       'loggedIn':$scope.isLoggedIn,
		       'cartValue':$scope.getCartDetailsVal.total_items,
		       'cartItemsCount':JSON.stringify(cartValues),
          'event': 'AngPageView'
        });
			}

		}
		$scope.removeAllNonCodItems = function() {
			var productIds = [];
			var allProducts = $scope.inStockNotCod;
			angular.forEach(allProducts, function(product) {
				var data = {
					productID: product.product_id
				};
				productIds.push(data);
			});
			craftsvillaService.removeQuoteItems(productIds)
			.success(function(response) {
				if(response.s == 0) {
					// alert(response.m);
					alert(ErrorMessages.cart.removeQuoteItems)
					return;
				}
				$scope.inStockNotCod = [];
				updateTotals(response);
			})
			.error(function(error) {
				//console.log(error);
			});
		};


		$scope.removeOutOfStockProducts = function() {
			var allProducts = $scope.outOfStockProducts;
			var productIds = [];
			angular.forEach(allProducts, function(product) {
				var data = {
					productID: product.product_id
				};
				productIds.push(data);
			});
			craftsvillaService.removeQuoteItems(productIds)
			.success(function(response) {
				if(response.s == 0) {
					// alert(response.m);
					alert(ErrorMessages.cart.removeQuoteItems)
					return;
				}
				$scope.outOfStockProducts = [];
				updateTotals(response);
			})
			.error(function(error) {
				//console.log(error);
			});

		}

		$scope.addNoteToSeller = function(index, product_id, comment,data) {
	  data.showFormNote =false;
	  data.waitingCartItem = true;
			craftsvillaService.addNoteToSeller(product_id, comment)
			.success(function(response) {
		data.waitingCartItem = false;
		if(response.s == 0) {
			// alert(response.m);
			alert(ErrorMessages.cart.addNoteToSeller)
			return;
		}
		$scope.getCartDetails();
			})
			.error(function(error) {
		data.waitingCartItem = false;
		//console.log(error);
			});
		};

		$scope.updateNoteToSeller = function(data, note) {
			data.showFormNote = true;
			data.sellernote = note;
		};

		$scope.removeNoteToSeller = function(data) {
			if(!data) return;

			craftsvillaService.removeNoteToSeller(data.product_id)
			.success(function(response) {
				if(response.s == 0) {
					// alert(response.m);
					alert(ErrorMessages.cart.removeNoteToSeller)
					return;
				}
				data.seller_note = null;
				data.showFormNote = false;
			})
			.error(function(error) {
				//console.log(error);
			});
		};

		$scope.showNoteToSeller = function(data) {
			data.showFormNote = true;
		};

		$scope.hideNoteToSeller = function(data) {
			data.showFormNote = false;
		};

		$scope.applyCoupon = function() {
	  $scope.couponWait=true;
			craftsvillaService.applyCoupon($scope.coupon.couponcode)
			.success(function(response) {
		$scope.couponWait = false;
				if(response.s == 1){
					$scope.successCoupon = true;
					$scope.couponCode = response.d.coupon_code;
					$scope.couponMessage = response.m;
					$scope.subTotal = response.d.sub_total;
					$scope.totalDiscount = response.d.totol_discount;
					$scope.shippingAmount = response.d.shipping_amount;
					$scope.grandTotal = response.d.grand_total;
					$scope.discount = ($scope.totalDiscount / $scope.subTotal) * 100;
				} else {
					$scope.couponMessage = response.m;
				}
			})
			.error(function (err) {
				throw new Error(err);
			});
		};

		$scope.removeCoupon = function() {
			craftsvillaService.removeCoupon($scope.coupon.couponcode)
			.success(function (response) {
				$scope.successCoupon = false;
				$scope.successCouponDetails=false;
				$scope.couponCodeHeader=false;
				$scope.couponMessage = response.m;
				$scope.subTotal = response.d.sub_total;
				$scope.totalDiscount = response.d.totol_discount;
				$scope.shippingAmount = response.d.shipping_amount;
				$scope.grandTotal = response.d.grand_total;
			})
			.error(function (err) {
				throw new Error(err);
			})

		};

		$scope.updateQuantity = function(quantity, product_id,data) {
	  data.waitingCartItem = true;

	  craftsvillaService.updateQty(product_id, quantity.id)
			.success(function(response) {
		data.waitingCartItem = true;
		if(response.s == 0) {
			// alert(response.m);
			alert(ErrorMessages.cart.updateQty)
		}
		else {
				document.body.scrollTop = 0;
		}
		$scope.getCartDetails();
			})
			.error(function(error) {
		data.waitingCartItem = true;

		//console.log(error);
			});
		};

		$scope.addToCart = function() {
			craftsvillaService.addToQuote($scope.latestRemovedItem, 1)
			.success(function (response) {
				if(response.s == 0) {
					// alert(response.m);
					alert(ErrorMessages.cart.addToQuote)
					return;
				}
				divideProducts(response);
				updateTotals(response);
				$scope.latestRemovedItem = null;
				$scope.itemRemoved = 0;
			})
			.error(function(error) {
				//console.log(error);
			});
		}


		$scope.checkLogin = function() {
			craftsvillaService.loginCheck()
			.success(function(response) {
				if(response.s == 1) {
					$localStorage.loginData = response.d;
					window.czuser= response.d;
					$scope.isLoggedIn = true;
				} else {
					delete $localStorage.loginData;
					$scope.isLoggedIn = false;
				}
			})
			.error(function (error) {
				throw new Error(err);
			});
		}

		$scope.initializeQuantity = function(data) {
			data.quantity = $scope.options[data.product_qty-1];
		}

		function divideProducts(response) {
			$scope.inStockCod = [];
			$scope.inStockNotCod = [];
			$scope.outOfStockProducts = [];
			angular.forEach(response.d.product_list, function(product) {
				if(!product.IsInStock) {
					$scope.outOfStockProducts.push(product);
				} else if(product.cod_available) {
					$scope.inStockCod.push(product);
				} else {
					$scope.inStockNotCod.push(product);
				}
			});
		}

		function updateTotals(response) {
			$scope.items = response.d.total_items;
			$scope.grandTotal = response.d.grand_total;
			$scope.subTotal = response.d.sub_total;
			$scope.totalDiscount = response.d.totol_discount;
			$scope.shippingAmount = response.d.shipping_amount;
			if(response.d.coupon_code && response.d.coupon_code.length) {
				$scope.successCoupon = true;
				$scope.couponCode = response.d.coupon_code;
				$scope.discount = ($scope.totalDiscount / $scope.subTotal) * 100;
			}
		}

		$scope.continueShopping = function() {
			window.location.href = "http://www.craftsvilla.com/";
		}

    $scope.addTypeAhead = function() {
      var suggestion_engine = new Bloodhound({
        datumTokenizer: Bloodhound.tokenizers.obj.whitespace('text'),
        queryTokenizer: Bloodhound.tokenizers.whitespace,
        limit: 10,
        remote: {
          url: $scope.HOST+'/v1/getAutosuggestion?term=%QUERY',
          filter: function (response) {
            var categories = [];
            var products = [];
            response.data.map(function(item) {
              var json_data = {
                "type": item.type,
                "text": item.content.text,
                "url_path": item.content.url_path,
                "vendor_name": item.content.vendor_name,
                "discounted_price": item.content.discounted_price,
                "entity_id": item.content.entity_id,
                "image": item.content.images
              };
              if(item.type == 'product') {
                products.push(json_data);
              } else {
                categories.push(json_data);
              }
            });
            var parsed_response = categories.concat(products);
            return parsed_response;
          },
          wildcard: '%QUERY'
        }
      });
      suggestion_engine.initialize();


      $('.typeahead').typeahead({
        minLength: 1,
        highlight: true,
        hint: true,
      },{
        source: suggestion_engine.ttAdapter(),
        displayKey: 'text',
        templates: {
          empty: [
            '<div class="custom_results_text custom_results">',
            '<div class="result_text">No Items Found</div>',
            '</div>'
          ].join('\n'),
          suggestion: function(data){
            if(data.type=='product') {
              var text = [
                '<div class="custom_results_image custom_results">',
                '<div class="result_image hidden-xs hidden-sm" style="background-image:url(" + $scope.HOST + "/thumb/166x166/' + data.image + ')"></div>',
                '<div class="result_text">' + data.text  + '</div>'
              ].join('\n');
              if(data.vendor_name.trim().length) {
                text = text.concat(['<div class="result_text hidden-xs hidden-sm">by ' + data.vendor_name  + '</div>']);
              }
              var other_text = [
                '<div class="result_text hidden-xs hidden-sm"><span class="discount_price">Rs. ' + parseInt(data.discounted_price)  + '</span></div>',
                '<div class="result_type visible-xs visible-sm" id="product_type">  Product </div>',
                '</div>'
              ].join('\n');
              return text.concat(other_text);
            } else {
              return ( [
                    '<div class="custom_results_text custom_results">',
                    '<div class="result_text">' + data.text + '</div>',
                    '<div class="result_type"> ' + data.type + '</div>',
                    '</div>'
                  ].join('\n')
              );
            }
          },
        },
      }).bind('typeahead:selected', function(obj, datum) {
        dataLayer.push({
          "event":"SearchPerformedEvent",
          "eventName":"SearchPerformed",
          "source":"homeScreen",
          "suggestionUsed":"yes",
          "searchQuery": datum.text
        });
        if(datum.type=="product") {
          window.location = $scope.HOST+'/catalog/product/view/id/' + datum.entity_id + '/s/'+ datum.url_path + '/';
        } else {
          window.location = $scope.HOST + '/'+ datum.url_path;
        }
      });
      $('.mobile-top .icon-search-v2').click(function(e) {
        $('.without-searchbar').hide();
        $('.with-searchbar').show();
      });
      $('.with-searchbar .icon-back-arrow').click(function(e) {
        $('.with-searchbar').hide();
        $('.without-searchbar').show();
      });


    }
    $scope.showCouponCont=function(){

    	$scope.successCouponDetails=true;
    	$scope.couponCodeHeader=true;

    }

    $scope.megaMenuFunction=function(){
	    	    // script adding for Mega Menu
		    if($(window).width() < 1024 ){
	    	     // First Click
		        $(document).on("click", "a[first-click]", function(){
		            $("a[first-click]").next().slideUp(400);
		            $(this).next().stop(true, false).slideToggle(400);

		            if( $(this).hasClass("active") ){
		                //console.log("active if");
		                //$("a[click-menu]").removeClass("active");
		                $(this).removeClass("active");
		            } else{
		                //console.log("active Else");
		                $("a[first-click]").removeClass("active");
		                $(this).addClass("active");
		            };
		        });

	        $("[first-click]").slice(0,1).addClass("active").next().show();
	        $(document).on("click", "a[click-menu]", function(){
	            $("a[click-menu]").next().slideUp(200);
	            //$("a[click-menu]").removeClass("active");
	            //$(this).addClass("active");
	            $(this).next().stop(true, false).slideToggle(200);

	            if( $(this).hasClass("active") ){
	                //console.log("active if");
	                //$("a[click-menu]").removeClass("active");
	                $(this).removeClass("active");
	            } else{
	                //console.log("active Else");
	                $("a[click-menu]").removeClass("active");
	                $(this).addClass("active");
	            };
	        });
	        /*========*/
	        $(".mobile-navbar, span[data-shop-by-close], div[mob-menu-overlay]").on("click", function(event){
	            event.stopPropagation();
	            $("body").toggleClass("animate-menu");
	            $("div[mob-menu-overlay]").fadeToggle( "slow", "linear" );
	            //$("#custom-header-dropdown").toggleClass("sumanta");
	        });
	    } else {
	        $("ul[data-mega-menu] > li").hover (function(){
	            $(this).toggleClass("active");
	        });
	        // Window Scroll
	        var _animated = false;
	        $(window).scroll(function(){
	            var scroll_val = $(window).scrollTop();
	            // console.log($(window).scrollTop());
	            if(scroll_val > 90 && !_animated){
	                $(".craftsvilla-international").animate({top: '-100px'});
	                $(".navbar-fixed-top").animate({top: '0px'}, 100);
	                $(".menu-wrapper").animate({top: "57px"}, 100);
	                _animated = true ;
	            }
	            if(scroll_val < 90 && _animated) {
	                $(".craftsvilla-international").animate({top: '0px'});
	                $(".navbar-fixed-top").animate({top: '25px'}, 100);
	                $(".menu-wrapper").animate({top: "82px"}, 100);
	                _animated = false;
	            };
	        });
	    };


	        // Mega menu ends
    }

    $scope.initCheckoutCart = function() {
      $scope.addTypeAhead();
      // $scope.getCartDetails();
	      $scope.checkLogin();
		  $scope.scrollToTop();
		  $scope.megaMenuFunction();

    }
    $scope.initCheckoutCart();

	}]);
});
