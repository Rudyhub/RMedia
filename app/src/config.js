const cp = require('child_process'),
    fs = require('fs'),
    utils = require('./utils');
let appRoot = utils.path(true).dirname(process.execPath),
	ffmpegPath = utils.path(appRoot+'\\ffmpeg\\ffmpeg.exe'),
	checkPath = cp.spawnSync(ffmpegPath,['-version']);
if(checkPath.error){
	appRoot = process.cwd();
	ffmpegPath = utils.path(appRoot+'\\ffmpeg\\ffmpeg.exe');
	checkPath = cp.spawnSync(ffmpegPath, ['-version']);
	if(checkPath.error){
		utils.dialog.show = true;
		utils.dialog.title = '丢失';
		utils.dialog.body = `<p>未找到核心程序，
		<a href="https://ffmpeg.zeranoe.com/builds/win64/static/ffmpeg-3.4.2-win64-static.zip" download="ffmpeg.zip" style="color: #b00">前往下载</a>，
		提取解压包中的ffmpeg.exe，放置位置如：${ffmpegPath}</p>`;
	}
}

//======== 准备临时文件夹 =================

let TEMP_FOLDER = 'temp';
if(utils.has(TEMP_FOLDER)){
    cp.exec('rd /s /q '+TEMP_FOLDER, (err)=>{
    	if(err){
            utils.dialog.show = true;
            utils.dialog.body = '清除临时文件夹时发生了错误。信息如：'+err.message.toString('utf-8');
		}else{
            fs.mkdirSync(TEMP_FOLDER);
		}
	});
}else{
    fs.mkdirSync(TEMP_FOLDER);
}

nw.process.on('exit',()=>{
	cp.execSync('rd /s /q '+TEMP_FOLDER);
});

let usercfgPath = utils.path(appRoot+'\\config.json'),
	usercfg;
if(fs.existsSync(usercfgPath)){
    usercfg = JSON.parse(fs.readFileSync(usercfgPath, 'utf-8'));
}else{
    usercfg = {
        documentation: "https://rudyhub.github.io/RMedia"
    };
}

module.exports = {
	appRoot,
	ffmpegPath,
    usercfg,
	temp: TEMP_FOLDER,
    audioThumb: utils.path(appRoot + '\\icons\\audio.jpg'),
	output: {
		folder: utils.path(process.env.USERPROFILE+'\\desktop'),
		width: 1280,
		height: 720,
		bitv: 2048,
		bita: 128,
		fps: 25,
		format: {
			image: 'jpg',
			video: 'mp4',
			audio: 'mp3'
		}
	}
};