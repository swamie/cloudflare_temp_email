<script setup>
import { ref, h, computed, onMounted } from 'vue'
import { useScopedI18n } from '@/i18n/app'
import { useHead } from '@unhead/vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { useIsMobile } from '../utils/composables'
import {
    DarkModeFilled, LightModeFilled, MenuFilled,
    MonitorHeartFilled,
    KeyboardArrowDownOutlined
} from '@vicons/material'
import { Envelope, Language, User } from '@vicons/fa'

import { useGlobalState } from '../store'
import { api } from '../api'
import { getRouterPathWithLang, hashPassword } from '../utils'
import { DEFAULT_LOCALE, isSupportedLocale, replaceLocaleInFullPath } from '../i18n/utils'
import { getLocaleLabel, SUPPORTED_LOCALES } from '../i18n/locale-registry'
import Turnstile from '../components/Turnstile.vue'
import { NButton, NIcon } from 'naive-ui'

const message = useMessage()
const notification = useNotification()

const {
    toggleDark, isDark, isTelegram,
    showAuth, auth, loading, openSettings, preferredLocale, userSettings
} = useGlobalState()
const route = useRoute()
const router = useRouter()
const isMobile = useIsMobile()

const showMobileMenu = ref(false)
const menuValue = computed(() => {
    if (route.path.includes("user")) return "user";
    if (route.path.includes("admin")) return "admin";
    return "home";
});

const cfToken = ref('')
const turnstileRef = ref(null)

const authFunc = async () => {
    try {
        await api.fetch('/open_api/site_login', {
            method: 'POST',
            body: JSON.stringify({
                password: await hashPassword(auth.value),
                cf_token: cfToken.value
            })
        });
        location.reload()
    } catch (error) {
        message.error(error.message || "error");
        turnstileRef.value?.refresh?.();
    }
}

const languageOptions = SUPPORTED_LOCALES.map((locale) => ({
    label: getLocaleLabel(locale),
    value: locale,
    key: locale,
}))

const currentLocaleLabel = computed(() => {
    return languageOptions.find(opt => opt.value === locale.value)?.label || locale.value;
});

const { t, locale } = useScopedI18n('views.Header')

const changeLocale = async (lang) => {
    if (!isSupportedLocale(lang)) {
        return;
    }

    const currentFullPath = route.fullPath;
    const targetFullPath = replaceLocaleInFullPath(currentFullPath, lang);

    if (lang === locale.value && targetFullPath === currentFullPath) {
        showMobileMenu.value = false;
        return;
    }

    if (lang === DEFAULT_LOCALE) {
        preferredLocale.value = DEFAULT_LOCALE;
    }

    let localeSwitched = false;
    try {
        await router.push({ path: targetFullPath, force: true });
        localeSwitched = router.currentRoute.value.fullPath === targetFullPath;
        if (!localeSwitched) {
            await router.replace({ path: targetFullPath, force: true });
            localeSwitched = router.currentRoute.value.fullPath === targetFullPath;
        }
    } catch (error) {
        console.error('Failed to switch locale', error);
    } finally {
        showMobileMenu.value = false;
    }

    if (localeSwitched) preferredLocale.value = lang;
}

const menuOptions = computed(() => [
    {
        label: () => h(NButton,
            {
                text: true,
                size: "small",
                type: menuValue.value == "home" ? "primary" : "default",
                style: "width: 100%",
                onClick: async () => {
                    await router.push(getRouterPathWithLang('/', locale.value));
                    showMobileMenu.value = false;
                }
            },
            {
                default: () => t('mailbox'),
                icon: () => h(NIcon, { component: Envelope })
            }),
        key: "home"
    },
    {
        label: () => h(
            NButton,
            {
                text: true,
                size: "small",
                type: menuValue.value == "user" ? "primary" : "default",
                style: "width: 100%",
                onClick: async () => {
                    await router.push(getRouterPathWithLang("/user", locale.value));
                    showMobileMenu.value = false;
                }
            },
            {
                default: () => t('userCenter'),
                icon: () => h(NIcon, { component: User }),
            }
        ),
        key: "user",
        show: !isTelegram.value
    },
    {
        label: () => h(
            NButton,
            {
                text: true,
                size: "small",
                style: "width: 100%",
                onClick: () => { toggleDark(); showMobileMenu.value = false; }
            },
            {
                default: () => isDark.value ? t('light') : t('dark'),
                icon: () => h(
                    NIcon, { component: isDark.value ? LightModeFilled : DarkModeFilled }
                )
            }
        ),
        key: "theme"
    },
    {
        label: () => h(
            NButton,
            {
                text: true,
                size: "small",
                style: "width: 100%",
                tag: "a",
                target: "_blank",
                href: openSettings.value?.statusUrl,
            },
            {
                default: () => t('status'),
                icon: () => h(NIcon, { component: MonitorHeartFilled })
            }
        ),
        show: !!openSettings.value?.statusUrl,
        key: "status"
    }
]);

