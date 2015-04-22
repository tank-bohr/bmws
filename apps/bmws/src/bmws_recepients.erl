-module(bmws_recepients).

-export([init/2]).

init(Req, Opts) ->
    AllRecepients = gproc:lookup_values({p, l, '_'}),
    Names = lists:map(fun({_, Name}) -> Name end, AllRecepients),
    Reply = jiffy:encode({[{recepients, Names}]}),
    Resp = cowboy_req:reply(200,
                            [{<<"content-type">>, <<"application/json">>}],
                            Reply,
                            Req),
    {ok, Resp, Opts}.
