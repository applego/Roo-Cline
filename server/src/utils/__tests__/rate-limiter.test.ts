import { RateLimiter } from "../rate-limiter.js"

describe("RateLimiter", () => {
	let rateLimiter: RateLimiter

	beforeEach(() => {
		rateLimiter = new RateLimiter(2, 1000) // 2 requests per 1 second
	})

	it("should allow requests within the limit", async () => {
		expect(await rateLimiter.checkRateLimit("user1")).toBe(true)
		expect(await rateLimiter.checkRateLimit("user1")).toBe(true)
	})

	it("should reject requests exceeding the limit", async () => {
		expect(await rateLimiter.checkRateLimit("user1")).toBe(true)
		expect(await rateLimiter.checkRateLimit("user1")).toBe(true)
		expect(await rateLimiter.checkRateLimit("user1")).toBe(false) // Exceeds the limit
	})

	it("should allow requests after the time window", async () => {
		expect(await rateLimiter.checkRateLimit("user1")).toBe(true)
		expect(await rateLimiter.checkRateLimit("user1")).toBe(true)

		// Wait for the time window to pass
		await new Promise((resolve) => setTimeout(resolve, 1000))

		expect(await rateLimiter.checkRateLimit("user1")).toBe(true) // Allowed after the time window
	})
})
