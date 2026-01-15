// Cloudflare Image Resizing URL helper (only works in production behind Cloudflare)
// Docs: https://developers.cloudflare.com/images/transform-images/transform-via-url/

type CfImageOptions = {
	width?: number;
	height?: number;
	quality?: number;
	fit?: "scale-down" | "contain" | "cover" | "crop" | "pad";
};

export function cfImage(src: string, options: CfImageOptions = {}) {
	// Skip Cloudflare transform in development
	if (import.meta.env.DEV) return src;

	const { width = 400, quality = 80, fit = "cover" } = options;
	const params = [`width=${width}`, `quality=${quality}`, `fit=${fit}`, "format=auto"].join(",");
	return `/cdn-cgi/image/${params}${src}`;
}

