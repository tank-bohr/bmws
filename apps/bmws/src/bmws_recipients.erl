-module(bmws_recipients).

-export([
  json/0,
  json/1
]).

-define(USER_PATTERN, {user, '_'}).

json() ->
    json([]).

json(Without) ->
    Values = gproc:lookup_values({p, l, ?USER_PATTERN}),
    AllRecipients = lists:usort(lists:map(fun({_, Name}) ->
        Name
    end, Values)),
    Recipients = AllRecipients -- Without,
    jiffy:encode({[
        {'_type', recipients},
        {recipients, Recipients}
    ]}).
