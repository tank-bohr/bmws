-module(bmws_handler).

-export([init/2]).
-export([websocket_handle/3]).
-export([websocket_info/3]).

-include ("bmws.hrl").

-record (state, {
    user = #user{},
    opts = []
}).

init(Req, Opts) ->
    State = case extract_name(Req) of
        undefined ->
            #state{opts=Opts};
        Name ->
            lager:info("init name: ~w", [Name]),
            ok = monitor_recipients(),
            self() ! {json, bmws_recipients:json()},
            gproc:send({p, l, {user, '_'}}, {new_recipient, Name}),
            gproc:reg({p, l, {user, Name}}, Name),
            #state{user = #user{name=Name}, opts=Opts}
    end,
    {cowboy_websocket, Req, State}.

websocket_handle({text, Json}, Req, State) ->
    { Message, Recipient } = parse_message_json(Json),
    Name = extract_name(State),
    JsonToSend = message_json(Message, Name),
    gproc:send({p, l, {user, Recipient}}, {json, JsonToSend}),
    Reply = sent_json(),
    {reply, {text, Reply}, Req, State};
websocket_handle(_Data, Req, State) ->
    {ok, Req, State}.

websocket_info({json, Json}, Req, State) ->
    {reply, {text, Json}, Req, State};
websocket_info({'DOWN', _MonitorRef, process, _Pid, _Info}, Req, State) ->
    Name = extract_name(State),
    Json = bmws_recipients:json([Name]),
    {reply, {text, Json}, Req, State};
websocket_info({new_recipient, _NewRecipientName}, Req, State) ->
    Name = extract_name(State),
    Json = bmws_recipients:json([Name]),
    {reply, {text, Json}, Req, State};
websocket_info(_Info, Req, State) ->
    {ok, Req, State}.

%% private functions

extract_name(State=#state{user=User}) when is_record(State, state) ->
    User#user.name;
extract_name(Req) -> %% is_record(Req, http_req)
    Bindings = cowboy_req:bindings(Req),
    proplists:get_value(name, Bindings).

monitor_recipients() ->
    lists:foreach(fun({Pid, _Name}) ->
        _MonitorRef = monitor(process, Pid)
    end, gproc:lookup_values({p, l, {user, '_'}})).

parse_message_json(Json) ->
    { Data }  = jiffy:decode(Json),
    Recipient = proplists:get_value(<<"recipient">>, Data),
    Message   = proplists:get_value(<<"message">>, Data),
    { Message, Recipient }.

message_json(Message, From) ->
    jiffy:encode({[
        {'_type', message},
        {message, Message},
        {from, From}
    ]}).

sent_json() ->
    jiffy:encode({[
        {'_type', sent}
    ]}).
