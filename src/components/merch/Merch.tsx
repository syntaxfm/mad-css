import { env } from "cloudflare:workers";
import { useQuery } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import "./merch.css";

const SHOPIFY_STORE = "4a31e6-3.myshopify.com";
const COLLECTION_HANDLE = "syntax-march-madcss";
const STORE_URL = "https://checkout.sentry.shop";
const CACHE_KEY = `merch:${COLLECTION_HANDLE}`;
const CACHE_TTL = import.meta.env.DEV ? 60 : 60 * 60; // 1 hour in production, 10 seconds in development

export type MerchProduct = {
	id: number;
	title: string;
	handle: string;
	price: string;
	compareAtPrice: string | null;
	image: string | null;
	available: boolean;
};

function parseProducts(raw: ShopifyProduct[]): MerchProduct[] {
	return raw.map((p) => {
		const firstVariant = p.variants?.[0];
		const firstImage = p.images?.[0];
		const anyAvailable = p.variants?.some((v) => v.available) ?? false;
		return {
			id: p.id,
			title: p.title,
			handle: p.handle,
			price: firstVariant?.price ?? "0.00",
			compareAtPrice: firstVariant?.compare_at_price ?? null,
			image: firstImage?.src ?? null,
			available: anyAvailable,
		};
	});
}

type ShopifyVariant = {
	price: string;
	compare_at_price: string | null;
	available: boolean;
};

type ShopifyImage = {
	src: string;
};

type ShopifyProduct = {
	id: number;
	title: string;
	handle: string;
	variants: ShopifyVariant[];
	images: ShopifyImage[];
};

const getMerchProducts = createServerFn({ method: "GET" }).handler(
	async (): Promise<MerchProduct[]> => {
		const kv = "KV" in env ? (env.KV as KVNamespace) : undefined;

		if (kv) {
			try {
				const cached = await kv.get(CACHE_KEY, "json");
				if (cached) {
					return cached as MerchProduct[];
				}
			} catch (e) {
				console.error("[merch] KV read failed:", e);
			}
		}

		const url = `https://${SHOPIFY_STORE}/collections/${COLLECTION_HANDLE}/products.json?country=US`;
		const res = await fetch(url, {
			headers: {
				Accept: "application/json",
				"User-Agent":
					"Mozilla/5.0 (compatible; MadCSS/1.0; +https://madcss.com)",
				"Accept-Language": "en-US,en;q=0.9",
				"Accept-Encoding": "gzip, deflate, br",
				Cookie: "localization=US",
			},
		});

		if (!res.ok) {
			const body = await res.text();
			console.error("[merch] fetch failed, body:", body);
			return [];
		}

		const data = (await res.json()) as { products: ShopifyProduct[] };
		const products = parseProducts(data.products ?? []);

		if (kv) {
			try {
				await kv.put(CACHE_KEY, JSON.stringify(products), {
					expirationTtl: CACHE_TTL,
				});
			} catch (e) {
				console.error("[merch] KV write failed:", e);
			}
		}

		return products;
	},
);

function formatPrice(price: string): string {
	const num = Number.parseFloat(price);
	return num % 1 === 0 ? `$${num}` : `$${num.toFixed(2)}`;
}

export function Merch() {
	const { data, isLoading, error } = useQuery<MerchProduct[]>({
		queryKey: ["merch"],
		queryFn: () => getMerchProducts(),
		staleTime: 1000 * 60 * 15,
	});

	const products = data ?? [];

	if (isLoading) {
		return (
			<section id="merch" className="section merch-section">
				<div className="section-content">
					<h2>Merch</h2>
					<div className="merch-loading">Loading gear...</div>
				</div>
			</section>
		);
	}

	if (products.length === 0) return null;

	return (
		<section id="merch" className="section merch-section">
			<div className="section-content">
				<h2>Merch</h2>
				<p className="merch-subtitle">
					Limited edition March MadCSS gear. Get it before it's gone.
				</p>
				<div className="merch-grid">
					{products.map((product) => (
						<a
							key={product.id}
							href={`${STORE_URL}/products/${product.handle}`}
							target="_blank"
							rel="noopener noreferrer"
							className="merch-card"
						>
							{product.image && (
								<img src={product.image} alt={product.title} loading="lazy" />
							)}
							<h3>
								{product.title}
								{!product.available && (
									<span className="sold-out">Sold Out</span>
								)}
							</h3>
							<span className="merch-cta">
								Inspect
								<span className="price">{formatPrice(product.price)}</span>
							</span>
						</a>
					))}

					<div className="merch-shop-link">
						<a
							href={STORE_URL}
							target="_blank"
							rel="noopener noreferrer"
							className="button merch-button"
						>
							Shop All Merch
						</a>
					</div>
				</div>
			</div>
		</section>
	);
}
