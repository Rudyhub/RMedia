const cwd = process.cwd();
const appRoot = cwd + '\\';
module.exports = {
	appInfo: {
		version: '1.0',
		author: 'mystermangit',
		homepage: 'https://github.com/mystermangit/fupconvert',
	},
	appRoot: appRoot,
	ffmpegRoot: appRoot + 'plugins\\ffmpeg',
	audioThumb: appRoot + 'css/audio.jpg',
	loadingGif: appRoot + 'css/loading.gif',
	icon: appRoot + 'css/icon.png',
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