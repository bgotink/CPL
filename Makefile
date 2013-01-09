main: install

install:
ifeq ($(wildcard src/.installed),) 
	cd src; npm install && touch .installed;
endif

test: install test/bigTestFile

test/%: test/%.dsl
	node src/dsl $<
