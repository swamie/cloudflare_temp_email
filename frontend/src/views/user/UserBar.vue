<script setup>
import { onMounted } from 'vue'
import { useScopedI18n } from '@/i18n/app'
import { useRouter } from 'vue-router'

import { useGlobalState } from '../../store'
import { api } from '../../api'
import UserLogin from './UserLogin.vue'

const message = useMessage()
const router = useRouter()

const {
    userSettings, userJwt, userOpenSettings
} = useGlobalState()

const { t } = useScopedI18n('views.user.UserBar')


onMounted(async () => {
    await api.getUserOpenSettings(message);
    // make sure user_id is fetched
    if (!userSettings.value.user_id) await api.getUserSettings(message);
});
</script>

<template>
    <div>
        <n-card :bordered="false" embedded v-if="!userSettings.fetched">
            <n-skeleton style="height: 50vh" />
        </n-card>
        <div v-else-if="userSettings.user_email">
            <div class="km-user-strip">
                <span class="km-user-strip__label">{{ t('currentUser') }}</span>
                <b>{{ userSettings.user_email }}</b>
            </div>
        </div>
        <div v-else class="center km-welcome">
            <div class="km-hero">
                <h1>{{ t('heroTitle') }}</h1>
                <p>{{ t('heroSubtitle') }}</p>
            </div>
            <n-card :bordered="false" embedded class="km-login-card">
                <n-alert v-if="userJwt" type="warning" :show-icon="false" :bordered="false" closable>
                    <span>{{ t('fetchUserSettingsError') }}</span>
                </n-alert>
                <UserLogin />
            </n-card>
        </div>
    </div>
</template>

<style scoped>
.km-welcome {
    flex-direction: column;
    margin: var(--km-space-5) 0 var(--km-space-6) !important;
}

.km-hero {
    max-width: 560px;
    margin-bottom: var(--km-space-5);
    text-align: center;
}

.km-hero h1 {
    margin: 0 0 var(--km-space-2);
    font: 800 clamp(30px, 6vw, 44px)/1.05 var(--km-font-display);
    letter-spacing: -0.03em;
}

.km-hero p {
    margin: 0;
    color: var(--km-muted);
    font-size: 17px;
}

.km-login-card {
    width: 100%;
    max-width: 520px;
}

.km-user-strip {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: var(--km-space-2);
    margin: var(--km-space-2) 0 var(--km-space-4);
    padding: var(--km-space-3) var(--km-space-4);
    border: 1px solid var(--km-line-soft);
    border-radius: var(--km-radius-lg);
    background: var(--km-surface);
}

.km-user-strip__label {
    color: var(--km-muted);
}

.n-alert {
    margin-top: 10px;
    margin-bottom: 10px;
    text-align: center;
}

.center {
    display: flex;
    text-align: center;
    place-items: center;
    justify-content: center;
    margin: 20px;
}
</style>
