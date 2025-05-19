# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript and enable type-aware lint rules. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

https://github.com/microsoft/omnichannel-chat-widget/
https://github.com/microsoft/omnichannel-chat-sdk

本地有一个react启动的项目，使用这个仓库实现一个场景：在企业内部使用react建立的一个portal站点的右下角，有一个chatbot的icon聊天入口，接入微软的AI Chatbot，类似于一个客服聊天机器人，包含以下背景和功能：
背景1. 后台AI Chatbot服务已经使用socket长连接
背景2. 使用的微软AI Chatbot服务在后台配置了OAuth2的认证
背景3. web前端界面，负责UI交互和AI chatbot聊天交互

实现的功能如下：
1. 用户首先在浏览器中登录自己portal站点
2. 登录的portal也是使用的微软当前服务，因为chatbot后台服务也是接入的微软的OAuth2认证
3. 用户登录portal之后，首次点击Chatbot icon时，首先根据登录的用户，和当前生产的JWT与微软的OAuth2进行身份认证
4. 认证的过程使用这个代码仓库的单点登录SSO
4. 详细列出这里的使用JWT，接入OAuth2的认证过程
5. OAuth2认证成功后，与后台AI Chatbot保持长连接的服务成功
6. 成功建立长连接之后，在建立心跳过程
7. 实现接收和发送message


你现在是一个拥有微软Azure经验的专家和软件架构师；需要从零实现上述的需求，首先需要去微软Dynamics 365 Customer Service中心配置Copilot agent (agent or AI agent). 
然后结合这个github仓库，在web portal前端中实现整个功能。
需要列出每一步的操作步骤和代码