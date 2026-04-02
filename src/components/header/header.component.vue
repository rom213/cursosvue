<script lang="ts" setup>
import { RouterLink, useRoute, useRouter } from 'vue-router';
import { authStore } from '../../store/AuthStore';
import { cartStore } from '../../store/CartStore';
import { ref, computed } from 'vue';
import HeaderSearchComponent from './header.search.component.vue';
import CartPage from '../../cart/cart.page.vue';
import { icons } from './headerIcons';
import { GoogleLogin } from 'vue3-google-login';
import AuthService from '../../services/AuthServices';

const handleLoginSuccess = async (response: any) => {
    const ser = await AuthService.verifyToken(response.credential)
    userStore.setProfile(ser)
}

const showPoverMore = ref(false);
const showCart = ref(false)

const userStore = authStore()
const carSto = cartStore()
const router = useRouter();
const route = useRoute();

const positionNavigate = computed(() => {
    if (route.name === 'home' || route.path === '/') return 0;
    if (route.path.startsWith('/courses') || route.name === 'courses') return 1;
    if (route.path.startsWith('/monetizar') || route.name === 'monetizar') return 2;
    if (route.name === 'mycourses') return 3;
    return -1;
});

const hadleCartData = () => {
    if (window.innerWidth > 768) { hadleShowCart(); return; }
    router.push({ name: 'cart' })
}
const hadleShowCart = () => { showCart.value = !showCart.value }
</script>

<template>
    <!-- ═══ BARRA PRINCIPAL ═══════════════════════════════ -->
    <header class="header-root">
        <div class="header-inner">

            <!-- ── Logo + Marca ──────────────────────────── -->
            <RouterLink :to="{ name: 'home' }" class="header-brand">
                <img src="../../assets/home/logo_cursos.png" alt="Logo" class="header-logo" width="120" height="40" />
                <span class="header-brand-name">CURSOS ESTUDIA Y TRABAJA</span>
            </RouterLink>

            <!-- ── Navegación central ─────────────────────── -->
            <nav class="header-nav">
                <RouterLink :to="{ name: 'home' }" class="nav-link" :class="{ 'nav-active': positionNavigate === 0 }">
                    <span class="nav-icon" v-html="icons.home" />
                    <span class="nav-label">Inicio</span>
                </RouterLink>
                <RouterLink :to="{ name: 'courses' }" class="nav-link" :class="{ 'nav-active': positionNavigate === 1 }">
                    <span class="nav-icon" v-html="icons.courses" />
                    <span class="nav-label">Cursos</span>
                </RouterLink>
                <RouterLink :to="{ name: 'monetizar' }" class="nav-link" :class="{ 'nav-active': positionNavigate === 2 }">
                    <span class="nav-icon" v-html="icons.monetizar" />
                    <span class="nav-label">Monetizar</span>
                </RouterLink>
                <RouterLink
                    v-if="userStore.getProfile()?.user?.is_bought"
                    :to="{ name: 'mycourses' }"
                    class="nav-link"
                    :class="{ 'nav-active': positionNavigate === 3 }"
                >
                    <span class="nav-icon" v-html="icons.misCursos" />
                    <span class="nav-label">Mis Cursos</span>
                </RouterLink>
            </nav>

            <!-- ── Acciones derecha ───────────────────────── -->
            <div class="header-right">
                <!-- Buscador (solo en tablet/desktop) -->
                <div class="search-desktop">
                    <HeaderSearchComponent />
                </div>

                <!-- Auth: no logueado → botón Google integrado -->
                <GoogleLogin v-if="userStore.getProfile() == null" :callback="handleLoginSuccess">
                    <button class="btn-auth" type="button">
                        <svg width="15" height="15" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                            <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                            <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
                            <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
                        </svg>
                        <span class="btn-auth-label">Iniciar sesión</span>
                    </button>
                </GoogleLogin>

                <!-- Auth: logueado → avatar + dropdown -->
                <div v-if="userStore.getProfile() != null" class="profile-wrap">
                    <button
                        class="profile-btn"
                        type="button"
                        @click="showPoverMore = !showPoverMore"
                    >
                        <img
                            class="profile-avatar"
                            :src="userStore.getProfile()?.user?.picture"
                            alt="Perfil"
                        />
                        <span class="profile-name">{{ userStore.getProfile()?.user?.given_name }}</span>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>

                    <div v-if="showPoverMore" class="profile-menu">
                        <div @click="showPoverMore = false" class="fixed inset-0 z-[-1]" />
                        <div class="profile-menu-header">
                            <p class="profile-menu-name">{{ userStore.getProfile()?.user?.name }}</p>
                            <p class="profile-menu-email">{{ userStore.getProfile()?.user?.email }}</p>
                        </div>
                        <RouterLink :to="{ name: 'mycourses' }" class="profile-menu-item" @click="showPoverMore = false">
                            <span class="w-4 h-4" v-html="icons.myCourses" />
                            Mis Cursos
                        </RouterLink>
                        <RouterLink :to="{ name: 'config' }" class="profile-menu-item" @click="showPoverMore = false">
                            <span class="w-4 h-4" v-html="icons.config" />
                            Configuración
                        </RouterLink>
                    </div>
                </div>

                <!-- Carrito -->
                <button class="cart-btn" type="button" aria-label="Carrito" @click="hadleCartData()">
                    <span class="cart-icon" v-html="icons.cart" />
                    <span v-if="carSto.countCart > 0" class="cart-badge">{{ carSto.countCart }}</span>
                </button>
            </div>
        </div>

        <!-- ── Buscador mobile (segunda fila, solo en < 768px) ── -->
        <div class="mobile-search-bar">
            <HeaderSearchComponent />
        </div>
    </header>

    <!-- Espaciador para la barra fija -->
    <div class="header-spacer"></div>

    <!-- ═══ SIDEBAR CARRITO ══════════════════════════════ -->
    <div v-if="showCart" class="fixed inset-0 z-[60] overflow-hidden" role="dialog" aria-modal="true">
        <div class="absolute inset-0 overflow-hidden">
            <div class="absolute inset-0 bg-black/30" @click="hadleShowCart()" />
            <div class="fixed inset-y-0 right-0 flex max-w-full">
                <div class="w-screen max-w-md bg-white shadow-2xl flex flex-col h-full">
                    <div class="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                        <h2 class="text-base font-semibold text-slate-900">Tu Carrito</h2>
                        <button @click="hadleShowCart()" class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <div class="flex-1 overflow-y-auto p-4">
                        <CartPage />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

