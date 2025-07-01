import { supabase } from "@/utils/supabase";
import { useRouter, useSegments } from "expo-router";
import { Image, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import tw from 'twrnc';
import { useUserStore } from "../store/userStore";

import { useEffect, useState } from "react";
import CreateTab from '../../assets/images/createtab.svg';
import CreateTabActive from '../../assets/images/createtab_active.svg';
import HomeTab from '../../assets/images/hometab.svg';
import HomeTabActive from '../../assets/images/hometab_active.svg';

function CustomTabBar({ state, descriptors, navigation }) {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const segments = useSegments();
    const { setSession, setUser, user } = useUserStore.getState();

    // Example avatar image, replace with user profile image if available
    const [avatarUri, setAvatarUri] = useState('');

    // Helper to determine if a tab is focused
    const isFocused = (routeName) => {
        const current = state.routes[state.index].name;
        return current === routeName;
    };

    // Function to set session and user in userStore

    function setSessionAndUser() {
        supabase.auth.getSession().then(async ({ data: { session } }) => {
            setSession(session);
            if (session && session.user) {
                const { data: userData, error: userError } = await supabase.from('users').select('*').eq('email', session.user.email).single();
                if (userError) {
                    console.error('Error fetching user:', userError);
                } else {
                    setUser(userData);
                    setAvatarUri(userData.profile_image);
                }
            } else {
                setUser(null);
            }
        });
    }

    useEffect(() => {
        setSessionAndUser();
    }, []);

    // Tab bar background and layout
    return (
        <View
            style={tw`flex-row justify-around items-center bg-[#2D1856] rounded-3xl mx-4 mb-[${insets.bottom ? insets.bottom : 12}px] h-16 absolute left-0 right-0 bottom-0 shadow-lg shadow-black/15 z-10`}
        >
            {/* Home Tab */}
            <TouchableOpacity onPress={() => router.replace("/(home)/home")} style={tw`flex-1 items-center justify-center`}>
                {isFocused("home") ? <HomeTabActive /> : <HomeTab />}
            </TouchableOpacity>

            {/* Center Add Button */}
            <TouchableOpacity onPress={() => router.replace("/(home)/create")} style={tw`flex-1 items-center justify-center`}>
                {isFocused("create") ? <CreateTabActive /> : <CreateTab />}
            </TouchableOpacity>
            
            {/* Profile Tab */}
            <TouchableOpacity onPress={() => router.replace("/(home)/profile")} style={tw`flex-1 items-center justify-center`}>
                <Image
                    source={{ uri: avatarUri }}
                    style={{
                        width: 30,
                        height: 30,
                        borderRadius: 18,
                        borderWidth: isFocused("profile") ? 2 : 0,
                        borderColor: "#fff",
                    }}
                />
            </TouchableOpacity>
        </View>
    );
}

// Use the custom tab bar in Tabs
import { Tabs } from "expo-router";

export default function HomeLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarShowLabel: false,
                tabBarStyle: { display: "none" }, // Hide default tab bar
            }}
            tabBar={(props) => <CustomTabBar {...props} />}
        >
            <Tabs.Screen name="home" options={{ headerShown: false }} />
            <Tabs.Screen name="create" options={{ headerShown: false }} />
            <Tabs.Screen name="profile" options={{ headerShown: false }} />
        </Tabs>
    );
}

