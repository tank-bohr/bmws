function Bmws() {
  this.init = function() {
    $('#server').val(this.userHost());
    if ("WebSocket" in window) {
      $('#status').append('<p><span style="color: green;">websockets are supported </span></p>');
      this.connect();
    } else {
      $('#status').append('<p><span style="color: red;">websockets are not supported </span></p>');
      $("#navigation").hide();
    };
    $("#connected").hide();
    $("#content").hide();
  };

  this.login = function() {
    return $("#login").val();
  };

  this.serverHost = function() {
    return "ws://" + window.location.host + "/websocket";
  };

  this.userHost = function() {
    if (this.login()) {
      return [this.serverHost(), "users", this.login()].join("/");
    } else {
      return this.serverHost();
    };
  };

  this.connect = function() {
    this.showScreen('<b>Connecting to: ' + this.userHost() + '</b>');
    websocket = new WebSocket(this.userHost());
    websocket.onopen    = function(event) { bmws.onOpen(event)    };
    websocket.onclose   = function(event) { bmws.onClose(event)   };
    websocket.onmessage = function(event) { bmws.onMessage(event) };
    websocket.onerror   = function(event) { bmws.onError(event)   };
  };

  this.disconnect = function() {
    websocket.close();
  };

  this.toggle_connection = function() {
    if(websocket.readyState == websocket.OPEN){
      this.disconnect();
    } else {
      this.connect();
    };
  };

  this.sendTxt = function() {
    if(websocket.readyState == websocket.OPEN) {
      var recepient = $("#recepient").val();
      var message = $("#message").val();
      var resp = {"message": message, "recepient": recepient};
      websocket.send(JSON.stringify(resp));
      this.showScreen('<span style="color: red;">' + this.login() + '</span>: ' + resp.message + '<br>');
      $("#message").val("");
    } else {
      this.showScreen('websocket is not connected');
    };
  };

  this.onOpen = function(event) {
    this.showScreen('<span style="color: green;">CONNECTED </span>');
    $("#connected").fadeIn('slow');
    $("#content").fadeIn('slow');
  };

  this.onClose = function(event) {
    this.showScreen('<span style="color: red;">DISCONNECTED </span>');
  };

  this.onMessage = function(event) {
    var resp = JSON.parse(event.data);
    this.showScreen('<span style="color: blue;">' + resp.from + '</span>: ' + resp.message);
  };

  this.onError = function(event) {
    this.showScreen('<span style="color: red;">ERROR: ' + event.data+ '</span>');
  };

  this.showScreen = function(txt) {
    $('#output').prepend('<p>' + txt + '</p>');
  };

  this.clearScreen = function() {
    $('#output').html("");
  };
};

var websocket;
var bmws = new Bmws();

$(document).ready(function(){
  bmws.init()
});
