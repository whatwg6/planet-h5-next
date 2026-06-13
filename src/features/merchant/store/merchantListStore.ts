import { create } from "zustand";

type MerchantListState = {
  keyword: string;
  setKeyword: (keyword: string) => void;
};

export const useMerchantListStore = create<MerchantListState>((set) => ({
  keyword: "",
  setKeyword: (keyword) => set({ keyword }),
}));
