all: htdocs/btmux.min.js htdocs/btmux.min.css jquery jquery-ui

# TODO: Move all that stuff away from here, fetch libraries with NPM (package.json dependency), use browserify or similar...
jquery: htdocs/ext/jquery.min.js htdocs/ext/jquery-cookie.min.js htdocs/ext/jquery.mousewheel.min.js
jquery-ui: htdocs/ext/jquery-ui.min.js htdocs/ext/jquery-ui.css \
       htdocs/ext/images/ui-icons_777777_256x240.png htdocs/ext/images/ui-icons_444444_256x240.png htdocs/ext/images/ui-icons_555555_256x240.png htdocs/ext/images/ui-icons_ffffff_256x240.png \
       htdocs/ext/images/ui-bg_highlight-soft_100_eeeeee_1x100.png htdocs/ext/images/ui-icons_ef8c08_256x240.png htdocs/ext/images/ui-icons_222222_256x240.png \
       htdocs/ext/images/ui-bg_glass_100_fdf5ce_1x400.png htdocs/ext/images/ui-bg_glass_65_ffffff_1x400.png htdocs/ext/images/ui-bg_glass_100_f6f6f6_1x400.png \
       htdocs/ext/images/ui-bg_gloss-wave_35_f6a828_500x100.png htdocs/ext/images/ui-bg_diagonals-thick_20_666666_40x40.png



# TODO: could be done with npm package.json script hooks
htdocs/btmux.min.js: htdocs/textview.js htdocs/speedbar.js htdocs/heatbar.js htdocs/mapview.js htdocs/weapons.js htdocs/contacts.js htdocs/hudinfo.js htdocs/inputline.js htdocs/client.js
	cat $+ | yui-compressor --type js > $@

htdocs/btmux.min.css: htdocs/colors.css htdocs/style.css
	cat $+ | yui-compressor --type css > $@


# These all depend on Makefile... Makefile change might have updated URLs
htdocs/ext/jquery.min.js: Makefile
	wget -O $@ https://code.jquery.com/jquery-2.2.4.min.js
	touch -c $@

htdocs/ext/jquery-cookie.min.js: Makefile
	 # TODO: Find a better URL, download directly from raw.github?
	 wget -O $@ https://cdn.jsdelivr.net/npm/jquery.cookie@1.4.1/jquery.cookie.min.js
	touch -c $@

htdocs/ext/jquery.mousewheel.min.js: Makefile
	 wget -O $@ https://raw.githubusercontent.com/jquery/jquery-mousewheel/master/jquery.mousewheel.min.js
	touch -c $@

htdocs/ext/jquery-ui.min.js: Makefile
	wget -O $@ https://code.jquery.com/ui/1.12.1/jquery-ui.min.js
	touch -c $@

# Change theme here
htdocs/ext/jquery-ui.css: Makefile
	wget -O $@ https://code.jquery.com/ui/1.12.1/themes/ui-lightness/jquery-ui.css
	touch -c $@
#	wget -O $@ https://code.jquery.com/ui/1.12.1/themes/base/jquery-ui.css


htdocs/ext/images/%:
	wget -O $@ $(subst htdocs/ext/,https://code.jquery.com/ui/1.12.1/themes/base/,$@) || wget -O $@  $(subst htdocs/ext/,https://code.jquery.com/ui/1.12.1/themes/ui-lightness/,$@)
	touch -c $@
