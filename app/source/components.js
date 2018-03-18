const Vue = require('./vue.min');
const utils = require('./utils');
const win = nw.Window.get();
const appInfo = Object.freeze(nw.App.manifest);
//title bar
Vue.component('title-bar',{
    template: `
    <div class="titlebar">
        <h1 class="title draggable">${appInfo.window.title}</h1>
        <div class="titlebar-tool">
            <button v-on:click="minimize">&minus;</button>
            <button v-on:click="toggle" class="full"><i></i></button>
            <button v-on:click="close">&times;</button>
        </div>
    </div>`,
    methods: {
        minimize: win.minimize,
        toggle(e){
            let classList = e.currentTarget.classList,
                w = screen.width * .8,
                h = Math.round(w * .5625),
                x = (screen.width - w) / 2,
                y = (screen.height - h) / 2;
            classList.toggle('full');
            if(classList.contains('full')){
                win.maximize();
            }else{
                win.moveTo(x, y);
                win.resizeTo(w, h);
            }
        },
        close(){
            win.close(true);
        }
    }
});

//footer bar
Vue.component('footer-bar',{
    template:`
    <footer class="footer draggable">
        ${appInfo.window.title} (${appInfo.name}-v${appInfo.version}) ${appInfo.copyright}
    </footer>`
});

//menu tree
Vue.component('menu-tree',{
    name: 'menu-tree',
    template: `
    <ul class="tree">
        <li class="tree-item" v-for="item in items">
            <div class="tree-item-name" v-html="item.html" :data-name="item.name"></div>
            <menu-tree v-if="item.items" :items="item.items"></menu-tree>
        </li>
    </ul>`,
    props: ['items']
});

Vue.component('control-logo',{
    template:`
    <div class="control-logo">
        <div class="control-logo-header">
            LOGO控制：
            <i v-on:click="logoFn($event,'add',param)" class="icon-btn icon icon-plus"></i>
            <i v-on:click="logoFn($event,'del',param)" class="icon-btn icon icon-minus"></i>
            <span v-if="param">
                <button v-on:click="logoFn($event,'start',param)" class="btn-s" :disabled="item.currentTime<item.startTime || item.currentTime>=item.logoEnd" title="开始显示">{{item.logoStart | timemat}}</button>
                -
                <button v-on:click="logoFn($event, 'end', param)" class="btn-s" :disabled="item.currentTime>item.endTime || item.currentTime<=item.logoStart" title="结束显示">{{item.logoEnd | timemat  }}</button>
            </span>
        </div>
        <div class="control-logo-body">
            <div class="control-logo-names">
                <div class="control-logo-name">尺寸比例：</div>
                <div class="control-logo-name">水平位置：</div>
                <div class="control-logo-name">垂直位置：</div>
            </div>
            <div class="control-logo-ranges">
                <input v-on:input="logoFn($event,'size',param)" class="control-logo-range" type="range" min="0" max="100" step="1" title="尺寸比例"/>
                <input v-on:input="logoFn($event,'left',param)" class="control-logo-range" type="range" min="0" max="100" step="1" title="水平位置"/>
                <input v-on:input="logoFn($event,'top', param)" class="control-logo-range" type="range" min="0" max="100" step="1" title="垂直位置"/>
            </div>
        </div>
    </div>`,
    props: ['param','item'],
    methods: {
        logoFn(e, name, param){
            this.$emit('logo', name, parseFloat(e.currentTarget.value), (param || ''));
        }
    },
    filters: {
        timemat(t){
            return utils.timemat(t*1000);
        }
    }
});
