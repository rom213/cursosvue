import { createRouter, createWebHistory } from "vue-router";
import homeComponent from "../home/home.component.vue"; 
import loginComponent from "../components/auth/login.component.vue";
import UsersComponent from "../components/users.component.vue";
import Notfound from "../components/notfound.vue";
import UserProfileComponent from "../components/user-profile-component.vue";
import UserPostsComponent from "../components/user-posts.component.vue";
import RegisterComponent from "../components/auth/register.component.vue";
import CoursesComponent from "../courses/courses.component.vue";






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
            path:'/register',
            component:RegisterComponent,
        },
        {
            path:'/courses',
            component:CoursesComponent,
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