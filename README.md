# QwenPaw 极简界面

一个纯前端 QwenPaw 插件：把界面收拢到「会话历史 + 输入框」，并去掉工具审批。

## 它做了什么

**侧边栏**

- 只保留会话历史列表。
- 保留「新建任务」按钮与会话历史列表。
- 隐藏品牌区、工具/导航面板、插件插槽、账号操作、用量卡片、折叠按钮，以及侧栏左下角用于拖动/浮动侧栏的握把。
- 折叠状态下只保留「新建任务」与「历史」两个入口（点击历史后仍在浮层里显示完整会话历史）。

**输入框（对话框）**

| 部件 | 处理 |
| --- | --- |
| Loop 模式选择器 | 隐藏 |
| SessionProjectDir（项目目录） | 隐藏 |
| Approval Toggle（工具审批切换） | 隐藏 |
| 工具审批级别 | 强制为 `OFF`（无需用户审批，仍保留沙箱等后端安全策略） |

**空会话欢迎页**

- 隐藏消息列表里的欢迎区块（问候语、示例提示、「Let's start a new journey!」卡片），新会话直接面对输入框。

审批级别通过两层保障固定为 `OFF`：

1. 覆写 `localStorage` 中 `approval_level-*` 的读取结果，让审批切换器在挂载时读到 `OFF`；
2. 包装 `window.fetch`，把发往 `/console/chat` 的请求体里的 `request_context.approval_level` 改写为 `OFF`。

第二层用于覆盖「插件晚于输入框挂载」的首次会话。两层都不改写你已保存的偏好：卸载插件后原来的审批设置会照常生效。

## 安装

要求 QwenPaw `2.2.2` – `2.9.9`（基于该区间控制台的 CSS Module 局部类名）。

从源码目录直接安装：

```bash
qwenpaw plugin install /home/lly/projects/qwenpaw-simplistic-plugin
```

或先打包成可分发 zip：

```bash
npm install
npm run package
qwenpaw plugin install ./release/qwenpaw-simplistic-0.1.0.zip
```

安装后重新加载控制台页面（必要时重启 QwenPaw）。插件列表里应出现 **QwenPaw 极简界面**。

> 控制台的插件加载器只在页面启动时运行一次。如果是在登录页完成登录后直接进入聊天页，请再刷新一次页面，插件才会生效；已经登录后再打开控制台则会直接生效。

卸载：

```bash
qwenpaw plugin uninstall qwenpaw-simplistic
```

## 开发

```bash
npm install
npm run check   # 类型检查 + 测试 + 构建
npm run build   # 仅构建 dist/index.js
```

产物是单个 IIFE（`dist/index.js`），不包含 React/antd，加载时做三件事：

1. 向 `<head>` 注入一个 `<style>`（id: `qwenpaw-simplistic-styles`）。
2. 给 `Storage.prototype.getItem` 加一层前缀判断，让 `approval_level-*` 恒为 `OFF`。
3. 包装 `window.fetch`，把发往 `/console/chat` 的 `request_context.approval_level` 改写为 `OFF`。

## 发布

发布由 GitHub Actions 自动完成：[`.github/workflows/release.yml`](.github/workflows/release.yml)。

1. 更新 `plugin.json` 与 `package.json` 的 `version`，跑一次 `npm run build` 并提交 `dist/`（CI 会校验已提交的 `dist/` 与重新构建的结果一致）。
2. 打 tag 并推送，tag 必须与 `plugin.json` 的版本一致（`v` + 版本号）：

```bash
V=0.1.0
git tag "v$V" && git push origin "v$V"
```

3. Workflow 会执行 `npm run check`（类型检查 + 测试 + 构建）、`npm run package` 打包 zip 与 sha256，然后以该 tag 创建 GitHub Release 并附上下载产物；若 Release 已存在则覆盖上传。

也可以在 Actions 页面手动触发 `Release`（`workflow_dispatch`），填入一个已存在的 tag。

## 实现说明与限制

- 控制台没有提供「隐藏侧边栏区块 / 发件箱控件」的公开 API，因此布局使用 CSS 属性选择器匹配控制台的 CSS Module **局部类名**（如 `index-module__sessionArea__`、`ApprovalToggle-module__trigger__`），不使用会随构建变化的 hash。
- 若未来 QwenPaw 控制台重命名这些局部类名，需要同步更新 `src/styles.ts`；这也是 `qwenpaw_version.max` 设为 `2.9.9` 的原因。
- 强制 `OFF` 的第一层依赖控制台按 `approval_level-<sessionId>` 持久化审批级别（2.2.x 的实现）；若该 key 格式变化，第二层 fetch 改写仍会生效。
- 第二层只改写 `body` 为字符串的 `fetch` 请求；控制台 2.2.x 的聊天提交正是这种形式。
- 控制台在登录页首次加载时插件列表接口返回 401，登录后的客户端路由不会重跑插件加载器，因此首次登录需要刷新一次。这是宿主加载时序，不是插件可以提前介入的环节。
- F1 探针模式等后端显式强制 `STRICT` 的会话不受 `OFF` 影响，这是后端的有意设计。
- `OFF` 只表示「不向用户请求审批」，不表示跳过沙箱、只读保护等执行层安全机制。

## 目录

```
plugin.json           # 插件清单（type: frontend）
src/index.ts          # 入口：注入样式 + 固定审批读取
src/styles.ts         # 全部布局选择器
src/approval.ts       # localStorage 读取补丁 + fetch 请求体兜底
test/                 # jsdom 回归测试（选择器命中、补丁行为）
scripts/build.mjs     # esbuild 打包
scripts/package.mjs   # 生成 release/*.zip
```
