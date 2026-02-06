import {
	type QueryClient,
	useMutation,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";

export type PredictionsData = {
	predictions: Record<string, string>;
	isLocked: boolean;
	lockedAt: string | null;
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
		isLocked: data.isLocked,
		lockedAt: data.lockedAt,
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

async function lockBracketApi(): Promise<{ lockedAt: string }> {
	const response = await fetch("/api/predictions/lock", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
	});

	if (!response.ok) {
		const data = await response.json();
		throw new Error(data.error || "Failed to lock bracket");
	}

	return response.json();
}

export function predictionsQueryKey(userId: string | undefined) {
	return ["predictions", userId] as const;
}

export function usePredictionsQuery(userId: string | undefined) {
	return useQuery({
		queryKey: predictionsQueryKey(userId),
		queryFn: fetchPredictions,
		enabled: !!userId,
		staleTime: (query) => {
			// If locked, cache for 1 hour (only admin unlock invalidates)
			// If unlocked, cache for 30 seconds
			return query.state.data?.isLocked ? 1000 * 60 * 60 : 1000 * 30;
		},
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

export function useLockBracketMutation(userId: string | undefined) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: lockBracketApi,
		onSuccess: () => {
			if (userId) {
				queryClient.invalidateQueries({
					queryKey: predictionsQueryKey(userId),
				});
			}
		},
	});
}

// Helper to invalidate all predictions (used by admin unlock)
export function invalidateAllPredictions(queryClient: QueryClient) {
	queryClient.invalidateQueries({ queryKey: ["predictions"] });
}
