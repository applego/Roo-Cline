両方の情報と、これまでの議論を踏まえて、RooCode の Webview UI をブラウザで表示するための実装方法を詳細に説明します。

**目標**:

- VS Code 拡張機能の Webview UI を、開発中にブラウザで表示・確認できるようにする。
- VS Code 拡張機能としての機能は維持する。
- 将来的には、Web アプリケーションとしても動作できるように、拡張性と保守性を考慮した設計にする。

**方針**:

1.  **環境の分離**:
    - VS Code 拡張機能として動作する環境 (本番環境) と、ブラウザで動作する環境 (開発環境) を明確に区別します。
    - 設定ファイルやビルドスクリプトを、環境ごとに使い分けられるようにします。
2.  **VS Code API のモック**:
    - ブラウザ環境では、VS Code API (`vscode` オブジェクト) をモックします。
    - モックは、必要最低限の機能 (メッセージング、状態管理) をエミュレートします。
    - 将来的に Web アプリケーション化する際には、このモックを実際のバックエンドとの通信に置き換えることを想定します。
3.  **UI コンポーネントの互換性**:
    - `@vscode/webview-ui-toolkit` は、VS Code の Webview 環境に最適化されています。
    - ブラウザ環境では、スタイルの調整や、代替コンポーネントの検討を行います。
    - 長期的な視点では、より汎用的な UI ライブラリへの移行も視野に入れます。
4.  **ビルドツールの活用**:
    - Vite を開発環境のビルドツールとして使用します。
    - VS Code 拡張機能のビルドには、引き続き esbuild を使用します。
    - Vite の設定を調整し、ブラウザでの開発をサポートします。

**具体的な実装手順**:

1.  **プロジェクト構造の確認 (現状)**:

    ```
    roocode-extension/
    ├── webview-ui/
    │   ├── public/
    │   │   └── index.html
    │   ├── src/
    │   │   ├── components/
    │   │   ├── utils/
    │   │   │   └── vscode.ts  <-- VS Code API ラッパー
    │   │   ├── App.tsx
    │   │   ├── main.tsx
    │   │   └── ...
    │   ├── scripts/
    │   │    └── build-react-no-split.js <--本番用のビルドスクリプト
    │   ├── .env.development
    │   ├── .env.production
    │   ├── package.json
    │   ├── tsconfig.json
    │   └── vite.config.ts
    └── package.json (拡張機能全体)

    ```

2.  **VS Code API のモック作成**:

    - `webview-ui/src/mocks/` ディレクトリを作成します。
    - `webview-ui/src/mocks/vscode.ts` を作成し、以下の内容を記述します。

    ```typescript
    // webview-ui/src/mocks/vscode.ts

    export const vscode = {
    	postMessage: (message: any) => {
    		// 開発中はコンソールにログを出力するだけ
    		console.log("Received message from Webview:", message)

    		// 必要に応じて、モックのバックエンドにメッセージを送る
    		// (例: WebSocket を使う、fetch で API を叩くなど)
    	},
    	getState: () => {
    		// Local Storage から状態を読み込む (モック)
    		const state = localStorage.getItem("roocodeState")
    		return state ? JSON.parse(state) : {}
    	},
    	setState: (newState: any) => {
    		// Local Storage に状態を保存する (モック)
    		localStorage.setItem("roocodeState", JSON.stringify(newState))
    	},
    }

    // VS Code 環境では、本物の vscode オブジェクトを使う
    export const getVsCode = () => {
    	if (typeof acquireVsCodeApi !== "undefined") {
    		return acquireVsCodeApi()
    	}
    	return vscode
    }
    ```

- `webview-ui/src/utils/vscode.ts`を以下のように修正します。

    ```typescript
    // webview-ui/src/utils/vscode.ts

    import { getVsCode } from "../mocks/vscode"
    const vscode = getVsCode()
    export { vscode }
    ```

    - **解説**:
        - `postMessage`: ブラウザ環境では、`console.log` でメッセージを表示するだけにしています。必要に応じて、モックサーバーとの通信を実装します。
        - `getState`, `setState`: ブラウザの Local Storage を使って状態管理をエミュレートしています。
        - `getVsCode`関数を作成し、VSCode環境では`acquireVsCodeApi`から本物のVSCodeオブジェクトを取得し、それ以外の環境ではモックを返します。
        - `utils/vscode.ts`を修正し、`getVsCode`関数を使うことで、VSCode環境とブラウザ環境で同じファイルを利用しながら、VSCodeオブジェクトを使い分けます。

