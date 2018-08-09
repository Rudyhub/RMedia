# RMedia
***
## 主要特性

媒体批处理

**视频**：压缩、转码、调整尺寸与比例、截取片段、分离视音频、加水印、输出单帧图像、输出为gif动图等。

**音频**：压缩、转码、截取片段、分离声道等。

**图片**：转码、调整尺寸与比例、多图拼接、序列图转gif动图、序列图转视频等。

**其他**：录制屏幕、批量重命名、PDF转图片等。

## 适用平台
Window7 x64/x86和Window10 x64/x86可以使用，其他平台没有测试过。

## 使用方法
参考文档说明[文档](https://rudyhub.github.io/rmedia.html)。

## 开发环境
1. node + npm
2. webpack
3. git
4. ffmpeg
5. node-webkit
6. vue2

## 开始配置：
以x64为例下载配置项目，x86同理。

### 1. 克隆项目：
```
git clone https://github.com/rudyhub/rmedia.git
```
### 2. 安装依赖：
```
npm install
```

### 3. 安装nwjs（有两种方式）

#### 第一种（推荐）：

##### 1. 下载nwjs：

[下载nwjs-sdk-v0.26.6-win-x64.zip](https://dl.nwjs.io/v0.26.6/nwjs-sdk-v0.26.6-win-x64.zip)，注意版本：`sdk-v0.26.6-win-x64`。此版本为开发时用，打包时，需要[下载nwjs-v0.26.6-win-x64.zip即正式版](https://dl.nwjs.io/v0.26.6/nwjs-v0.26.6-win-x64.zip)。（与开发版不同之处：正式版无devtools)。

完成后，解压到项目根目录，改名为: nwjs

##### 2. ffmpeg下载：

[下载ffmpeg.exe](https://ffmpeg.zeranoe.com/builds/win64/static/ffmpeg-3.4.2-win64-static.zip),版本：`3.4.2-win64-static`，[其他版本](https://ffmpeg.zeranoe.com/builds/win64/static)一般也可以，但如果官网更新一些参数的写法，就可能产生错误。

完成后，解压提取ffmpeg.exe文件，在“app/”目录下新建一个ffmpeg文件夹，把提取的ffmpeg.exe放进入。

然后[下载ffmpeg.dll](https://github.com/iteufel/nwjs-ffmpeg-prebuilt/releases/download/0.26.6/0.26.6-win-x64.zip)，版本：0.26.6，此文件的版本号一定要与nwjs的版本号对应（这很重要），否则，video，audio标签将不支持播放如mp4,mp3等文件。[更多版本](https://github.com/iteufel/nwjs-ffmpeg-prebuilt/releases)。

完成后，解压提取ffmpeg.dll，替换nwjs目录下的ffmpeg.dll文件。

##### 3. 整体目录结构大致如下：
```
> RMedia/
| - app/
| | - cache/
| | - css/
| | - ffmpeg/
| | | - ffmpeg.exe
| | | - ...
| - nwjs/
| | - ...
| | - ffmpeg.dll
| | - nw.exe
| | - ...
| - .gitignore
| - package.json
| - README.md
| - webpack.config.js
 ```
##### 4. 启动：
执行命令
```
npm run nw
```
稍等一会即可看到一个nwjs应用程序即打开。

接下来就可以修改源码进行喜欢的开发，修改后，执行命令：
```
npm run dev
```
然后右击应用界面，在右键菜单中选`重新加载应用`，即重新加载修改后的代码，（也可以F12调出调试工具，在工具中再按F5，与浏览器相同）。

修改完成后，执行命令
```
npm run build
```
即可打包压缩版js代码

#### 第二种：
##### 1. 全局安装nwjs执行命令：
```
//安装nwjs
npm install -g nwjs
    
//安装对应sdk版本
nw install 0.26.6-sdk
```
##### 2. 下载ffmpeg:
ffmpeg.exe与上述步骤相同。

但ffmpeg.dll不同，需要把它放替换到C:\Users\Administrator\.nwjs\0.26.6-sdk目录下的ffmpeg.dll。注意：这是windows10系统的目录，目录中的Administrator是登录电脑所用的用户名。其他系统未测试过。可以直接在C盘搜"0.26.6-sdk"或者".nwjs"，总之要找到ffmpeg.dll的目录替换它。

##### 3. 启动
执行命令
```
nw app
```
打开了nwjs应用程序，此时cmd窗口是阻塞状态的，无法行进下一步命令，需要另外打开新的cmd窗口

接下来就是修改项目源码，开始你的开发，与第一种方法完全相同

## 打包:
请参照[【官网文档】](http://docs.nwjs.io/en/latest/For%20Users/Package%20and%20Distribute/#package-and-distribute)。
