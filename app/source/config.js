const cwd = process.cwd();
const appRoot = cwd + '\\';
module.exports = {
	appRoot: appRoot,
	ffmpegRoot: appRoot + 'ffmpeg',
	audioThumb: appRoot + 'css\\audio.jpg',
	loadingGif: appRoot + 'css\\loading.gif',
	icon: appRoot + 'css\\icon.png',
	logPath: appRoot + 'cache\\log.txt',
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