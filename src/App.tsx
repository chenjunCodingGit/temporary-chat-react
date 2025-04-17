import React, { useEffect } from 'react';

// 动态导入 CommonJS 模块
const loadLegacyModule = async () => {
//   const legacyModule = await import('../public/legacy/lib/lib.js');
//   console.log('legacyModule: ', legacyModule);
  // 使用模块功能
};

const MyComponent = () => {
  useEffect(() => {
    loadLegacyModule();
  }, []);

  return <div>Combined with legacy module</div>;
};

export default MyComponent;
