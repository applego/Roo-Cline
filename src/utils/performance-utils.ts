// 処理のキャッシュ用インターフェース
interface CacheEntry<T> {
	value: T
	timestamp: number
	ttl: number
}

// キャッシュマネージャー
export class CacheManager<T> {
	private cache: Map<string, CacheEntry<T>> = new Map()

	constructor(private defaultTTL: number = 5 * 60 * 1000) {} // デフォルトTTL: 5分

	public set(key: string, value: T, ttl: number = this.defaultTTL): void {
		this.cache.set(key, {
			value,
			timestamp: Date.now(),
			ttl,
		})
	}

	public get(key: string): T | null {
		const entry = this.cache.get(key)
		if (!entry) return null

		if (Date.now() - entry.timestamp > entry.ttl) {
			this.cache.delete(key)
			return null
		}

		return entry.value
	}

	public clear(): void {
		this.cache.clear()
	}
}

// 処理のスロットリング
export function throttle<T extends (...args: any[]) => any>(
	func: T,
	limit: number,
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
	let inThrottle: boolean = false
	let lastResult: ReturnType<T>

	return async (...args: Parameters<T>): Promise<ReturnType<T>> => {
		if (!inThrottle) {
			inThrottle = true
			lastResult = await func(...args)
			setTimeout(() => (inThrottle = false), limit)
		}
		return lastResult
	}
}

// バッファサイズの最適化
export function optimizeBuffer(buffer: ArrayBuffer, maxSize: number = 10 * 1024 * 1024): ArrayBuffer {
	if (buffer.byteLength <= maxSize) return buffer

	// バッファを分割して処理
	const chunks: ArrayBuffer[] = []
	const view = new Uint8Array(buffer)
	for (let i = 0; i < buffer.byteLength; i += maxSize) {
		chunks.push(view.slice(i, i + maxSize).buffer)
	}

	return chunks[0] // 最初のチャンクのみを返す（必要に応じて他のチャンクも処理可能）
}
