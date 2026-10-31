<template>
  <div v-if="data.length" class="ui-card ui-table-container">
    <div class="table-scroll-wrapper" tabindex="0" :aria-label="label + '，可横向滚动'">
      <table class="m3-modern-table" :style="{ minWidth: `${minWidth}px` }">
        <thead>
          <tr class="table-header-row">
            <th
              v-for="column in columns"
              :key="column.key"
              :style="column.width ? { width: `${column.width}px` } : undefined"
              :class="{ 'text-right': column.key === 'actions' }"
              class="table-header-cell"
            >
              {{ column.title }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(row, rowIndex) in data"
            :key="row.id || row.key || rowIndex"
            class="table-body-row reveal-item"
            :style="{ '--reveal-index': Math.min(rowIndex, 7) }"
          >
            <td
              v-for="column in columns"
              :key="column.key"
              :class="{ 'text-right': column.key === 'actions' }"
              class="table-body-cell"
            >
              <div
                class="cell-content"
                :class="{ 'cell-content-actions': column.key === 'actions' }"
              >
                <CellValue :column="column" :row="row" />
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
  <UiEmpty v-else title="暂无数据" />
</template>

<script setup lang="ts">
import { computed, defineComponent, type PropType, type VNode } from 'vue'
import UiEmpty from './UiEmpty.vue'

export interface UiTableColumn {
  title: string
  key: string
  width?: number
  render?: (row: any) => VNode | string | number | null
}

const props = withDefaults(
  defineProps<{ columns: UiTableColumn[]; data: any[]; label?: string }>(),
  { label: '数据列表' }
)

function isWideColumn(column: UiTableColumn) {
  return ['description', 'base_url', 'module_path'].includes(column.key)
}

const minWidth = computed(() =>
  Math.max(
    760,
    props.columns.reduce(
      (total, column) =>
        total + (column.width || (column.key === 'actions' ? 88 : isWideColumn(column) ? 190 : 140)),
      0
    )
  )
)

const CellValue = defineComponent({
  props: {
    column: { type: Object as PropType<UiTableColumn>, required: true },
    row: { type: Object, required: true },
  },
  setup(props) {
    return () =>
      props.column.render
        ? props.column.render(props.row)
        : String(props.row[props.column.key] ?? '—')
  },
})
</script>

<style scoped>
.ui-table-container {
  width: 100%;
  overflow: hidden;
}

.table-scroll-wrapper {
  width: 100%;
  overflow-x: auto;
  outline: none;
}

/* 优雅细致的横向滚动条 */
.table-scroll-wrapper::-webkit-scrollbar {
  height: 6px;
}
.table-scroll-wrapper::-webkit-scrollbar-thumb {
  background: var(--color-outline-variant, #cac4d0);
  border-radius: 9999px;
}
.table-scroll-wrapper::-webkit-scrollbar-track {
  background: transparent;
}

.m3-modern-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

/* 表头设计 */
.table-header-row {
  background-color: var(--color-surface-container-high, #f3edf7);
  border-bottom: 1px solid var(--color-outline-variant, rgba(0, 0, 0, 0.1));
}

:root[data-theme='dark'] .table-header-row {
  background-color: var(--color-surface-container-high, #2b2930);
  border-bottom-color: var(--color-outline-variant, rgba(255, 255, 255, 0.12));
}

.table-header-cell {
  padding: 11px 16px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.02em;
  text-transform: none;
  color: var(--sidebar-muted, #625b71);
  white-space: nowrap;
  user-select: none;
}

/* 表体单元格与行设计 */
.table-body-row {
  border-bottom: 1px solid var(--color-outline-variant, rgba(0, 0, 0, 0.06));
  transition: background-color 0.16s cubic-bezier(0.2, 0, 0, 1);
}

:root[data-theme='dark'] .table-body-row {
  border-bottom-color: var(--color-outline-variant, rgba(255, 255, 255, 0.07));
}

.table-body-row:last-child {
  border-bottom: none;
}

.table-body-row:hover {
  background-color: var(--sidebar-hover, rgba(0, 0, 0, 0.03));
}

:root[data-theme='dark'] .table-body-row:hover {
  background-color: var(--sidebar-hover, rgba(255, 255, 255, 0.04));
}

.table-body-cell {
  padding: 11px 16px;
  font-size: 13.5px;
  vertical-align: middle;
  color: var(--sidebar-strong, #1d1b20);
  font-variant-numeric: tabular-nums;
}

:root[data-theme='dark'] .table-body-cell {
  color: var(--color-text, #e2e2e6);
}

.cell-content {
  display: flex;
  align-items: center;
  width: 100%;
  min-width: 0;
  gap: 8px;
}

.cell-content-actions {
  justify-content: flex-end;
}

.cell-content-actions :deep(.v-btn) {
  color: var(--color-primary, #1976d2);
}

:root[data-theme='dark'] :deep(.model-icon),
.dark :deep(.model-icon) {
  color: var(--color-primary, #90caf9);
}
</style>
