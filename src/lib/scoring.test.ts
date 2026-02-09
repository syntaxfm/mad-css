import { describe, expect, it } from "vitest";
import { calculateScoresForUser } from "./scoring";

describe("calculateScoresForUser", () => {
	it("returns zero scores when no predictions match", () => {
		const predictions = [{ gameId: "r1-0", predictedWinnerId: "player-a" }];
		const results = [{ gameId: "r1-0", winnerId: "player-b" }];

		const scores = calculateScoresForUser(predictions, results);

		expect(scores).toEqual({
			round1Score: 0,
			round2Score: 0,
			round3Score: 0,
			round4Score: 0,
			totalScore: 0,
		});
	});

	it("returns zero scores when no results exist", () => {
		const predictions = [{ gameId: "r1-0", predictedWinnerId: "player-a" }];
		const results: Array<{ gameId: string; winnerId: string }> = [];

		const scores = calculateScoresForUser(predictions, results);

		expect(scores).toEqual({
			round1Score: 0,
			round2Score: 0,
			round3Score: 0,
			round4Score: 0,
			totalScore: 0,
		});
	});

	it("awards 10 points for correct round 1 pick", () => {
		const predictions = [{ gameId: "r1-0", predictedWinnerId: "player-a" }];
		const results = [{ gameId: "r1-0", winnerId: "player-a" }];

		const scores = calculateScoresForUser(predictions, results);

		expect(scores.round1Score).toBe(10);
		expect(scores.totalScore).toBe(10);
	});

	it("awards 20 points for correct quarterfinal pick", () => {
		const predictions = [{ gameId: "qf-0", predictedWinnerId: "player-a" }];
		const results = [{ gameId: "qf-0", winnerId: "player-a" }];

		const scores = calculateScoresForUser(predictions, results);

		expect(scores.round2Score).toBe(20);
		expect(scores.totalScore).toBe(20);
	});

	it("awards 40 points for correct semifinal pick", () => {
		const predictions = [{ gameId: "sf-0", predictedWinnerId: "player-a" }];
		const results = [{ gameId: "sf-0", winnerId: "player-a" }];

		const scores = calculateScoresForUser(predictions, results);

		expect(scores.round3Score).toBe(40);
		expect(scores.totalScore).toBe(40);
	});

	it("awards 80 points for correct final pick", () => {
		const predictions = [{ gameId: "final", predictedWinnerId: "player-a" }];
		const results = [{ gameId: "final", winnerId: "player-a" }];

		const scores = calculateScoresForUser(predictions, results);

		expect(scores.round4Score).toBe(80);
		expect(scores.totalScore).toBe(80);
	});

	it("calculates total score across all rounds", () => {
		const predictions = [
			{ gameId: "r1-0", predictedWinnerId: "player-a" },
			{ gameId: "r1-1", predictedWinnerId: "player-b" },
			{ gameId: "qf-0", predictedWinnerId: "player-a" },
			{ gameId: "sf-0", predictedWinnerId: "player-a" },
			{ gameId: "final", predictedWinnerId: "player-a" },
		];
		const results = [
			{ gameId: "r1-0", winnerId: "player-a" },
			{ gameId: "r1-1", winnerId: "player-b" },
			{ gameId: "qf-0", winnerId: "player-a" },
			{ gameId: "sf-0", winnerId: "player-a" },
			{ gameId: "final", winnerId: "player-a" },
		];

		const scores = calculateScoresForUser(predictions, results);

		expect(scores.round1Score).toBe(20); // 2 correct R1 picks
		expect(scores.round2Score).toBe(20); // 1 correct QF pick
		expect(scores.round3Score).toBe(40); // 1 correct SF pick
		expect(scores.round4Score).toBe(80); // 1 correct final pick
		expect(scores.totalScore).toBe(160);
	});

	it("ignores predictions for games without results", () => {
		const predictions = [
			{ gameId: "r1-0", predictedWinnerId: "player-a" },
			{ gameId: "qf-0", predictedWinnerId: "player-a" },
		];
		const results = [
			{ gameId: "r1-0", winnerId: "player-a" },
			// qf-0 has no result yet
		];

		const scores = calculateScoresForUser(predictions, results);

		expect(scores.round1Score).toBe(10);
		expect(scores.round2Score).toBe(0);
		expect(scores.totalScore).toBe(10);
	});
});
