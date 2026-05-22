/*
版本号: v2.0.0
更新日志:
- 新增批量图片上传
- 新增批量 PNG 导出
- 新增批量预览网格
- 优化图片处理逻辑
- 保持透明背景与像素风
*/

import React, { useRef, useState } from 'react';
import { Upload, Download, Image as ImageIcon } from 'lucide-react';

/*
====================================
EXE 打包方式（Electron）
====================================

1. 安装依赖：

npm install electron electron-builder concurrently wait-on --save-dev

2. package.json 增加：

"main": "electron/main.js",
"homepage": "./",

"scripts": {
  "dev": "vite",
  "build": "vite build",
  "electron": "electron .",
  "electron-dev": "concurrently \"npm run dev\" \"wait-on http://localhost:5173 && electron .\"",
  "dist": "npm run build && electron-builder"
},

"build": {
  "appId": "com.pixel.converter",
  "productName": "PixelPNGConverter",
  "directories": {
    "output": "release"
  },
  "files": [
    "dist/**/*",
    "electron/**/*"
  ],
  "win": {
    "target": "nsis"
  }
}

3. 创建文件：electron/main.js

内容如下：

const { app, BrowserWindow } = require('electron')
const path = require('path')

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  })

  win.loadFile(path.join(__dirname, '../dist/index.html'))
}

app.whenReady().then(createWindow)

4. 执行打包：

npm run dist

5. EXE 输出目录：

/release

====================================

网页版部署方式（Vercel）
====================================

1. 注册并登录 Vercel：
https://vercel.com

2. 把当前项目上传到 GitHub

3. 在 Vercel 点击：

New Project

4. 导入你的 GitHub 仓库

5. 保持默认配置：

Framework:
Vite

Build Command:
npm run build

Output Directory:
dist

6. 点击 Deploy

几分钟后即可生成在线网页。

后续每次更新代码：

git push

Vercel 会自动更新网站。

====================================
*/

export default function PixelPNGConverter() {
  const [preview, setPreview] = useState([]);
  const [output, setOutput] = useState([]);
  const canvasRef = useRef(null);

  const handleUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const previewResults = [];
    const outputResults = [];

    files.forEach((file) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        const img = new Image();

        img.onload = () => {
          const png = processImage(img);

          previewResults.push({
            name: file.name,
            src: event.target.result,
          });

          outputResults.push({
            name: file.name.replace(/\.[^/.]+$/, ''),
            src: png,
          });

          if (previewResults.length === files.length) {
            setPreview(previewResults);
            setOutput(outputResults);
          }
        };

        img.src = event.target.result;
      };

      reader.readAsDataURL(file);
    });
  };

  const processImage = (img) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = 32;
    canvas.height = 32;

    ctx.clearRect(0, 0, 32, 32);

    ctx.imageSmoothingEnabled = false;

    const scale = Math.min(32 / img.width, 32 / img.height);

    const newWidth = img.width * scale;
    const newHeight = img.height * scale;

    const x = (32 - newWidth) / 2;
    const y = (32 - newHeight) / 2;

    ctx.drawImage(img, x, y, newWidth, newHeight);

    return canvas.toDataURL('image/png');
  };

  const downloadPNG = () => {
    output.forEach((item) => {
      const link = document.createElement('a');
      link.href = item.src;
      link.download = `${item.name}_32x32.png`;
      link.click();
    });
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-8 flex items-center justify-center">
      <div className="w-full max-w-4xl grid md:grid-cols-2 gap-6">

        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-2xl bg-zinc-800">
              <ImageIcon className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">32x32 PNG 转换工具</h1>
              <p className="text-zinc-400 text-sm">
                自动生成透明背景像素 PNG
              </p>
            </div>
          </div>

          <label className="flex flex-col items-center justify-center border-2 border-dashed border-zinc-700 rounded-2xl p-10 cursor-pointer hover:border-zinc-500 transition">
            <Upload className="w-10 h-10 mb-4 text-zinc-400" />
            <span className="text-lg font-medium mb-2">上传图片</span>
            <span className="text-sm text-zinc-500 text-center">
              支持任意尺寸图片（可批量上传）
            </span>

            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleUpload}
            />
          </label>

          <button
            onClick={downloadPNG}
            disabled={!output.length}
            className="mt-6 w-full bg-white text-black rounded-2xl py-4 font-semibold flex items-center justify-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed hover:scale-[1.01] transition"
          >
            <Download className="w-5 h-5" />
            下载 PNG
          </button>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl flex flex-col">
          <h2 className="text-xl font-bold mb-4">预览</h2>

          <div className="flex-1 grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-zinc-400 mb-2">原图</div>
              <div className="aspect-square rounded-2xl bg-zinc-800 flex items-center justify-center overflow-hidden">
                {preview.length ? (
                  <div className="grid grid-cols-2 gap-2 p-2 overflow-auto max-h-[420px]">
                    {preview.map((item, index) => (
                      <div key={index} className="bg-zinc-900 rounded-xl p-2">
                        <img
                          src={item.src}
                          alt="preview"
                          className="w-full aspect-square object-contain"
                        />
                        <div className="text-xs text-zinc-400 mt-2 truncate">
                          {item.name}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-zinc-500 text-sm">暂无图片</span>
                )}
              </div>
            </div>

            <div>
              <div className="text-sm text-zinc-400 mb-2">32x32 输出</div>
              <div className="aspect-square rounded-2xl bg-[linear-gradient(45deg,#222_25%,transparent_25%),linear-gradient(-45deg,#222_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#222_75%),linear-gradient(-45deg,transparent_75%,#222_75%)] bg-[length:20px_20px] bg-[position:0_0,0_10px,10px_-10px,-10px_0px] flex items-center justify-center overflow-hidden border border-zinc-700">
                {output.length ? (
                  <div className="grid grid-cols-2 gap-2 p-2 overflow-auto max-h-[420px]">
                    {output.map((item, index) => (
                      <div key={index} className="bg-zinc-900 rounded-xl p-2 border border-zinc-700">
                        <img
                          src={item.src}
                          alt="output"
                          className="w-full aspect-square object-contain"
                          style={{ imageRendering: 'pixelated' }}
                        />
                        <div className="text-xs text-zinc-400 mt-2 truncate">
                          {item.name}_32x32.png
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-zinc-500 text-sm">暂无输出</span>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 text-sm text-zinc-500 leading-6">
            · 输出尺寸固定为 32x32<br />
            · 自动透明背景<br />
            · PNG 格式导出<br />
            · 保持像素风格
          </div>
        </div>
      </div>

      
    </div>
  );
}
