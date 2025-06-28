import { create } from "zustand";

export const useAuthStore = create((set) => ({
    user: null,
    isLoading: false,
    setUser: (user) => set({user: user}),
}));

// const checkMailAvailable = async (email) => {
//     const {data, error} = await supabase.from('users')
//     .select('id').eq('email', email).single();
//     if (error) {
//         return true;
//     }
//     return false;
// }