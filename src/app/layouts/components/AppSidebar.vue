<script setup lang="ts">
import { RouterLink } from 'vue-router'
import {
  GraduationCap,
  LayoutDashboard,
  CalendarDays,
  ClipboardList,
  Users,
  Bell,
  UserRound,
  Sparkles,
  LogOut,
  type LucideIcon,
} from 'lucide-vue-next'

interface NavItem {
  label: string
  icon: LucideIcon
  to: string
  /** Renders the live pulse dot (Dashboard). */
  live?: boolean
  /** Renders a small count badge (Assignments). */
  badge?: string
}

const navItems: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, to: '/', live: true },
  { label: 'Schedule', icon: CalendarDays, to: '/schedules' },
  { label: 'Assignments', icon: ClipboardList, to: '/assignments', badge: '1' },
  { label: 'Study Groups', icon: Users, to: '/groups' },
  { label: 'Notifications', icon: Bell, to: '/notifications' },
  { label: 'Profile', icon: UserRound, to: '/users' },
]
</script>

<template>
  <aside
    class="hidden lg:flex flex-col w-[264px] shrink-0 bg-white border-r border-border px-4 py-6 sticky top-0 h-screen slide-left"
  >
    <!-- Brand -->
    <div class="flex items-center gap-3 px-2 mb-9">
      <div
        class="h-11 w-11 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald/30"
        style="background: linear-gradient(135deg, var(--emerald), var(--indigo))"
      >
        <GraduationCap class="h-6 w-6" />
      </div>
      <div>
        <p class="font-display font-extrabold text-[17px] leading-none text-ink">Student Life</p>
        <p class="text-[11px] text-muted mt-1">Stay on track, stress-free</p>
      </div>
    </div>

    <!-- Nav -->
    <nav class="flex flex-col gap-1.5 text-[14.5px]">
      <RouterLink
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        custom
        v-slot="{ isActive, isExactActive, href, navigate }"
      >
        <!-- Dashboard ('/') needs an exact match; every other route is nested under '/' and would otherwise also count as active. -->
        <a
          :href="href"
          class="nav-item flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-muted"
          :class="{ active: item.to === '/' ? isExactActive : isActive }"
          @click="navigate"
        >
          <component :is="item.icon" class="nav-ico h-[18px] w-[18px]" />
          {{ item.label }}
          <span
            v-if="item.live"
            class="ml-auto h-2 w-2 rounded-full bg-emerald pulse-dot"
          ></span>
          <span
            v-else-if="item.badge"
            class="ml-auto text-[11px] font-semibold text-amber-ink bg-amber/15 px-2 py-0.5 rounded-full"
          >
            {{ item.badge }}
          </span>
        </a>
      </RouterLink>
    </nav>

    <!-- Focus card -->
    <div
      class="mt-auto rounded-2xl p-4 text-white relative overflow-hidden"
      style="background: linear-gradient(135deg, var(--emerald), var(--emerald-dark))"
    >
      <div class="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-white/15"></div>
      <p class="text-[12.5px] font-semibold flex items-center gap-1.5">
        <Sparkles class="h-4 w-4" /> Daily focus
      </p>
      <p class="text-[12px] text-white/90 mt-1.5 leading-snug">
        One small step today beats a perfect plan tomorrow.
      </p>
    </div>

    <button
      type="button"
      class="mt-4 flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-muted hover:text-danger hover:bg-danger/5 transition text-[14.5px]"
    >
      <LogOut class="h-[18px] w-[18px]" /> Log out
    </button>
  </aside>
</template>
