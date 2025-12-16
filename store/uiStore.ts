import { create } from "zustand";

interface UIStore {
  isCreateTaskModalOpen: boolean;
  isCreateProjectModalOpen: boolean;
  openCreateTaskModal: () => void;
  closeCreateTaskModal: () => void;
  openCreateProjectModal: () => void;
  closeCreateProjectModal: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  isCreateTaskModalOpen: false,
  isCreateProjectModalOpen: false,
  openCreateTaskModal: () => set({ isCreateTaskModalOpen: true }),
  closeCreateTaskModal: () => set({ isCreateTaskModalOpen: false }),
  openCreateProjectModal: () => set({ isCreateProjectModalOpen: true }),
  closeCreateProjectModal: () => set({ isCreateProjectModalOpen: false }),
}));
