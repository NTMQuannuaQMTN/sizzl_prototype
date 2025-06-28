import { supabase } from "@/utils/supabase";
import { Alert } from "react-native";

export const checkCode = async (email, otp) => {
    const { data, error } = await supabase.auth.verifyOtp({
        email: email,
        token: otp,
        type: 'email',
    });
    if (error) {
        Alert.alert("Something wrong");
        return false;
    } else {
        Alert.alert("OK");
        return true;
    }
}