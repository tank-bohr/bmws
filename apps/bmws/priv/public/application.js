(function () {
  var websocket;

  var currentRecipient = null;

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

    $('.js-recipient-list').on('change', updateRecipient);
  };

  function updateRecipient() {
    $('#recipient').val($('.js-recipient-list').val());
  };

  function updateRecipientList() {
    var options = $('.js-recipient-list');
    var defaultOption = $('<option value="">Select a recipient</option>');

    $.ajax({
      method: 'GET',
      url: '/recipients',
      success: function(resp) {
        options.html('');
        options.append(defaultOption);
        var recipients = resp.recipients.map(function(r) {
          var option = $('<option value="' + r + '">' + r +  '</option>');
          if(r === currentRecipient) {
            option.attr('selected', 'selected');
          }
          options.append(option);
          return option;
        });
      }
    })

  };

  updateRecipientList();

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
    updateRecipientList();
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
      var recipient = $('#recipient').val();
      currentRecipient = recipient;
      var message = $('#message').val();
      var resp = { 'message': message, 'recipient': recipient };
      websocket.send(JSON.stringify(resp));
      showMessage(message, login(), true);
      $("#message").val("");
      updateRecipientList();
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
