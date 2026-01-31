import { createContext, type ReactNode, useContext } from "react";
import {
	type UsePredictionsReturn,
	usePredictions,
} from "@/hooks/usePredictions";

const PredictionsContext = createContext<UsePredictionsReturn | null>(null);

export function PredictionsProvider({
	isAuthenticated,
	children,
}: {
	isAuthenticated: boolean;
	children: ReactNode;
}) {
	const predictions = usePredictions(isAuthenticated);
	return (
		<PredictionsContext.Provider value={predictions}>
			{children}
		</PredictionsContext.Provider>
	);
}

export function usePredictionsContext() {
	return useContext(PredictionsContext);
}
