import {
    TextInput,
    View,
    Text,
    Image,
    KeyboardAvoidingView,
    TouchableWithoutFeedback,
    Keyboard,
    Platform,
} from "react-native";

const InputField = ({
    label,
    icon,
    secureTextEntry = false,
    labelStyle,
    containerStyle,
    inputStyle,
    iconStyle,
    className,
    ...props
}: any) => {
    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={{ marginVertical: 8, width: '100%' }}>
                    <Text style={[{ fontSize: 18, fontWeight: '600', marginBottom: 12, color:'white' }, labelStyle]}>
                        {label}
                    </Text>
                    <View
                        style={[{
                            flexDirection: 'row',
                            justifyContent: 'flex-start',
                            alignItems: 'center',
                            backgroundColor: '#F3F4F6', // neutral-100
                            borderRadius: 9999, // rounded-full
                            borderWidth: 1,
                            borderColor: '#F3F4F6', // neutral-100
                        }, containerStyle]}
                    >
                        {icon && (
                            <Image source={icon} style={[{ width: 24, height: 24, marginLeft: 16 }, iconStyle]} />
                        )}
                        <TextInput
                            style={[{
                                borderRadius: 9999, // rounded-full
                                padding: 16,
                                fontWeight: '600',
                                fontSize: 15,
                                flex: 1,
                                textAlign: 'left',
                            }, inputStyle]}
                            secureTextEntry={secureTextEntry}
                            {...props}
                        />
                    </View>
                </View>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
};

export default InputField;