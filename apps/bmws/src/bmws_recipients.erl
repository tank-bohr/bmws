-module(bmws_recipients).

-export([
  json/0,
  json/1
]).

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
