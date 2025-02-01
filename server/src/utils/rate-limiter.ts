export class RateLimiter {
	private lastRequestTime: Map<string, number> = new Map()
	private requestCounts: Map<string, number> = new Map()

	constructor(
		private minInterval: number = 1000, // Default: 1 second between requests
		private maxRequestsPerInterval: number = 10, // Default: 10 requests per interval
		private intervalWindow: number = 60000, // Default: 1 minute window
	) {}

	async checkRateLimit(key: string): Promise<boolean> {
		const now = Date.now()
		const lastRequest = this.lastRequestTime.get(key) || 0
		const requestCount = this.requestCounts.get(key) || 0

		// クリーンアップ：古いリクエスト数をリセット
		if (now - lastRequest > this.intervalWindow) {
			this.requestCounts.set(key, 0)
		}

		// インターバルチェック
		if (now - lastRequest < this.minInterval) {
			return false
		}

		// レート制限チェック
		if (requestCount >= this.maxRequestsPerInterval) {
			return false
		}

		// カウンター更新
		this.lastRequestTime.set(key, now)
		this.requestCounts.set(key, requestCount + 1)

		return true
	}

	// 指定されたキーのレート制限情報をリセット
	reset(key: string): void {
		this.lastRequestTime.delete(key)
		this.requestCounts.delete(key)
	}

	// すべてのレート制限情報をリセット
	resetAll(): void {
		this.lastRequestTime.clear()
		this.requestCounts.clear()
	}

	// 残りのリクエスト数を取得
	getRemainingRequests(key: string): number {
		const count = this.requestCounts.get(key) || 0
		return Math.max(0, this.maxRequestsPerInterval - count)
	}

	// 次のリクエスト可能時刻までの待ち時間（ミリ秒）を取得
	getNextRequestDelay(key: string): number {
		const now = Date.now()
		const lastRequest = this.lastRequestTime.get(key) || 0
		const timeSinceLastRequest = now - lastRequest

		if (timeSinceLastRequest < this.minInterval) {
			return this.minInterval - timeSinceLastRequest
		}

		return 0
	}
}
