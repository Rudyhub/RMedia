const cwd = process.cwd();
module.exports = {
	ui: {
		saveas: '输出的目录是：'
	},
	ffmpeg: function(){
		let ffmpeg = require('fluent-ffmpeg'),
			path = cwd + '/app/plugins/ffmpeg/';
		ffmpeg.setFfmpegPath(path + 'ffmpeg.exe');
		ffmpeg.setFfprobePath(path +'ffprobe.exe');
		return ffmpeg;
	},
	appRoot: cwd + '/app/'
}