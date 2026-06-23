import { create } from "zustand";

type ClientListState = {
  draftKeyword: string;
  committedKeyword: string;
  setDraftKeyword: (keyword: string) => void;
  commitKeyword: () => void;
};

export const useClientListStore = create<ClientListState>((set) => ({
  draftKeyword: "",
  committedKeyword: "",
  setDraftKeyword: (keyword) => set({ draftKeyword: keyword }),
  commitKeyword: () => set((state) => ({ committedKeyword: state.draftKeyword })),
}));
