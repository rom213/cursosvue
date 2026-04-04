import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { AuthResponse } from '../types/Auth';


export const authStore = defineStore('auth', () => {
    const profile = ref<AuthResponse | null>(null);
    const nameAffiliaty=ref()
    const cupoCode=ref()

    function setCupoCode(cupo: string){
        cupoCode.value = cupo;
    }

    function noMostrarCursoDrive(){
        if (profile.value?.user) {
            profile.value.user.vista_previa_drive = 0;
        }
    }

    function getCupoCode(): string {
        return cupoCode.value;
    }

    function setProfile(prof: AuthResponse | null){
        profile.value = prof;
    }

    function getProfile(): AuthResponse | null {
        return profile.value;
    }



    return { setProfile, getProfile, profile, nameAffiliaty, setCupoCode, getCupoCode,noMostrarCursoDrive };
});
