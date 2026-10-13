import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { Loading } from '../components/ui';
import { colors } from '../theme';
import { LoginScreen, RegisterScreen, ForgotScreen } from '../screens/AuthScreens';
import DashboardScreen from '../screens/DashboardScreen';
import { ProjectsScreen, ProjectDetailScreen, NewProjectScreen } from '../screens/ProjectScreens';
import { TasksScreen, TaskDetailScreen } from '../screens/TaskScreens';
import ChatScreen from '../screens/ChatScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import { ProfileScreen, EditProfileScreen, ChangePasswordScreen } from '../screens/ProfileScreens';

const Stack = createNativeStackNavigator();
const Tabs = createBottomTabNavigator();
const ProjectsStack = createNativeStackNavigator();
const ProfileStack = createNativeStackNavigator();

const header = {
  headerStyle: { backgroundColor: colors.navy },
  headerTintColor: '#fff',
  headerTitleStyle: { fontWeight: '700' },
};

function ProjectsNavigator() {
  return (
    <ProjectsStack.Navigator screenOptions={header}>
      <ProjectsStack.Screen name="Projects" component={ProjectsScreen} options={{ title: 'Proyectos' }} />
      <ProjectsStack.Screen name="ProjectDetail" component={ProjectDetailScreen} options={{ title: 'Detalle del proyecto' }} />
      <ProjectsStack.Screen name="NewProject" component={NewProjectScreen} options={{ title: 'Nuevo proyecto' }} />
      <ProjectsStack.Screen name="Tasks" component={TasksScreen} options={({ route }) => ({ title: route.params.name })} />
      <ProjectsStack.Screen name="TaskDetail" component={TaskDetailScreen} options={{ title: 'Tarea' }} />
      <ProjectsStack.Screen name="Chat" component={ChatScreen} options={({ route }) => ({ title: `Chat · ${route.params.name}` })} />
    </ProjectsStack.Navigator>
  );
}

function ProfileNavigator() {
  return (
    <ProfileStack.Navigator screenOptions={header}>
      <ProfileStack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Perfil' }} />
      <ProfileStack.Screen name="EditProfile" component={EditProfileScreen} options={{ title: 'Editar perfil' }} />
      <ProfileStack.Screen name="ChangePassword" component={ChangePasswordScreen} options={{ title: 'Cambiar contraseña' }} />
    </ProfileStack.Navigator>
  );
}

const icons = { DashboardTab: 'grid', ProjectsTab: 'briefcase', NotificationsTab: 'notifications', ProfileTab: 'person' };

function MainTabs() {
  return (
    <Tabs.Navigator
      screenOptions={({ route }) => ({
        ...header,
        tabBarActiveTintColor: colors.blue,
        tabBarIcon: ({ color, size }) => <Ionicons name={icons[route.name]} size={size} color={color} />,
      })}
    >
      <Tabs.Screen name="DashboardTab" component={DashboardScreen} options={{ title: 'Dashboard' }} />
      <Tabs.Screen name="ProjectsTab" component={ProjectsNavigator} options={{ title: 'Proyectos', headerShown: false }} />
      <Tabs.Screen name="NotificationsTab" component={NotificationsScreen} options={{ title: 'Avisos' }} />
      <Tabs.Screen name="ProfileTab" component={ProfileNavigator} options={{ title: 'Perfil', headerShown: false }} />
    </Tabs.Navigator>
  );
}

export default function RootNavigator() {
  const { user, loading } = useAuth();
  if (loading) return <Loading />;
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <Stack.Screen name="Main" component={MainTabs} />
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="Forgot" component={ForgotScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
