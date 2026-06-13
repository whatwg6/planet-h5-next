import { create } from "zustand";

type ClientListState = {
  keyword: string;
  setKeyword: (keyword: string) => void;
};

export const useClientListStore = create<ClientListState>((set) => ({
  keyword: "",
  setKeyword: (keyword) => set({ keyword }),
}));
