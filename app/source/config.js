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
/*
======== 准备一些临时文件 =================
 */

let TEMP_FOLDER = 'temp',
	//用于暂存单帧base64数据的临时文件，即预览图数据来源。
	THUMB_TEMP_FILE = TEMP_FOLDER+'\\thumb_temp_file.temp',
    //用地录屏时的暂时标准错误流信息
    CAP_LOG_TEMP_FILE = TEMP_FOLDER+'\\cap_log_temp_file.temp';

fs.mkdir(TEMP_FOLDER,(err)=>{
    if(err){
        utils.dialog.show = true;
        utils.dialog.body = '准备临时文件夹时发生了错误。信息如：'+err.message;
    }else{
        fs.writeFileSync(THUMB_TEMP_FILE,'');
        fs.writeFileSync(CAP_LOG_TEMP_FILE,'');
    }
});

nw.process.on('exit',()=>{
	try{
		fs.unlinkSync(THUMB_TEMP_FILE);
		fs.unlinkSync(CAP_LOG_TEMP_FILE);
		fs.rmdirSync(TEMP_FOLDER);
    }catch(err){}
});

module.exports = {
	appRoot: appRoot,
	ffmpegPath: ffmpegPath,
	ffprobePath: utils.path(appRoot+'\\ffmpeg\\ffprobe.exe'),
    thumbPath: utils.path(appRoot + '\\' + THUMB_TEMP_FILE),
	logPath: utils.path(appRoot + '\\' + CAP_LOG_TEMP_FILE),
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