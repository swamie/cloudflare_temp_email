<script setup>
import {
  darkTheme,
} from 'naive-ui'
import { computed, onMounted, watchEffect } from 'vue'
import { useHead } from '@unhead/vue'
import { useI18n } from 'vue-i18n'
import { useGlobalState } from './store'
import { useIsMobile } from './utils/composables'
import Header from './views/Header.vue';
import Footer from './views/Footer.vue';
import { api } from './api'
import { getNaiveLocaleConfig } from './i18n/naive-locale'
import { DEFAULT_LOCALE, isSupportedLocale } from './i18n/utils'
import { APP_CONFIG } from './config'
import { themeOverrides, cssVars } from './theme/tokens'

const {
  isDark, loading, useSideMargin, telegramApp, isTelegram
} = useGlobalState()
const adClient = APP_CONFIG.GOOGLE_AD_CLIENT;
const adSlot = APP_CONFIG.GOOGLE_AD_SLOT;
const { locale } = useI18n({ useScope: 'global' });
const theme = computed(() => isDark.value ? darkTheme : null)
const overrides = computed(() => themeOverrides(isDark.value ? 'dark' : 'light'))
const localeConfig = computed(() => getNaiveLocaleConfig(isSupportedLocale(locale.value) ? locale.value : DEFAULT_LOCALE))
const isMobile = useIsMobile()
const showSideMargin = computed(() => !isMobile.value && useSideMargin.value);
const showAd = computed(() => !isMobile.value && adClient && adSlot);
const gridMaxCols = computed(() => showAd.value ? 8 : 12);

watchEffect(() => {
  if (typeof document === 'undefined') return
  for (const [k, v] of Object.entries(cssVars(isDark.value ? 'dark' : 'light'))) {
    document.documentElement.style.setProperty(k, v)
  }
  document.documentElement.style.colorScheme = isDark.value ? 'dark' : 'light'
})

watchEffect(() => {
  if (typeof document === 'undefined') return
  document.documentElement.lang = isSupportedLocale(locale.value) ? locale.value : DEFAULT_LOCALE
})

if (showAd.value) {
  useHead({
    script: [{
      src: `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adClient}`,
      async: true,
      crossorigin: 'anonymous',
    }],
  })
}

onMounted(async () => {
  try {
    await api.getUserSettings();
  } catch (error) {
    console.error(error);
  }

  const token = APP_CONFIG.CF_WEB_ANALY_TOKEN;

  const exist = document.querySelector('script[src="https://static.cloudflareinsights.com/beacon.min.js"]') !== null
  if (token && !exist) {
    const script = document.createElement('script');
    script.defer = true;
    script.src = 'https://static.cloudflareinsights.com/beacon.min.js';
    script.dataset.cfBeacon = `{ token: ${token} }`;
    document.body.appendChild(script);
  }

  // check if google ad is enabled
  if (showAd.value) {
    (window.adsbygoogle = window.adsbygoogle || []).push({});
    (window.adsbygoogle = window.adsbygoogle || []).push({});
  }


  // check if telegram is enabled
  const enableTelegram = APP_CONFIG.IS_TELEGRAM;
  if (
    (typeof enableTelegram === 'boolean' && enableTelegram === true)
    ||
    (typeof enableTelegram === 'string' && enableTelegram === 'true')
  ) {
    await new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://telegram.org/js/telegram-web-app.js';
      script.onload = resolve;
      script.onerror = reject;
      document.body.appendChild(script);
    });
    telegramApp.value = window.Telegram?.WebApp || {};
    isTelegram.value = !!window.Telegram?.WebApp?.initData;
  }
});
</script>

<template>
  <n-config-provider :locale="localeConfig.locale" :date-locale="localeConfig.dateLocale" :theme="theme"
    :theme-overrides="overrides">
    <n-global-style />
    <n-spin description="Loading…" :show="loading" class="km-spin">
      <n-notification-provider container-style="margin-top: 64px;">
        <n-message-provider container-style="margin-top: 16px;">
          <div class="km-page" :class="{ 'km-page--ads': showAd, 'km-page--wide': !showSideMargin }">
            <aside v-if="showAd" class="km-ad">
              <ins class="adsbygoogle" style="display:block" :data-ad-client="adClient" :data-ad-slot="adSlot"
                data-ad-format="auto" data-full-width-responsive="true"></ins>
            </aside>
            <div class="km-shell">
              <Header />
              <main class="km-main">
                <router-view></router-view>
              </main>
              <Footer />
            </div>
            <aside v-if="showAd" class="km-ad">
              <ins class="adsbygoogle" style="display:block" :data-ad-client="adClient" :data-ad-slot="adSlot"
                data-ad-format="auto" data-full-width-responsive="true"></ins>
            </aside>
          </div>
          <n-back-top />
        </n-message-provider>
      </n-notification-provider>
    </n-spin>
  </n-config-provider>
</template>

<style>
@import './theme/base.css';
</style>

<style scoped>
.km-spin {
  position: relative;
  z-index: 1;
}

.km-page {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  justify-content: center;
  gap: var(--km-space-4);
  min-height: 100vh;
  padding: 0 var(--km-space-5);
}

.km-page--ads {
  grid-template-columns: 160px minmax(0, var(--km-max-width)) 160px;
}

.km-shell {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: var(--km-max-width);
  min-height: 100vh;
  margin: 0 auto;
}

.km-page--wide .km-shell {
  max-width: none;
}

.km-main {
  flex: 1;
  padding-bottom: var(--km-space-6);
}

.km-ad {
  position: sticky;
  top: 0;
  height: 100vh;
}

@media (max-width: 768px) {
  .km-page {
    padding: 0 var(--km-space-3);
  }
}
</style>
