import { TanStackDevtools } from "@tanstack/react-devtools";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
	createRootRoute,
	HeadContent,
	Outlet,
	Scripts,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { AdminButton } from "@/components/AdminButton";
import { Footer } from "@/components/footer/Footer";
import { Header } from "@/components/Header";
import appCss from "../styles/styles.css?url";

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 1000 * 60 * 5, // 5 min default
			retry: 2,
		},
	},
});

export const Route = createRootRoute({
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				title: "March Mad CSS",
			},
			// Open Graph
			{
				property: "og:title",
				content: "March Mad CSS",
			},
			{
				property: "og:image",
				content: "/og.jpg",
			},
			{
				property: "og:type",
				content: "website",
			},
			// Twitter
			{
				name: "twitter:card",
				content: "summary_large_image",
			},
			{
				name: "twitter:image",
				content: "/og.jpg",
			},
			{
				name: "twitter:title",
				content: "March Mad CSS",
			},
		],
		links: [
			{
				rel: "preconnect",
				href: "https://fonts.googleapis.com",
			},
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: "anonymous",
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Alfa+Slab+One&display=swap",
			},
			{
				rel: "stylesheet",
				href: appCss,
			},
			{
				rel: "icon",
				type: "image/png",
				href: "/favicon.png",
			},
		],
	}),
	component: RootDocument,
	notFoundComponent: NotFound,
});

function NotFound() {
	return (
		<div style={{ padding: "2rem", textAlign: "center" }}>
			<h1>404 - Page Not Found</h1>
			<p>The page you're looking for doesn't exist.</p>
		</div>
	);
}

function RootDocument() {
	return (
		<html lang="en">
			<head>
				<HeadContent />
			</head>
			<body>
				<QueryClientProvider client={queryClient}>
					<Header />
					<Outlet />
					<Footer />
					<AdminButton />
					{process.env.NODE_ENV === "development" && (
						<TanStackDevtools
							config={{
								position: "bottom-right",
							}}
							plugins={[
								{
									name: "Tanstack Router",
									render: <TanStackRouterDevtoolsPanel />,
								},
							]}
						/>
					)}
				</QueryClientProvider>
				<Scripts />
			</body>
		</html>
	);
}
