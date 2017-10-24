all: htdocs/btmux.min.js

htdocs/btmux.min.js: htdocs/textview.js htdocs/speedbar.js htdocs/heatbar.js htdocs/mapview.js htdocs/weapons.js htdocs/hudinfo.js htdocs/inputline.js htdocs/client.js
	cat $+ | yui-compressor --type js > $@
