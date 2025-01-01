MAKEFLAGS += --silent

start:
	make publish && make serve & \
		fswatch -o docs scripts | while read -r; do make publish; done
publish:
	cd ./scripts && npm run --silent build
serve:
	cd ./scripts && npm run --silent serve
commit:
	cd ./scripts && ./tools/commit.sh