/* ══ BARRA PRINCIPAL ══════════════════════════════════════ */
.header-root {
    position: fixed;
    top: 0; left: 0;
    width: 100%;
    z-index: 50;
    background: rgba(255, 255, 255, 0.96);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-bottom: 1px solid rgba(30, 64, 175, 0.08);
    box-shadow: 0 1px 12px rgba(13, 27, 42, 0.06);
    font-family: 'Inter', system-ui, sans-serif;
}

.header-inner {
    display: flex;
    align-items: center;
    height: 3.5rem;
    padding: 0 1.5rem 0 1.25rem;
    gap: 1.5rem;
    max-width: 1440px;
    margin: 0 auto;
}

/* ── Espaciador ─────────────────────────────────────────── */
.header-spacer { height: 3.5rem; }

/* ── Marca ─────────────────────────────────────────────── */
.header-brand {
    display: flex;
    align-items: center;
    gap: 0.55rem;
    text-decoration: none;
    flex-shrink: 0;
}
.header-logo { height: 1.9rem; width: auto; }
.header-brand-name {
    font-size: 0.72rem;
    font-weight: 800;
    letter-spacing: 0.06em;
    color: #0d1b2a;
    white-space: nowrap;
}

/* ── Navegación ────────────────────────────────────────── */
.header-nav {
    display: flex;
    align-items: center;
    gap: 0.15rem;
    flex: 1;
}

.nav-link {
    display: flex;
    align-items: center;
    gap: 0.32rem;
    padding: 0.32rem 0.6rem;
    border-radius: 7px;
    font-size: 0.8rem;
    font-weight: 500;
    color: #64748b;
    text-decoration: none;
    transition: color 0.18s, background 0.18s;
    white-space: nowrap;
}
.nav-icon {
    display: flex;
    align-items: center;
    width: 15px;
    height: 15px;
    flex-shrink: 0;
}
.nav-icon :deep(svg) { width: 15px; height: 15px; }

