main: install
	
.SILENT:

install:
ifeq ($(wildcard src/.installed),) 
	cd src; npm install && touch .installed;
endif

test_internal: test/bigTestFile test/get/local test/get/db \
			test/qantas.airline test/qantas.schedule \
			test/aircraft \
		 	test/error/AirlineCode test/error/AirportCode \
			test/error/CityTimezone test/error/CountryCode \
			test/error/TooFewArguments

test: test_all_pre test_internal
	make test_all_post
			
test_long: test_all_pre test_internal test/airports
	make test_all_post
			
test_all_pre: install
ifeq ($(wildcard src/config.js),src/config.js)
	mv src/config.js src/config.js.make-bak
endif
	cp src/config.js.dist src/config.js
ifeq ($(wildcard data/db.sqlite),data/db.sqlite)
	mv data/db.sqlite data/db.sqlite.make-bak
endif
	
test_all_post:
	rm -f src/config.js
ifeq ($(wildcard src/config.js.make-bak),src/config.js.make-bak)
	mv src/config.js.make-bak src/config.js
endif
	rm -f data/db.sqlite
ifeq ($(wildcard data/db.sqlite.make-bak),data/db.sqlite.make-bak)
	mv data/db.sqlite.make-bak data/db.sqlite;
endif

test_pre:
ifeq ($(wildcard data/db.sqlite),data/db.sqlite)
	rm data/db.sqlite;
endif

test/%: test/%.dsl
	make test_pre
	echo "\033[01;34mRunning test file $<:\033[00m" && \
		node src/dsl $< && \
		echo "\033[01;32mTest succeeded\033[00m" || \
		(echo "\033[01;31mTest failed\033[00m"; exit 1)
		
test/get/db: test/get/db.dsl
	# don't make test_pre
	echo "\033[01;34mRunning test file $<:\033[00m" && \
		node src/dsl $< && \
		echo "\033[01;32mTest succeeded\033[00m" || \
		(echo "\033[01;31mTest failed\033[00m"; exit 1)

test/error/%: test/error/error%.dsl
	make test_pre
	echo "\033[01;34mRunning test file $<:\033[00m" && \
	node src/dsl $< && \
	echo "\033[01;31mThis file should've failed.\033[00m" && exit 1 \
			|| echo "\033[01;32mFile failed, as expected\033[00m"
