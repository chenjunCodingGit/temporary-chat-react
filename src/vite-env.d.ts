/// <reference types="vite/client" />

interface Window {
  renderChatDialog: (containerId: string, props?: any) => void;
  unmountChatDialog: (containerId: string) => void;
}
