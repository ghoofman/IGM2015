var Mixpanel = require('mixpanel');
var mixpanel = Mixpanel.init('e7f7fdf03c6d140ff659e3b5daa5b9aa');

var GUID = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
    return v.toString(16);
});

module.exports = {
  Track: function(event, data) {
    var send = data || {};
    send.distinct_id = GUID;
    mixpanel.track(event, send);
  }
};
