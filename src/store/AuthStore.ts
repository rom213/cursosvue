import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { AuthResponse } from '../types/Auth';


export const authStore = defineStore('auth', () => {
    const profile = ref<AuthResponse | null>(null);
    const nameAffiliaty=ref()

    function setProfile(prof: AuthResponse | null){
        profile.value = prof;
    }

    function getProfile(): AuthResponse | null {
        return profile.value;
    }



    return { setProfile, getProfile, profile, nameAffiliaty };
});
