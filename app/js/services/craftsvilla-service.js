define(['./index'], function (services) {
   // expand input and show post button on focus
  services.service('craftsvillaService', ['$http', 'ENVIRONMENT', 'ENV_DEV', 'ENV_PROD', function($http, ENVIRONMENT, ENV_DEV, ENV_PROD) {
     var HOST;
     if(ENVIRONMENT == 'development') {
          HOST = ENV_DEV.HOST;
     }
     if(ENVIRONMENT == 'production') {
          HOST = ENV_PROD.HOST;
     }
    return {
      // getCartData: getCartData,
      loginCheck : loginCheck,
      // getApplyCoupon : getApplyCoupon,
      // getRemoveCoupon: getRemoveCoupon,
      // getProducts: getProducts,
      // getProductById: getProductById,
      loadQuote: loadQuote,
      updateQty: updateQty,
      addToQuote: addToQuote,
      removeQuoteItems: removeQuoteItems,
      addNoteToSeller: addNoteToSeller,
      updateNoteToSeller: updateNoteToSeller,
      removeNoteToSeller: removeNoteToSeller,
      applyCoupon: applyCoupon,
      removeCoupon: removeCoupon,
      getAddress : getAddress,
      getCountry : getCountry,
      addAddress : addAddress,
      assignAddressToQuote : assignAddressToQuote,
      updateAddress : updateAddress,
      getLogin : getLogin,
      getRegister : getRegister,
      forgotPassword : forgotPassword,
      getLogout : getLogout,
      getPaymentMethods : getPaymentMethods,
      placeOrder: placeOrder,
      paymentRedirect: paymentRedirect,
      continueAsGuest : continueAsGuest,
      loadFinalQuote : loadFinalQuote,
      placeOrderCOD: placeOrderCOD,
      getSuccessData:getSuccessData,
      getAddressFromPincode : getAddressFromPincode,
      getOrderDetails : getOrderDetails,
      socialAuth: socialAuth,
      getRecommendation: getRecommendation,
      sendAffiliateData: sendAffiliateData
    };

    //////////////////////////////////////////


    /*function getCartData(){
     return $http.get('https://api.myjson.com/bins/u3o4');
     //https://api.myjson.com/bins/36aj8
     }

     function getApplyCoupon(c) {
     return $http.get( 'https://api.myjson.com/bins/3md8k');
     //https://api.myjson.com/bins/22n2c
     //https://api.myjson.com/bins/3md8k
     }

     function getRemoveCoupon(c) {
     return $http.get( 'https://api.myjson.com/bins/2wv10');

     }*/

    //demo apis ends here
    function loginCheck () {
      return $http.get( HOST + '/checkoutService/index/loginCheck');
    }

    function loadQuote() {
      return $http.get( HOST + '/checkoutService/index/loadQuote');
    }

    function updateQty(productId, productQty) {
      return $http.post( HOST + '/checkoutService/index/updateQty', {
        "productId": productId,
        "productQty": productQty
      });
    }

    //remove items
    function removeQuoteItems(productIds) {
      return $http.post( HOST + '/checkoutService/index/removeQuoteItems', {
        "productIds": productIds
      });
    }

    function addNoteToSeller(productId, comment) {
      return $http.post( HOST + '/checkoutService/index/addNoteToSeller', {
        "productId": productId,
        "comment": comment
      });
    }


    function updateNoteToSeller(productId, comment) {
      return $http.post( HOST + '/checkoutService/index/updateNoteToSeller', {
        "productId": productId,
        "comment": comment
      });
    }

    function removeNoteToSeller(productId) {
      return $http.post( HOST + '/checkoutService/index/removeNoteToSeller', {
        "productId": productId
      });
    }

    function applyCoupon(couponCode) {
      //console.log(couponCode);
      return $http.post( HOST + '/checkoutService/index/applyCoupon', {
        "couponCode" : couponCode
      });
    }

    function removeCoupon(couponCode) {
      //console.log(couponCode);
      return $http.post( HOST + '/checkoutService/index/removeCoupon', {
        "couponCode": couponCode
      });
    }

    // undo remove from cart
    function addToQuote(productId, qty) {
      return $http.post( HOST + '/checkoutService/index/addToQuote', {
        "productId": productId,
        "qty": qty
      });
    }

    //cart page ends

    //login page

    function getLogin(emailId, password) {
      return $http.post( HOST + '/checkoutService/index/getLogin', {
        "emailId": emailId,
        "password": password
      });
    }

    function forgotPassword(emailId) {
      return $http.post( HOST + '/checkoutService/index/forgotPassword', {
        "emailId" : emailId
      });
    }

    //login page ends


    //register page

    function getRegister(firstName, lastName, emailId, phoneNo, password) {
      return $http.post( HOST + '/checkoutService/index/getRegister', {
        "firstName" : firstName,
        "lastName" : lastName,
        "emailId" : emailId,
        "phoneNo" : phoneNo,
        "password" : password
      });
    }

    //register page ends

    //logout

    function getLogout() {
      return $http.get( HOST + '/checkoutService/index/getLogout');
    }

    //logout ends

    //continue as guest
    function continueAsGuest(emailId) {
      return $http.post( HOST + '/checkoutService/index/continueAsGuest', {
        "customerEmail" : emailId
      });
    }
    //continue as guest ends

    //final quote
    function loadFinalQuote(platform, Authorization,XSession,customerId,quoteId, appVersion, imei) {
      if(platform === 'web') {
        return $http.get( HOST + '/checkoutService/index/loadFinalQuote');
      }
      else {
        if (XSession)
          return $http({
            url: HOST + '/checkoutService/index/loadAppQuote',
            method: 'POST',
            data: {
              "quoteId":quoteId,
              "XSession":XSession
            }
          });
        else {
          var data = {
            "quoteId":quoteId,
            "customerId":customerId,
            "Authorization":Authorization,
            "appVersion": appVersion,
            "imei": imei
          };
          return $http({
            url: HOST + '/checkoutService/index/loadAppQuote',
            method: 'POST',
            data: data
          });
        }
      }
    }
    //final quote ends




    //shipping page

    function getAddress() {
      return $http.get( HOST + '/checkoutService/index/getAddress');
    }

    function getAddressFromPincode(pincode) {
      return $http.post( HOST + '/checkoutService/index/getAddressFromPincode', {
        "Pincode": pincode
      });
    }

    function assignAddressToQuote(billingId, shippingId) {
      return $http.post( HOST + '/checkoutService/index/assignAddressToQuote', {
        "billingId": billingId,
        "shippingId": shippingId
      });
    }

    function updateAddress(firstName,lastName, address1, city, state, pincode, country, phoneNo, addressId) {
      //console.log(firstName,lastName, address1, city, state, pincode, country, phoneNo, addressId);
      return $http.post( HOST + '/checkoutService/index/updateAddress', {
        "firstName" : firstName,
        "lastName" : lastName,
        "address1" : address1,
        "city" : city,
        "state" : state,
        "pincode" : pincode,
        "country" : country,
        "phoneNo" : phoneNo,
        "addressId":addressId
      });
    }

    function getCountry() {
      return $http.get( HOST + '/checkoutService/index/getCountry');
    }

    function addAddress(shipping, billing) {
      //console.log(shipping, billing);

      return $http.post( HOST + '/checkoutService/index/addAddress', {
        "shippingAddreess":{
          "firstName":shipping.firstName,
          "lastName":shipping.lastName,
          "address1":shipping.address1,
          "city":shipping.city,
          "state":shipping.state,
          "pincode":shipping.postcode,
          "country":shipping.countryName,
          "isSame":shipping.isSame,
          "phoneNo":shipping.phoneNo
        },
        "billingAddreess":{
          "firstName":billing.firstName,
          "lastName":billing.lastName,
          "address1":billing.address1,
          "city":billing.city,
          "state":billing.state,
          "pincode":billing.postcode,
          "country":billing.countryName,
          "isSame":shipping.isSame,
          "phoneNo":billing.phoneNo
        }
      });
    }
    //shipping page ends

    //payment methods

    function getPaymentMethods() {
      return $http.get(HOST + '/checkoutService/index/getPaymentMethods');
    }


    function postQuote (customerId, quoteId) {
      return $http.post(HOST + '/checkoutService/index/loadQuote', {
        customerId: customerId,
        quoteId: quoteId
      });
    }
    // Place order (Prepaid)
    function placeOrder(json) {
      // if(typeof Android !== typeof undefined) {
        //Android.showLog("FROM SERVICE : " + JSON.stringify(json));
      // }
      return $http({
        method: 'POST',
        url: HOST + '/checkoutService/index/placeOrderPrepaid',
        params: json
      });
    }

    //final quote
    function getSuccessData() {
      return $http.get( HOST + '/checkoutService/index/loadFinalQuote');
      //return $http.get( 'https://api.myjson.com/bins/3wu38');
    }

    function getOrderDetails(){
       return $http.get( HOST + '/checkoutService/index/orderDetails');
    }


    function paymentRedirect(url, json) {
      return $http({
        method: 'POST',
        url: url,
        data: json
      });
    }

    function placeOrderCOD(data) {
      // if(typeof Android !== typeof undefined) {
        //Android.showLog("FROM SERVICE : " + JSON.stringify(data));
      // }
      return $http({
        method: 'POST',
        url: HOST + '/checkoutService/index/placeOrderCOD',
        data: data
      });
    }
    //final quote
    function getRecommendation() {
      return $http.get(HOST + '/checkoutService/index/getRecommendedProducts');
    }
    //final quote ends
    //payment methods ends

    function socialAuth (json) {
      return $http({
        method: 'POST',
        url: HOST + '/checkoutService/index/socialLogin',
        data: json,
        withCredentials: true
      });
    }

    function sendAffiliateData(timestamp, affiliateName, orderId, orderValue, utmMedium) {
      return $http.post(HOST + '/checkoutService/index/saveAffiliate', {
        date_timestamp: timestamp,
        affiliate_name: affiliateName,
        order_id: orderId,
        order_value: orderValue,
        utm_medium: utmMedium
      });
    }
  }]);

  services.service('Auth', ['$localStorage', function($localStorage) {
    return {
      isLoggedIn: function () {
        return $localStorage.loginData !== null && $localStorage.loginData !== undefined && $localStorage.loginData !== {};
      }
    }
  }]);

  services.service('ErrorMessages', [ function() {
    return {
      cart: {
        removeQuoteItems: 'Unable to remove product from cart. Please try again.',
        addNoteToSeller: 'Failed to add note to seller. Please try again.',
        removeNoteToSeller: 'Failed to remove note. Please try again.',
        updateQty: 'The requested quantity is not available.',
        addToQuote: 'Failed to undo. Product is now out of stock',
        proceedToCheckout: "Please remove out of stock products.",
      },
      login: {
        forgotPassword: 'This email is not registered with us. You can still proceed using Guest Checkout.',
        socialAuth: 'Login failure. Please try again.'
      },
      payment: {
        placeOrder: 'Unable to place order. Please try again.',
        errors: {
          nonCod: "Sorry, your payment could not be processed. Please try again",
          cod: "Having trouble with your payments? Pay via CASH ON DELIVERY"
        }
      },
      shipping: {
        getCountry: 'Network connectivity failure. Please try again.',
        addAddress: 'Failed to add address. Please check your form entries or try refreshing the page',
        updateAddress: 'Failed to update address. Please check your form entries or try refreshing the page',
      }
    }
  }]);
});
