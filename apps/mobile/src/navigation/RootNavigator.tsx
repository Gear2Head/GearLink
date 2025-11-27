// navigation/RootNavigator.tsx
// Updated with all new screens including CallScreen

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TouchableOpacity } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { COLORS } from '../constants/config';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Screens
import LoginScreen from '../screens/LoginScreen';
import ChatListScreen from '../screens/ChatListScreen';
import ChatScreen from '../screens/ChatScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { AdminPanelScreen } from '../screens/AdminPanelScreen';
import { SwitchAccountScreen } from '../screens/SwitchAccountScreen';
import { CallScreen } from '../components/calling/CallScreen';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
    const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
    const userEmail = useSelector((state: RootState) => state.auth.user?.email || '');

    return (
        <Stack.Navigator
            screenOptions={{
                headerStyle: {
                    backgroundColor: COLORS.primary,
                },
                headerTintColor: '#FFFFFF',
                headerTitleStyle: {
                    fontWeight: '600',
                },
            }}
        >
            {!isAuthenticated ? (
                <Stack.Screen
                    name="Login"
                    component={LoginScreen}
                    options={{ headerShown: false }}
                />
            ) : (
                <>
                    <Stack.Screen
                        name="ChatList"
                        component={ChatListScreen}
                        options={({ navigation }: any) => ({
                            title: 'GearLink',
                            headerRight: () => (
                                <TouchableOpacity
                                    style={{ marginRight: 16 }}
                                    onPress={() => navigation.navigate('Settings')}
                                >
                                    <Icon name="cog" size={24} color="#FFFFFF" />
                                </TouchableOpacity>
                            ),
                        })}
                    />
                    <Stack.Screen
                        name="Chat"
                        component={ChatScreen}
                        options={{ headerBackTitleVisible: false }}
                    />
                    <Stack.Screen
                        name="Settings"
                        component={(props: any) => <SettingsScreen {...props} userEmail={userEmail} />}
                        options={{ title: 'Ayarlar' }}
                    />
                    <Stack.Screen
                        name="Profile"
                        component={(props: any) => (
                            <ProfileScreen
                                {...props}
                                user={{
                                    name: 'Kullanıcı',
                                    phone: '+90 555 123 4567',
                                    about: 'Hey, GearLink kullanıyorum!',
                                }}
                            />
                        )}
                        options={{ title: 'Profil' }}
                    />
                    <Stack.Screen
                        name="SwitchAccount"
                        component={(props: any) => <SwitchAccountScreen {...props} />}
                        options={{ title: 'Hesap Değiştir' }}
                    />
                    <Stack.Screen
                        name="Call"
                        component={(props: any) => <CallScreen {...props} />}
                        options={{
                            headerShown: false,
                            presentation: 'fullScreenModal',
                        }}
                    />
                    <Stack.Screen
                        name="AdminPanel"
                        component={(props: any) => <AdminPanelScreen {...props} userEmail={userEmail} />}
                        options={{
                            title: 'Admin Panel',
                            presentation: 'transparentModal',
                            headerShown: false,
                        }}
                    />
                </>
            )}
        </Stack.Navigator>
    );
}
