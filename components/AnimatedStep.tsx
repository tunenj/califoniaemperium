import { Animated } from "react-native";
import { useEffect, useRef } from "react";

export default function AnimatedStep({
  children,
}: {
  children: React.ReactNode;
}) {
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fade, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [fade]); // ✅ add fade

  return (
    <Animated.View style={{ flex: 1, opacity: fade }}>
      {children}
    </Animated.View>
  );
}
