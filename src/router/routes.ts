import { createRouter, createWebHistory } from "vue-router";
import { authStore } from "../store/AuthStore";
import UserService from "../services/UserService";
import AuthService from "../services/AuthServices";





const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/:pathMach(.*)*',
            component:()=> import('../components/notfound.vue')
        },
        {
            path: '/',
            component:()=> import('../home/home.component.vue'),
            name:'home'
        },
        {
            path: '/login',
            component: ()=>import('../components/auth/login.component.vue'),
            name:'login'
        },
        {
            path: '/register',
            component: ()=> import('../components/auth/register.component.vue'),
            name:'register'
        },
        {
            path: '/courses',
            component:()=> import('../courses/courses.component.vue'),
            name:'courses',
        },
        {
            path: '/courses/:id',
            component:()=> import('../courses/courseInfoPage/course.info.page.vue'),
            name:'courses-description',
        },
        {
            path: '/cart',
            name:'cart',
            component: () => import('../cart/cart.page.vue'),
        },
        {
            path: '/mis-courses',
            name:'mycourses',
            component: () => import('../mycourses/my.courses.page.vue'),
        },
        {
            path: '/:googleid/affiliaty/:id',
            name:'affiliaty',
            component: () => import('../courses/courseInfoPage/course.info.page.vue'),
            beforeEnter: (to, from, next) => {
                const profile = AuthService.getProfile()

                profile.then((res)=>{
                    if (res==null) {
                        localStorage.setItem('referido', to.fullPath); // Guarda el enlace
                        next({name : 'register'});
                      } else {
                        next();
                      }
                }
                )

              }
        }
    ]
})


export default router