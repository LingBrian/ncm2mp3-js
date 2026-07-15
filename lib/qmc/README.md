# QMC Decoder

解密 QQ 音乐 `.qmc0` / `.qmcflac` / `.mgg` / `.mflac` 等加密音频文件。

## 文件说明

| 文件 | 说明 |
|------|------|
| `index.html` | 纯浏览器端解密页面（拖拽文件即可，无需服务器） |
| `ekey-getter-gui.exe` | 图形化 ekey 获取工具（Windows） |

## 使用方式

### 方式一：浏览器解密（`index.html`）

直接用浏览器打开 `index.html`，拖入加密文件即可解密。所有算法在浏览器本地运行，文件不会上传。

支持：`.qmc0` `.qmc2` `.qmc3` `.qmcflac` `.qmcogg` `.mgg` `.mgg0` `.mgg1` `.mggl` `.mflac` `.mflac0` `.mflach`

### 方式二：获取 ekey（`ekey-getter-gui.exe`）

部分新版文件（musicex 格式）的加密密钥未嵌入文件内，需要从 QQ 音乐 API 获取：

1. 运行 `ekey-getter-gui.exe`
2. 点击「选择 .mgg/.mflac 文件」打开加密文件
3. 点击「检测」自动获取登录凭证（需先登录 PC 版 QQ 音乐），或取消勾选「自动检测」后手动输入 uin / authst
4. 点击「获取 Ekey」从腾讯 API 拉取密钥
5. 复制 ekey 粘贴到 `index.html` 的密钥输入框中再解密

## 项目结构

```
qmc-decoder/
├── html/                  # 纯 HTML 前端
│   ├── index.html         # 解密页面（所有算法内联）
│   ├── ekey-getter-gui.exe
│   └── README.md
├── nodejs/                # Node.js 服务端版本
├── ekey-getter/           # Rust CLI 版 ekey 获取工具
├── ekey-getter-gui/       # Rust GUI 版 ekey 获取工具（源码）
└── README.md
```
