
import { defineStore } from 'pinia';

export const menuStore = defineStore('menu', {
  state: () => ({
    refreshTrigger: 0
  }),
  actions: {
    triggerRefresh() {
      this.refreshTrigger++;
    }
  }
});