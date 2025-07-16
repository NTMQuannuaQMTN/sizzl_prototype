import React, { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import tw from 'twrnc';
import Explore from './explore';
import YourEvents from './yourevents';

export default function Homepage() {
    const [activeTab, setActiveTab] = useState<'explore' | 'yourevents'>('explore');

    return (
        <View style={tw`flex-1 bg-black`}>
            {/* Tab Switcher */}
            <View style={tw`flex-row justify-around mt-8 mb-2`}>
                <TouchableOpacity
                    style={tw`flex-1 items-center py-2 ${activeTab === 'explore' ? 'bg-white rounded-full' : ''}`}
                    onPress={() => setActiveTab('explore')}
                >
                    <Text style={[tw`${activeTab === 'explore' ? 'text-indigo-900' : 'text-white'}`, { fontFamily: 'Nunito-ExtraBold' }]}>Explore</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={tw`flex-1 items-center py-2 ${activeTab === 'yourevents' ? 'bg-white rounded-full' : ''}`}
                    onPress={() => setActiveTab('yourevents')}
                >
                    <Text style={[tw`${activeTab === 'yourevents' ? 'text-indigo-900' : 'text-white'}`, { fontFamily: 'Nunito-ExtraBold' }]}>Your events</Text>
                </TouchableOpacity>
            </View>

            {/* Tab Content */}
            <View style={tw`flex-1`}>
                {activeTab === 'explore' ? <Explore /> : <YourEvents />}
            </View>
        </View>
    );
}