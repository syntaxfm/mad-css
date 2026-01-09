import { TanStackDevtools } from "@tanstack/react-devtools";
import {
	ClientOnly,
	createRootRoute,
	HeadContent,
	Outlet,
	Scripts,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { Header } from "@/components/Header";
import appCss from "../styles/styles.css?url";

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
				title: "Mad CSS - The Ultimate CSS Tournament",
			},
		],
		links: [
			{
				rel: "stylesheet",
				href: appCss,
			},
		],
	}),

	shellComponent: RootDocument,
	component: RootLayout,
	notFoundComponent: NotFound,
});

function RootLayout() {
	return (
		<>
			<Header />
			<Outlet />
			<ClientOnly fallback={null}>
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
			</ClientOnly>
		</>
	);
}

function NotFound() {
	return (
		<div style={{ padding: "2rem", textAlign: "center" }}>
			<h1>404 - Page Not Found</h1>
			<p>The page you're looking for doesn't exist.</p>
		</div>
	);
}

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<head>
				<HeadContent />
			</head>
			<body>
				{children}
				<Scripts />
			</body>
		</html>
	);
}
