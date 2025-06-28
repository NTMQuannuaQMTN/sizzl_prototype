import { supabase } from "@/utils/supabase";
import { Alert } from "react-native";
import { create } from "zustand";

export const useAuthStore = create((set) => ({
    user: null,
    token: null,
    isLoading: false,
    setUser: (user) => set({user: user}),
    verify: async (email) => {
        set({isLoading: true});
        const available = await checkMailAvailable(email);
        const {data, error} = await supabase.auth.signInWithOtp({
            email: email,
            options: {
                shouldCreateUser: available ? true : false,
            }
        });
        if (error) {
            Alert.alert("There are error, sorry");
        }
        set({isLoading: false});
    },
    checkCode: async (email, otp) => {
        set({isLoading: true});
        const {data, error} = await supabase.auth.verifyOtp({
            email: email,
            token: otp,
            type: 'email',
        });
        let valid = true;
        if (error) {
            valid = false;
        }
        set({isLoading: false});
        return valid;
    }
}));

const checkMailAvailable = async (email) => {
    const {data, error} = await supabase.from('users')
    .select('id').eq('email', email).single();
    if (error) {
        return true;
    }
    return false;
}