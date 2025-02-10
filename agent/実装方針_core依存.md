# RooCode Core依存アーキテクチャ実装方針

## 基本方針

既存のVSCode拡張機能の機能を保持しながら、Webアプリケーションとしても動作可能な構造にリファクタリングを行う。
コアロジックを共通化し、プラットフォーム固有の実装を分離する。

## アーキテクチャ設計

```
roocode/
├── core/                     # プラットフォーム共通のコアロジック
│   ├── chat/                # チャット関連の共通機能
│   │   ├── types.ts        # 共通の型定義
│   │   ├── messages.ts     # メッセージング処理
│   │   └── state.ts        # 状態管理
│   ├── mcp/                 # MCPサーバー連携の共通インターフェース
│   │   ├── types.ts        # MCP関連の型定義
│   │   └── client.ts       # MCPクライアント基本実装
│   └── browser/            # ブラウザ操作の共通インターフェース
│       ├── types.ts        # ブラウザ操作の型定義
│       └── commands.ts     # ブラウザコマンド
│
├── platforms/               # プラットフォーム固有の実装
│   ├── vscode/             # VSCode拡張向け実装
│   │   ├── adapter.ts      # VSCode APIアダプター
│   │   └── extensions/     # VSCode固有の拡張機能
│   └── web/                # Webアプリケーション向け実装
│       ├── adapter.ts      # Web APIアダプター
│       └── services/       # Web固有のサービス
│
└── ui/                     # UIコンポーネント
    ├── components/         # 共通コンポーネント
    │   └── chat/          # チャットUI
    └── themes/            # テーマ設定
```

## 実装方針

### 1. コアロジックの分離

- チャット処理、MCPサーバー連携、ブラウザ操作などの基本機能をコアロジックとして分離
- プラットフォームに依存しないインターフェースを定義
- 型定義を共通化し、強力な型安全性を確保

### 2. アダプターパターンの適用

```typescript
// core/chat/types.ts
interface ChatCore {
	sendMessage(content: string): Promise<void>
	receiveMessage(handler: MessageHandler): void
	// その他の共通インターフェース
}

// platforms/vscode/adapter.ts
class VSCodeChatAdapter implements ChatCore {
	sendMessage(content: string) {
		// VSCode固有の実装
	}
}

// platforms/web/adapter.ts
class WebChatAdapter implements ChatCore {
	sendMessage(content: string) {
		// Web固有の実装
	}
}
```

### 3. MCPサーバー連携

- MCPサーバーとの通信を抽象化
- プラットフォームごとに適切な通信方式を実装
- WebSocket、HTTP、またはVSCode MessagePassingを使用

```typescript
// core/mcp/types.ts
interface MCPClient {
	connect(): Promise<void>
	execute(command: string, params: any): Promise<any>
}

// Implementations for each platform
class VSCodeMCPClient implements MCPClient {
	// VSCode固有のMCP実装
}

class WebMCPClient implements MCPClient {
	// Web向けのMCP実装（WebSocket使用）
}
```

### 4. ブラウザ操作

- ブラウザ操作をインターフェースとして定義
- VSCodeとWeb環境で同じインターフェースを実装

```typescript
// core/browser/types.ts
interface BrowserOperations {
	open(url: string): Promise<void>
	executeScript(script: string): Promise<any>
	// その他のブラウザ操作
}
```

### 5. 状態管理

- プラットフォーム共通の状態管理システムを実装
- VSCode State APIとWeb LocalStorageを抽象化

```typescript
// core/state/types.ts
interface StateManager {
	get(key: string): any
	set(key: string, value: any): void
	subscribe(handler: StateChangeHandler): void
}
```

## マイグレーション計画

1. コアロジックの抽出

    - 既存コードからプラットフォーム依存しない部分を特定
    - 共通インターフェースを定義
    - テストを整備

2. プラットフォーム別実装

    - VSCode拡張の既存機能をアダプターとして実装
    - Web向けの新規アダプターを実装
    - 各プラットフォームでのテスト

3. UIコンポーネントの更新

    - プラットフォーム依存のないUIコンポーネントに更新
    - テーマシステムの統合
    - アクセシビリティの確保

4. ビルドシステムの整備
    - マルチプラットフォーム対応のビルド設定
    - 開発環境の整備
    - CI/CDパイプラインの更新

## 注意点

1. 後方互換性の維持

    - VSCode拡張の既存機能は維持
    - 既存のAPIは非推奨化して段階的に移行

2. パフォーマンス最適化

    - プラットフォームごとの最適化
    - バンドルサイズの管理

3. エラーハンドリング
    - プラットフォーム固有のエラー処理
    - ユーザーへの適切なフィードバック

## 今後の展開

1. プラグインシステム

    - コアロジックを拡張可能に
    - サードパーティ開発のサポート

2. オフライン対応

    - PWA対応
    - ローカルでの機能維持

3. セキュリティ強化
    - クロスプラットフォームでのセキュリティ確保
    - 認証・認可の統合
