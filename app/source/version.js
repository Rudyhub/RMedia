const https = require('https'),
	utils = require('./utils'),
	aEl = document.createElement('a');
module.exports = (url, version)=>{
	https.get(url, (res)=>{
		res.on('data', (data)=>{
			let match = /data-version=\"([^\"]*?)\"\s+data-loadurl=\"([^\"]*?)\"/i.exec(data.toString());
			if(match && match[1] && match[1] !== version){
				utils.dialog.show = true;
				utils.dialog.title = '版本更新';
				utils.dialog.body = '<p>有新版本，更新到：v'+match[1]+'。更新详情请查看【帮助文档】</p>';
				utils.dialog.setBtn('下载更新','暂不');
				utils.dialog.callback = function(code){
					utils.dialog.callback = null;
					if(code === 0){
						aEl.href = match[2];
						aEl.download = match[2].slice(match[2].lastIndexOf('/')+1);
						aEl.click();
					}
				}
			}
		});
	});
}