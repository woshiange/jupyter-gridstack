<template>
  <a :href="linkUrl">
    <v-hover v-slot="{ isHovering, props }">
      <v-card
        :class="{ 'on-hover': isHovering }"
        :elevation="isHovering ? 12 : 2"
        v-bind="props"
      >
        <v-card-title>{{ title }}</v-card-title>
        <v-img
          :src="imageUrl"
          :alt="title"
          width="569"
          height="528"
          class="position-relative"
        >
          <div class="align-self-center absolute-center">
            <v-btn
              class="text-none"
              variant="flat"
              rounded
              :class="isHovering ? 'show-btn' : 'hide-btn'"
            >
              View example
            </v-btn>
          </div>
        </v-img>
      </v-card>
    </v-hover>
  </a>
</template>

<style scoped>
a {
  color: black;
  text-decoration: none; /* no underline */
}

.show-btn {
  color: rgba(255, 255, 255, 1) !important;
  background-color: #5865f2;
}

.hide-btn {
  color: rgba(255, 255, 255, 0) !important;
  background-color: rgba(0, 0, 0, 0);
}

.position-relative {
  position: relative;
}

.absolute-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
</style>

<script setup>
const props = defineProps(['title', 'imageUrl', 'linkUrl'])
</script>

