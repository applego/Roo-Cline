import express from "express"
import { createServer } from "http"
import { WebSocketServer, WebSocket } from "ws"
import cors from "cors"
import { WebviewMessage, WebSocketResponse, RestResponse, ServerConfig } from "./src/types"

const config: ServerConfig = {
	port: Number(process.env.PORT) || 3002,
	corsOrigins: process.env.CORS_ORIGINS?.split(",") || ["http://localhost:3000"],
	maxReconnectAttempts: 5,
	reconnectDelay: 1000,
}

const app = express()
const server = createServer(app)
const wss = new WebSocketServer({ server })

// メッセージ保存用の配列
const messages: WebviewMessage[] = []
let lastMessageId = 0

// CORS設定
app.use(
	cors({
		origin: config.corsOrigins,
		methods: ["GET", "POST"],
	}),
)
app.use(express.json())

// REST API エンドポイント
app.post("/messages", (req, res) => {
	try {
		const message: WebviewMessage = {
			...req.body,
			id: ++lastMessageId,
			timestamp: new Date().toISOString(),
		}
		messages.push(message)

		// WebSocket接続中のクライアントにもブロードキャスト
		wss.clients.forEach((client) => {
			if (client.readyState === WebSocket.OPEN) {
				const response: WebSocketResponse = {
					success: true,
					data: message,
				}
				client.send(JSON.stringify(response))
			}
		})

		res.status(200).json({ success: true, data: message })
	} catch (error) {
		console.error("Error processing message:", error)
		res.status(500).json({
			success: false,
			error: error instanceof Error ? error.message : "Unknown error",
		})
	}
})

app.get("/messages", (req, res) => {
	try {
		const since = Number(req.query.since) || 0
		const newMessages = messages.filter((m) => (m.id || 0) > since)

		const response: RestResponse = {
			success: true,
			data: newMessages,
			lastId: lastMessageId,
		}

		res.json(response)
	} catch (error) {
		console.error("Error fetching messages:", error)
		res.status(500).json({
			success: false,
			error: error instanceof Error ? error.message : "Unknown error",
		})
	}
})

// WebSocketサーバーの設定
wss.on("connection", (ws: WebSocket) => {
	console.log("Client connected")

	// 接続時に最新のメッセージ一覧を送信
	const response: WebSocketResponse = {
		success: true,
		data: {
			type: "init",
			messages,
			lastId: lastMessageId,
		},
	}
	ws.send(JSON.stringify(response))

	ws.on("message", (data: Buffer) => {
		try {
			const message: WebviewMessage = JSON.parse(data.toString())
			message.id = ++lastMessageId
			message.timestamp = new Date().toISOString()
			messages.push(message)

			// 他のクライアントにブロードキャスト
			wss.clients.forEach((client) => {
				if (client !== ws && client.readyState === WebSocket.OPEN) {
					const response: WebSocketResponse = {
						success: true,
						data: message,
					}
					client.send(JSON.stringify(response))
				}
			})
		} catch (error) {
			console.error("Error processing WebSocket message:", error)
			const errorResponse: WebSocketResponse = {
				success: false,
				error: error instanceof Error ? error.message : "Unknown error",
			}
			ws.send(JSON.stringify(errorResponse))
		}
	})

	ws.on("error", (error) => {
		console.error("WebSocket error:", error)
	})

	ws.on("close", () => {
		console.log("Client disconnected")
	})
})

// エラーハンドリング
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
	console.error("Server error:", err)
	res.status(500).json({
		success: false,
		error: err.message || "Internal server error",
	})
})

// サーバー起動
server.listen(config.port, () => {
	console.log(`Server running on port ${config.port}`)
	console.log(`WebSocket server running on ws://localhost:${config.port}`)
	console.log(`REST API running on http://localhost:${config.port}`)
	console.log("CORS origins:", config.corsOrigins)
})

// グレースフルシャットダウン
process.on("SIGTERM", () => {
	console.log("SIGTERM received. Closing server...")
	server.close(() => {
		console.log("Server closed")
		process.exit(0)
	})
})
