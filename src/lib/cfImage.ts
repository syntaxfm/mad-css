type CfImageOptions = {
	width?: number;
	height?: number;
	quality?: number;
	fit?: "scale-down" | "contain" | "cover" | "crop" | "pad";
};

export function cfImage(src: string, options: CfImageOptions = {}) {
	// Skip Cloudflare transform in development
	if (import.meta.env.DEV) return src;

	// Only enable on production domain - set VITE_CF_IMAGES=1 in your production environment
	if (!import.meta.env.VITE_CF_IMAGES) return src;

	const { width = 400, quality = 80, fit = "cover" } = options;
	const params = [`width=${width}`, `quality=${quality}`, `fit=${fit}`, "format=auto"].join(",");
	return `/cdn-cgi/image/${params}${src}`;
}

