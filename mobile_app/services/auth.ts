import * as Linking from "expo-linking";
import * as SecureStore from "expo-secure-store";
import { useAuth } from "@clerk/clerk-expo";
import { fetchAPI } from "./fetch";
import { SignIn } from '@clerk/types';


interface OAuthResponse {
    createdSessionId: string | null;
    signIn?: SignIn;
    signUp?: any;
    setActive: (params: { session: string }) => Promise<void>;
}

export const tokenCache = {
    async getToken(key: string) {
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
    async saveToken(key: string, value: string) {
        try {
            console.log(`Saving token for key: ${key}`);
            await SecureStore.setItemAsync(key, value);
        } catch (err) {
            console.error('Error saving token:', err);
        }
    },
};

export const googleOAuth = async (startOAuthFlow: () => Promise<OAuthResponse>) => {
    try {
        const existingToken = await tokenCache.getToken('__clerk_client_jwt');
        if (existingToken) {
            await tokenCache.saveToken('__clerk_client_jwt', '');
        }

        const { createdSessionId, signIn, signUp } = await startOAuthFlow();

        if (createdSessionId) {
            // Save the new session token immediately
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
    } catch (err: any) {
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
        // Clear any stored tokens
        await SecureStore.deleteItemAsync('__clerk_client_jwt');
    } catch (error) {
        console.error("Error signing out:", error);
        throw error;
    }
};