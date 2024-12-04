import { StyleProp, ViewStyle } from 'react-native';

export interface ButtonProps {
    onPress: () => void;
    title: string;
    bgVariant?: 'primary' | 'secondary' | 'danger' | 'success' | 'outline';
    textVariant?: 'default' | 'primary' | 'secondary' | 'danger' | 'success';
    IconLeft?: React.ComponentType;
    IconRight?: React.ComponentType;
    style?: StyleProp<ViewStyle>;
    [key: string]: any;
}

export interface TokenCache {
    getToken: (key: string) => Promise<string | undefined | null>
    saveToken: (key: string, token: string) => Promise<void>
    clearToken?: (key: string) => void
}