const cwd = process.cwd();
const appRoot = cwd + '/app/';
module.exports = {
	ui: {
		saveas: '输出的目录是：'
	},
	appRoot: appRoot,
	ffmpegRoot: appRoot + 'plugins/ffmpeg/',
	audioThumb: appRoot + 'css/audio.jpg',
	output: {
		folder: '',
		width: 1280,
		format: {
			image: 'jpg',
			video: 'mp4',
			audio: 'mp3'
		}
	}
}