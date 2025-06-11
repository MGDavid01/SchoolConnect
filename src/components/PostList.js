import React from "react"
import { View, FlatList, StyleSheet, Platform } from "react-native"
import { Text } from "react-native-paper"
import NewsCard from "./NewsCard"
import { COLORS } from "../theme/theme"

const PostList = ({ posts, defaultImages, onPostPress, expandedPostId, onExpand }) => {
  return (
    <View style={styles.container}>
      {posts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No se encontraron noticias</Text>
        </View>
      ) : (
        <FlatList
          data={posts}
          renderItem={({ item }) => (
            <NewsCard
              key={item.id}
              title={item.title}
              content={item.content}
              date={item.date}
              author={item.author}
              category={item.category}
              imageUrl={item.imageUrl || defaultImages[item.category]}
              onViewMore={() => onPostPress(item)}
              expanded={expandedPostId === item.id}
              onExpand={() => onExpand(item.id)}
            />
          )}
          keyExtractor={item => item.id}
          contentContainerStyle={{ flexGrow: 1 }}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: 16
  }
})

export default PostList