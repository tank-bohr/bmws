(function () {
  var websocket;

  var currentRecepient = null;

  function init() {
    $('#server').val(userHost());
    if ('WebSocket' in window) {
      showStatus('websockets are supported', 'green');
      connect();
    } else {
      showStatus('websockets are not supported', 'red');
      $("#navigation").hide();
    };
    $('.connected').hide();
    $('.content').hide();

    $('.btn_connect').on('click', toggleConnection);
    $('.btn_send').on('click', sendText);
    $('.btn_clear').on('click', clearScreen);

    $('.js-recepient-list').on('change', updateRecepient);
  };

  function updateRecepient() {
    $('#recepient').val($('.js-recepient-list').val());
  };

  function updateRecepientList() {
    var options = $('.js-recepient-list');
    var defaultOption = $('<option value="">Select a recepient</option>');

    $.ajax({
      method: 'GET',
      url: '/recepients',
      success: function(resp) {
        options.html('');
        options.append(defaultOption);
        var recepients = resp.recepients.map(function(r) {
          var option = $('<option value="' + r + '">' + r +  '</option>');
          if(r === currentRecepient) {
            option.attr('selected', 'selected');
          }
          options.append(option);
          return option;
        });
      }
    })

  };

  updateRecepientList();

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
    updateRecepientList();
    $('.js-connect-button').html('disconnect');
  };

  function disconnect() {
    websocket.close();
    $('.js-connect-button').html('connect');
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
      currentRecepient = recepient;
      var message = $('#message').val();
      var resp = { 'message': message, 'recepient': recepient };
      websocket.send(JSON.stringify(resp));
      showMessage(message, login(), true);
      $("#message").val("");
      updateRecepientList();
    } else {
      showScreen('websocket is not connected');
    };
  };

  function onOpen(event) {
    showScreen('CONNECTED', 'green');
    $(".connected").fadeIn('slow');
    $(".content").fadeIn('slow');
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
    $('.header .status')
      .append('<p><span style="color: ' + color + ';">' + text + '</span></p>')
  }

  function clearScreen() {
    $('#output').html('');
  };

  $(document).ready(init);

})(this);
