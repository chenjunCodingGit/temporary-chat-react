// src/layouts/Layout.tsx
import { Outlet, Link } from 'react-router-dom';

const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* 顶部导航栏 */}
      <header className="bg-white shadow-sm">
        <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-xl font-bold">My App</div>
          <div className="flex space-x-6">
            <Link to="/" className="text-gray-700 hover:text-blue-600 transition-colors">
              Home Page
            </Link>
            <div></div>
            <Link to="/about" className="text-gray-700 hover:text-blue-600 transition-colors">
              About Page
            </Link>
            <div></div>
            <Link to="/codemode" className="text-gray-700 hover:text-blue-600 transition-colors">
              Code Mode Page
            </Link>
          </div>
        </nav>
      </header>

      {/* 主要内容区域 */}
      <main className="container mx-auto px-4 py-8 flex-grow">
        <Outlet />
      </main>

      {/* 页脚 */}
      <footer className="bg-gray-800 text-white py-8 mt-auto">
        <div className="container mx-auto px-4">
          <p className="text-center">© 2023 My App. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;