
module.exports = (Vue)=>{
    //拖拽指令
    Vue.directive('drag',{
        bind(el){
            let drag = el.querySelectorAll('[data-drag]'),
                len = drag.length,
                style = window.getComputedStyle,
                i = 0,
                start_x = 0, start_y = 0, cur_x = 0, cur_y = 0, matrix;

            if(len)
                for(; i<len; i++) drag[i].addEventListener('mousedown', downFn);
            else
                el.addEventListener('mousedown', downFn);

            function downFn(e){
                matrix = style(el)['transform'].split(',');
                start_x = e.x;
                start_y = e.y;
                cur_x = parseInt(style(el)['left']) || 0;
                cur_y = parseInt(style(el)['top']) || 0;
                el.style.transition = 'none';
                document.addEventListener('mousemove', moveFn);
                document.addEventListener('mouseup', upFn);
            }
            function moveFn(e){
                el.style.left = (e.x-start_x+cur_x)+'px';
                el.style.top = (e.y-start_y+cur_y)+'px';
            }
            function upFn(){
                el.style.cssText = el.style.cssText.replace(/\s*transition:\s*none[;]?/i,'');
                document.removeEventListener('mousemove', moveFn);
                document.removeEventListener('mouseup', upFn);
            }
        }
    });
};