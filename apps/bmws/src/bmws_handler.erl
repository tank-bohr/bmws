-module(bmws_handler).

-export([init/2]).
-export([websocket_handle/3]).
-export([websocket_info/3]).

init(Req, Opts) ->
  Bindings = cowboy_req:bindings(Req),
  Name = proplists:get_value(name, Bindings),
  gproc:reg({p, l, Name}, Name),
  lager:info("Name: ~w", [Name]),
  {cowboy_websocket, Req, Opts}.

websocket_handle({text, Json}, Req, State) ->
  lager:debug("Json: ~w", [Json]),
  {Data} = jiffy:decode(Json),
  lager:debug("Data: ~w", [Data]),
  Recepient = proplists:get_value(<<"recepient">>, Data),
  lager:debug("Recepient: ~w", [Recepient]),
  Message   = proplists:get_value(<<"message">>, Data),
  lager:debug("Message: ~w", [Message]),
  JsonToSend = jiffy:encode({[{message, Message}]}),
  lager:debug("JsonToSend: ~w", [JsonToSend]),
  gproc:send({p, l, Recepient}, {json, JsonToSend}),
  Reply = jiffy:encode({[{message, <<"sent">>}]}),
  {reply, {text, Reply}, Req, State};
websocket_handle(_Data, Req, State) ->
  {ok, Req, State}.

websocket_info({json, Json}, Req, State) ->
  {reply, {text, Json}, Req, State};
websocket_info(_Info, Req, State) ->
  {ok, Req, State}.
