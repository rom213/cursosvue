import { createRouter, createWebHistory } from "vue-router";
import homeComponent from "../components/home.component.vue";
import loginComponent from "../components/login.component.vue";
import UsersComponent from "../components/users.component.vue";
import UserComponent from "../components/user.component.vue";
import Notfound from "../components/notfound.vue";
import UserProfileComponent from "../components/user-profile-component.vue";
import UserPostsComponent from "../components/user-posts.component.vue";






const router = createRouter({
    history:createWebHistory(),
    routes:[
        {
            path:'/:pathMach(.*)*',
            component:Notfound
        },
        {
            path:'/',
            component:homeComponent
        },
        {
            path:'/login',
            component:loginComponent,
        },
        {
            path:'/users',
            component: UsersComponent
        },
        {
            path:'/userabc/:iduser',
            name: 'user',
            component: ()=> import('../components/user.component.vue'),
            children:[
                {
                    // /user/:iduser/profile
                    path:'profile',
                    component: UserProfileComponent,
                    name: 'user-profile'
                }
                ,
                {
                    // /user/:iduser/posts
                    path:'posts',
                    component: UserPostsComponent,
                    name: 'user-posts'
                }
            ]
        }
    ]
})

export default router