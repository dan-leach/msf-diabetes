/**
 * @module useInstallPrompt
 * @description Vue composable that manages the PWA "Add to Home Screen" install prompt.
 *
 * The browser fires `beforeinstallprompt` when the PWA install criteria are met; this
 * module captures and defers that event so the app can show its own "Install app" button
 * (rendered in `Header.vue`) rather than relying on the browser's default banner timing.
 * Once installed the deferred prompt is cleared so the button disappears.
 *
 * The `deferredPrompt` ref is module-level (singleton) — all components that call
 * `useInstallPrompt()` share the same underlying event reference.
 *
 * @exports useInstallPrompt - Composable returning `{ deferredPrompt, install }`.
 */
import { ref } from "vue";

/**
 * Module-level singleton ref holding the deferred `BeforeInstallPromptEvent`, or null
 * when the prompt is unavailable (already installed, dismissed, or not yet triggered).
 * @type {import('vue').Ref<BeforeInstallPromptEvent|null>}
 */
const deferredPrompt = ref(null);

// Capture the install prompt event before the browser shows its own UI.
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt.value = e;
});

// Clear the prompt reference once the app has been installed.
window.addEventListener("appinstalled", () => {
  deferredPrompt.value = null;
});

/**
 * Composable that provides access to the PWA install prompt.
 *
 * @returns {{ deferredPrompt: import('vue').Ref<BeforeInstallPromptEvent|null>, install: Function }}
 *   - `deferredPrompt` — reactive ref; non-null only when the browser has a pending prompt.
 *   - `install` — triggers the native install dialog and clears the ref on completion.
 */
export function useInstallPrompt() {
  /**
   * Triggers the browser's native PWA install dialog.
   * No-ops if no prompt is currently available.
   *
   * @returns {Promise<void>}
   */
  const install = async () => {
    if (!deferredPrompt.value) return;
    deferredPrompt.value.prompt();
    await deferredPrompt.value.userChoice;
    deferredPrompt.value = null;
  };

  return { deferredPrompt, install };
}
