import { describe, expect, it } from "vitest";
import { getPickablePlayersForGame } from "./usePredictions";

describe("getPickablePlayersForGame", () => {
	describe("round 1 games", () => {
		it("returns fixed players for r1-0", () => {
			const predictions = {};
			const [p1, p2] = getPickablePlayersForGame("r1-0", predictions);

			expect(p1).toBe("jason-lengstorf");
			expect(p2).toBe("kyle-cook");
		});

		it("returns fixed players regardless of predictions", () => {
			const predictions = { "r1-0": "jason-lengstorf" };
			const [p1, p2] = getPickablePlayersForGame("r1-0", predictions);

			expect(p1).toBe("jason-lengstorf");
			expect(p2).toBe("kyle-cook");
		});
	});

	describe("quarterfinal games", () => {
		it("returns undefined when source games have no predictions", () => {
			const predictions = {};
			const [p1, p2] = getPickablePlayersForGame("qf-0", predictions);

			expect(p1).toBeUndefined();
			expect(p2).toBeUndefined();
		});

		it("returns player from r1-0 winner as p1", () => {
			const predictions = { "r1-0": "jason-lengstorf" };
			const [p1, p2] = getPickablePlayersForGame("qf-0", predictions);

			expect(p1).toBe("jason-lengstorf");
			expect(p2).toBeUndefined();
		});

		it("returns player from r1-1 winner as p2", () => {
			const predictions = { "r1-1": "adam-wathan" };
			const [p1, p2] = getPickablePlayersForGame("qf-0", predictions);

			expect(p1).toBeUndefined();
			expect(p2).toBe("adam-wathan");
		});

		it("returns both players when both source games have predictions", () => {
			const predictions = {
				"r1-0": "jason-lengstorf",
				"r1-1": "adam-wathan",
			};
			const [p1, p2] = getPickablePlayersForGame("qf-0", predictions);

			expect(p1).toBe("jason-lengstorf");
			expect(p2).toBe("adam-wathan");
		});
	});

	describe("semifinal games", () => {
		it("returns winners from quarterfinals", () => {
			const predictions = {
				"r1-0": "jason-lengstorf",
				"r1-1": "adam-wathan",
				"r1-2": "chris-coyier",
				"r1-3": "scott-tolinski",
				"qf-0": "jason-lengstorf",
				"qf-1": "chris-coyier",
			};
			const [p1, p2] = getPickablePlayersForGame("sf-0", predictions);

			expect(p1).toBe("jason-lengstorf");
			expect(p2).toBe("chris-coyier");
		});
	});

	describe("final game", () => {
		it("returns winners from semifinals", () => {
			const predictions = {
				"sf-0": "jason-lengstorf",
				"sf-1": "kevin-powell",
			};
			const [p1, p2] = getPickablePlayersForGame("final", predictions);

			expect(p1).toBe("jason-lengstorf");
			expect(p2).toBe("kevin-powell");
		});
	});

	describe("invalid game IDs", () => {
		it("returns undefined for unknown game ID", () => {
			const predictions = {};
			const [p1, p2] = getPickablePlayersForGame("invalid-game", predictions);

			expect(p1).toBeUndefined();
			expect(p2).toBeUndefined();
		});
	});
});
