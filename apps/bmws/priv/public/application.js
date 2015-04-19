(function () {
  var websocket;

  function init() {
    $('#server').val(userHost());
    if ('WebSocket' in window) {
      showStatus('websockets are supported', 'green');
      connect();
    } else {
      showStatus('websockets are not supported', 'red');
      $("#navigation").hide();
    };
    $('#connected').hide();
    $('#content').hide();

    $('.btn_connection').on('click', toggleConnection);
    $('.btn_send').on('click', sendText);
    $('.btn_clear').on('click', clearScreen);
  };

  function login() {
    return $('#login').val();
  };

  function serverHost() {
    return 'ws://' + window.location.host + '/websocket';
  };

  function userHost() {
    if (login()) {
      return [serverHost(), 'users', login()].join('/');
    } else {
      return serverHost();
    };
  };

  function connect() {
    showScreen('<b>Connecting to: ' + userHost() + '</b>');
    websocket = new WebSocket(userHost());
    websocket.onopen    = function(event) { onOpen(event)    };
    websocket.onclose   = function(event) { onClose(event)   };
    websocket.onmessage = function(event) { onMessage(event) };
    websocket.onerror   = function(event) { onError(event)   };
  };

  function disconnect() {
    websocket.close();
  };

  function toggleConnection() {
    if(websocket.readyState == websocket.OPEN){
      disconnect();
    } else {
      connect();
    };
  };

  function sendText() {
    if(websocket.readyState == websocket.OPEN) {
      var recepient = $('#recepient').val();
      var message = $('#message').val();
      var resp = { 'message': message, 'recepient': recepient };
      websocket.send(JSON.stringify(resp));
      showMessage(message, login(), true);
      $("#message").val("");
    } else {
      showScreen('websocket is not connected');
    };
  };

  function onOpen(event) {
    showScreen('CONNECTED', 'green');
    $("#connected").fadeIn('slow');
    $("#content").fadeIn('slow');
  };

  function onClose(event) {
    showScreen('DISCONNECTED', 'red');
  };

  function onMessage(event) {
    var resp = JSON.parse(event.data);
    showMessage(resp.message, resp.from, false);
  };

  function onError(event) {
    error = 'ERROR: ' + event.data;
    showScreen(error, 'red');
  };

  function showMessage(message, from, is_mine) {
    color = is_mine ? 'red' : 'blue'
    $('#output')
      .prepend('<p><span style="color: ' + color + ';">' + from + ': </span>' + message + '</p>');
  }

  function showScreen(text, color) {
    $('#output')
      .prepend('<p><span style="color: ' + color + ';">' + text + '</span></p>');
  };

  function showStatus(text, color) {
    $('#status')
      .append('<p><span style="color: ' + color + ';">' + text + '</span></p>')
  }

  function clearScreen() {
    $('#output').html('');
  };

  $(document).ready(init);

})(this);
