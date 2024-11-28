start:
	make publish && make serve & \
	fswatch -o docs | while read -r; do make publish; done
publish:
	cd ./scripts && npm run build
serve:
	cd ./scripts && npm run serve
