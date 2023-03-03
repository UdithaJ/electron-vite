<template>
  <v-container>

    <h4>Workers</h4>
  <v-card
      v-for="worker in workers"
      :key="worker._id"
      class="mx-auto"
      width="800"
      outlined
      style="margin-bottom: 10px"
  >
    <v-row no-gutters>
      <v-col
          cols="12"
          sm="4"
      >
    <v-list-item
        three-line>
      <v-col>
      <v-avatar
          tile
          class="profile"
          size="100px"

      >
        <v-img

            :src="worker.avatar">
        </v-img>

      </v-avatar>
      </v-col>

      <v-col>

      <v-list-item-content>
        <v-list-item-title class="text-h5 mb-1">
         {{worker.firstName + " " +  worker.lastName}}
        </v-list-item-title>
      </v-list-item-content>
      </v-col>
    </v-list-item>
      </v-col>
      <v-col cols="12"
             md="6">
        <v-list class="md-triple-line md-dense">
        <v-list-item v-for="skill in worker.skills" :key="skill.name">
          <v-row>
          <v-chip  style="width: 30%"
                   class="ma-2"
                   color="white"
                   label
                   small
                   text-color="white"
          >{{skill.name}}</v-chip>
          <v-rating
              v-model="skill.level"
              background-color="purple lighten-3"
              color="white"
              small
          ></v-rating>
          </v-row>
        </v-list-item>
        </v-list>
      </v-col>
    </v-row>
  </v-card>
  </v-container>
</template>

<script lang='ts'>
import { defineComponent } from 'vue'
import {ipcRenderer} from "electron";

export default defineComponent({
  name: 'HomeView',

  data () {
    return {
      skills: [],
      workers: []
    }
  },
  mounted() {
    // ipcRenderer.invoke('get_workers').then((data) => {
    //   this.workers = JSON.parse(data);
    // });
  },
  methods: {
    setSkill() {
      const payload = {};
      ipcRenderer.send('test', payload);
    },
  }
})
</script>

<style scoped>
.v-progress-linear, .v-progress-linear__determinate {
  transition: none;
}
</style>
