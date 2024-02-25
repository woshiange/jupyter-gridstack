<template>
  <v-card>
    <a :href="linkUrl">
      <v-card-title>{{ title }}</v-card-title>
      <v-img
        :src="imageUrl"
        :alt="title"
        width="374"
      />
    </a>
  </v-card>
</template>

<style scoped>
a {
  color: black;
  text-decoration: none; /* no underline */
}
</style>

<script setup>
const props = defineProps(['title', 'imageUrl', 'linkUrl'])
</script>

