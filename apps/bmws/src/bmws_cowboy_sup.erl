-module(bmws_cowboy_sup).
-export([start_link/0]).

-behaviour(supervisor_bridge).
-export([
    init/1,
    terminate/2
]).

-record (state, {}).

-define(SERVER, ?MODULE).

start_link() ->
    supervisor_bridge:start_link({local, ?SERVER}, ?MODULE, []).

init([]) ->
    {ok, Port} = application:get_env(port),
    lager:debug("Port is ~p", [Port]),
    Dispatch = cowboy_router:compile([
        {'_', [
            {"/", cowboy_static, {priv_file, bmws, "index.html"}},
            {"/websocket/[users/:name]", bmws_handler, []},
            {"/recepients", bmws_recepients, []},
            {"/public/[...]", cowboy_static, {priv_dir, bmws, "public"}}
        ]}
    ]),
    {ok, Pid} = cowboy:start_http(bmws_http_listener, 100, [{port, Port}],
        [{env, [{dispatch, Dispatch}]}]
    ),
    {ok, Pid, #state{}}.

terminate(_Reason, _State) ->
    ok.
