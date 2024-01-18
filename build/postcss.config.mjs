import fs from "fs";
import path from "path";
import postcss from "postcss";
import postcssMixins from "postcss-mixins";
import stylelint from "stylelint";
import postcssLightningcss from "postcss-lightningcss";
import reporter from "postcss-reporter";
import { bundle } from "lightningcss";

const lightningcssBundle = (opts = {}) => {
	return {
		postcssPlugin: "lightningcss-bundle",
		Once(root, { result }) {
			const filename = opts.filename || result.opts.from;
			const { code } = bundle({
				filename,
				...opts.lightningcssOptions
			});

			root.removeAll();
			const parsedCode = postcss.parse(code);
			root.append(parsedCode);
		}
	};
};

export default (ctx) => {
	const nodeEnv = ctx.env;
	const dev = nodeEnv === "development";

	const browserslistpath = path.resolve(ctx.file.dirname, "../../.browserslistrc");
	const browserslist = fs.readFileSync(browserslistpath, "utf8").trim();

	const stylelintOptions = {
		configFile: path.join(ctx.cwd, "/.stylelintrc"),
		fix: true
	};

	const mixinOptions = {
		mixinsDir: path.join(ctx.file.dirname, "/parts")
	};

	lightningcssBundle.postcss = true;

	const lightningcssOptions = {
		browsers: browserslist,
		lightningcssOptions: {
			minify: !dev,
			sourceMap: true,
			cssModules: false,
			drafts: {
				nesting: true,
				customMedia: true
			},
			visitor: {
				Url(url) {
					if (!dev) {
						url.url = url.url;
					} else {
						if (url.url.startsWith("../../")) {
							url.url = url.url.replace("../../", "../");
						}
					}
					return url;
				}
			}
		},
	};

	const reporterOptions = {
		formatter: input => {
			return input.source + " produced " + input.messages.length + " messages \n";
		},
		clearMessages: true
	};

	let plugins = [];

	switch (nodeEnv) {
		case "production":
		case "development":
			plugins = [
				stylelint(stylelintOptions),
				lightningcssBundle(lightningcssOptions),
				postcssMixins(mixinOptions),
				postcssLightningcss(lightningcssOptions),
				reporter(reporterOptions)
			];
			break;
		default:
			console.log("No ENV defined so no Plugins enabled.");
	}

	return {
		map: { inline: false },
		plugins: plugins
	};
};
