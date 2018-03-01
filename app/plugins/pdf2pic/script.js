const win = nw.Window.get();
const fs = require('fs');

let winToggle = true;
const titlebarFn = (name, _this)=>{
    switch(name){
        case 'min':
        {
            win.minimize();
        }
        break;
        case 'toggle':
        {
            let w = screen.width * .8,
                h = Math.round(w * .5625),
                x = (screen.width - w) / 2,
                y = (screen.height - h) / 2;
            if(winToggle = !winToggle){
                win.maximize();
                _this.className = 'full';
            }else{
                win.moveTo(x, y);
                win.resizeTo(w, h);
                _this.removeAttribute('class');
            }
        }
        break;
        case 'close':
        {
            win.close(true);
            win = null;
        }
    }
};

const inputEl = document.createElement('input');
const outputEl = document.createElement('input');

inputEl.type = outputEl.type = 'file';
inputEl.multiple = true;
inputEl.accept = 'application/pdf';
outputEl.nwdirectory = true;

let paramsPanel = document.querySelector('[data-by=params]'),
    listEl = document.getElementById('list'),
    scaleEl = document.querySelector('[name=scale]'),
    curScale = document.getElementById('cur-scale'),
    scale = 2,
    qualityEl = document.querySelector('[name=quality]'),
    curQuality = document.getElementById('cur-quality'),
    quality = 1,
    dialog = document.querySelector('.dialog'),
    dContent = dialog.querySelector('.dialog-content'),
    progressTxt = dialog.querySelectorAll('.dialog-progress-txt'),
    progressVal = dialog.querySelectorAll('.dialog-progress-value'),
    outputPath = '';

setCurVal();
function setCurVal(){
    curScale.innerText = scale;
    curQuality.innerText = quality;
}

function toolbarFn(name){
    switch(name){
        case 'chosefile': inputEl.click(); break;
        case 'start': outputEl.click(); break;
        case 'params':
            paramsPanel.classList.add('set-params-show');
            setCurVal();
    }
};
function setParamsFn(code){
    paramsPanel.classList.remove('set-params-show');
    if(code === 1){
        scale = parseFloat(scaleEl.value) || 2;
        quality = parseFloat(qualityEl.value) || 1;
        setCurVal();
    }else if(code === 2){
        paramsPanel.reset();
        scale = 2;
        quality = 1;
        setCurVal();
    }
}

function deleteItemFn(_this){
    list.removeChild(_this.parentNode.parentNode);
}

function dialogCloseFn(){
    dialog.classList.remove('dialog-show');
}
inputEl.addEventListener('change', ()=>{
    let i = 0, len, itemEl, file;
    if(inputEl.files && (len = inputEl.files.length)){
        for(; i < len; i++){
            file = inputEl.files[i];
            if(file.type != 'application/pdf') continue;
            itemEl = document.createElement('div');
            itemEl.className = 'list-item';
            itemEl.dataset.path = file.path;
            itemEl.dataset.filename = file.name.slice(0,-4);
            itemEl.innerHTML = `
                <div class="list-item-tools">
                    <button class="list-item-close" onclick="deleteItemFn(this)">&times;</button>
                </div>
                <embed src="${file.path}#toolbar=0" type="application/pdf"/>
            `;
            list.append(itemEl);
        }
    }
});
outputEl.addEventListener('change', startFn);
outputEl.addEventListener('cancel', startFn);
function startFn(){
    let dir;
    if( outputEl.files && outputEl.files[0] && (dir = outputEl.files[0].path)){
        output(dir);
    }else{
        if(confirm('您未输出目录，重新选择？')){
            outputEl.click();
        }
    }
}

function output(dir){
    let items = document.querySelectorAll('.list-item'),
        len = items.length,
        i = 0,
        viewport,
        canvas = document.createElement('canvas'),
        context,
        renderContext,
        pageNum = 0;
    if(len > 0){
        recycle();
    }else{
        if(confirm('没有任何PDF文件，去添加PDF?')){
            inputEl.click();
        }
    }
    function recycle(){
        pageNum = 0;
        dialog.classList.add('dialog-show');
        progressTxt[0].innerText = '文件：'+ (i+1) + '/' + len;
        progressVal[0].style.width = i/len*100 + '%';
        PDFJS.getDocument(items[i].dataset.path).then( (pdf)=>{
            inrecycle();
            function inrecycle(){
                progressTxt[1].innerText = '页：'+ (pageNum+1) + '/' + pdf.numPages;
                progressVal[1].style.width = pageNum/pdf.numPages*100 + '%';
                dContent.innerHTML = '正在处理...';
                dContent.classList.add('dialog-rotating');
                pdf.getPage( ++pageNum ).then( (page) => {
                    viewport = page.getViewport(scale);
                    context = canvas.getContext('2d');
                    canvas.width = viewport.width;
                    canvas.height = viewport.height;
                    renderContext = {
                        canvasContext: context,
                        viewport: viewport
                    };

                    page.render(renderContext).then(()=>{
                        canvasToFile(dir+'\\'+items[i].dataset.filename+'_'+i+'_'+pageNum+'.jpg', canvas.toDataURL('image/jpeg', quality), ()=>{
                            progressVal[1].style.width = pageNum/pdf.numPages*100 + '%';
                            if(pageNum < pdf.numPages){
                                inrecycle();
                            }else{
                                i++;
                                if(i < len){
                                    recycle();
                                }else{
                                    progressVal[0].style.width = i/len*100 + '%';
                                    dContent.innerHTML = '完成！';
                                    dContent.classList.remove('dialog-rotating');
                                }
                            }
                        }, (errmsg)=>{
                            dContent.innerHTML = '处理失败：'+errmsg;
                            dContent.classList.remove('dialog-rotating');
                        });
                    });
                });
            }
        });
    }
}
function canvasToFile(path, data, success, fail){
    fs.writeFile(path, data.replace(/^data:image\/\w+;base64,/, ''), 'base64', (err)=>{
        if(err){
            if(fail) fail(err.message);
        }else{
            if(success) success();
        }
    });
}