import type { DirectiveBinding } from 'vue';

export const clickOutside = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    const handler = (e: Event) => {
      if (el.contains(e.target as Node)) {
        return;
      }
      if (binding.value && typeof binding.value === 'function') {
        binding.value(e);
      }
    };

    el._clickOutside = handler;
    document.addEventListener('click', handler);
  },
  
  unmounted(el: HTMLElement) {
    if (el._clickOutside) {
      document.removeEventListener('click', el._clickOutside);
      delete el._clickOutside;
    }
  }
};

// 扩展HTMLElement类型以包含我们的自定义属性
declare global {
  interface HTMLElement {
    _clickOutside?: (e: Event) => void;
  }
} 