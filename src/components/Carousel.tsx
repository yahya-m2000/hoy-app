import React, { useRef } from "react";
import { View, ScrollView, Image, StyleSheet, Dimensions } from "react-native";

interface CarouselProps {
  images: string[];
}

const { width } = Dimensions.get("window");

const Carousel: React.FC<CarouselProps> = ({ images }) => {
  const scrollRef = useRef<ScrollView>(null);

  return (
    <View style={styles.carouselContainer}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        style={styles.scrollView}
      >
        {images.map((img, idx) => (
          <Image
            key={idx}
            source={{ uri: img }}
            style={styles.image}
            resizeMode="cover"
          />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  carouselContainer: {
    width: "100%",
    height: 260,
    backgroundColor: "#eee",
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
  },
  scrollView: {
    width: "100%",
    height: 260,
  },
  image: {
    width,
    height: 260,
  },
});

export default Carousel;
