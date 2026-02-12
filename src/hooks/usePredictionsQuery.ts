import {
	type QueryClient,
	useMutation,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";

export type PredictionsData = {
	predictions: Record<string, string>;
};

async function fetchPredictions(): Promise<PredictionsData> {
	const response = await fetch("/api/predictions/");
	if (!response.ok) {
		throw new Error("Failed to fetch predictions");
	}
	const data = await response.json();

	// Convert array to record
	const predictions: Record<string, string> = {};
	for (const pred of data.predictions) {
		predictions[pred.gameId] = pred.predictedWinnerId;
	}

	return {
		predictions,
	};
}

async function savePredictionsApi(
	predictions: Record<string, string>,
): Promise<void> {
	const predictionsArray = Object.entries(predictions).map(
		([gameId, predictedWinnerId]) => ({
			gameId,
			predictedWinnerId,
		}),
	);

	const response = await fetch("/api/predictions/", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ predictions: predictionsArray }),
	});

	if (!response.ok) {
		const data = await response.json();
		throw new Error(data.error || "Failed to save predictions");
	}
}

export function predictionsQueryKey(userId: string | undefined) {
	return ["predictions", userId] as const;
}

export function usePredictionsQuery(userId: string | undefined) {
	return useQuery({
		queryKey: predictionsQueryKey(userId),
		queryFn: fetchPredictions,
		enabled: !!userId,
		staleTime: 1000 * 30,
	});
}

export function useSavePredictionsMutation(userId: string | undefined) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: savePredictionsApi,
		onSuccess: () => {
			if (userId) {
				queryClient.invalidateQueries({
					queryKey: predictionsQueryKey(userId),
				});
			}
		},
	});
}

// Helper to invalidate all predictions (used by admin)
export function invalidateAllPredictions(queryClient: QueryClient) {
	queryClient.invalidateQueries({ queryKey: ["predictions"] });
}