.nav-link:hover { color: #1e40af; background: rgba(30, 64, 175, 0.06); }
.nav-active     { color: #1e40af; font-weight: 600; background: rgba(30, 64, 175, 0.07); }

/* ── Zona derecha ──────────────────────────────────────── */
.header-right {
    display: flex;
    align-items: center;
    gap: 0.65rem;
    flex-shrink: 0;
    margin-left: auto;
}

/* ── Botón auth ─────────────────────────────────────────── */
.btn-auth {
    display: flex;
    align-items: center;
    gap: 0.45rem;
    background: #1e40af;
    color: #ffffff;
    font-family: 'Inter', sans-serif;
    font-size: 0.78rem;
    font-weight: 600;
    padding: 0.4rem 0.9rem;
    border-radius: 8px;
    border: none;
    cursor: pointer;
    white-space: nowrap;
    letter-spacing: 0.01em;
    transition: background 0.18s, transform 0.15s, box-shadow 0.18s;
    box-shadow: 0 2px 8px rgba(30, 64, 175, 0.28);
}
.btn-auth:hover {
    background: #1e3a8a;
    transform: translateY(-1px);
    box-shadow: 0 4px 14px rgba(30, 64, 175, 0.38);
}
.btn-auth:active { transform: translateY(0); }

/* ── Perfil ─────────────────────────────────────────────── */
.profile-wrap { position: relative; }

.profile-btn {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.25rem 0.55rem 0.25rem 0.3rem;
    border-radius: 9999px;
    border: 1px solid rgba(30, 64, 175, 0.12);
    background: transparent;
    cursor: pointer;
    transition: background 0.18s, border-color 0.18s;
    color: #475569;
}
.profile-btn:hover {
    background: rgba(30, 64, 175, 0.05);
    border-color: rgba(30, 64, 175, 0.22);
}
.profile-avatar {
    width: 1.75rem;
    height: 1.75rem;
    border-radius: 50%;
    object-fit: cover;
}
.profile-name {
    font-size: 0.78rem;
    font-weight: 600;
    color: #0d1b2a;
    max-width: 120px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.profile-menu {
    position: absolute;
    right: 0;
    top: calc(100% + 0.4rem);
    width: 220px;
    background: #ffffff;
    border-radius: 12px;
    border: 1px solid rgba(30, 64, 175, 0.09);
    box-shadow: 0 8px 32px rgba(13, 27, 42, 0.12), 0 2px 8px rgba(13, 27, 42, 0.06);
    overflow: hidden;
    z-index: 100;
}
.profile-menu-header {
    padding: 0.85rem 1rem;
    border-bottom: 1px solid rgba(30, 64, 175, 0.06);
    background: #f8faff;
}
.profile-menu-name  { font-size: 0.82rem; font-weight: 600; color: #0d1b2a; margin: 0; }
.profile-menu-email { font-size: 0.72rem; color: #64748b; margin: 0.1rem 0 0; }

.profile-menu-item {
    display: flex;
    align-items: center;
    gap: 0.65rem;
    padding: 0.65rem 1rem;
    font-size: 0.82rem;
    font-weight: 500;
    color: #475569;
    text-decoration: none;
    transition: background 0.15s, color 0.15s;
}
.profile-menu-item:hover { background: #f0f4ff; color: #1e40af; }

/* ── Carrito ─────────────────────────────────────────────── */
.cart-btn {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    border-radius: 8px;
    border: 1px solid rgba(30, 64, 175, 0.1);
    background: transparent;
    color: #475569;
    cursor: pointer;
    flex-shrink: 0;
    transition: background 0.18s, color 0.18s, border-color 0.18s;
}
.cart-icon {
    display: flex;
    align-items: center;
    width: 15px;
    height: 15px;
}
.cart-icon :deep(svg) { width: 15px; height: 15px; }

.cart-btn:hover {
    background: rgba(30, 64, 175, 0.06);
    color: #1e40af;
    border-color: rgba(30, 64, 175, 0.2);
}

.cart-badge {
    position: absolute;
    top: -5px;
    right: -5px;
    background: #dc2626;
    color: #fff;
    font-size: 0.55rem;
    font-weight: 700;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
    border: 1.5px solid #fff;
}

/* ── Buscador mobile (segunda fila) ─────────────────────── */
.mobile-search-bar {
    display: none;
    padding: 0.4rem 0.75rem 0.5rem;
    border-top: 1px solid rgba(30, 64, 175, 0.06);
}

/* ══ RESPONSIVE ═══════════════════════════════════════════ */

/* Mobile (< 768px) */
@media (max-width: 767px) {
    .header-inner      { padding: 0 0.75rem; gap: 0.4rem; }
    .header-nav        { flex: 1; gap: 0; }
    .nav-label         { display: none; }
    .nav-link          { padding: 0.5rem 0.6rem; }
    .nav-icon            { width: 22px; height: 22px; }
    .nav-icon :deep(svg) { width: 22px; height: 22px; }
    .cart-icon           { width: 22px; height: 22px; }
    .cart-icon :deep(svg){ width: 22px; height: 22px; }
    .search-desktop    { display: none; }
    .mobile-search-bar { display: block; }
    .header-brand-name { display: none; }
    .profile-name      { display: none; }
    .btn-auth-label    { display: none; }
    .btn-auth          { padding: 0.4rem 0.55rem; }
    .header-spacer     { height: 7rem; }
}

/* Tablet (768px – 1023px): nav con íconos solamente */
@media (min-width: 768px) and (max-width: 1023px) {
    .nav-label         { display: none; }
    .header-brand-name { display: none; }
    .profile-name      { display: none; }
    .header-inner      { gap: 0.75rem; }
    .header-nav        { gap: 0; }
    .nav-link          { padding: 0.4rem 0.55rem; }
}
</style>
