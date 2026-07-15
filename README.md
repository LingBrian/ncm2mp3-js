# NCM / QMC 音乐解密转换器

一个纯浏览器端的音乐格式解密工具，支持网易云 NCM 和 QQ音乐 QMC 两种加密格式，支持批量转换、封面显示和音频预览。

## 功能特性

- 🔐 **纯浏览器端解密** - 所有操作在本地完成，无需上传文件，保护隐私
- 📦 **批量转换** - 支持同时转换多个文件
- 🖼️ **封面显示** - 自动提取并显示专辑封面图片（NCM）
- 🎵 **音频预览** - 内置播放器，转换后可直接预览
- 📥 **打包下载** - 支持将转换后的文件打包为 ZIP 下载
- 🏷️ **ID3 标签** - 自动写入歌曲名称、艺术家、专辑、封面等元数据（NCM）
- 🔑 **ekey 自动检测** - QMC 文件自动检测是否需要输入密钥

## 支持的格式

### 网易云 NCM
输入 `.ncm`，解密后输出 MP3 / FLAC / M4A / OGG。

### QQ音乐 QMC
输入 `.qmc0` `.qmc2` `.qmc3` `.qmcflac` `.qmcogg` `.mgg` `.mgg0` `.mgg1` `.mggl` `.mflac` `.mflac0` `.mflach`，解密后输出 MP3 / OGG / FLAC。

## 使用方法

1. 打开 `index.html` 文件
2. 通过顶部 Tab 切换到对应模式（网易云 NCM / QQ音乐 QMC）
3. 拖拽文件到页面，或点击选择文件
4. 点击"开始转换"按钮
5. 转换完成后可以：
   - 点击"预览"按钮播放音频
   - 点击"下载"按钮下载单个文件
   - 点击"打包下载"按钮下载所有转换成功的文件

> QQ音乐部分文件（Musicex 格式）的加密密钥未嵌入文件内，需要手动输入 ekey。可使用 `lib/qmc/ekey-getter-gui.exe` 获取。

### ekey-getter-gui 使用说明（Windows）

部分新版 QMC 文件（Musicex 格式）的加密密钥未嵌入文件内，需要从 QQ 音乐 API 获取：

1. 运行 `ekey-getter-gui.exe`
2. 点击「选择 .mgg/.mflac 文件」打开加密文件
3. 点击「检测」自动获取登录凭证（需先登录 PC 版 QQ 音乐），或取消勾选「自动检测」后手动输入 uin / authst
4. 点击「获取 Ekey」从腾讯 API 拉取密钥
5. 复制 ekey 粘贴到页面的密钥输入框中，点击「开始转换」

## 本地运行

1. **直接打开** - 双击 `index.html` 文件在浏览器中打开即可使用

2. **通过 HTTP 服务器**（推荐）：

```bash
# 使用 Python
python -m http.server 8080

# 或使用 Node.js
npx http-server -p 8080
```

然后在浏览器中访问 `http://localhost:8080`

## 技术实现

- **AES-128-ECB 解密** - 用于解密 NCM 文件的密钥和元数据
- **CR4 流加密** - 用于解密 NCM 音频数据
- **XOR / TC-TEA / Map / RC4** - 用于解密 QMC 音频数据
- **ID3v2 标签** - 用于写入 MP3 元数据和封面图片
- **JSZip** - 用于打包下载功能

## 文件结构

```
ncm2mp3-js/
├── index.html      # 主程序文件（NCM + QMC 全部代码内联）
├── lib/
│   └── qmc/        # QMC 解密独立页面及工具
├── README.md       # 说明文档
└── LICENSE         # MIT 协议
```

## 注意事项

- 本工具仅供学习和个人使用
- 请尊重版权，不要用于商业用途
- 转换后的音频文件仅供个人欣赏

## 致谢

- [ncm2mp3](https://github.com/charlotte-xiao/NCM2MP3) - NCM 解密算法参考
- [qmc-decoder](https://github.com/ownlight6/qmc-decoder) - QMC 解密算法参考
- [JSZip](https://github.com/Stuk/jszip) - ZIP 文件生成库

## License

[MIT](LICENSE)
