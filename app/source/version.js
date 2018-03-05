const https = require('https');
const aEl = document.createElement('a');
module.exports = (url, version, dialog)=>{
	https.get(url, (res)=>{
		res.on('data', (data)=>{
			let match = /data-version=\"([^\"]*?)\"\s+data-loadurl=\"([^\"]*?)\"/i.exec(data.toString());
			if(match && match[1] && match[1] !== version){
				dialog.show = true;
				dialog.title = '版本更新';
				dialog.body = '<p>有新版本，更新到：v'+match[1]+'。更新详情请查看【帮助文档】</p>';
				dialog.setBtn('下载更新','暂不');
				dialog.callback = function(code){
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