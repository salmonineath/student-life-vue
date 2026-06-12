import { ref, type Ref } from 'vue'

/** Small reusable boolean toggle composable. */
export function useToggle(initial = false): {
  state: Ref<boolean>
  toggle: () => void
  set: (value: boolean) => void
} {
  const state = ref(initial)
  const toggle = () => {
    state.value = !state.value
  }
  const set = (value: boolean) => {
    state.value = value
  }
  return { state, toggle, set }
}
