<script setup>
const year = new Date().getFullYear()
</script>

<template>
    <footer class="km-footer">
        <span>© {{ year }} Kimolo</span>
        <span aria-hidden="true">·</span>
        <a href="https://admin.kimolo.dev" target="_blank" rel="noopener noreferrer">Admin ↗</a>
    </footer>
</template>

<style scoped>
.km-footer {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: var(--km-space-2);
    padding: var(--km-space-5) 0 var(--km-space-6);
    border-top: 1px solid var(--km-line-soft);
    color: var(--km-faint);
    font-size: 13px;
}

.km-footer a {
    color: var(--km-muted);
    text-decoration: none;
    border-radius: var(--km-radius-sm);
}

.km-footer a:hover {
    color: var(--km-accent);
}
</style>
