import * as Linking from "expo-linking";
import * as SecureStore from "expo-secure-store";
import { useAuth } from "@clerk/clerk-expo";
import { fetchAPI } from "./fetch";

export const tokenCache = {
    async getToken(key) {
        try {
            const item = await SecureStore.getItemAsync(key);
            if (item) {
                console.log(`${key} was used 🔐 \n`);
            } else {
                console.log("No values stored under key: " + key);
            }
            return item;
        } catch (error) {
            console.error("SecureStore get item error: ", error);
            await SecureStore.deleteItemAsync(key);
            return null;
        }
    },
    async saveToken(key, value) {
        try {
            console.log(`Saving token for key: ${key}`);
            await SecureStore.setItemAsync(key, value);
        } catch (err) {
            console.error('Error saving token:', err);
        }
    },
};

export const googleOAuth = async (startOAuthFlow) => {
    try {
        const existingToken = await tokenCache.getToken('__clerk_client_jwt');
        if (existingToken) {
            await tokenCache.saveToken('__clerk_client_jwt', '');
        }

        const { createdSessionId, signIn, signUp } = await startOAuthFlow();

        if (createdSessionId) {
            await tokenCache.saveToken('__clerk_client_jwt', createdSessionId);

            if (signUp?.createdUserId) {
                try {
                    await fetchAPI("/api/user", {
                        method: "POST",
                        body: JSON.stringify({
                            name: `${signUp.firstName} ${signUp.lastName}`,
                            email: signUp.emailAddress,
                            clerkId: signUp.createdUserId,
                        }),
                    });
                } catch (error) {
                    console.error("Error creating user profile:", error);
                }
            }
            await setActive({ session: createdSessionId });

            return {
                success: true,
                createdSessionId,
                code: signIn ? "session_exists" : "success",
                message: "Successfully authenticated with Google",
            };
        }

        return {
            success: false,
            message: "Failed to authenticate with Google",
        };
    } catch (err) {
        console.error("OAuth error:", err);
        return {
            success: false,
            code: err.code,
            message: err?.errors?.[0]?.longMessage || "Authentication failed",
        };
    }
};

export const signOutUser = async () => {
    try {
        const { signOut } = useAuth();
        await signOut();
        await SecureStore.deleteItemAsync('__clerk_client_jwt');
    } catch (error) {
        console.error("Error signing out:", error);
        throw error;
    }
};