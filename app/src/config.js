const cwd = process.cwd();
const appRoot = cwd + '\\app\\';
module.exports = {
	appRoot: appRoot,
	ffmpegRoot: appRoot + 'plugins\\ffmpeg',
	audioThumb: appRoot + 'css/audio.jpg',
	output: {
		folder: process.env.USERPROFILE+'/desktop',
		width: 1280,
		bitv: 1024000,
		bita: 128000,
		format: {
			image: 'jpg',
			video: 'mp4',
			audio: 'mp3'
		}
	}
}