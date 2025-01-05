MAKEFLAGS += --silent

start:
	make publish && make serve & \
		fswatch -o docs/*.md docs/images docs/private/*.md docs/private/images scripts | while read -r; do make publish; done
publish:
	cd ./scripts && npm run --silent build
serve:
	cd ./scripts && npm run --silent serve
commit:
	cd ./scripts && ./tools/commit.sh
