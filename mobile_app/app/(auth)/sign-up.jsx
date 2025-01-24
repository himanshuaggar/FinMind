import { useSignUp, useAuth } from "@clerk/clerk-expo";
import { Link, router } from "expo-router";
import { useState } from "react";
import { Alert, Image, ScrollView, Text, View, StyleSheet } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { ReactNativeModal } from "react-native-modal";

import CustomButton from "../../components/common/CustomButton";
import InputField from "../../components/common/InputField";
import OAuth from "../../components/common/OAuth";
import { fetchAPI } from "../../services/fetch";
import { COLORS, SIZES } from "../../constants/theme";
import { icons, images } from "../../constants";

const SignUp = () => {
    const { isLoaded, signUp, setActive } = useSignUp();
    const { signOut } = useAuth();
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
    });
    const [verification, setVerification] = useState({
        state: "default",
        error: "",
        code: "",
    });

    const onSignUpPress = async () => {
        if (!isLoaded) return;
        try {
            try {
                await signOut();
            } catch (e) {
            }

            await signUp.create({
                emailAddress: form.email,
                password: form.password,
            });

            await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
            setVerification({
                ...verification,
                state: "pending",
            });
        } catch (err) {
            console.log(JSON.stringify(err, null, 2));
            if (err.code === "session_exists") {
                try {
                    // Handle existing session
                    await signOut();
                    // Retry the sign-up
                    await signUp.create({
                        emailAddress: form.email,
                        password: form.password,
                    });
                    await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
                    setVerification({
                        ...verification,
                        state: "pending",
                    });
                } catch (retryErr) {
                    Alert.alert("Error", retryErr.errors[0].longMessage);
                }
            } else {
                Alert.alert("Error", err.errors[0].longMessage);
            }
        }
    };
    const onPressVerify = async () => {
        if (!isLoaded) return;
        try {
            const completeSignUp = await signUp.attemptEmailAddressVerification({
                code: verification.code,
            });

            if (completeSignUp.status === "complete") {
                await setActive({ session: completeSignUp.createdSessionId });
                setVerification({
                    ...verification,
                    state: "success",
                });
                setShowSuccessModal(true);
            } else {
                setVerification({
                    ...verification,
                    error: "Verification failed. Please try again.",
                    state: "failed",
                });
            }
        } catch (err) {
            setVerification({
                ...verification,
                error: err.errors?.[0]?.longMessage || "Verification failed",
                state: "failed",
            });
        }
    };
    return (
        <ScrollView style={styles.container}>
            <LinearGradient
                colors={[COLORS.primary + '20', COLORS.background]}
                style={styles.gradient}
            >
                <View style={styles.imageContainer}>
                    <Image source={images.finance} style={styles.image} />
                    <Text style={styles.titleText}>Create Account</Text>
                </View>

                <View style={styles.formContainer}>
                    <InputField
                        label="Name"
                        placeholder="Enter name"
                        icon={icons.person}
                        value={form.name}
                        onChangeText={(value) => setForm({ ...form, name: value })}
                    />
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
                        title="Sign Up"
                        onPress={onSignUpPress}
                        style={styles.button}
                    />

                    <OAuth />

                    <Link href="/sign-in" style={styles.link}>
                        Already have an account?{" "}
                        <Text style={styles.linkText}>Sign In</Text>
                    </Link>
                </View>
            </LinearGradient>

            <ReactNativeModal
                isVisible={verification.state === "pending"}
                onModalHide={() => {
                    if (verification.state === "success") {
                        setShowSuccessModal(true);
                    }
                }}
            >
                <View style={styles.modalContainer}>
                    <Text style={styles.modalTitle}>Verification</Text>
                    <Text style={styles.modalText}>
                        We've sent a verification code to {form.email}.
                    </Text>
                    <InputField
                        label="Code"
                        icon={icons.lock}
                        placeholder="12345"
                        value={verification.code}
                        keyboardType="numeric"
                        onChangeText={(code) =>
                            setVerification({ ...verification, code })
                        }
                    />
                    {verification.error && (
                        <Text style={styles.errorText}>{verification.error}</Text>
                    )}
                    <CustomButton
                        title="Verify Email"
                        onPress={onPressVerify}
                        style={styles.verifyButton}
                    />
                </View>
            </ReactNativeModal>
            <ReactNativeModal isVisible={showSuccessModal}>
                <View style={styles.successModalContainer}>
                    <Image
                        source={images.check}
                        style={styles.successImage}
                    />
                    <Text style={styles.successTitle}>Verified</Text>
                    <Text style={styles.successText}>
                        You have successfully verified your account.
                    </Text>
                    <CustomButton
                        title="Browse Home"
                        onPress={() => router.push("/(tabs)")}
                        style={styles.browseButton}
                    />
                </View>
            </ReactNativeModal>
        </ScrollView>
    );
};
export default SignUp;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    gradient: {
        flex: 1,
        minHeight: '100%',
    },
    imageContainer: {
        position: 'relative',
        width: '100%',
        height: 250,
        marginBottom: SIZES.large,
    },
    image: {
        width: '100%',
        height: '100%',
    },
    titleText: {
        position: 'absolute',
        bottom: SIZES.medium,
        left: SIZES.medium,
        fontSize: SIZES.xLarge,
        color: COLORS.textPrimary,
        fontFamily: 'Roboto-Bold',
    },
    formContainer: {
        padding: SIZES.medium,
        gap: SIZES.small,
    },
    button: {
        marginTop: SIZES.medium,
        backgroundColor: COLORS.primary,
    },
    link: {
        textAlign: 'center',
        marginTop: SIZES.large,
        fontFamily: 'Roboto-Regular',
        color: COLORS.textSecondary,
    },
    linkText: {
        color: COLORS.primary,
        fontFamily: 'Roboto-Bold',
    },
    modalContainer: {
        backgroundColor: COLORS.background,
        padding: 28,
        borderRadius: 16,
        minHeight: 300,
    },
    modalTitle: {
        fontFamily: 'Roboto-Bold',
        fontSize: 24,
        marginBottom: 8,
        color: COLORS.textPrimary,
    },
    modalText: {
        fontFamily: 'Roboto-Regular',
        marginBottom: 20,
        color: COLORS.textSecondary,
    },
    errorText: {
        color: COLORS.error,
        fontSize: 14,
        marginTop: 4,
        fontFamily: 'Roboto-Regular',
    },
    verifyButton: {
        marginTop: 20,
        backgroundColor: COLORS.success,
    },
    successModalContainer: {
        backgroundColor: COLORS.background,
        padding: 28,
        borderRadius: 16,
        alignItems: 'center',
    },
    successImage: {
        width: 110,
        height: 110,
        marginVertical: 20,
    },
    successTitle: {
        fontSize: 24,
        fontFamily: 'Roboto-Bold',
        color: COLORS.textPrimary,
        textAlign: 'center',
    },
    successText: {
        fontSize: 16,
        color: COLORS.textSecondary,
        textAlign: 'center',
        marginVertical: 10,
    },
    browseButton: {
        marginTop: 20,
        backgroundColor: COLORS.primary,
    },
});