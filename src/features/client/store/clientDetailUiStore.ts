import { create } from "zustand";

type ClientDetailUiState = {
  isDirty: boolean;
  confirmDiscardOpen: boolean;
  resetEditState: () => void;
  setDirty: (isDirty: boolean) => void;
  requestCancel: () => void;
  closeConfirm: () => void;
};

export const useClientDetailUiStore = create<ClientDetailUiState>((set, get) => ({
  isDirty: false,
  confirmDiscardOpen: false,
  resetEditState: () => set({ isDirty: false, confirmDiscardOpen: false }),
  setDirty: (isDirty) => set({ isDirty }),
  requestCancel: () => {
    if (get().isDirty) set({ confirmDiscardOpen: true });
  },
  closeConfirm: () => set({ confirmDiscardOpen: false }),
}));
