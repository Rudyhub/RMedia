        /*
        mainSubmenuFn(e,name){
            let target, panel, i = 0, item;
            vue.active.mainSubmenu = name;
            if(name === 'firstAid'){
                utils.dialog('警告：','<p>为了避免失误操作，必须谨慎选择是否真的启用急救，不到万不得已，请不要轻易启用！</p>',['启用','关闭'],(code)=>{
                    if(code === 0){
                        Media.killAll((msg)=>{
                            utils.dialog('提示：','<p>所有可能的错误程序已被清除！<br>详细：'+msg+'</p>');
                        });
                    }
                });
            }else{
                item = vue.items[ Object.keys(vue.items)[i] ];

                switch(name){
                    case 'convert':
                    function convert(){

                    }
                    break;
                    case 'vtogif':
                    //type == video && toformat == gif
                    function vtogif(){
                        if(item.type === 'video'){
                            let w = item.towidth%2 === 0 ? item.towidth : item.towidth - 1,
                                h = item.toheight%2 === 0 ? item.toheight : item.toheight - 1,
                                t = item.endTime - item.startTime,
                                cammand = ['-i', item.path, '-s', w+'x'+h, '-y', vue.output+'\\'+item.toname + '.gif'];
                            if(item.endTime < item.duration && t > 0) cammand.unshift('-t', t);
                            if(item.startTime > 0) cammand.unshift('-ss', item.startTime);

                            Media.convert({
                                cammand,
                                progress(cur){
                                    item.progress = (cur / t)*100;
                                },
                                complete(code, msg){
                                    if(code !== 0){
                                        utils.dialog('失败','<p>'+msg+'</p>');
                                    }else{
                                        item.progress = 100;
                                    }

                                    item = vue.items[ Object.keys(vue.items)[++i] ];
                                    if(item) vtogif(item);
                                }
                            });
                        }
                    }
                    vtogif();
                    break;
                    case 'giftov':
                    //format == gif && toformat is video
                    function giftov(){
                        if(item.format === 'gif'){
                            let w = item.towidth%2 === 0 ? item.towidth : item.towidth - 1,
                                h = item.toheight%2 === 0 ? item.toheight : item.toheight - 1;

                            Media.convert({
                                cammand: ['-i', item.path, '-s', w+'x'+h, '-pix_fmt', 'yuv420p', '-y', vue.output+'\\'+item.toname + '.mp4'],
                                progress(){
                                    item.progress = 50;
                                },
                                complete(code, msg){
                                    if(code !== 0){
                                        utils.dialog('失败','<p>'+msg+'</p>');
                                    }else{
                                        item.progress = 100;
                                        item = vue.items[ Object.keys(vue.items)[++i] ];
                                        if(item) giftov(item);
                                    }
                                }
                            });
                        }
                    }
                    giftov();
                    break;
                    case 'ptogif':
                    //type = image queue && toformat === gif
                    function ptogif(){
                        let reg,
                            d,
                            input,
                            w = item.towidth%2 === 0 ? item.towidth : item.towidth - 1,
                            h = item.toheight%2 === 0 ? item.toheight : item.toheight - 1;
                        if(item){
                            reg = new RegExp('(\\d+)\\.'+item.format+'$','i');
                            d = reg.exec(item.path);
                            if(d && d[1]){
                                input = item.path.replace(reg, function($0,$1){
                                    return '%0'+$1.length+'d.'+item.format;
                                });
                                Media.convert({
                                    cammand: ['-r', 25,'-i', input, '-s', w+'x'+h, '-y', vue.output+'\\'+item.toname + '.gif'],
                                    progress(){
                                        item.progress = 50;
                                    },
                                    complete(code, msg){
                                        if(code !== 0){
                                            utils.dialog('失败','<p>'+msg+'</p>');
                                        }else{
                                            item.progress = 100;
                                            item = vue.items[ Object.keys(vue.items)[++i] ];
                                            if(item) ptogif(item);
                                        }
                                    }
                                });
                            }else{
                                utils.dialog('失败：',
                                    `<p>系列图不满足条件！</p>
                                    <p>系列图名称必须是有规律、等长度、末尾带系列化数字的名称。</p>
                                    <p>如：001.png、002.png、003.png... 或 img01.png、img02.png、img03.png...</p>
                                    <p>然后只需要选择第一张图片即可</p>`);
                            }
                        }
                    }
                    ptogif();     
                    break;
                    case 'vtoa':
                    //type == video && toformat is audio
                    function vtoa(){
                        if(item.bita > 0){
                            let t = item.endTime - item.startTime,
                                cammand = ['-i', item.path, '-vn', '-b:a', item.bita+'k', '-y', vue.output+'\\'+item.toname + '.mp3'];

                            if(item.endTime < item.duration && t > 0) cammand.unshift('-t', t);
                            if(item.startTime > 0) cammand.unshift('-ss', item.startTime);
                            Media.convert({
                                cammand,
                                progress(cur){
                                    item.progress = (cur / t)*100;
                                },
                                complete(code, msg){
                                    if(code !== 0){
                                        utils.dialog('失败','<p>'+msg+'</p>');
                                    }else{
                                        item.progress = 100;
                                        item = vue.items[ Object.keys(vue.items)[++i] ];
                                        if(item) vtoa(item);
                                    }
                                }
                            });
                        }
                    }
                    vtoa();
                    break;  
                }
            }
        },
        */