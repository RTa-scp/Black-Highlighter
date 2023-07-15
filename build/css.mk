# Variables
CSS_COPY_SOURCES := $(wildcard src/css/parts/*)
CSS_COPY_OUTPUTS := $(patsubst src/css/parts/%,dist/css/parts/%,$(CSS_COPY_SOURCES))

CSS_SOURCES := $(wildcard src/css/*.css src/css/parts/*.css)
CSS_OUTPUTS := \
		dist/css/min/black-highlighter.min.css \
		dist/css/min/normalize.min.css

# Copy CSS Rules
dist/css/parts/%: src/css/parts/%
		build/install.sh 644 $< $@

# CSS rules
dist/css/min/black-highlighter.min.css: src/css/black-highlighter.css $(BUILD_SOURCES) $(CSS_SOURCES) node_modules
		build/install.sh 644 $< dist/css/black-highlighter-imports.css
		pnpm postcss dist/css/black-highlighter-imports.css --config build --env development -o dist/css/black-highlighter.css
		pnpm postcss dist/css/black-highlighter-imports.css --config build --env production -o $@

dist/css/min/normalize.min.css: src/css/normalize.css $(BUILD_SOURCES) node_modules
		build/install.sh 644 $< dist/css/normalize.css
		pnpm postcss dist/css/normalize.css --config build --env development -r
		pnpm postcss dist/css/normalize.css --config build --env production -o $@
