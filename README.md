# RMedia
***
### 主要特性

媒体批处理

**视频**：压缩、转码、调整尺寸与比例、截取片段、分离视音频、加水印、输出单帧图像、输出为gif动图等。

**音频**：压缩、转码、截取片段、分离声道等。

**图片**：转码、调整尺寸与比例、多图拼接、序列图转gif动图、序列图转视频等。

**其他**：录制屏幕、批量重命名、PDF转图片等。

### 适用平台
Window7 x64/x86和Window10 x64/x86可以使用，其他平台没有测试过。

### 使用方法
参考文档说明[文档](https://rudyhub.github.io/rmedia.html)。

### 开发环境
1. node + npm
2. webpack3
3. git
4. ffmpeg
5. nwjs
6. vue2

### 开始配置：
##### 以x64为例下载配置项目，x86同理。

1. 克隆项目：
```
git clone https://github.com/rudyhub/rmedia.git
```
2. 安装依赖：
```
npm install
```

3. 下载nwjs:
> [下载nwjs-sdk-v0.26.6-win-x64.zip即开发版](https://dl.nwjs.io/v0.26.6/nwjs-sdk-v0.26.6-win-x64.zip)，注意版本：`sdk-v0.26.6-win-x64`。此版本为开发时用，打包时，需要[下载nwjs-v0.26.6-win-x64.zip即正式版](https://dl.nwjs.io/v0.26.6/nwjs-v0.26.6-win-x64.zip),与开发版不同的是，正式版去除了调试工具等一些方便开发的东西。

> 也可以完全选择另一种方式：全局安装nwjs.
```
    //安装nwjs
    npm install -g nwjs
    
    //安装对应sdk版本
    nw install 0.26.6-sdk
```

4. ffmpeg下载：
> [下载ffmpeg.exe文件（zip压缩包）](https://ffmpeg.zeranoe.com/builds/win64/static/ffmpeg-3.4.2-win64-static.zip),版本号：`3.4.2-win64-static`，[其他版本](https://ffmpeg.zeranoe.com/builds/win64/static)一般也可以，但如果官网更新一些参数的写法，就可能产生错误。
> [下载ffmpeg.dll文件（zip压缩包）](https://github.com/iteufel/nwjs-ffmpeg-prebuilt/releases/download/0.26.6/0.26.6-win-x64.zip)，版本号：0.26.6，此文件的版本号一定要与nwjs的版本号对应（这很重要），否则，video，audio标签将不支持播放如mp4,mp3等文件。[更多版本](https://github.com/iteufel/nwjs-ffmpeg-prebuilt/releases)。

5. 配置ffmpeg:
> 将以上下载的第一个zip包解压后，把bin文件夹下的ffmpeg.exe文件复制到项目的ffmpeg文件夹下。
> 将第二个zip包解压得到ffmpeg.dll文件，复制替换nwjs文件夹根目录的ffmpeg.dll文件。

6. 配置nwjs:
> 将nwjs-sdk-v0.26.6-win-x64.zip解压到目录RMedia/下，最终的文件树枝关系如：
```
> RMedia/
| - app/
| | - cache/
| | - css/
| | - ffmpeg/
| | | - ffmpeg.exe
| | | - ...
| - nwjs-v0.26.6-win-x64-sdk/
| | - ...
| | - nw.exe
| | - ...
| - .gitignore
| - package.json
| - README.md
| - webpack.config.js
 ```
7. 启动：
```
npm run dev
```
>稍等一会即可看到软件已经打开，接下来就可以修改源码，修改后，执行命令：`webpack`
然后右击软件，在右键菜单中选`重新加载应用`，即刷新（其他刷新方式：F12调出调试工具，在工具中再按F5即刷新）。

>当然，也可以把正式版nwjs-v0.26.6-win-x64.zip解压到RMedia/下，与sdk版并列。然后使用以下命令运行。注意：两个版本无法一起运行。

```
npm run nw
```

8. 打包:
>请参照[【官网文档】](http://docs.nwjs.io/en/latest/For%20Users/Package%20and%20Distribute/#package-and-distribute)。
