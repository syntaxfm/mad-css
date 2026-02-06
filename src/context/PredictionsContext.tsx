import { createContext, type ReactNode, use } from "react";
import {
	type UsePredictionsReturn,
	usePredictions,
} from "@/hooks/usePredictions";

const PredictionsContext = createContext<UsePredictionsReturn | null>(null);

export function PredictionsProvider({
	isAuthenticated,
	userId,
	children,
}: {
	isAuthenticated: boolean;
	userId?: string;
	children: ReactNode;
}) {
	const predictions = usePredictions(isAuthenticated, userId);
	return (
		<PredictionsContext.Provider value={predictions}>
			{children}
		</PredictionsContext.Provider>
	);
}

export function usePredictionsContext() {
	return use(PredictionsContext);
}
