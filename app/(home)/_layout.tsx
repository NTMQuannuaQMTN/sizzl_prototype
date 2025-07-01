import { Tabs } from "expo-router";
import BotBar from '../botbar';

export default function HomeLayout() {
    return (
        <>
            <Tabs
                screenOptions={{
                    headerShown: false,
                    tabBarShowLabel: false,
                    tabBarStyle: { display: "none" }, // Hide default tab bar
                }}
            >
                <Tabs.Screen name="home" options={{ headerShown: false }} />
                <Tabs.Screen name="create" options={{ headerShown: false }} />
                <Tabs.Screen name="profile" options={{ headerShown: false }} />
            </Tabs>
            <BotBar />
        </>
    );
}

