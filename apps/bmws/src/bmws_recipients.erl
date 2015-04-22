-module(bmws_recipients).

-export([init/2]).
-export([
  json/0,
  json/1
]).

init(Req, Opts) ->
    Resp = cowboy_req:reply(200, [
      { <<"content-type">>, <<"application/json">> }
    ], json(), Req),
    {ok, Resp, Opts}.

json() ->
    json([]).

json(Without) ->
    Values = gproc:lookup_values({p, l, '_'}),
    AllRecipients = lists:usort(lists:map(fun({_, Name}) ->
        Name
    end, Values)),
    Recipients = AllRecipients -- Without,
    jiffy:encode({[
        {'_type', recipients},
        {recipients, Recipients}
    ]}).
