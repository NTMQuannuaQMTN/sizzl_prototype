import { supabase } from "@/utils/supabase";
import { Alert } from "react-native";
import { create } from "zustand";

interface User {
    email: string;
}

interface AuthStore {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    setUser: (user: User) => void;
    verify: (email: string) => Promise<void>;
    checkCode: (email: string, otp: string) => Promise<{ valid: boolean; error?: string; data?: any }>;
}

export const useAuthStore = create<AuthStore>((set) => ({
    user: null,
    token: null,
    isLoading: false,
    setUser: (user) => set({user: user}),
    verify: async (email) => {
        set({isLoading: true});
        try {
            const available = await checkMailAvailable(email);
            const {data, error} = await supabase.auth.signInWithOtp({
                email: email,
                options: {
                    shouldCreateUser: available ? true : false,
                }
            });
            if (error) {
                Alert.alert("Error", "Failed to send verification email");
            }
        } catch (err) {
            Alert.alert("Error", "Something went wrong");
        } finally {
            set({isLoading: false});
        }
    },
    checkCode: async (email, otp) => {
        set({isLoading: true});
        
        // Input validation
        if (!email || !otp || otp.length !== 6) {
            set({isLoading: false});
            return { valid: false, error: 'Please enter a valid 6-digit code' };
        }
        
        try {
            // Add timeout to prevent hanging
            const timeoutPromise = new Promise<never>((_, reject) => 
                setTimeout(() => reject(new Error('Request timeout')), 10000)
            );
            
            const verifyPromise = supabase.auth.verifyOtp({
                email: email,
                token: otp,
                type: 'email',
            });
            
            const {data, error} = await Promise.race([verifyPromise, timeoutPromise]);
            
            if (error) {
                console.error('OTP verification error:', error);
                set({isLoading: false});
                return { 
                    valid: false, 
                    error: error.message || 'Invalid verification code' 
                };
            }
            
            console.log('OTP verified successfully:', data);
            set({isLoading: false});
            return { valid: true, data };
            
        } catch (err) {
            console.error('Verification error:', err);
            set({isLoading: false});
            const errorMessage = err instanceof Error ? err.message : 'Verification failed. Please try again.';
            return { 
                valid: false, 
                error: errorMessage === 'Request timeout' 
                    ? 'Request timed out. Please try again.' 
                    : 'Verification failed. Please try again.' 
            };
        }
    }
}));

const checkMailAvailable = async (email: string) => {
    const {data, error} = await supabase.from('users')
    .select('id').eq('email', email).single();
    if (error) {
        return true;
    }
    return false;
}