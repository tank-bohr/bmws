-module (bmws).
-export ([start/0]).

-define (APPLICATION, ?MODULE).

start() ->
  {ok, Started} = application:ensure_all_started(?APPLICATION),
  lager:debug("Applications started: ~p", [Started]).
