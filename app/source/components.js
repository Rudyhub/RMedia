
module.exports = (Vue)=>{
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
        name: 'control-logo',
        template:`
        <div class="control-logo">
            <div class="control-logo-header">
                LOGO控制：
                <i v-on:click="logoFn($event,'add',param)" class="icon-btn icon icon-plus"></i>
                <i v-on:click="logoFn($event,'del',param)" class="icon-btn icon icon-minus"></i>
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
        props: ['param'],
        methods: {
            logoFn(e, name, param){
                this.$emit('logo', name, parseFloat(e.currentTarget.value), param);
            }
        }
    });
};