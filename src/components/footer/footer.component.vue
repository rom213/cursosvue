<script lang="ts" setup>
import { ref } from 'vue'
import { RouterLink } from 'vue-router'

const openContact = ref<string | null>(null)
const emailCopied = ref(false)
const supportEmail = 'cursosestudiaytrabajalatam@gmail.com'
let copiedTimeout: ReturnType<typeof setTimeout> | null = null

function toggleContact(key: string) {
    openContact.value = openContact.value === key ? null : key
}

async function handleEmailClick(event: MouseEvent) {
    event.preventDefault()
    try {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(supportEmail)
        } else {
            const textarea = document.createElement('textarea')
            textarea.value = supportEmail
            textarea.style.position = 'fixed'
            textarea.style.opacity = '0'
            document.body.appendChild(textarea)
            textarea.select()
            document.execCommand('copy')
            document.body.removeChild(textarea)
        }
        emailCopied.value = true
        if (copiedTimeout) clearTimeout(copiedTimeout)
        copiedTimeout = setTimeout(() => {
            emailCopied.value = false
        }, 2000)
    } catch (err) {
        console.error('No se pudo copiar el correo', err)
    }
    window.location.href = `mailto:${supportEmail}`
}
</script>

<template>
    <footer class="footer-root">
        <!-- Wave separator at the top -->
        <div class="footer-wave" aria-hidden="true"></div>

        <div class="footer-inner">

            <!-- Brand column -->
            <div class="footer-brand-col">
                <div class="footer-brand">
                    <img src="../../assets/home/logo_cursos.png" alt="Cursos Estudia y Trabaja" class="footer-logo" />
                    <span class="footer-brand-name">CURSOS ESTUDIA Y TRABAJA</span>
                </div>
                <p class="footer-brand-desc">
                    Plataforma educativa premium con acceso vitalicio, contenido descargable y certificaciones reconocidas.
                </p>
                <!-- Social icons -->
                <div class="footer-social">
                    <a href="https://www.facebook.com/profile.php?id=61554175103394&mibextid=ZbWKwL" target="_blank" rel="noopener noreferrer" class="social-link" aria-label="Facebook">
                        <svg width="18" height="18" viewBox="0 0 31 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <g clip-path="url(#clip0_footer_fb)">
                                <path d="M30.5 15C30.5 6.71578 23.7842 0 15.5 0C7.21578 0 0.5 6.71578 0.5 15C0.5 22.4869 5.98531 28.6925 13.1562 29.8178V19.3359H9.34766V15H13.1562V11.6953C13.1562 7.93594 15.3957 5.85938 18.822 5.85938C20.4631 5.85938 22.1797 6.15234 22.1797 6.15234V9.84375H20.2883C18.4249 9.84375 17.8438 11 17.8438 12.1863V15H22.0039L21.3389 19.3359H17.8438V29.8178C25.0147 28.6925 30.5 22.487 30.5 15Z" fill="#1877F2"/>
                                <path d="M21.3389 19.3359L22.0039 15H17.8438V12.1863C17.8438 10.9999 18.4249 9.84375 20.2883 9.84375H22.1797V6.15234C22.1797 6.15234 20.4631 5.85938 18.8219 5.85938C15.3957 5.85938 13.1562 7.93594 13.1562 11.6953V15H9.34766V19.3359H13.1562V29.8178C13.9316 29.9393 14.7152 30.0002 15.5 30C16.2848 30.0002 17.0684 29.9393 17.8438 29.8178V19.3359H21.3389Z" fill="white"/>
                            </g>
                            <defs>
                                <clipPath id="clip0_footer_fb"><rect width="30" height="30" fill="white" transform="translate(0.5)"/></clipPath>
                            </defs>
                        </svg>
                    </a>
                    <a href="https://www.instagram.com/cursos_estudia_y_trabaja?igsh=YXFodm9oMjE0Zmxh" target="_blank" rel="noopener noreferrer" class="social-link" aria-label="Instagram">
                        <svg width="18" height="18" viewBox="0 0 29 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M21.4688 0H5.53125C1.648 0 -1.5 3.148 -1.5 7.03125V22.9688C-1.5 26.852 1.648 30 5.53125 30H21.4688C25.352 30 28.5 26.852 28.5 22.9688V7.03125C28.5 3.148 25.352 0 21.4688 0Z" fill="url(#paint0_footer_ig)"/>
                            <path d="M21.4688 0H5.53125C1.648 0 -1.5 3.148 -1.5 7.03125V22.9688C-1.5 26.852 1.648 30 5.53125 30H21.4688C25.352 30 28.5 26.852 28.5 22.9688V7.03125C28.5 3.148 25.352 0 21.4688 0Z" fill="url(#paint1_footer_ig)"/>
                            <path d="M13.5011 3.28125C10.3185 3.28125 9.91898 3.2952 8.66906 3.35203C7.42148 3.40922 6.56988 3.60668 5.8248 3.89648C5.05395 4.19578 4.40016 4.59621 3.74883 5.24777C3.09691 5.89922 2.69648 6.55301 2.39625 7.32352C2.10563 8.06883 1.90793 8.92078 1.8518 10.1678C1.7959 11.4178 1.78125 11.8174 1.78125 15.0001C1.78125 18.1828 1.79531 18.581 1.85203 19.8309C1.90945 21.0785 2.10691 21.9301 2.39648 22.6752C2.69602 23.4461 3.09645 24.0998 3.74801 24.7512C4.39922 25.4031 5.05301 25.8045 5.82328 26.1038C6.56895 26.3936 7.42066 26.591 8.66801 26.6482C9.91805 26.705 10.3172 26.719 13.4996 26.719C16.6826 26.719 17.0808 26.705 18.3307 26.6482C19.5783 26.591 20.4308 26.3936 21.1765 26.1038C21.947 25.8045 22.5998 25.4031 23.2509 24.7512C23.9029 24.0998 24.3032 23.4461 24.6035 22.6755C24.8916 21.9301 25.0894 21.0783 25.148 19.8312C25.2041 18.5812 25.2188 18.1828 25.2188 15.0001C25.2188 11.8174 25.2041 11.418 25.148 10.168C25.0894 8.92043 24.8916 8.06895 24.6035 7.32387C24.3032 6.55301 23.9029 5.89922 23.2509 5.24777C22.5991 4.59598 21.9472 4.19555 21.1758 3.8966C20.4287 3.60668 19.5766 3.4091 18.3291 3.35203C17.079 3.2952 16.6811 3.28125 13.4974 3.28125H13.5011ZM12.4498 5.39309C12.7618 5.39262 13.11 5.39309 13.5011 5.39309C16.6301 5.39309 17.0009 5.40434 18.2365 5.46047C19.3791 5.51273 19.9992 5.70363 20.4123 5.86406C20.9592 6.07641 21.3491 6.33035 21.759 6.74063C22.1692 7.15078 22.423 7.54137 22.6359 8.08828C22.7964 8.50078 22.9875 9.12094 23.0395 10.2635C23.0957 11.4989 23.1079 11.8699 23.1079 14.9974C23.1079 18.1249 23.0957 18.4961 23.0395 19.7313C22.9873 20.8739 22.7964 21.4941 22.6359 21.9067C22.4236 22.4536 22.1692 22.843 21.759 23.2529C21.3489 23.6631 20.9595 23.9169 20.4123 24.1294C19.9997 24.2905 19.3791 24.4809 18.2365 24.5332C17.0011 24.5893 16.6301 24.6015 13.5011 24.6015C10.3719 24.6015 10.001 24.5893 8.76574 24.5332C7.62316 24.4805 7.00301 24.2896 6.58957 24.1291C6.04277 23.9167 5.65207 23.6629 5.24191 23.2527C4.83176 22.8425 4.57793 22.4529 4.365 21.9057C4.20457 21.4931 4.01344 20.873 3.96141 19.7304C3.90527 18.495 3.89402 18.124 3.89402 14.9945C3.89402 11.865 3.90527 11.496 3.96141 10.2606C4.01367 9.11801 4.20457 8.49785 4.365 8.08477C4.57746 7.53785 4.83176 7.14727 5.24203 6.73711C5.6523 6.32695 6.04277 6.07301 6.58969 5.8602C7.00277 5.69906 7.62316 5.50863 8.76574 5.45613C9.8468 5.40727 10.2657 5.39262 12.4498 5.39016V5.39309ZM19.7565 7.33887C18.9802 7.33887 18.3503 7.96816 18.3503 8.74465C18.3503 9.52102 18.9802 10.1509 19.7565 10.1509C20.5329 10.1509 21.1628 9.52102 21.1628 8.74465C21.1628 7.96828 20.5329 7.3384 19.7565 7.3384V7.33887ZM13.5011 8.98195C10.1776 8.98195 7.48301 11.6766 7.48301 15.0001C7.48301 18.3237 10.1776 21.017 13.5011 21.017C16.8246 21.017 19.5183 18.3237 19.5183 15.0001C19.5183 11.6767 16.8244 8.98195 13.5008 8.98195H13.5011ZM13.5011 11.0938C15.6584 11.0938 17.4074 12.8426 17.4074 15.0001C17.4074 17.1574 15.6584 18.9064 13.5011 18.9064C11.3438 18.9064 9.59484 17.1574 9.59484 15.0001C9.59484 12.8426 11.3436 11.0938 13.5011 11.0938Z" fill="white"/>
                            <defs>
                                <radialGradient id="paint0_footer_ig" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(6.46875 32.3106) rotate(-90) scale(29.7322 27.6533)">
                                    <stop stop-color="#FFDD55"/>
                                    <stop offset="0.1" stop-color="#FFDD55"/>
                                    <stop offset="0.5" stop-color="#FF543E"/>
                                    <stop offset="1" stop-color="#C837AB"/>
                                </radialGradient>
                                <radialGradient id="paint1_footer_ig" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(-6.52512 2.16105) rotate(78.681) scale(13.2905 54.7837)">
                                    <stop stop-color="#3771C8"/>
                                    <stop offset="0.128" stop-color="#3771C8"/>
                                    <stop offset="1" stop-color="#6600FF" stop-opacity="0"/>
                                </radialGradient>
                            </defs>
                        </svg>
                    </a>
                    <a href="https://www.tiktok.com/@cursos.estudia.y?_t=8qrpqja63ec&_r=1" target="_blank" rel="noopener noreferrer" class="social-link" aria-label="TikTok">
                        <svg width="18" height="18" viewBox="0 0 27 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <g clip-path="url(#clip0_footer_tt)">
                                <path d="M19.7684 10.8787C21.6654 12.234 23.9893 13.0315 26.4993 13.0315V8.20424C26.0242 8.20443 25.5504 8.15487 25.0857 8.05637V11.8561C22.576 11.8561 20.2524 11.0588 18.355 9.70351V19.5547C18.355 24.4828 14.3579 28.4774 9.42762 28.4774C7.58802 28.4774 5.87812 27.9216 4.45776 26.9682C6.0789 28.625 8.33969 29.6527 10.8408 29.6527C15.7714 29.6527 19.7686 25.6581 19.7686 20.7297V10.8787H19.7684ZM21.5122 6.00856C20.5427 4.94998 19.9061 3.58193 19.7684 2.06946V1.44861H18.4289C18.7661 3.37088 19.9163 5.01315 21.5122 6.00856ZM7.57614 23.1866C7.03444 22.4769 6.74165 21.6085 6.74302 20.7156C6.74302 18.4618 8.57125 16.6342 10.8268 16.6342C11.2471 16.634 11.665 16.6985 12.0656 16.8255V11.8902C11.5974 11.8262 11.1249 11.7988 10.6527 11.8089V15.6502C10.2518 15.5232 9.83379 15.4587 9.4133 15.4591C7.1578 15.4591 5.32968 17.2864 5.32968 19.5405C5.32968 21.1345 6.24344 22.5144 7.57614 23.1866Z" fill="#FF004F"/>
                                <path d="M18.3549 9.70341C20.2524 11.0587 22.5758 11.856 25.0856 11.856V8.05626C23.6847 7.75798 22.4445 7.02632 21.5121 6.00856C19.916 5.01305 18.766 3.37078 18.4288 1.44861H14.9104V20.7295C14.9024 22.9773 13.0773 24.7973 10.8266 24.7973C9.50035 24.7973 8.32203 24.1655 7.57585 23.1865C6.24335 22.5144 5.32949 21.1344 5.32949 19.5406C5.32949 17.2867 7.15761 15.4592 9.41311 15.4592C9.84526 15.4592 10.2618 15.5264 10.6525 15.6503V11.809C5.80876 11.909 1.91333 15.8647 1.91333 20.7296C1.91333 23.1582 2.88335 25.3598 4.45778 26.9684C5.87813 27.9216 7.58793 28.4776 9.42763 28.4776C14.358 28.4776 18.355 24.4827 18.355 19.5547L18.3549 9.70341Z" fill="white"/>
                                <path d="M25.0857 8.05617V7.02897C23.8224 7.0308 22.5841 6.6772 21.5122 6.00857C22.461 7.04675 23.7103 7.76269 25.0857 8.05638M18.4288 1.44852C18.3967 1.26485 18.372 1.07995 18.3549 0.894289V0.273438H13.4968V19.5546C13.489 21.8021 11.664 23.6221 9.41313 23.6221C8.77503 23.6231 8.14567 23.4739 7.57586 23.1868C8.32204 24.1655 9.50037 24.7972 10.8266 24.7972C13.0772 24.7972 14.9025 22.9774 14.9104 20.7296V1.44862L18.4288 1.44852ZM10.6528 11.8089V10.7152C10.2468 10.6598 9.83758 10.632 9.42785 10.6321C4.49699 10.6321 0.5 14.627 0.5 19.5546C0.5 22.644 2.07087 25.3667 4.45799 26.9682C2.88357 25.3597 1.91355 23.158 1.91355 20.7295C1.91355 15.8647 5.80888 11.9089 10.6528 11.8089Z" fill="#00F2EA"/>
                            </g>
                            <defs>
                                <clipPath id="clip0_footer_tt"><rect width="26" height="29.4531" fill="white" transform="translate(0.5 0.273438)"/></clipPath>
                            </defs>
                        </svg>
                    </a>
                    <a href="#" class="social-link" aria-label="LinkedIn">
                        <svg width="18" height="18" viewBox="0 0 31 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <g clip-path="url(#clip0_footer_li)">
                                <path d="M23.4688 0H7.53125C3.648 0 0.5 3.148 0.5 7.03125V22.9688C0.5 26.852 3.648 30 7.53125 30H23.4688C27.352 30 30.5 26.852 30.5 22.9688V7.03125C30.5 3.148 27.352 0 23.4688 0Z" fill="#0A66C2"/>
                                <path d="M22.1463 25.51H25.5764C25.7007 25.51 25.8199 25.4606 25.9078 25.3727C25.9957 25.2848 26.0451 25.1656 26.0451 25.0413L26.0469 17.7942C26.0469 14.0064 25.2307 11.0948 20.8041 11.0948C19.1214 11.0323 17.5346 11.8997 16.6783 13.3481C16.6741 13.3552 16.6678 13.3606 16.6602 13.3637C16.6526 13.3668 16.6442 13.3673 16.6363 13.3651C16.6284 13.363 16.6214 13.3583 16.6164 13.3519C16.6114 13.3454 16.6087 13.3374 16.6086 13.3293V11.9133C16.6086 11.789 16.5592 11.6697 16.4713 11.5818C16.3834 11.4939 16.2642 11.4445 16.1398 11.4445H12.8847C12.7604 11.4445 12.6412 11.4939 12.5533 11.5818C12.4654 11.6697 12.416 11.789 12.416 11.9133V25.0406C12.416 25.1649 12.4654 25.2842 12.5533 25.3721C12.6412 25.46 12.7604 25.5094 12.8847 25.5094H16.3146C16.4389 25.5094 16.5581 25.46 16.646 25.3721C16.7339 25.2842 16.7833 25.1649 16.7833 25.0406V18.5516C16.7833 16.7168 17.1314 14.9399 19.4061 14.9399C21.6485 14.9399 21.6775 17.0394 21.6775 18.6704V25.0412C21.6775 25.1655 21.7269 25.2848 21.8148 25.3727C21.9027 25.4606 22.022 25.51 22.1463 25.51ZM4.95312 6.98766C4.95312 8.37797 6.0977 9.52195 7.48813 9.52195C8.8782 9.52184 10.0221 8.37715 10.0221 6.98707C10.0218 5.59699 8.87785 4.45312 7.48766 4.45312C6.09711 4.45312 4.95312 5.59734 4.95312 6.98766ZM5.76863 25.51H9.20305C9.32737 25.51 9.4466 25.4606 9.5345 25.3727C9.62241 25.2848 9.6718 25.1655 9.6718 25.0412V11.9133C9.6718 11.789 9.62241 11.6697 9.5345 11.5818C9.4466 11.4939 9.32737 11.4445 9.20305 11.4445H5.76863C5.64431 11.4445 5.52508 11.4939 5.43718 11.5818C5.34927 11.6697 5.29988 11.789 5.29988 11.9133V25.0412C5.29988 25.1655 5.34927 25.2848 5.43718 25.3727C5.52508 25.4606 5.64431 25.51 5.76863 25.51Z" fill="white"/>
                            </g>
                            <defs>
                                <clipPath id="clip0_footer_li"><rect width="30" height="30" fill="white" transform="translate(0.5)"/></clipPath>
                            </defs>
                        </svg>
                    </a>
                    <a href="https://wa.me/573134141912" target="_blank" rel="noopener noreferrer" class="social-link" aria-label="WhatsApp de soporte">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M20.52 3.48A11.93 11.93 0 0012 0C5.37 0 0 5.37 0 12c0 2.11.55 4.16 1.6 5.97L0 24l6.22-1.57A11.94 11.94 0 0012 24c6.63 0 12-5.37 12-12 0-3.21-1.25-6.22-3.48-8.52z" fill="#25D366"/>
                            <path d="M17.47 14.38c-.28-.14-1.64-.81-1.9-.9-.25-.09-.44-.14-.62.14-.18.28-.71.9-.87 1.08-.16.18-.32.2-.6.07-.28-.14-1.18-.44-2.25-1.4-.83-.74-1.39-1.66-1.55-1.94-.16-.28-.02-.43.12-.57.13-.13.28-.32.42-.48.14-.16.18-.28.28-.46.09-.18.05-.34-.02-.48-.07-.14-.62-1.5-.85-2.05-.22-.54-.45-.46-.62-.47H8.3c-.18 0-.46.07-.7.34-.25.27-.94.92-.94 2.24s.96 2.6 1.1 2.78c.13.18 1.89 2.88 4.58 4.04.64.28 1.14.44 1.53.56.64.2 1.23.17 1.69.1.52-.08 1.64-.67 1.87-1.32.23-.65.23-1.2.16-1.32-.07-.12-.25-.18-.53-.32z" fill="white"/>
                        </svg>
                    </a>
                    <a href="mailto:cursosestudiaytrabajalatam@gmail.com" @click="handleEmailClick" class="social-link email-link" aria-label="Correo de soporte">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" fill="#EA4335"/>
                            <polyline points="22,6 12,13 2,6" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        <span v-if="emailCopied" class="copied-tooltip">Correo copiado</span>
                    </a>
                    <a href="#" class="social-link" aria-label="YouTube">
                        <svg width="20" height="14" viewBox="0 0 31 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <g clip-path="url(#clip0_footer_yt)">
                                <path d="M29.8374 3.74316C29.6654 3.10725 29.3297 2.52751 28.8639 2.06167C28.3981 1.59583 27.8183 1.26015 27.1824 1.08805C24.8544 0.453125 15.4848 0.453125 15.4848 0.453125C15.4848 0.453125 6.11471 0.472344 3.78666 1.10727C3.15075 1.27938 2.57101 1.61508 2.10519 2.08094C1.63937 2.5468 1.30372 3.12657 1.13166 3.7625C0.427483 7.89898 0.154319 14.202 1.151 18.173C1.32307 18.809 1.65873 19.3887 2.12455 19.8545C2.59037 20.3204 3.1701 20.6561 3.806 20.8282C6.13405 21.4631 15.5039 21.4631 15.5039 21.4631C15.5039 21.4631 24.8736 21.4631 27.2015 20.8282C27.8375 20.6561 28.4172 20.3204 28.8831 19.8546C29.3489 19.3887 29.6846 18.809 29.8567 18.173C30.5994 14.0307 30.8283 7.73152 29.8374 3.74316Z" fill="#FF0000"/>
                                <path d="M12.5024 15.4602L20.2753 10.958L12.5024 6.45593V15.4602Z" fill="white"/>
                            </g>
                            <defs>
                                <clipPath id="clip0_footer_yt"><rect width="30" height="21.0938" fill="white" transform="translate(0.5 0.453438)"/></clipPath>
                            </defs>
                        </svg>
                    </a>
                </div>
            </div>

            <!-- Navigation column -->
            <div class="footer-col">
                <h4 class="footer-col-title">Plataforma</h4>
                <nav class="footer-nav">
                    <a href="/" class="footer-link">Inicio</a>
                    <a href="/courses" class="footer-link">Cursos</a>
                    <a href="/monetizar" class="footer-link">Monetizar</a>
                    <a href="/mycourses" class="footer-link">Mis Cursos</a>
                </nav>
            </div>

            <!-- Benefits column -->
            <div class="footer-col">
                <h4 class="footer-col-title">Beneficios</h4>
                <nav class="footer-nav">
                    <a href="#" class="footer-link">Acceso Vitalicio</a>
                    <a href="#" class="footer-link">100% Descargable</a>
                    <a href="#" class="footer-link">Club de Descuentos</a>
                    <a href="#" class="footer-link">Programa de Afiliados</a>
                </nav>
            </div>

            <!-- Contact column -->
            <div class="footer-col">
                <h4 class="footer-col-title">Contacto</h4>
                <div class="footer-contact">
                    <!-- Ubicación -->
                    <div class="contact-item contact-accordion">
                        <button class="contact-trigger" @click="toggleContact('location')">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
                            </svg>
                            <span>Latinoamérica</span>
                        </button>
                        <div v-if="openContact === 'location'" class="contact-detail">
                            <a href="https://maps.google.com/?q=Bogota,Colombia" target="_blank" rel="noopener noreferrer" class="contact-detail-link">
                                Bogotá, Colombia 📍
                            </a>
                        </div>
                    </div>

                    <!-- WhatsApp -->
                    <div class="contact-item contact-accordion">
                        <button class="contact-trigger" @click="toggleContact('whatsapp')">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M20.52 3.48A11.93 11.93 0 0012 0C5.37 0 0 5.37 0 12c0 2.11.55 4.16 1.6 5.97L0 24l6.22-1.57A11.94 11.94 0 0012 24c6.63 0 12-5.37 12-12 0-3.21-1.25-6.22-3.48-8.52z" fill="#25D366"/>
                                <path d="M17.47 14.38c-.28-.14-1.64-.81-1.9-.9-.25-.09-.44-.14-.62.14-.18.28-.71.9-.87 1.08-.16.18-.32.2-.6.07-.28-.14-1.18-.44-2.25-1.4-.83-.74-1.39-1.66-1.55-1.94-.16-.28-.02-.43.12-.57.13-.13.28-.32.42-.48.14-.16.18-.28.28-.46.09-.18.05-.34-.02-.48-.07-.14-.62-1.5-.85-2.05-.22-.54-.45-.46-.62-.47H8.3c-.18 0-.46.07-.7.34-.25.27-.94.92-.94 2.24s.96 2.6 1.1 2.78c.13.18 1.89 2.88 4.58 4.04.64.28 1.14.44 1.53.56.64.2 1.23.17 1.69.1.52-.08 1.64-.67 1.87-1.32.23-.65.23-1.2.16-1.32-.07-.12-.25-.18-.53-.32z" fill="white"/>
                            </svg>
                            <span>WhatsApp</span>
                        </button>
                        <div v-if="openContact === 'whatsapp'" class="contact-detail">
                            ¿Necesitas soporte rápido? ¡Contáctanos!
                            <a href="https://wa.me/573134141912?text=Hola%2C%20necesito%20soporte%20con%20mi%20cuenta." target="_blank" rel="noopener noreferrer" class="contact-detail-link">
                                +57 313 414 1912 — ¡Te esperamos! 💬
                            </a>
                        </div>
                    </div>

                    <!-- Email -->
                    <div class="contact-item contact-accordion">
                        <button class="contact-trigger" @click="toggleContact('email')">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                            </svg>
                            <span>Soporte por email</span>
                        </button>
                        <div v-if="openContact === 'email'" class="contact-detail">
                            Escríbenos tus dudas y sugerencias, ¡feliz día! 😊
                            <a href="mailto:cursosestudiaytrabajalatam@gmail.com" class="contact-detail-link">
                                cursosestudiaytrabajalatam@gmail.com
                            </a>
                        </div>
                    </div>
                </div>
            </div>

        </div>

        <!-- Bottom bar -->
        <div class="footer-bottom">
            <p class="footer-copy">
                © {{ new Date().getFullYear() }} Cursos Estudia y Trabaja. Todos los derechos reservados.
            </p>
            <div class="footer-bottom-links">
                <RouterLink :to="{ name: 'terminos' }" class="footer-bottom-link">Términos y condiciones</RouterLink>
                <span class="footer-dot" aria-hidden="true">·</span>
                <RouterLink :to="{ name: 'privacidad' }" class="footer-bottom-link">Política de privacidad</RouterLink>
            </div>
        </div>
    </footer>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

.footer-root {
    font-family: 'Inter', system-ui, sans-serif;
    background: #0d1b2a;
    color: #cbd5e1;
    position: relative;
    overflow: hidden;
}

/* Wave separator */
.footer-wave {
    width: 100%;
    height: 3px;
    background: linear-gradient(90deg, transparent 0%, #1e40af 30%, #3b82f6 60%, transparent 100%);
    opacity: 0.6;
}

/* Main grid */
.footer-inner {
    display: grid;
    grid-template-columns: 1fr;
    gap: 2.5rem;
    max-width: 1280px;
    margin: 0 auto;
    padding: 3rem 1.5rem 2.5rem;
}
@media (min-width: 640px) {
    .footer-inner {
        grid-template-columns: 1fr 1fr;
    }
}
@media (min-width: 1024px) {
    .footer-inner {
        grid-template-columns: 2fr 1fr 1fr 1fr;
        gap: 3rem;
    }
}

/* Brand column */
.footer-brand-col {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.footer-brand {
    display: flex;
    align-items: center;
    gap: 0.55rem;
}

.footer-logo {
    height: 1.9rem;
    width: auto;
    /* Tint the logo white to fit the dark background */
    filter: brightness(0) invert(1);
    opacity: 0.9;
}

.footer-brand-name {
    font-size: 0.65rem;
    font-weight: 800;
    letter-spacing: 0.06em;
    color: #f1f5f9;
    white-space: nowrap;
}

.footer-brand-desc {
    font-size: 0.8rem;
    color: #94a3b8;
    line-height: 1.65;
    margin: 0;
    max-width: 300px;
}

/* Social icons */
.footer-social {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    margin-top: 0.25rem;
}

.social-link {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2.1rem;
    height: 2.1rem;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.08);
    transition: background 0.2s, border-color 0.2s, transform 0.18s;
    text-decoration: none;
    flex-shrink: 0;
}
.social-link:hover {
    background: rgba(30, 64, 175, 0.35);
    border-color: rgba(59, 130, 246, 0.4);
    transform: translateY(-2px);
}

.email-link {
    position: relative;
}

.copied-tooltip {
    position: absolute;
    bottom: calc(100% + 8px);
    left: 50%;
    transform: translateX(-50%);
    background: #1e293b;
    color: #f1f5f9;
    font-size: 0.7rem;
    font-weight: 600;
    padding: 0.35rem 0.6rem;
    border-radius: 6px;
    white-space: nowrap;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(59, 130, 246, 0.4);
    animation: copiedFade 0.2s ease;
    pointer-events: none;
    z-index: 10;
}

.copied-tooltip::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 5px solid transparent;
    border-top-color: #1e293b;
}

@keyframes copiedFade {
    from { opacity: 0; transform: translate(-50%, 4px); }
    to   { opacity: 1; transform: translate(-50%, 0); }
}

/* Column */
.footer-col {
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
}

.footer-col-title {
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #f1f5f9;
    margin: 0 0 0.2rem;
}

.footer-nav {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.footer-link {
    font-size: 0.82rem;
    color: #94a3b8;
    text-decoration: none;
    transition: color 0.18s;
    width: fit-content;
}
.footer-link:hover { color: #3b82f6; }

/* Contact */
.footer-contact {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
}

.contact-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.82rem;
    color: #94a3b8;
}
.contact-item svg {
    flex-shrink: 0;
    color: #3b82f6;
    opacity: 0.8;
}

.contact-accordion {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.35rem;
}

.contact-trigger {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    font-size: 0.82rem;
    color: #94a3b8;
    transition: color 0.18s;
}
.contact-trigger:hover {
    color: #3b82f6;
}
.contact-trigger svg {
    flex-shrink: 0;
    color: #3b82f6;
    opacity: 0.8;
}

.contact-detail {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    font-size: 0.78rem;
    color: #94a3b8;
    padding-left: 1.4rem;
    animation: fadeIn 0.2s ease;
}

.contact-detail-link {
    color: #3b82f6;
    text-decoration: none;
    font-weight: 500;
    transition: color 0.18s;
}
.contact-detail-link:hover {
    color: #60a5fa;
}

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(-4px); }
    to   { opacity: 1; transform: translateY(0); }
}

/* Bottom bar */
.footer-bottom {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    padding: 1.1rem 1.5rem 1.4rem;
    border-top: 1px solid rgba(255, 255, 255, 0.06);
    text-align: center;
}
@media (min-width: 640px) {
    .footer-bottom {
        flex-direction: row;
        justify-content: space-between;
    }
}

.footer-copy {
    font-size: 0.75rem;
    color: #64748b;
    margin: 0;
}

.footer-bottom-links {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.footer-bottom-link {
    font-size: 0.75rem;
    color: #64748b;
    text-decoration: none;
    transition: color 0.18s;
}
.footer-bottom-link:hover { color: #3b82f6; }

.footer-dot {
    color: #334155;
    font-size: 0.75rem;
}
</style>
