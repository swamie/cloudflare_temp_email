<script setup>
import { onMounted, ref } from 'vue'
import { useScopedI18n } from '@/i18n/app'
import { useRouter } from 'vue-router'
import { User, ExchangeAlt } from '@vicons/fa'

import { useGlobalState } from '../../store'
import { api } from '../../api'
import Login from '../common/Login.vue'
import TelegramAddress from './TelegramAddress.vue'
import LocalAddress from './LocalAddress.vue'
import AddressManagement from '../user/AddressManagement.vue'
import { getRouterPathWithLang } from '../../utils'
import AddressSelect from '../../components/AddressSelect.vue'
import AddressCredentialModal from '../../components/AddressCredentialModal.vue'

const router = useRouter()

const {
    jwt, settings, showAddressCredential, userJwt,
    isTelegram, addressPassword
} = useGlobalState()

const { locale, t } = useScopedI18n('views.index.AddressBar')

const showAddressManage = ref(false)

const onUserLogin = async () => {
    await router.push(getRouterPathWithLang("/user", locale.value))
}

onMounted(async () => {
    await api.getSettings();
});
</script>

<template>
    <div>
        <n-card :bordered="false" embedded v-if="!settings.fetched">
            <n-skeleton style="height: 50vh" />
        </n-card>
        <div v-else-if="settings.address">
            <div class="km-address-strip">
                <AddressSelect>
                    <template #actions>
                        <n-button class="address-manage" size="small" tertiary type="primary"
                            @click="showAddressManage = true">
                            <n-icon :component="ExchangeAlt" />
                            {{ t('addressManage') }}
                        </n-button>
                    </template>
                </AddressSelect>
            </div>
        </div>
        <div v-else-if="isTelegram">
            <TelegramAddress />
        </div>
        <div v-else-if="userJwt" class="center">
            <n-card :bordered="false" embedded style="max-width: 900px; width: 100%;">
                <AddressManagement />
            </n-card>
        </div>
        <div v-else class="center km-welcome">
            <div class="km-hero">
                <h1>{{ t('heroTitle') }}</h1>
                <p>{{ t('heroSubtitle') }}</p>
            </div>
            <n-card :bordered="false" embedded class="km-login-card">
                <n-alert v-if="jwt" type="warning" :show-icon="false" :bordered="false" closable>
                    <span>{{ t('fetchAddressError') }}</span>
                </n-alert>
                <Login />
                <n-divider />
                <n-button @click="onUserLogin" size="large" block quaternary strong>
                    <template #icon>
                        <n-icon :component="User" />
                    </template>
                    {{ t('userCenter') }}
                </n-button>
            </n-card>
        </div>
        <AddressCredentialModal v-model:show="showAddressCredential" :address="settings.address" :jwt="jwt"
            :address-password="addressPassword" />
        <n-modal v-model:show="showAddressManage" preset="card" :title="t('addressManage')"
            style="width: 720px;">
            <TelegramAddress v-if="isTelegram" />
            <AddressManagement v-else-if="userJwt" />
            <LocalAddress v-else />
        </n-modal>
    </div>
</template>

<style scoped>
.n-alert {
    margin-top: 10px;
    margin-bottom: 10px;
    text-align: center;
}

.n-card {
    margin-top: 10px;
}

.center {
    display: flex;
    text-align: left;
    place-items: center;
    justify-content: center;
    margin: 20px;
}

.km-welcome {
    flex-direction: column;
    margin: var(--km-space-5) 0 var(--km-space-6);
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

.km-address-strip {
    margin: var(--km-space-2) 0 var(--km-space-4);
    padding: var(--km-space-3) var(--km-space-4);
    border: 1px solid var(--km-line-soft);
    border-radius: var(--km-radius-lg);
    background: var(--km-surface);
}

.address-manage {
    flex: 0 0 auto;
    white-space: nowrap;
}

@media (max-width: 640px) {
    .km-welcome {
        margin: var(--km-space-3) 0 var(--km-space-5);
    }

    .km-hero p {
        font-size: 15px;
    }
}
</style>
