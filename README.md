# RMedia
***
### 主要特性

媒体批处理

**视频**：压缩、转码、调整尺寸与比例、截取片段、分离视音频、加水印、输出单帧图像、输出为gif等。

**音频**：压缩、转码、截取片段、分离声道、合并、混合等。

**图片**：转码、调整尺寸与比例、多图拼接、序列图转gif、序列图转视频等。

**其他**：录制屏幕、批量重命名、PDF转图片等。

### 适用平台
Window7 x64和Window10 x64可以使用，其他平台没有测试过。

### 开发环境
1. node + npm
2. webpack3
3. git
4. ffmpeg
5. nwjs

### 开始

1. 克隆项目：
```
git clone https://github.com/rudyhub/rmedia.git
```
2. 安装依赖：
```
npm install
```

3. ffmpeg下载：
> [下载ffmpeg-3.4.2-win64-static.zip](https://ffmpeg.zeranoe.com/builds/win64/static/ffmpeg-3.4.2-win64-static.zip),注意版本：`3.4.2-win64-static`，[其他版本](https://ffmpeg.zeranoe.com/builds/win64/static)一般也可以，但如果官网更新一些参数的写法，就可能产生错误。

4. 配置ffmpeg:
> 将下载的`ffmpeg-3.4.2-win64-static.zip`包解压后，把bin文件夹下的ffmpeg.exe文件复制到项目的ffmpeg文件夹下。

5. 下载nwjs:
> [下载nwjs-sdk-v0.26.6-win-x64.zip即开发版](https://dl.nwjs.io/v0.26.6/nwjs-sdk-v0.26.6-win-x64.zip)，注意版本：`sdk-v0.26.6-win-x64`。此版本为开发时用，打包时，需要[下载nwjs-v0.26.6-win-x64.zip即正式版](https://dl.nwjs.io/v0.26.6/nwjs-v0.26.6-win-x64.zip),与开发版不同的是，正式版去除了调试工具等一些方便开发的东西。

6. 配置nwjs:
> 将nwjs-sdk-v0.26.6-win-x64.zip压缩到当前目录RMedia/下，命名文件夹为nwjs，最终的文件树枝关系如：
```
> RMedia/
|	- app/
|	|	- cache/
|	|	- css/
|	|	- ffmpeg/
|	|	|	- ffmpeg.exe
|	|	|	- ...
|	- nwjs/
|	|	- ...
|	|	- nw.exe
|	|	- ...
|	- .gitignore
|	- package.json
|	- README.md
|	- webpack.config.js
 ```
7. 启动：
```
npm run app
```
>稍等一会即可看到软件已经打开，接下来就可以修改源码，修改后，执行命令：`webpack`
然后右击软件，在右键菜单中选`重新加载应用`，即刷新（其他刷新方式：F12调出调试工具，在工具中再按F5即刷新）。

8. 打包:
>请参照[【官网文档】](http://docs.nwjs.io/en/latest/For%20Users/Package%20and%20Distribute/#package-and-distribute)。
