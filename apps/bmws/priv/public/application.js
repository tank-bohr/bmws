var websocket;
$(document).ready(init);

function init() {
  $('#server').val("ws://" + window.location.host + "/websocket");
  if ("WebSocket" in window) {
    $('#status').append('<p><span style="color: green;">websockets are supported </span></p>');
    connect();
  } else {
    $('#status').append('<p><span style="color: red;">websockets are not supported </span></p>');
    $("#navigation").hide();
  };
  $("#connected").hide();
  $("#content").hide();
};

function connect() {
  wsHost = $("#server").val()
  websocket = new WebSocket(wsHost);
  showScreen('<b>Connecting to: ' +  wsHost + '</b>');
  websocket.onopen    = function(event) { onOpen(event)    };
  websocket.onclose   = function(event) { onClose(event)   };
  websocket.onmessage = function(event) { onMessage(event) };
  websocket.onerror   = function(event) { onError(event)   };
};

function disconnect() {
  websocket.close();
};

function toggle_connection() {
  if(websocket.readyState == websocket.OPEN){
    disconnect();
  } else {
    connect();
  };
};

function sendTxt() {
  if(websocket.readyState == websocket.OPEN){
    var recepient = $("#recepient").val();
    var message = $("#message").val();
    var resp = {"message": message, "recepient": recepient};
    websocket.send(JSON.stringify(resp));
    showScreen('sending: ' + resp.message + ' to ' + resp.recepient);
  } else {
    showScreen('websocket is not connected');
  };
};

function onOpen(event) {
  showScreen('<span style="color: green;">CONNECTED </span>');
  $("#connected").fadeIn('slow');
  $("#content").fadeIn('slow');
};

function onClose(event) {
  showScreen('<span style="color: red;">DISCONNECTED </span>');
};

function onMessage(event) {
  var resp = JSON.parse(event.data);
  showScreen('<span style="color: blue;">' + resp.message + ' from ' + resp.from + '</span>');
};

function onError(event) {
  showScreen('<span style="color: red;">ERROR: ' + event.data+ '</span>');
};

function showScreen(txt) {
  $('#output').prepend('<p>' + txt + '</p>');
};

function clearScreen() {
  $('#output').html("");
};
