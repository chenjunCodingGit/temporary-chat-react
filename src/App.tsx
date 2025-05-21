// src/App.tsx
import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { Layout, Menu, Button, theme, ConfigProvider } from 'antd'; // 导入 antd 组件
import Home from './components/Home';
import About from './components/About';
import Counter from './components/Counter';
import './App.css'; // 如果有自定义的 App.css，可以保留

const { Header, Content, Footer } = Layout;

function App() {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  // 定义菜单项
  const items = [
    { key: '1', label: <Link to="/">Home</Link> },
    { key: '2', label: <Link to="/about">About</Link> },
    { key: '3', label: <Link to="/counter">Counter (Redux)</Link> },
  ];

  return (
    <ConfigProvider
      theme={{
        // 1. 单独使用暗色算法
        // algorithm: theme.darkAlgorithm,
        // 2. 配置整体组件 Token
        token: {
          colorPrimary: '#00b96b',
          borderRadius: 4,
        },
        // 3. 配置特定组件 Token
        components: {
          Button: {
            colorPrimary: '#00b96b',
            // 更多 Button Token...
          },
        },
      }}
    >
      <Layout style={{ minHeight: '100vh' }}>
        <Header style={{ display: 'flex', alignItems: 'center' }}>
          <div className="logo" style={{ color: 'white', marginRight: '20px' }}>MY APP</div>
          <Menu
            theme="dark"
            mode="horizontal"
            defaultSelectedKeys={['1']}
            items={items}
            style={{ flex: 1, minWidth: 0 }}
          />
        </Header>
        <Content style={{ padding: '0 48px', marginTop: '20px' }}>
          <div
            style={{
              background: colorBgContainer,
              minHeight: 280,
              padding: 24,
              borderRadius: borderRadiusLG,
            }}
          >
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/counter" element={<Counter />} />
            </Routes>
            <br />
            <Button type="primary" style={{ marginRight: '10px' }}>AntD Primary BTN</Button>
          </div>
        </Content>
        <Footer style={{ textAlign: 'center' }}>
          {new Date().getFullYear()} Created by You
        </Footer>
      </Layout>
    </ConfigProvider>
  );
}

export default App;