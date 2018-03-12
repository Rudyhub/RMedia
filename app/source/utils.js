const Vue = require('./vue.min');
module.exports = {
    timemat(time){
        let t,
            mat = (n) => {
                return n < 10 ? '0'+n : n;
            };
        if(typeof time === 'string' && /^\d{2}:\d{2}:\d{2}([\.\d]*)$/.test(time)){
            t = time.split(':');
            return (parseInt(t[0]*3600) + parseInt(t[1]*60) + parseFloat(t[2])) * 1000;
        }else if(typeof time === 'number'){
            if(isNaN(time)) return '00:00:00';
            t = time / 1000;
            let h = Math.floor( t/3600 );
            let m = Math.floor( (t%3600) / 60 );
            let s = Math.floor( t%60 );
            return mat(h) + ':' + mat(m) + ':' + mat(s);
        }else{
            return "error time";
        }
    },
    datemat(time){
        let date;
        if(typeof time === 'number'){
            date = new Date(time);
        }else if(typeof time === 'string'){
            return new Date(time).getTime();
        }else{
            date = new Date();
        }
        return date.getFullYear() + '-' + (date.getMonth()+1) + '-' + date.getDate()
    },
    sizemat(b, flag){
        if(!flag){
            if(b < 1024) return b + ' B';
            let size = b/1024,
                fixed = arguments[1] || 2;
            if(size < 1024){
                return size.toFixed(fixed) + ' KB';
            }else{
                return (size/1024).toFixed(fixed) + ' MB';
            }
        }else{
            if(/^[\d\.]+\s*KB$/.test(b)){
                return parseFloat(b)*1024;
            }else if(/^[\d\.]+\s*MB$/.test(b)){
                return parseFloat(b)*1024*1024;
            }else{
                return parseFloat(b);
            }
        }
    },
    namemat(str,n){
        if(/\d+$/g.test(str)){
            return str.replace(/\d+$/g, function(a){
                return (parseInt('1'+a) + n).toString().slice(1);
            });
        }
        return str + (100 + n).toString().slice(1);
    },
    css(node, name){
        return parseFloat(window.getComputedStyle(node)[name]);
    },
    dialog: new Vue({
        el: '#dialog',
        data: {
            show: false,
            title: '',
            body: '',
            btns: []
        },
        methods: {
            setBtn(){
                this.btns.splice(0, this.btns.length);
                this.btns.push(...arguments);
            },
            dialogFn(e, code){
                this.show = false;
                this.title = '';
                this.body = '';
                this.btns.splice(0, this.btns.length);
                if(typeof this.callback === 'function'){
                    this.callback.call(e.currentTarget, code);
                    this.callback = null;
                }
            }
        }
    }),
    menu: new Vue({
        el: '#contextmenu',
        data: {
            show: false,
            x: 0,
            y: 0,
            items: []
        },
        methods: {
            setItem(){
                this.items.splice(0, this.items.length);
                this.items.push(...arguments);
            },
            contextmenuFn(e){
                let target = e.target;
                if(!target.hasAttribute('data-name')) return false;
                this.show = false;
                this.items.splice(0, this.items.length);
                if(typeof this.callback === 'function'){
                    this.callback.call(target, target.dataset.name);
                    this.callback = null;
                    this.x = this.y = 0;
                }
            },
            remove(){
                this.items.splice(0, this.items.length);
                this.show = false;
                this.callback = null;
            }
        },
        components: {
            'sub-menu': {
                name: 'sub-menu',
                template: `
                <ul class="contextmenu-submenu">
                    <li class="contextmenu-item" v-for="subitem in item.submenu">
                        <div class="contextmenu-item-inner" v-html="subitem.html" :data-name="subitem.name"></div>
                        <sub-menu v-if="subitem.submenu" :item="subitem"></sub-menu>
                    </li>
                </ul>`,
                props: ['item']
            }
        }
    })
};
