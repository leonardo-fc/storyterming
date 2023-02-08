let modalMessage = $state<string>();

export const modal = {
  show: (message: string) => {
    modalMessage = message;
  },

  reset: () => {
    modalMessage = undefined;
  },

  get message() {
    return modalMessage;
  },
};
