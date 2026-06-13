import { create } from "zustand";

type ClientDetailUiState = {
  mode: "readonly" | "editing";
  isDirty: boolean;
  confirmDiscardOpen: boolean;
  enterEdit: () => void;
  exitEdit: () => void;
  setDirty: (isDirty: boolean) => void;
  requestCancel: () => void;
  closeConfirm: () => void;
};

export const useClientDetailUiStore = create<ClientDetailUiState>((set, get) => ({
  mode: "readonly",
  isDirty: false,
  confirmDiscardOpen: false,
  enterEdit: () => set({ mode: "editing", isDirty: false, confirmDiscardOpen: false }),
  exitEdit: () => set({ mode: "readonly", isDirty: false, confirmDiscardOpen: false }),
  setDirty: (isDirty) => set({ isDirty }),
  requestCancel: () => {
    if (get().isDirty) set({ confirmDiscardOpen: true });
    else get().exitEdit();
  },
  closeConfirm: () => set({ confirmDiscardOpen: false }),
}));
