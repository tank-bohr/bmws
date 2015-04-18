# Собрать

`rebar get-deps compile`

# Запустить

`erl +K true -pa apps/bmws/ebin -pa deps/*/ebin -config config/app -s bmws`
