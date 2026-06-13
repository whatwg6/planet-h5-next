import { create } from "zustand";

type PlanDraftState = {
  saveMessage: string;
  setSaveMessage: (saveMessage: string) => void;
};

export const usePlanDraftStore = create<PlanDraftState>((set) => ({
  saveMessage: "",
  setSaveMessage: (saveMessage) => set({ saveMessage }),
}));
