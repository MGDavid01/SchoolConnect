import React from "react"
import { StyleSheet, View } from "react-native"
import Animated, {
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  Easing
} from "react-native-reanimated"
import { COLORS } from "../theme/theme"

// Configuración de tiempos de transición
const TRANSITION_CONFIG = {
  fadeInDuration: 150, // Duración del fade in
  pauseDuration: 250, // Duración de la pausa
  fadeOutDuration: 150, // Duración del fade out
  logoOpacity: 0.8 // Opacidad máxima del logo
}

// Duración total de la transición
const TOTAL_DURATION =
  TRANSITION_CONFIG.fadeInDuration +
  TRANSITION_CONFIG.pauseDuration +
  TRANSITION_CONFIG.fadeOutDuration

export default TabTransition = ({ children, active }) => {
  const overlayStyle = useAnimatedStyle(() => {
    return {
      opacity: withSequence(
        withTiming(active ? 1 : 0, {
          duration: TRANSITION_CONFIG.fadeInDuration,
          easing: Easing.inOut(Easing.ease)
        }),
        withDelay(
          TRANSITION_CONFIG.pauseDuration,
          withTiming(0, {
            duration: TRANSITION_CONFIG.fadeOutDuration,
            easing: Easing.out(Easing.ease)
          })
        )
      ),
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: COLORS.background,
      zIndex: 2,
      justifyContent: "center",
      alignItems: "center"
    }
  })

  const logoStyle = useAnimatedStyle(() => {
    return {
      opacity: withSequence(
        withTiming(active ? TRANSITION_CONFIG.logoOpacity : 0, {
          duration: TRANSITION_CONFIG.fadeInDuration,
          easing: Easing.inOut(Easing.ease)
        }),
        withDelay(
          TRANSITION_CONFIG.pauseDuration,
          withTiming(0, {
            duration: TRANSITION_CONFIG.fadeOutDuration,
            easing: Easing.out(Easing.ease)
          })
        )
      )
    }
  })

  const contentStyle = useAnimatedStyle(() => {
    return {
      opacity: withDelay(
        TRANSITION_CONFIG.fadeInDuration,
        withTiming(active ? 1 : 0, {
          duration: TRANSITION_CONFIG.fadeOutDuration,
          easing: Easing.out(Easing.ease)
        })
      ),
      flex: 1
    }
  })

  return (
    <View style={styles.container}>
      <Animated.View style={contentStyle}>{children}</Animated.View>
      <Animated.View style={overlayStyle} pointerEvents="none">
        <Animated.Image
          source={require("../assets/images/utt-logo.png")}
          style={[styles.logo, logoStyle]}
          resizeMode="contain"
        />
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  logo: {
    width: 250,
    height: 250
  }
})