import { RateLimiter } from "../rate-limiter"

describe("RateLimiter", () => {
	let rateLimiter: RateLimiter

	beforeEach(() => {
		jest.useFakeTimers()
		rateLimiter = new RateLimiter(100, 3, 1000) // 100ms interval, 3 requests per 1s window
	})

	afterEach(() => {
		jest.useRealTimers()
	})

	it("should allow requests within rate limits", async () => {
		const result1 = await rateLimiter.checkRateLimit("test-key")
		expect(result1).toBe(true)

		jest.advanceTimersByTime(100)
		const result2 = await rateLimiter.checkRateLimit("test-key")
		expect(result2).toBe(true)

		jest.advanceTimersByTime(100)
		const result3 = await rateLimiter.checkRateLimit("test-key")
		expect(result3).toBe(true)
	})

	it("should block requests exceeding rate limits", async () => {
		// First 3 requests should be allowed
		expect(await rateLimiter.checkRateLimit("test-key")).toBe(true)
		jest.advanceTimersByTime(100)
		expect(await rateLimiter.checkRateLimit("test-key")).toBe(true)
		jest.advanceTimersByTime(100)
		expect(await rateLimiter.checkRateLimit("test-key")).toBe(true)

		// 4th request should be blocked
		jest.advanceTimersByTime(100)
		expect(await rateLimiter.checkRateLimit("test-key")).toBe(false)
	})

	it("should block requests within minimum interval", async () => {
		expect(await rateLimiter.checkRateLimit("test-key")).toBe(true)

		// Request before minimum interval
		jest.advanceTimersByTime(50)
		expect(await rateLimiter.checkRateLimit("test-key")).toBe(false)

		// Request after minimum interval
		jest.advanceTimersByTime(50)
		expect(await rateLimiter.checkRateLimit("test-key")).toBe(true)
	})

	it("should reset rate limits correctly", async () => {
		expect(await rateLimiter.checkRateLimit("test-key")).toBe(true)
		jest.advanceTimersByTime(100)
		expect(await rateLimiter.checkRateLimit("test-key")).toBe(true)

		rateLimiter.reset("test-key")

		// Should be able to make 3 more requests
		expect(await rateLimiter.checkRateLimit("test-key")).toBe(true)
		jest.advanceTimersByTime(100)
		expect(await rateLimiter.checkRateLimit("test-key")).toBe(true)
		jest.advanceTimersByTime(100)
		expect(await rateLimiter.checkRateLimit("test-key")).toBe(true)
	})

	it("should handle multiple keys independently", async () => {
		expect(await rateLimiter.checkRateLimit("key1")).toBe(true)
		expect(await rateLimiter.checkRateLimit("key2")).toBe(true)

		jest.advanceTimersByTime(100)
		expect(await rateLimiter.checkRateLimit("key1")).toBe(true)
		expect(await rateLimiter.checkRateLimit("key2")).toBe(true)

		jest.advanceTimersByTime(100)
		expect(await rateLimiter.checkRateLimit("key1")).toBe(true)
		expect(await rateLimiter.checkRateLimit("key2")).toBe(true)

		// 4th request for key1 should be blocked, but key2 should still work
		jest.advanceTimersByTime(100)
		expect(await rateLimiter.checkRateLimit("key1")).toBe(false)
		expect(await rateLimiter.checkRateLimit("key2")).toBe(true)
	})

	it("should reset counters after interval window", async () => {
		expect(await rateLimiter.checkRateLimit("test-key")).toBe(true)
		jest.advanceTimersByTime(100)
		expect(await rateLimiter.checkRateLimit("test-key")).toBe(true)
		jest.advanceTimersByTime(100)
		expect(await rateLimiter.checkRateLimit("test-key")).toBe(true)

		// Wait for interval window to pass
		jest.advanceTimersByTime(1000)

		// Should be able to make 3 more requests
		expect(await rateLimiter.checkRateLimit("test-key")).toBe(true)
		jest.advanceTimersByTime(100)
		expect(await rateLimiter.checkRateLimit("test-key")).toBe(true)
		jest.advanceTimersByTime(100)
		expect(await rateLimiter.checkRateLimit("test-key")).toBe(true)
	})

	it("should return correct remaining requests", async () => {
		expect(rateLimiter.getRemainingRequests("test-key")).toBe(3)

		await rateLimiter.checkRateLimit("test-key")
		expect(rateLimiter.getRemainingRequests("test-key")).toBe(2)

		jest.advanceTimersByTime(100)
		await rateLimiter.checkRateLimit("test-key")
		expect(rateLimiter.getRemainingRequests("test-key")).toBe(1)

		jest.advanceTimersByTime(100)
		await rateLimiter.checkRateLimit("test-key")
		expect(rateLimiter.getRemainingRequests("test-key")).toBe(0)
	})

	it("should calculate next request delay correctly", async () => {
		await rateLimiter.checkRateLimit("test-key")

		// Should need to wait full interval
		expect(rateLimiter.getNextRequestDelay("test-key")).toBe(100)

		// After half interval
		jest.advanceTimersByTime(50)
		expect(rateLimiter.getNextRequestDelay("test-key")).toBe(50)

		// After full interval
		jest.advanceTimersByTime(50)
		expect(rateLimiter.getNextRequestDelay("test-key")).toBe(0)
	})
})
