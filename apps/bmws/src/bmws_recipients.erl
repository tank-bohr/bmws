-module(bmws_recipients).

-export([init/2]).

init(Req, Opts) ->
    AllRecipients = gproc:lookup_values({p, l, '_'}),
    Names = lists:map(fun({_, Name}) -> Name end, AllRecipients),
    Reply = jiffy:encode({[{recipients, Names}]}),
    Resp = cowboy_req:reply(200,
                            [{<<"content-type">>, <<"application/json">>}],
                            Reply,
                            Req),
    {ok, Resp, Opts}.
