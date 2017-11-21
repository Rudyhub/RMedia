module.exports = {
	ui: {
		title: '多媒体处理器',
		open: '打开',
		save: '保存',
		start: '开始',
		nosave: '未选择输出目录',
		saveas: '输出的目录是：'
	},
	ffmpeg: function(){
		let ffmpeg = require('fluent-ffmpeg'),
			path = process.cwd() + '/app/plugins/ffmpeg/';
		ffmpeg.setFfmpegPath(path + 'ffmpeg.exe');
		ffmpeg.setFfprobePath(path +'ffprobe.exe');
		return ffmpeg;
	}
}