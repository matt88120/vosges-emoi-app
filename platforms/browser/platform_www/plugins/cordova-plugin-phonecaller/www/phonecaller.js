cordova.define("cordova-plugin-phonecaller.PhoneCaller", function(require, exports, module) { var argscheck = require('cordova/argscheck');
var exec = require('cordova/exec');

var PhoneCaller = {
  call: function(phoneNumber, successCallback, errorCallback) {
      argscheck.checkArgs('sfF', 'PhoneCaller.call', arguments);
      exec(successCallback, errorCallback, 'PhoneCaller', 'call', [phoneNumber]);
  }
};

module.exports = PhoneCaller;

});
