<template>
  <v-app>
    <v-main>
      <v-app-bar
          :value="value"
          color="black"
      >
        <v-container>

        <v-btn
            class="ma-2 white--text"
            outlined
            color="white"
            @click="navigate('home')"
        >
          Workers
          <v-icon
              left
          >
            mdi-account
          </v-icon>
        </v-btn>

        <v-btn
            class="ma-2 white--text"
            outlined
            color="white"
            @click="navigate('styles')"
        >
          Styles
          <v-icon
              right
          >
            mdi-tshirt-v
          </v-icon>
        </v-btn>
        </v-container>

      </v-app-bar>
      <router-view/>
    </v-main>
  </v-app>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import HelloWorld from './components/HelloWorld.vue'
import {ipcRenderer} from "electron";

export default defineComponent({
  name: 'App',

  components: {
    HelloWorld,
  },

  data () {
    return {
      //
    }
  },
  methods: {
    navigate(routeName: any) {
      this.$router.push({name: routeName });
    }
  }
})
</script>
