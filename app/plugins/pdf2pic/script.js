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
outputEl.nwdirectory = true;

let paramsPanel = document.querySelector('[data-by=params]'),
    listEl = document.getElementById('list'),
    scaleEl = document.querySelector('[name=scale]'),
    qualityEl = document.querySelector('[name=quality]'),
    mergeEl = document.querySelector('[name=merge]'),
    dialog = document.querySelector('.dialog'),
    dContent = dialog.querySelector('.dialog-content'),
    progressEl = dialog.querySelector('.dialog-progress');

function toolbarFn(name){
    switch(name){
        case 'chosefile': inputEl.click(); break;
        case 'saveas': outputEl.click(); break;
        case 'start': output(); break;
        case 'params':
            paramsPanel.classList.add('set-params-show');
    }
};
function setParamsFn(code){
    paramsPanel.classList.remove('set-params-show');
    if(code){
        console.log(code);
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
            itemEl = document.createElement('div');
            itemEl.className = 'list-item';
            itemEl.dataset.path = file.path;
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


function output(){
    let items = document.querySelectorAll('.list-item'),
        len = items.length,
        i = 0,
        scale = parseFloat(scaleEl.value) || 2,
        quality = parseFloat(qualityEl.value) || 1,
        merge = parseInt(mergeEl.value) || 1,
        viewport,
        canvas = document.createElement('canvas'),
        context,
        renderContext,
        pageNum = 0;

    progressEl.value = 0;
    recycle();
    function recycle(){
        pageNum = 0;
        PDFJS.getDocument(items[i].dataset.path).then( (pdf)=>{
            inrecycle();
            function inrecycle(){
                dialog.classList.add('dialog-show');
                progressEl.value = (i+1)/len*100;
                dContent.innerHTML = '开始处理第'+(i+1)+'/'+len+'个文件，<br />第'+(pageNum+1)+'/'+pdf.numPages+'页';
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
                        canvasToFile('c:\\users\\administrator\\desktop\\a_'+i+'_'+pageNum+'.jpg', canvas.toDataURL('image/jpeg', quality), ()=>{
                            if(pageNum < pdf.numPages){
                                inrecycle();
                            }else{
                                i++;
                                if(i < len){
                                    recycle();
                                }else{
                                    dContent.innerHTML = '完成！';
                                }
                            }
                        }, (errmsg)=>{
                            dContent.innerHTML = '处理失败：'+errmsg;
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