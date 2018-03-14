const cp = require('child_process'),
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
		utils.dialog.body = '<p>ffmpeg文件丢失，请确保安装目录下的文件夹ffmpeg/有ffmpeg.exe和ffprobe.exe文件。</p>';
	}
}

module.exports = {
	appRoot: appRoot,
	ffmpegPath: ffmpegPath,
	ffprobePath: utils.path(appRoot+'\\ffmpeg\\ffprobe.exe'),
	audioThumb: utils.path('..\\css\\audio.jpg'),
	logPath: utils.path(appRoot + '\\cache\\log.txt'),
	cacheThumb: utils.path(appRoot + '\\cache\\thumb'),
	output: {
		folder: utils.path(process.env.USERPROFILE+'\\desktop'),
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