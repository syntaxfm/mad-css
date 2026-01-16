type CfImageOptions = {
	width?: number;
	height?: number;
	quality?: number | 'auto';
	fit?: "scale-down" | "contain" | "cover" | "crop" | "pad";
  origin?: string;
};

export function cfImage(src: string, options: CfImageOptions = {}) {
	const { width = 400, quality = 'auto', fit = "cover", origin = '' } = options;
	// Skip Cloudflare transform in development
	if (import.meta.env.DEV) return `${origin}${src}`;

	const params = [`width=${width}`, `quality=${quality}`, `fit=${fit}`, "format=auto"].join(",");
	return `https://madcss.com/cdn-cgi/image/${params}${origin ? `/${origin}` : ''}${src}`;
}

