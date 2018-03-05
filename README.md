# FUPConvert
### 主要特性
FUPConvert 是基于[nw.js](https://nwjs.io/)和[vue.js](https://vuejs.org/)开发的Window桌面应用程序，主要用于处理视频、音频、图片等文件格式转换、压缩、合并等，内部处理程序是有名的[ffmpeg](http://ffmpeg.org/)。

事实上，网上已经有很多很多类似的功能的软件，但对于网络媒体转输方面，大多数软件功能要么单一，要么功能太多余，或者各种参数设置让外行人士很难看懂，尤其像只懂文字编辑，平常又经常处理媒体文件上传到网上的人员，需要一个简单实用的工具来辅助。FUPConvert就比较适合网络编辑和前端开发人员，当然，只要经常处理视频、音频、图片、PDF等人，都可能很有用。

程序的使用方法参见[使用文d档](https://mystermangit.github.io/fmwwp.html);

注：FUPConvert只在Window x64使用，其他平台未做兼容处理。
### 开发
通过 git clone 下载本源码之后。
在命令行中
- 安装依赖：`npm install`
- 启动：`npm run app`
稍等一会即可看到软件已经打开，接下来就可以修改源码，修改后，执行命令：`webpack`
然后右击软件，在右键菜单中选`重新加载应用`，即刷新（其他刷新方式：F12调出调试工具，在工具中再按F5即刷新）。
- 打包，请参照[【官网文档】](http://docs.nwjs.io/en/latest/For%20Users/Package%20and%20Distribute/#package-and-distribute)。
