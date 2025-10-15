const path = require("node:path");
const fs = require("fs");
const Image = require("@11ty/eleventy-img");

const IMAGE_OPTIONS = {
	widths: [400, 800, 1280, 1600, 2000],
	formats: ["avif", "webp", "svg", "jpeg"],
	outputDir: "./_site/optimized/",
	urlPath: "/optimized/",
	filenameFormat: function (id, src, width, format) {
		// Extract the base name of the source file
		let baseName = path.basename(src, path.extname(src));
		// Generate a hash from the source path for cache busting
		const crypto = require('crypto');
		const hash = crypto.createHash('md5').update(src).digest('hex').substring(0, 8);
		// Return the formatted filename: originalname-width-hash.format
		return `${baseName}-${width}-${hash}.${format}`;
	},
	// More aggressive compression settings for maximum file size reduction
	avifOptions: {
		quality: 60, // Very aggressive compression
		speed: 2,    // Slower but better compression
	},
	webpOptions: {
		quality: 65, // Very aggressive compression
		method: 6,   // Best compression algorithm
	},
	jpegOptions: {
		quality: 75, // More aggressive compression
		progressive: true,
		optimize: true,
	},
	// svgCompressionSize: "br",
};

module.exports = async (srcFilePath, alt, className, sizes, preferSvg) => {
	let before = Date.now();
	let inputFilePath = srcFilePath == null ? srcFilePath : path.join("src", srcFilePath);

	if (fs.existsSync(inputFilePath)) {
		let metadata = await Image(
			inputFilePath,
			Object.assign(
				{
					svgShortCircuit: preferSvg ? "size" : false,
				},
				IMAGE_OPTIONS,
			),
		);
		console.log(`[11ty/eleventy-img] ${Date.now() - before}ms: ${inputFilePath}`);

		return Image.generateHTML(metadata, {
			alt,
			class: className,
			sizes: sizes || "100vw", // Set default value to "100vw" if sizes is not provided
			loading: "eager",
			decoding: "async",
		});
	} else {
		return `<img class='${className}' src='${srcFilePath}' alt='${alt}'>`;
	}
};
