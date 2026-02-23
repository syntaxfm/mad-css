import { TanStackDevtools } from "@tanstack/react-devtools";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
	createRootRoute,
	HeadContent,
	Outlet,
	Scripts,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { createIsomorphicFn } from "@tanstack/react-start";
import { getRequestUrl } from "@tanstack/react-start/server";
import { AdminButton } from "@/components/AdminButton";
import { Footer } from "@/components/footer/Footer";
import { Header } from "@/components/Header";
import { NotFound } from "@/components/NotFound";
import { Schedule } from "@/components/Schedule";
import appCss from "../styles/styles.css?url";

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 1000 * 60 * 5, // 5 min default
			retry: 2,
		},
	},
});

const getLocation = createIsomorphicFn()
	.server(() => getRequestUrl())
	.client(() => new URL(window.location.href));

export const Route = createRootRoute({
	head: () => {
		const url = getLocation();
		const origin = url.origin;
		return {
			meta: [
				{
					charSet: "utf-8",
				},
				{
					name: "viewport",
					content: "width=device-width, initial-scale=1",
				},
				{
					name: "color-scheme",
					content: "dark",
				},
				{
					name: "theme-color",
					content: "#f3370e",
				},
				{
					title: "March Mad CSS",
				},
				{
					name: "description",
					content: "The Ultimate CSS Tournament. Brought to you by Syntax",
				},
				// Open Graph
				{
					property: "og:title",
					content: "March Mad CSS",
				},
				{
					property: "og:description",
					content: "The Ultimate CSS Tournament. Brought to you by Syntax",
				},
				{
					property: "og:image",
					content: `${origin}/og.jpg`,
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
					content: `${origin}/og.jpg`,
				},
				{
					name: "twitter:title",
					content: "March Mad CSS",
				},
				{
					name: "twitter:site",
					content: "@syntaxfm",
				},
				{
					name: "twitter:description",
					content: "The Ultimate CSS Tournament. Brought to you by Syntax",
				},
			],
			links: [
				{
					rel: "canonical",
					href: `https://madcss.com${url.pathname}`,
				},
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
		};
	},
	component: RootDocument,
	notFoundComponent: NotFound,
});

function RootDocument() {
	return (
		<html lang="en">
			<head>
				<HeadContent />
			</head>
			<body>
				<QueryClientProvider client={queryClient}>
					<Schedule />
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
