const cwd = process.cwd();
const appRoot = cwd + '\\app\\';
module.exports = {
	appRoot: appRoot,
	ffmpegRoot: appRoot + 'plugins\\ffmpeg',
	audioThumb: appRoot + 'css/audio.jpg',
	loadingGif: appRoot + 'css/loading.gif',
	output: {
		folder: process.env.USERPROFILE+'/desktop',
		width: 1280,
		bitv: 1024,
		bita: 128,
		format: {
			image: 'jpg',
			video: 'mp4',
			audio: 'mp3'
		}
	}
}