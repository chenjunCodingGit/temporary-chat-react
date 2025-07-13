/**
 * @file src/index.ts
 * @description 这是组件库的公共入口文件。
 * 它定义了哪些组件和类型将被导出，供外部项目使用。
 */

// 导入并导出 ChatDialog 组件作为默认导出
export { default as ChatDialog } from './components/ChatDialog';

// 如果 ChatDialogProps 类型有被导出，您也可以在这里导出它
// export type { ChatDialogProps } from './components/ChatDialog';

// 注意：我们不需要在这里导入 CSS。
// Vite 在构建库时会自动处理 ChatDialog 组件及其子组件中导入的所有 CSS，
// 并将它们合并到一个单独的 style.css 文件中。
// 包的使用者需要像这样手动导入这个 CSS 文件：
// import 'temporary-chat-react/style.css';
