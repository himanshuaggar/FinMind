import { router } from "expo-router";
import { useRef, useState } from "react";
import { Image, Text, TouchableOpacity, View, StyleSheet, Button } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Swiper from "react-native-swiper";
import { onboarding } from "../../constants/index";
import CustomButton from "../../components/common/CustomButton";
import { COLORS } from "../../constants/theme";

const Home = () => {
    const swiperRef = useRef<Swiper>(null);
    const [activeIndex, setActiveIndex] = useState(0);

    const isLastSlide = activeIndex === onboarding.length - 1;

    return (
        <SafeAreaView style={styles.safeArea}>
            <TouchableOpacity
                onPress={() => {
                    router.replace("/(auth)/sign-up");
                }}
                style={styles.skipButton}
            >
                <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>

            <Swiper
                ref={swiperRef}
                loop={false}
                dot={<View style={styles.dot} />}
                activeDot={<View style={styles.activeDot} />}
                onIndexChanged={(index) => setActiveIndex(index)}
            >
                {onboarding.map((item) => (
                    <View key={item.id} style={styles.slide}>
                        <Image
                            source={item.image}
                            style={styles.image}
                            resizeMode="contain"
                        />
                        <View style={styles.titleContainer}>
                            <Text style={styles.titleText}>{item.title}</Text>
                        </View>
                        <Text style={styles.descriptionText}>{item.description}</Text>
                    </View>
                ))}
            </Swiper>

            <CustomButton
                title={isLastSlide ? "Get Started" : "Next"}
                onPress={() =>
                    isLastSlide
                        ? router.replace("/(auth)/sign-up")
                        : swiperRef.current?.scrollBy(1)
                }
                style={styles.button}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: COLORS.background,
        marginTop: 0,
        paddingTop: 0,
        borderWidth: 1,
        borderColor: COLORS.primary,
    },
    skipButton: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'flex-end',
        padding: 10,
        paddingTop: 0,
        paddingBottom: 0,
    },
    skipText: {
        color: COLORS.textPrimary,
        fontSize: 20,
        fontFamily: 'Roboto-Bold',
    },
    dot: {
        width: 32,
        height: 4,
        marginHorizontal: 4,
        backgroundColor: COLORS.gray2,
        borderRadius: 2,
    },
    activeDot: {
        width: 32,
        height: 4,
        marginHorizontal: 4,
        backgroundColor: COLORS.primary,
        borderRadius: 2,
    },
    slide: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    image: {
        width: '100%',
        height: '100%',
        maxHeight: 400,
        maxWidth: 400,
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        marginTop: 10,
    },
    titleText: {
        color: COLORS.textPrimary,
        fontSize: 24,
        fontWeight: 'bold',
        marginHorizontal: 10,
        textAlign: 'center',
    },
    descriptionText: {
        fontSize: 14,
        fontFamily: 'Roboto-SemiBold',
        textAlign: 'center',
        color: COLORS.textSecondary,
        marginHorizontal: 10,
        marginTop: 3,
    },
    button: {
        width: '90%',
        alignSelf: 'center',
        justifyContent: 'center',
        marginTop: 10,
        marginBottom: 10,
        backgroundColor: COLORS.primary,
    },
});
export default Home;
