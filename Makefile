deps:
	rebar get-deps compile

compile:
	erl -pa deps/*/ebin -make

run:
	erl +K true -pa apps/bmws/ebin -pa deps/*/ebin -config config/app -s bmws
