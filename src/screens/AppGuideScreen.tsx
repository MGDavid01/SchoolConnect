// Tu importación original está bien, no cambió
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Animated,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Image
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { CommonActions } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/MainNavigator';

type AppGuideScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'AppGuide'>;
};

type Slide = {
  id: number;
  title: string;
  description: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  color: string;
};

const { width } = Dimensions.get('window');

const slides: Slide[] = [
  {
    id: 1,
    title: "Explora las Noticias",
    description: "Desliza hacia abajo para ver las últimas actualizaciones y mantente informado sobre lo que sucede.",
    icon: "article",
    color: "#7A1625"
  },
  {
    id: 2,
    title: "Gestión de Becas",
    description: "Revisa las convocatorias disponibles, consulta requisitos y aplica directamente desde la app.",
    icon: "school",
    color: "#B78E4A"
  },
  {
    id: 3,
    title: "Calendario Académico",
    description: "Visualización del calendario escolar para poder ver los eventos que la institución va a realizar, además de poder visualizar tu horario una vez que se te asigne uno.",
    icon: "event",
    color: "#2C5E2E"
  },
  {
    id: 4,
    title: "Blog",
    description: "Poder ver las publicaciones que hayan realizado otros estudiantes o docentes de la institución, además de poder crear publicaciones en el mismo apartado.",
    icon: "chat",
    color: "#1A5276"
  },
    {
    id: 5,
    title: "Llamado de Iot",
    description: "En esa sección recibiras las notificaciones cuando un maestro ocupe de tu presencia en su cubículo.",
    icon: "phone",
    color: "#1A5276"
  },
  {
    id: 6,
    title: "Perfil",
    description: "Podras ver tus datos personales a la vez de las publicaciones y comentarios que hayas realizado, además de ver las publicaciones guardadas y a las que le hayas dado like, inclusive poder cambiar tu contraseña.",
    icon: "face",
    color: "#1A5276"
  },
    {
    id: 7,
    title: "¡Listo para comenzar!",
    description: "Ahora estás preparado para aprovechar al máximo todas las funciones de la aplicación.",
    icon: "check-circle",
    color: "#1A5276"
  }
];

const AppGuideScreen: React.FC<AppGuideScreenProps> = ({ navigation }) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);

  const handleContinue = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'MainTabs' }],
      })
    );
  };

  const goToSlide = (index: number) => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ x: width * index, animated: true });
      setCurrentSlideIndex(index);
    }
  };

  const goToNext = () => {
    const nextIndex = currentSlideIndex + 1;
    if (nextIndex < slides.length) {
      goToSlide(nextIndex);
    }
  };

  const goToPrev = () => {
    const prevIndex = currentSlideIndex - 1;
    if (prevIndex >= 0) {
      goToSlide(prevIndex);
    }
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const newIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    if (newIndex !== currentSlideIndex) {
      setCurrentSlideIndex(newIndex);
    }
  };

  return (
    <View style={styles.container}>

      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onMomentumScrollEnd={handleScroll}
        scrollEventThrottle={16}
      >
        {slides.map((slide) => (
          <View key={slide.id} style={[styles.slide, { width }]}>
            <View style={[styles.iconContainer, { backgroundColor: slide.color }]}>
              <MaterialIcons name={slide.icon} size={60} color="white" />
            </View>
            <Text style={styles.title}>{slide.title}</Text>
            <Text style={styles.description}>{slide.description}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.pagination}>
        {slides.map((_, index) => (
          <TouchableOpacity key={index} onPress={() => goToSlide(index)}>
            <View 
              style={[
                styles.paginationDot, 
                currentSlideIndex === index && styles.paginationDotActive
              ]} 
            />
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.controlsContainer}>
        {currentSlideIndex < slides.length - 1 ? (
          <>
            <TouchableOpacity 
              style={styles.skipButton}
              onPress={handleContinue}
            >
              <Text style={styles.skipButtonText}>Omitir</Text>
            </TouchableOpacity>

            <View style={styles.navButtons}>
              {currentSlideIndex > 0 && (
                <TouchableOpacity 
                  style={styles.navButton} 
                  onPress={goToPrev}
                >
                  <MaterialIcons name="arrow-back" size={24} color="#7A1625" />
                </TouchableOpacity>
              )}

              <TouchableOpacity 
                style={[styles.navButton, { marginLeft: 10 }]} 
                onPress={goToNext}
              >
                <MaterialIcons name="arrow-forward" size={24} color="#7A1625" />
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <TouchableOpacity 
            style={styles.continueButton}
            onPress={handleContinue}
          >
            <Text style={styles.continueButtonText}>Comenzar</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
    paddingTop: 40,
  },
  logo: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
    alignSelf: 'center',
    marginBottom: 10,
  },
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  iconContainer: {
    width: 110,
    height: 110,
    borderRadius: 55,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 25,
    elevation: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#7A1625',
    textAlign: 'center',
    marginBottom: 15,
  },
  description: {
    fontSize: 15,
    color: '#4A4A4A',
    textAlign: 'center',
    paddingHorizontal: 10,
    lineHeight: 22,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 10,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ccc',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: '#7A1625',
    width: 20,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 30,
    marginBottom: 30,
  },
  skipButton: {
    padding: 10,
  },
  skipButtonText: {
    color: '#7A1625',
    fontSize: 16,
    fontWeight: '500',
  },
  navButtons: {
    flexDirection: 'row',
  },
  navButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
  },
  continueButton: {
    flex: 1,
    marginHorizontal: 30,
    backgroundColor: '#7A1625',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  continueButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AppGuideScreen;
