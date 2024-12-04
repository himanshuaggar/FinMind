import { useSignIn } from "@clerk/clerk-expo";
import { Link, router } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, Image, ScrollView, Text, View, StyleSheet } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';

import CustomButton from "../../components/common/CustomButton";
import InputField from "../../components/common/InputField";
import OAuth from "../../components/common/OAuth";
import { COLORS, SIZES } from "../../constants/theme";
import { icons, images } from "../../constants";

const SignIn = () => {
    const { signIn, setActive, isLoaded } = useSignIn();

    const [form, setForm] = useState({
        email: "",
        password: "",
    });

    const onSignInPress = useCallback(async () => {
        if (!isLoaded) return;

        try {
            const signInAttempt = await signIn.create({
                identifier: form.email,
                password: form.password,
            });

            if (signInAttempt.status === "complete") {
                await setActive({ session: signInAttempt.createdSessionId });
                router.replace("/(tabs)");
            } else {
                Alert.alert("Error", "Log in failed. Please try again.");
            }
        } catch (err: any) {
            Alert.alert("Error", err.errors[0].longMessage);
        }
    }, [isLoaded, form]);

    return (
        <ScrollView style={styles.container}>
            <View style={styles.innerContainer}>
                <View style={styles.imageContainer}>
                    <Image source={images.finance} style={styles.image} />
                    <Text style={styles.welcomeText}>Welcome 👋</Text>
                </View>
                <View style={styles.formContainer}>
                    <InputField
                        label="Email"
                        placeholder="Enter email"
                        icon={icons.email}
                        textContentType="emailAddress"
                        value={form.email}
                        onChangeText={(value) => setForm({ ...form, email: value })}
                    />
                    <InputField
                        label="Password"
                        placeholder="Enter password"
                        icon={icons.lock}
                        secureTextEntry={true}
                        textContentType="password"
                        value={form.password}
                        onChangeText={(value) => setForm({ ...form, password: value })}
                    />
                    <CustomButton
                        title="Sign In"
                        onPress={onSignInPress}
                        style={styles.button}
                    />
                    <OAuth />
                    <Link
                        href="/sign-up"
                        style={styles.link}
                    >
                        Don't have an account?{" "}
                        <Text style={styles.linkText}>Sign Up</Text>
                    </Link>
                </View>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    innerContainer: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    imageContainer: {
        position: 'relative',
        width: '100%',
        height: 250,
    },
    image: {
        width: '100%',
        height: '100%',
    },
    welcomeText: {
        position: 'absolute',
        bottom: 5,
        left: 5,
        fontSize: 24,
        color: COLORS.textPrimary,
        fontFamily: 'Roboto-Bold',
    },
    formContainer: {
        padding: 20,
    },
    button: {
        marginTop: 24,
    },
    link: {
        textAlign: 'center',
        marginTop: 40,
        fontFamily: 'Roboto-Regular',
        color: COLORS.textSecondary,
    },
    linkText: {
        color: COLORS.primary,
        fontFamily: 'Roboto-Bold',
    },
});

export default SignIn;