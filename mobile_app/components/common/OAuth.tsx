import { useOAuth } from "@clerk/clerk-expo";
import { router } from "expo-router";
import { Alert, Image, Text, View, StyleSheet, Linking } from "react-native";

import CustomButton from "./CustomButton";
import { icons } from "../../constants";
import { googleOAuth } from "../../services/auth";
import { COLORS, SIZES } from "../../constants/theme";
import { useAuth } from "@clerk/clerk-expo";

const OAuth = () => {
    const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });
    const { signOut } = useAuth();

    const handleGoogleSignIn = async () => {
        try {
            // First try to sign out if there's an existing session
            try {
                await signOut();
            } catch (e) {
                // Ignore error if no session exists
            }

            const result = await googleOAuth(startOAuthFlow);

            if (result.success) {
                if (result.code === "session_exists") {
                    // Handle existing session
                    await signOut();
                    // Retry the OAuth flow
                    const retryResult = await googleOAuth(startOAuthFlow);
                    if (retryResult.success) {
                        router.replace("/(tabs)");
                    }
                } else {
                    router.replace("/onboarding");
                }
            } else {
                Alert.alert("Error", result.message);
            }
        } catch (error) {
            Alert.alert("Error", "Failed to authenticate with Google");
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.dividerContainer}>
                <View style={styles.divider} />
                <Text style={styles.dividerText}>Or</Text>
                <View style={styles.divider} />
            </View>

            <CustomButton
                title="Log In with Google"
                style={styles.button}
                IconLeft={() => (
                    <Image
                        source={icons.google}
                        resizeMode="contain"
                        style={styles.googleIcon}
                    />
                )}
                bgVariant="outline"
                textVariant="secondary"
                onPress={handleGoogleSignIn}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
    },
    dividerContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: SIZES.medium,
        gap: SIZES.small,
    },
    divider: {
        flex: 1,
        height: 1,
        backgroundColor: COLORS.background,
    },
    dividerText: {
        fontSize: SIZES.large,
        color: COLORS.textPrimary,
    },
    button: {
        marginTop: SIZES.medium,
        width: '100%',
        shadowOpacity: 0,
        backgroundColor: COLORS.primary,
        color:'white'
    },
    googleIcon: {
        width: SIZES.medium,
        height: SIZES.medium,
        marginHorizontal: SIZES.small,
    },
});

export default OAuth;