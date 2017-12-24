const cwd = process.cwd();
const appRoot = cwd + '\\app\\';
module.exports = {
	appRoot: appRoot,
	ffmpegRoot: appRoot + 'plugins\\ffmpeg',
	audioThumb: appRoot + 'css/audio.jpg',
	loadingGif: appRoot + 'css/loading.gif',
	
	//html支持的格式
	formats: {
	    image: ['jpg','jpeg','png','gif','webp','svg','ico','bmp','jps','mpo'],
	    video: ['mp4','ogg','webm'],
	    audio: ['aac','mp3','wav','mpeg']
	},
	//需要转码为html支持的格式
	otherFormats: {
	    image: ['tga','psd','iff','pbm','pcx','tif'],
	    video: ['ts','flv','mkv','rm','mov','wmv','avi','rmvb'],
	    audio: ['wma','mid']
	},
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