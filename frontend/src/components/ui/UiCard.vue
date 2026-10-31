<template>
  <v-card class="ui-card" :class="{ 'ui-card-flush': !padded }">
    <header v-if="$slots.header || title || $slots.extra" class="card-heading">
      <div class="card-heading-title">
        <component :is="icon" v-if="icon" :size="20" :stroke-width="1.5" aria-hidden="true" />
        <h2 v-if="title" class="card-title">{{ title }}</h2>
        <slot name="header" />
      </div>
      <div v-if="$slots.extra" class="card-heading-extra">
        <slot name="extra" />
      </div>
    </header>
    <div :class="{ 'panel-body': padded }"><slot /></div>
    <footer v-if="$slots.footer" class="card-footer">
      <v-divider class="my-2" />
      <div class="panel-body"><slot name="footer" /></div>
    </footer>
  </v-card>
</template>

<script setup lang="ts">
import type { Component } from 'vue'

withDefaults(defineProps<{ title?: string; padded?: boolean; icon?: Component }>(), {
  padded: true,
})
</script>

<style scoped>
.ui-card {
  min-width: 0;
  height: auto;
  box-sizing: border-box;
  padding: 18px 20px;
}
.ui-card-flush {
  padding: 0;
  overflow: hidden;
}
.card-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
}
.card-heading-title {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}
.card-heading-extra {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}
.card-title {
  font-size: 15px;
  font-weight: 600;
  margin: 0;
}
.card-heading + .panel-body,
.card-heading + div:not(.panel-body) {
  margin-top: 14px;
}
</style>
