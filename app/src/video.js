const ffmpeg = require('fluent-ffmpeg');
const config = require('./src/config');

ffmpeg.setFfmpegPath(config.ffmpegPath+'ffmpeg.exe');
ffmpeg.setFfprobePath(config.ffmpegPath+'ffprobe.exe');
function convert(options){
	ffmpeg('C:\\Users\\Administrator\\Desktop\\o.mp4').format('avi').on('error',function(err){
		console.log(err.message)
	}).on('progress', function(progress) {
	    console.log('Processing: ' + progress.percent + '% done');
	}).on('end', function(){
		console.log('ended');
	}).save('C:\\Users\\Administrator\\Desktop\\o.avi');
}
