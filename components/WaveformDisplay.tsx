import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withRepeat, 
  Easing,
  cancelAnimation
} from 'react-native-reanimated';

interface WaveformDisplayProps {
  isActive: boolean;
  count?: number;
  color?: string;
}

export function WaveformDisplay({ 
  isActive, 
  count = 30, 
  color = '#2563EB' 
}: WaveformDisplayProps) {
  // Create an array of bar heights
  const bars = Array.from({ length: count }, (_, i) => {
    const heightValue = useSharedValue(0.1);
    
    // Animated style for each bar
    const style = useAnimatedStyle(() => {
      return {
        height: `${heightValue.value * 100}%`,
        backgroundColor: color,
      };
    });
    
    useEffect(() => {
      if (isActive) {
        // Random duration between 400ms and 1000ms
        const duration = 400 + Math.random() * 600;
        
        // Animate to random heights between 0.1 and 0.9
        heightValue.value = withRepeat(
          withTiming(0.1 + Math.random() * 0.8, {
            duration,
            easing: Easing.inOut(Easing.ease),
          }),
          -1,
          true
        );
      } else {
        // Stop animation and reset to a small height
        cancelAnimation(heightValue);
        heightValue.value = withTiming(0.1, { duration: 300 });
      }
      
      return () => {
        cancelAnimation(heightValue);
      };
    }, [isActive]);
    
    return { style };
  });
  
  return (
    <View style={styles.container}>
      {bars.map((bar, index) => (
        <Animated.View 
          key={index}
          style={[styles.bar, bar.style]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '100%',
  },
  bar: {
    width: 3,
    borderRadius: 3,
    opacity: 0.7,
  },
});