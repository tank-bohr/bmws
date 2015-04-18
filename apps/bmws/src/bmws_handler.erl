-module(bmws_handler).

-export([init/2]).
-export([websocket_handle/3]).
-export([websocket_info/3]).

init(Req, Opts) ->
  Bindings = cowboy_req:bindings(Req),
  Name = proplists:get_value(name, Bindings),
  gproc:reg({n, l, Name}),
  lager:info("Name: ~w", [Name]),
  {cowboy_websocket, Req, Opts}.

websocket_handle({text, Message}, Req, State) ->
  Reply = #{message => Message},
  {reply, {text, jiffy:encode(Reply)}, Req, State};
websocket_handle(_Data, Req, State) ->
  {ok, Req, State}.

websocket_info({message, Msg}, Req, State) ->
  {reply, {text, Msg}, Req, State};
websocket_info(_Info, Req, State) ->
  {ok, Req, State}.
