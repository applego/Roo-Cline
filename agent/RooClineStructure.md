[Roo-Cline プロジェクト構造の詳細解説](https://zenn.dev/sunwood_ai_labs/articles/roo-cline-project-structure)

Roo-Cline プロジェクト構造の詳細解説
2025/01/19に公開

自動化

Roo-Cline

vscode拡張

llmapi

tech
はじめに
Roo-Cline プロジェクトは、VS Code 拡張機能として動作する自律的なコーディングエージェントの基盤となる複雑なシステムです。ソフトウェア開発プロセスを自動化し、開発者がより創造的で戦略的なタスクに注力できるよう支援することを目的としています。

本稿では、Roo-Cline プロジェクトのディレクトリ構成と役割、さらにはエージェントがどのように動作するのかを解説します。ぜひご参照いただき、コードベースを深く理解するためにお役立てください。

プロジェクトの全体構造
Roo-Cline は、拡張機能のコアロジック（エージェントのビジネスロジック）、外部 API とのインターフェース、ユーザーインターフェース（webview UI）、そして設定管理など、それぞれが独立したモジュールとして組織化されています。このモジュール化により、保守性と拡張性が高まり、新たな機能追加や変更が容易に行える設計となっています。

src/ ディレクトリ
src/api/
さまざまな大規模言語モデル（LLM）API と通信するためのコードが置かれています。ここでは、Anthropic、OpenAI、AWS Bedrock、Google Gemini など多様な LLM プロバイダに対応します。

src/api/providers/
個別の LLM プロバイダとやり取りするためのファイルを配置しています。API 呼び出しの認証やレスポンスの解析、データ変換、エラー処理など、それぞれのプロバイダに固有の実装が含まれます。
src/api/transform/
プロンプトを特定の API フォーマットに整形したり、ストリーミング API からのレスポンスを Roo-Cline 内で扱いやすい形式に変換するための機能を提供します。
src/api/index.ts
apiProvider 設定に基づき適切な API ハンドラを初期化し、エージェントから利用できるようにするエントリーポイントです。
src/core/
拡張機能の中核となるビジネスロジックが格納されています。

src/core/assistant-message/
LLM から返されるアシスタントメッセージを解析し、テキストやツール呼び出しなどのコンテンツを抽出する機能を提供します。
src/core/config/
API キーやモデル ID、ユーザー設定など拡張機能の設定を管理します。ConfigManager.ts に設定の永続化ロジックが含まれます。
src/core/diff/
コードへの変更を適用するための diff アルゴリズムを実装しています。UnifiedDiffStrategy や SearchReplaceDiffStrategy といったクラスを通じてモデルの特性に合わせたアプローチで diff を適用します。
src/core/mentions/
@メンション（ファイルパスや URL、特定のキーワードなど）を解析・認識する機能があります。 index.ts でメンション解析を行い、vsCodeSelectorUtils.ts でメンションの構造を定義します。
src/core/prompts/
LLM に送信するシステムプロンプトを生成・管理するモジュールです。
src/core/prompts/system.ts
デフォルトのプロンプト構造およびタスク・ルール・ツール使用ガイダンスなど各セクションを定義します。
architect.ts, ask.ts, code.ts
それぞれ異なるモード（アーキテクトモード、アスクモード、コーディングモードなど）のシステムプロンプトを定義します。
src/core/prompts/sections/
プロンプトの各セクション（機能、目的、ルールなど）を個別に管理しています。
src/core/sliding-window/
長時間の会話を扱う際のコンテキストウィンドウを管理する仕組みを提供します。プロンプトが長くなりすぎた場合、会話の一部を自動的に省略するなどの処理を行います。
src/core/webview/
VS Code 拡張機能と webview UI 間の通信や状態管理を制御します。ClineProvider.ts に通信機能が実装されています。
src/core/Cline.ts
Roo-Cline の中核クラスで、タスクのライフサイクル管理、LLM との対話、ツール呼び出し、メッセージ履歴の管理などを担います。
src/exports/
他の拡張機能から Roo-Cline を利用できるようにするためのエクスポートを管理します。index.ts で API を公開し、cline.d.ts で型定義を行っています。

src/integrations/
VS Code のさまざまな機能や外部サービスとの統合ロジックをまとめています。

src/integrations/diagnostics/
VS Code エディタの診断情報（エラーや警告など）を監視し、変更を検出して表示用の文字列に変換します。
src/integrations/editor/
テキストエディタ機能と連携し、diff の適用や省略箇所の検出などを実装します。DiffViewProvider.ts は diff の取得と更新を、detect-omission.ts は生成コードの省略を検出します。
src/integrations/misc/
チャットログの Markdown 形式でのエクスポートやファイル読み取り、画像処理など多岐にわたる処理を提供します。
src/integrations/terminal/
VS Code のターミナル機能と連携し、コマンド実行や出力管理を行います。TerminalManager.ts でターミナルインスタンス全体を管理し、TerminalProcess.ts で各プロセスの制御を行います。
src/services/
エージェントのコア機能をサポートするサービス群です。

src/services/browser/
Puppeteer を使ったヘッドレスブラウザの起動・操作、スクリーンショットの取得などを行います。
src/services/glob/
globby を用いてファイルパターンに一致するファイルを一覧取得するためのロジックがあります。
src/services/mcp/
Model Context Protocol (MCP) サーバーとの通信・管理を行います。
src/services/ripgrep/
ripgrep コマンドラインツールを用いて、テキスト検索を実行します。
src/services/tree-sitter/
tree-sitter を利用してコード構造を解析し、関数やクラス定義の抽出を行います。
src/shared/
プロジェクト全体で使用される型やインターフェース、定数などをまとめたディレクトリです。

api.ts、array.ts、ExtensionMessage.ts など、API の共通インターフェースや配列操作のユーティリティ、webview と拡張機能間通信のインターフェース定義など、汎用的な機能が用意されています。
src/utils/
拡張機能全体で再利用される各種ユーティリティ関数をまとめています。

src/utils/cost.ts
API のトークンコストを算出するロジック
src/utils/fs.ts
ファイルシステムの操作（存在確認やディレクトリ作成など）
src/utils/git.ts
Git リポジトリからコミット情報を取得する関数
src/utils/textMateToHljs.ts
VS Code の TextMate テーマを highlight.js 形式へ変換する機能
ほか、API 設定の検証やパス文字列の正規化などの機能も含まれます。
src/test/
拡張機能に対する単体テストや統合テストを配置しています。

src/**mocks**/
単体テストで使用するモックファイル（VS Code モジュールなど）を配置しています。

src/extension.ts
拡張機能のメインエントリーポイントです。VS Code が拡張機能を有効化する際に呼び出され、コマンドの登録や webview UI の管理を行います。

webview-ui/ ディレクトリ
React ベースで構築された拡張機能の UI（webview）が格納されています。

webview-ui/public/
index.html など、React アプリの静的アセットを配置します。

webview-ui/src/
React アプリケーションの実装ファイルが含まれています。

webview-ui/src/components/
チャットや設定画面など、複数のカテゴリーに分かれたコンポーネント群です。
chat/
ChatView.tsx、ChatTextArea.tsx、AutoApproveMenu.tsx など、チャットインターフェイスに関連するコンポーネント。
common/
コードブロック表示、Markdown レンダリングなどの汎用コンポーネント。
history/
チャットやタスクの履歴を表示するためのコンポーネント。
mcp/
MCP サーバーのツール管理や状態を可視化するコンポーネント。
prompts/
プロンプトやモード設定を扱うコンポーネント。
settings/
API 設定などを行う画面（SettingsView.tsx）や関連コンポーネントを含む。
welcome/
初回利用時に表示されるウェルカム画面を実装。
webview-ui/src/context/
React の Context API を使用して拡張機能の状態をグローバルに管理する仕組みです。
webview-ui/src/services/
webview 内で使用するサービスクラス（GitService.ts など）を定義しています。
webview-ui/src/utils/
コマンドのバリデーションや文字列の整形、ハイライト用の関数など、さまざまなユーティリティ機能を提供します。
webview-ui/src/index.tsx
React アプリケーションのエントリーポイントです。
webview-ui/scripts/build-react-no-split.js
VS Code の webview に組み込みやすくするため、React アプリを単一の JS/CSS ファイルにビルドするカスタムスクリプト。

webview-ui/tsconfig.json
React アプリ用の TypeScript コンパイラ設定ファイル。

webview-ui/public/index.html
React アプリのメイン HTML ファイル。

webview-ui/src/react-app-env.d.ts
React 固有の型定義。

webview-ui/src/reportWebVitals.ts
アプリのパフォーマンス測定に関する設定を管理します。

webview-ui/src/setupTests.ts
テスト環境をセットアップするためのファイル。

ルートレベルのファイル
プロジェクトの動作や開発に必要な構成ファイルがルートディレクトリにまとめられています。

.clinerules
拡張機能のカスタムルールを記述するファイル。
.eslintrc.json
ESLint の設定ファイル。
.npmrc, .nvmrc, .prettierignore, .prettierrc.json
npm レジストリや Node バージョン、コードフォーマッタなどの設定ファイル。
.vscodeignore
拡張機能のパッケージ化時に除外するファイルを指定します。
CHANGELOG.md
バージョンごとの変更点を記述するファイル。
ellipsis.yaml
Ellipsis コードレビューツールの設定ファイル。
esbuild.js
esbuild を使用して拡張機能をビルドするスクリプト。
jest.config.js
Jest テストランナーの設定ファイル。
package.json
npm 依存関係やスクリプトを定義する主要ファイル。
README.md
プロジェクトの概要や使い方をまとめたメインドキュメント。
tsconfig.json
TypeScript コンパイラの設定ファイル。
src/.changeset/, src/.husky/, src/.vscode/
Changeset、Husky、VS Code の各種設定やフックスクリプトを管理します。
webview-ui/.npmrc, webview-ui/config-overrides.js, webview-ui/package.json
webview-ui フォルダ側の npm 設定やスクリプトなどの構成ファイル。
Roo-Cline エージェントのワークフロー
Roo-Cline エージェントは以下のステップを繰り返しながら自律的に動作し、タスクの完了を目指します。あわせて、主要ファイルの役割も示します。

タスクの初期化

ユーザーが新規タスクを送信、または過去のタスクを再開するとき、src/core/Cline.ts クラスがインスタンス化され、エージェントのライフサイクルがスタートします。
テキストや画像などの入力データを構造化形式に変換して保持し、src/core/mentions/index.ts でメンション（ファイル、URL、課題など）を解析します。
プロジェクトのファイル構造や Git の状態、ターミナル出力などのタスクに関連するコンテキスト情報を、src/services/glob/list-files.ts や src/services/ripgrep/index.ts、src/services/tree-sitter/index.ts などから収集します。
LLM との対話

選択された API プロバイダに応じて、src/api/index.ts が適切なハンドラを初期化します。
プロンプトは src/core/prompts/system.ts や architect.ts、ask.ts、code.ts などから組み立てられ、タスクやコンテキストに応じて変化します。
作成されたプロンプトが src/api/providers/\*.ts に渡され、LLM API に送信されます。
LLM からのレスポンス（テキストやツール呼び出しなど）は、src/api/transform/stream.ts の ApiStream を使ってストリーミング処理されます。
ツールの実行

LLM がツール呼び出しを指示した場合、src/core/Cline.ts が該当ツールの実行を管理します。
ツール呼び出しが妥当かどうかは、src/core/mode-validator.ts の validateToolUse で検証されます。
実行内容により使用するファイルは異なります。
ターミナルコマンド: src/integrations/terminal/TerminalManager.ts / TerminalProcess.ts
ファイルの読み書き: src/integrations/misc/extract-text.ts、src/utils/fs.ts、src/integrations/editor/DiffViewProvider.ts
ウェブブラウジング: src/services/browser/BrowserSession.ts
MCP サーバー: src/services/mcp/McpHub.ts
実行結果が生成されると、拡張機能側でユーザーに提示し、フィードバックを収集します。必要に応じて AutoApproveMenu.tsx を介し、ユーザーにツールの実行許可を求めることもあります。
結果の処理とフィードバック

ツール実行結果は src/core/Cline.ts で受け取り、webview UI へ送信されます。
ユーザーのフィードバックが必要な場合、再度 ask メソッドを呼び出し、webview UI を介して入力を促します。
フロントエンド側では webview-ui/src/components/chat/ChatView.tsx が履歴メッセージをレンダリングし、ChatTextArea.tsx がユーザー入力を受け取ります。
コードブロックや Markdown は webview-ui/src/components/common/CodeBlock.tsx や MarkdownBlock.tsx でレンダリングされます。
状態管理は webview-ui/src/context/ExtensionStateContext.tsx を通じて行われ、拡張機能との同期を保ちます。
繰り返し（サイクル）

src/core/Cline.ts の recursivelyMakeClineRequests メソッドを用い、LLM・ツール・ユーザーフィードバックのサイクルを継続します。
コンテキストの長さが制限に近づくと、src/core/sliding-window/index.ts の truncateHalfConversation で会話履歴を自動的に短縮し、プロンプトの最大長を超えないよう調整します。
終了

タスク完了時、エージェントは結果をユーザーに提示し（attempt_completion ツールなど）、タスクの履歴が taskHistory に保存されます。
webview-ui/src/components/chat/ChatView.tsx 上に新しいタスク開始ボタンが表示されるため、ユーザーは必要に応じて新たなタスクを開始できます。
エージェントの内部動作
柔軟な計画
事前定義されたシナリオではなく、タスク実行中に LLM からのレスポンスを都度参照し、最適なステップを動的に決定する仕組みです。src/core/Cline.ts の recursivelyMakeClineRequests メソッドが中心的役割を担います。

コンテキストの活用
プロジェクト構造や診断情報、ユーザー入力など、多面的な情報を組み合わせてタスクを遂行する方針を定めます。

人間中心の設計
自動化を重視しつつも、すべての操作には人間の承認を得られる設計です。ユーザーは AI の出力を随時確認でき、必要があれば修正を加えられます。

自律性と制御
デフォルトでは操作ごとにユーザーの承認を求めますが、特定の操作を自動承認にするオプションを備え、作業効率を高める柔軟性も提供します。

モデルコンテキストプロトコル (MCP)
src/services/mcp を用いてカスタムツールやリソースを動的に追加できます。webview-ui/src/components/mcp の画面から設定や可視化を行います。

プロンプトのカスタマイズ
.clinerules ファイルや src/core/prompts/ ディレクトリを編集することで、システムプロンプトやルールを自由にカスタマイズできます。

UI と状態管理
React ベースの webview UI は拡張機能とシームレスに連携し、状態の変化に応じて表示を切り替えます。ExtensionStateContext.tsx が全体の状態管理を担います。

Roo-Cline のプロジェクト構造とエージェントのワークフローについて理解が深まることで、コードベースへの修正や機能追加を自信を持って行えるようになるでしょう。ご不明な点がございましたら、遠慮なくご質問ください。
