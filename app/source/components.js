
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
};