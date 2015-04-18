-module(bmws_app).

-behaviour(application).

%% Application callbacks
-export([start/2, stop/1]).

%% ===================================================================
%% Application callbacks
%% ===================================================================

start(_StartType, _StartArgs) ->
    start_cowboy(),
    bmws_sup:start_link().

stop(_State) ->
    ok.

start_cowboy() ->
    Dispatch = cowboy_router:compile([
      {'_', [
        {"/", cowboy_static, {priv_file, bmws, "index.html"}},
        {"/websocket/[users/:name]", bmws_handler, []},
        {"/public/[...]", cowboy_static, {priv_dir, bmws, "public"}}
      ]}
    ]),
    cowboy:start_http(bmws_http_listener, 100, [{port, 8080}],
        [{env, [{dispatch, Dispatch}]}]
    ).