3.  **Vite 設定の変更 (vite.config.ts)**:

    ```typescript
    // webview-ui/vite.config.ts

    import { defineConfig } from "vite"
    import react from "@vitejs/plugin-react"
    import { fileURLToPath, URL } from "node:url"

    // https://vitejs.dev/config/
    export default defineConfig(({ command, mode }) => {
    	return {
    		plugins: [react()],
    		resolve: {
    			alias: {
    				"@": fileURLToPath(new URL("./src", import.meta.url)),
    			},
    		},
    		// 開発環境 (npm run dev) では、base を '/' にする
    		base: mode === "development" ? "/" : "./",
    		build: {
    			// ... (既存の設定)
    			rollupOptions: {
    				// ... (既存の設定)
    			},
    		},
    		server: {
    			port: 5173, // お好みのポート番号に変更してください
    			// HMR (Hot Module Replacement) 設定 (必要に応じて)
    			hmr: {
    				overlay: true,
    			},
    		},
    	}
    })
    ```

- `tsconfig.json`で`paths`が設定されている場合、`vite.config.ts`でも同じ`paths`を`resolve.alias`で設定します。

4.  **HTML エントリポイントの確認 (webview-ui/public/index.html)**:

    ```html
    <!-- webview-ui/public/index.html -->
    <!DOCTYPE html>
    <html lang="en">
    	<head>
    		<meta charset="UTF-8" />
    		<link rel="icon" type="image/svg+xml" href="/vite.svg" />
    		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
    		<title>RooCode Webview</title>
    	</head>
    	<body>
    		<div id="root"></div>
    		<!-- 開発時は、Vite が生成する main.tsx を読み込む -->
    		<script type="module" src="/src/main.tsx"></script>
    	</body>
    </html>
    ```

5.  **開発サーバーの起動**:

    - `webview-ui` ディレクトリで `npm run dev` を実行します。
    - ブラウザで `http://localhost:5173` (または指定したポート) にアクセスします。

6.  **型定義の修正とモックの削除**

    - `webview-ui/src/react-app-env.d.ts`から不要な参照を削除します。

    ```typescript
    // webview-ui/src/react-app-env.d.ts
    // このファイルは空、もしくは必要な型定義のみを記述する
    ```

    - `webview-ui/src/components/chat/__tests__/Announcement.spec.tsx`から`useTheme`のモックを削除します。

7.  **VS Code 拡張機能のビルド (本番)**:

    - VS Code 拡張機能としてビルドする際は、`webview-ui/scripts/build-react-no-split.js` を使用します。
    - このスクリプトは、`webview-ui/package.json` の `build:webview` スクリプトから呼び出されます。
    - `npm run package` を実行すると、VS Code 拡張機能のパッケージ (`.vsix` ファイル) が生成されます。

**補足と今後の拡張**:

- **UI Toolkit の扱い**:

    - `@vscode/webview-ui-toolkit` のコンポーネントは、VS Code のスタイル (CSS カスタムプロパティ) に依存しています。
    - ブラウザで表示する際、スタイルが崩れる可能性があります。
        - **応急処置**: 開発中は、ブラウザの開発者ツールでスタイルを確認し、必要に応じて `webview-ui/src/index.css` などで一時的なスタイル調整を行います。
        - **根本的な解決**:
            - VS Code のデザインガイドラインに従って、CSS を自作する。
            - より汎用的な UI ライブラリ (例: Material UI, Ant Design, Chakra UI) に置き換える。この場合、`webview-ui-toolkit` のコンポーネントを使っている部分を、新しいライブラリのコンポーネントに置き換える必要があります。

- **メッセージングの本格実装**:

    - 現状のモックでは、`postMessage` はコンソールにログを出力するだけです。
    - ブラウザとバックエンド (Node.js など) の間でリアルタイム通信を行うには、WebSocket (例: Socket.IO) を使うのが一般的です。
        - 開発用に簡単な WebSocket サーバーを立て、`postMessage` のモックからメッセージを送信するようにします。
        - Web アプリケーション化する際は、この WebSocket サーバーを、実際のアプリケーションロジックと連携させます。

- **状態管理**:

    - 現状のモックでは、Local Storage を使っています。
    - より堅牢な状態管理が必要な場合は、Redux, Zustand, Recoil などの状態管理ライブラリを導入することを検討します。

- **環境変数**:

    - `.env.development` と `.env.production` を使い分け、環境ごとの設定 (API エンドポイントなど) を管理します。
    - Vite は、`.env` ファイルの値を `import.meta.env` で参照できるようにします。

- **ビルド設定の整理**:
    - 現状`build:webview`と`dev:webview`で異なるビルド設定がされています。
    - `vite.config.ts`を環境変数やmodeを利用して、一つのファイルで開発時と本番時のビルド設定を使い分けるように変更しました。

この手順により、開発中はブラウザで Webview UI を確認でき、VS Code 拡張機能としてのビルドも維持できます。
