import { create } from "zustand";
import api from "../api/axios";
import type { UpdateProfileInput } from "../../../shared/userValidators";

interface UserProfile {
  firstName: string;
  lastName:  string;
  email:     string;
  address:   string;
  phone:     string;
  birthday:  string;
  gender:    string;
  city:      string;
  country:   string;
  postalcode:string;
  region:    string;

  updateUserProfile: (data: Partial<UserProfile>) => void;
  resetUserProfile:  () => void;
  fetchUserProfile:  () => Promise<void>;
  saveUserProfile:   (data: Partial<UpdateProfileInput>) => Promise<void>;
}

export const useUserStore = create<UserProfile>((set, get) => ({
  // initial
  firstName:  "",
  lastName:   "",
  email:      "",
  address:    "",
  phone:      "",
  birthday:   "",
  gender:     "",
  city:       "",
  country:    "",
  postalcode: "",
  region:     "",

  updateUserProfile: data => set(state => ({ ...state, ...data })),

  resetUserProfile: () =>
    set({
      firstName:  "",
      lastName:   "",
      email:      "",
      address:    "",
      phone:      "",
      birthday:   "",
      gender:     "",
      city:       "",
      country:    "",
      postalcode: "",
      region:     "",
    }),

  fetchUserProfile: async () => {
    try {
      const { data } = await api.get("/user/profile", { withCredentials: true });
      set({ ...data });
    } catch (err) {
      console.error("fetchUserProfile failed", err);
    }
  },

  saveUserProfile: async profile => {
    try {
      // optimistic UI update
      get().updateUserProfile(profile);
      // use PATCH to match backend
      const { data } = await api.patch(
        "/user/profile",
        profile,
        { withCredentials: true }
      );
      // sync with server
      set({ ...data });
    } catch (err) {
      console.error("saveUserProfile failed", err);
      // rollback
      await get().fetchUserProfile();
    }
  },
}));