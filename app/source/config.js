const path = require('path'),
	cp = require('child_process'),
	utils = require('./utils');

let appRoot = path.dirname(process.execPath),
	ffmpegPath = path.normalize(appRoot+'\\ffmpeg\\ffmpeg.exe'),
	checkPath = cp.spawnSync(ffmpegPath,['-version']);
if(checkPath.error){
	appRoot = process.cwd();
	ffmpegPath = path.normalize(appRoot+'\\ffmpeg\\ffmpeg.exe');
	checkPath = cp.spawnSync(ffmpegPath, ['-version']);
	if(checkPath.error){
		utils.dialog.show = true;
		utils.dialog.title = '丢失';
		utils.dialog.body = '<p>ffmpeg文件丢失，请确保安装目录下的文件夹ffmpeg/有ffmpeg.exe和ffprobe.exe文件。</p>';
	}
}

module.exports = {
	appRoot: appRoot,
	ffmpegPath: ffmpegPath,
	ffprobePath: path.normalize(appRoot+'\\ffmpeg\\ffprobe.exe'),
	audioThumb: path.normalize('..\\css\\audio.jpg'),
	logPath: path.normalize(appRoot + '\\cache\\log.txt'),
	cacheThumb: path.normalize(appRoot + '\\cache\\thumb'),
	output: {
		folder: process.env.USERPROFILE+'\\desktop',
		width: 1280,
		height: 720,
		bitv: 1024,
		bita: 128,
		fps: 25,
		format: {
			image: 'jpg',
			video: 'mp4',
			audio: 'mp3'
		}
	}
}