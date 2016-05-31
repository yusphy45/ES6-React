dev: copy-media
	@npm run dev

deploy: copy-media
	@npm run deploy

build: copy-media
	@npm run build

copy-media: clean
	@if [ ! -d dist ]; then \
	mkdir dist; \
	fi
	@cp public/* dist
	@cp -r media dist

clean: install
	@rm -rf dist

install:
	@npm install