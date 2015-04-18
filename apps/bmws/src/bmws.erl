-module (bmws).
-export ([start/0]).

start() ->
  {ok, _Started} = application:ensure_all_started(bmws).
