<script setup lang="ts">
import { nextTick, ref } from 'vue'
import { Mic, Paperclip, SendHorizontal, Smile } from 'lucide-vue-next'

const emit = defineEmits<{ send: [text: string] }>()

const draft = ref('')
const textarea = ref<HTMLTextAreaElement | null>(null)

function autoGrow(): void {
  const el = textarea.value
  if (!el) return
  el.style.height = 'auto'
  el.style.height = `${el.scrollHeight}px`
}

function submit(): void {
  if (!draft.value.trim()) return
  emit('send', draft.value)
  draft.value = ''
  nextTick(autoGrow)
}

function onKeydown(e: KeyboardEvent): void {
  // Enter sends; Shift+Enter inserts a newline.
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    submit()
  }
}
</script>

<template>
  <div class="px-6 pb-6 pt-2 slide-right d2">
    <div
      class="flex items-end gap-2 bg-white border border-border rounded-2xl px-3 py-2 shadow-sm focus-within:ring-2 focus-within:ring-emerald/40 focus-within:border-emerald/50 transition"
    >
      <button type="button" class="h-10 w-10 grid place-items-center rounded-xl text-muted hover:bg-bg transition shrink-0">
        <Paperclip class="h-[19px] w-[19px]" />
      </button>
      <textarea
        ref="textarea"
        v-model="draft"
        rows="1"
        placeholder="Type a message…"
        class="flex-1 resize-none bg-transparent text-sm text-ink placeholder:text-muted/60 focus:outline-none py-2.5 max-h-32"
        @input="autoGrow"
        @keydown="onKeydown"
      ></textarea>
      <button type="button" class="h-10 w-10 grid place-items-center rounded-xl text-muted hover:bg-bg transition shrink-0">
        <Smile class="h-[19px] w-[19px]" />
      </button>
      <button type="button" class="h-10 w-10 grid place-items-center rounded-xl text-muted hover:bg-bg transition shrink-0">
        <Mic class="h-[19px] w-[19px]" />
      </button>
      <button
        type="button"
        class="send-btn h-11 w-11 grid place-items-center rounded-xl text-white shadow-lg shadow-emerald/30 shrink-0"
        style="background: linear-gradient(135deg, var(--emerald), var(--indigo))"
        aria-label="Send message"
        @click="submit"
      >
        <SendHorizontal class="h-[19px] w-[19px]" />
      </button>
    </div>
  </div>
</template>
