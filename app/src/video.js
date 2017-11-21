const config = require('./src/config');
const ffmpeg = config.ffmpeg(); 
function convert(options){
	ffmpeg('C:\\Users\\Administrator\\Desktop\\o.mp4').format('avi').on('error',function(err){
		console.log(err.message)
	}).on('progress', function(progress) {
	    console.log('Processing: ' + progress.percent + '% done');
	}).on('end', function(){
		console.log('ended');
	}).save('C:\\Users\\Administrator\\Desktop\\o.avi');
}