useHead({
    title: () => openSettings.value.title || t('title'),
    meta: [
        { name: "description", content: openSettings.value.description || t('title') },
    ]
});

const logoClick = async () => {
    await router.push(getRouterPathWithLang('/', locale.value));
}

onMounted(async () => {
    await api.getOpenSettings(message, notification);
    // make sure user_id is fetched
    if (!userSettings.value.user_id) await api.getUserSettings(message);
});
</script>

<template>
    <div>
        <header class="km-header">
            <button type="button" class="km-brand" @click="logoClick" :aria-label="t('title')">
                <img class="km-brand__mark" src="/logo.svg" alt="" width="32" height="32" />
                <span class="km-brand__name">Kimolo <span>Mail</span></span>
            </button>
            <nav class="km-header__nav" v-if="!isMobile">
                <n-menu mode="horizontal" :options="menuOptions" responsive />
                <n-dropdown :options="languageOptions" @select="changeLocale" trigger="click">
                    <n-button quaternary class="km-header__locale">
                        <template #icon>
                            <n-icon :component="Language" />
                        </template>
                        {{ currentLocaleLabel }}
                        <n-icon :component="KeyboardArrowDownOutlined" style="margin-left: 4px;" />
                    </n-button>
                </n-dropdown>
            </nav>
            <n-button v-else secondary @click="showMobileMenu = !showMobileMenu">
                <template #icon>
                    <n-icon :component="MenuFilled" />
                </template>
                {{ t('menu') }}
            </n-button>
        </header>
        <n-drawer v-model:show="showMobileMenu" placement="right" width="min(320px, 88vw)">
            <n-drawer-content :title="t('menu')" closable>
                <n-menu :options="menuOptions" />
                <div class="mobile-menu-actions">
                    <n-dropdown :options="languageOptions" @select="changeLocale" trigger="click">
                        <button type="button" class="mobile-menu-utility-button">
                            <n-icon :component="Language" />
                            <span class="mobile-menu-action-label">{{ currentLocaleLabel }}</span>
                            <n-icon :component="KeyboardArrowDownOutlined" class="mobile-menu-action-arrow" />
                        </button>
                    </n-dropdown>
                </div>
            </n-drawer-content>
        </n-drawer>
        <n-modal v-model:show="showAuth" :closable="false" :closeOnEsc="false" :maskClosable="false" preset="dialog"
            :title="t('accessHeader')" :show-icon="false" style="max-width: 420px;">
            <p class="km-modal-tip">{{ t('accessTip') }}</p>
            <n-input v-model:value="auth" type="password" show-password-on="click" size="large" @keyup.enter="authFunc" />
            <Turnstile ref="turnstileRef" v-if="openSettings.enableGlobalTurnstileCheck" v-model:value="cfToken" />
            <template #action>
                <n-button :loading="loading" @click="authFunc" type="primary" size="large" block>
                    {{ t('ok') }}
                </n-button>
            </template>
        </n-modal>
    </div>
</template>

<style scoped>
.km-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--km-space-4);
    padding: var(--km-space-5) 0;
}

.km-brand {
    display: inline-flex;
    align-items: center;
    gap: var(--km-space-3);
    min-width: 0;
    padding: 0;
    border: 0;
    background: none;
    color: var(--km-text);
    cursor: pointer;
    border-radius: var(--km-radius-sm);
}

.km-brand__mark {
    flex: 0 0 auto;
    border-radius: var(--km-radius-sm);
}

.km-brand__name {
    font: 700 22px var(--km-font-display);
    letter-spacing: -0.02em;
    white-space: nowrap;
}

.km-brand__name span {
    color: var(--km-accent);
}

.km-header__nav {
    display: flex;
    align-items: center;
    gap: var(--km-space-2);
    min-width: 0;
}

.km-header__nav :deep(.n-menu) {
    min-width: 0;
}

.km-header__nav :deep(.n-menu-item-content) {
    padding: 0 6px !important;
}

.km-header__locale {
    color: var(--km-muted);
}

.km-modal-tip {
    margin: 0 0 var(--km-space-3);
    color: var(--km-muted);
}

.mobile-menu-actions {
    margin-top: var(--km-space-3);
    padding-top: var(--km-space-3);
    border-top: 1px solid var(--km-line-soft);
}

.mobile-menu-utility-button {
    display: flex;
    align-items: center;
    gap: var(--km-space-2);
    height: 44px;
    width: 100%;
    padding: 0 var(--km-space-3);
    border: 1px solid var(--km-line-soft);
    border-radius: var(--km-radius-md);
    background: transparent;
    color: inherit;
    font: inherit;
    cursor: pointer;
}

.mobile-menu-action-label {
    flex: 1;
    text-align: left;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

@media (max-width: 640px) {
    .km-header {
        padding: var(--km-space-4) 0;
    }

    .km-brand__name {
        font-size: 19px;
    }
}
</style>
