const path = require('path');
const cp = require('child_process');
let appRoot = path.dirname(process.execPath),
	ffmpegPath = path.normalize(appRoot+'\\ffmpeg\\ffmpeg.exe'),
	checkPath = cp.spawnSync(ffmpegPath,['-version']);
if(checkPath.error){
	appRoot = process.cwd();
	ffmpegPath = path.normalize(appRoot+'\\ffmpeg\\ffmpeg.exe');
}

module.exports = {
	appRoot: appRoot,
	ffmpegPath: ffmpegPath,
	ffprobePath: path.normalize(appRoot+'\\ffmpeg\\ffprobe.exe'),
	audioThumb: path.normalize('..\\css\\audio.jpg'),
	loadingGif: path.normalize('..\\css\\loading.gif'),
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
		},
		speeds: {
			ultrafast: '无敌快',
			superfast: '超级快',
			veryfast: '非常快',
			faster: '比较快',
			fast: '正常快',
			medium: '普通',
			slow: '正常慢',
			slower: '比较慢',
			veryslow: '非常慢',
			placebo: '超级慢'
		},
		speedLevel: 'slow'
	}
}