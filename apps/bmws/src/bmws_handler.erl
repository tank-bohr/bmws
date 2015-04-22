-module(bmws_handler).

-export([init/2]).
-export([websocket_handle/3]).
-export([websocket_info/3]).

-include ("bmws.hrl").

init(Req, Opts) ->
    State = case extract_name(Req) of
                undefined ->
                    Opts;
                Name ->
                    lager:info("init name: ~w", [Name]),
                    gproc:reg({p, l, Name}, Name),
                    [{user, #user{name=Name}} | Opts]
            end,
    {cowboy_websocket, Req, State}.

websocket_handle({text, Json}, Req, State) ->
    lager:debug("Json: ~w", [Json]),
    #user{name = Name} = proplists:get_value(user, State, #user{}),
    lager:info("websocket_handle name: ~w", [Name]),
    {Data} = jiffy:decode(Json),
    lager:debug("Data: ~w", [Data]),
    Recipient = proplists:get_value(<<"recipient">>, Data),
    lager:debug("Recipient: ~w", [Recipient]),
    Message = proplists:get_value(<<"message">>, Data),
    lager:debug("Message: ~w", [Message]),
    JsonToSend = jiffy:encode({[{message, Message}, {from, Name}]}),
    lager:debug("JsonToSend: ~w", [JsonToSend]),
    gproc:send({p, l, Recipient}, {json, JsonToSend}),
    Reply = jiffy:encode({[{message, <<"sent">>}, {from, me}]}),
    {reply, {text, Reply}, Req, State};
websocket_handle(_Data, Req, State) ->
    {ok, Req, State}.

websocket_info({json, Json}, Req, State) ->
    {reply, {text, Json}, Req, State};
websocket_info(_Info, Req, State) ->
    {ok, Req, State}.

extract_name(Req) ->
    Bindings = cowboy_req:bindings(Req),
    proplists:get_value(name, Bindings).
