const cp = require('child_process'),
	utils = require('./utils'),
    fs = require('fs');

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
		utils.dialog.body = '<p>ffmpeg文件丢失，请确保安装目录下的文件夹ffmpeg/有ffmpeg.exe和ffprobe.exe文件。</p>';
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

module.exports = {
	appRoot: appRoot,
	ffmpegPath: ffmpegPath,
	temp: TEMP_FOLDER,
    audioThumb: utils.path(appRoot + '\\css\\audio.jpg'),
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