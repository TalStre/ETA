import { Text, View } from "react-native";
import { useAppSelector } from "../store/hooks";

const login = () => {
    const { user, isAuthenticated, biometricsEnabled } = useAppSelector(state => state.auth);

    return (
        <View>
            <Text>Welcome {user?.name}</Text>
            <Text>Authenticated: {isAuthenticated ? "Yes" : "No"}</Text>
            <Text>Biometrics Enabled: {biometricsEnabled ? "Yes" : "No"}</Text>
        </View>
    );
}