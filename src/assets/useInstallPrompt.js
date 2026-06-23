import { ref } from "vue";

const deferredPrompt = ref(null);

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt.value = e;
});

window.addEventListener("appinstalled", () => {
  deferredPrompt.value = null;
});

export function useInstallPrompt() {
  const install = async () => {
    if (!deferredPrompt.value) return;
    deferredPrompt.value.prompt();
    await deferredPrompt.value.userChoice;
    deferredPrompt.value = null;
  };

  return { deferredPrompt, install };
}
