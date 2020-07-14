include node.mk
.PHONY: all test build lint
SHELL := /bin/bash

TS_FILES := $(shell find . -name "*.ts" -not -path "./node_modules/*" -not -name "*.d.ts")

all: test build

format:
	@./node_modules/.bin/prettier --write $(TS_FILES)

lint:
	@echo "Linting..."
	@./node_modules/.bin/eslint -c .eslintrc.yml $(TS_FILES)
	@echo "Running prettier"
	@./node_modules/.bin/prettier -l $(TS_FILES) || \
		(echo "**** Prettier errors in the above files! Run 'make format' to fix! ****" && false)

test: lint

build:
	@echo "Building..."
	@rm -rf dist
	@./node_modules/.bin/tsc --declaration

format-all:
	@echo "Formatting all files"
	@npx prettier --write $(TS_FILES)


run:
	NODE_ENV=development ./node_modules/.bin/webpack-cli --mode=development --watch & ./node_modules/nodemon/bin/nodemon.js --watch 'src/**/*.ts' --exec './node_modules/.bin/ts-node' src/server.ts
