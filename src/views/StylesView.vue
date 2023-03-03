<template>
  <v-container>
    <v-row v-if="styles.length !== 0"
           no-gutters
    >
        <v-row  no-gutters>
        <v-card
            v-for="style in styles"
            :key="style._id"
            style="margin-top: 10px; margin-left: 15px"
            width="200px"
            @click="onSelectStyle(style)"
            color="#1B2631">
          <v-card-title>
            {{ style.styleName }}
          </v-card-title>
          <v-card-subtitle>
            {{ style.styleNo}}
          </v-card-subtitle>
          <v-container>
          <v-icon
              small
              color="teal accent-4"
              style="margin-right: 5px"
              v-for="operation in style.styleOp"
              :key="operation._id">{{operation.icon}}
          </v-icon>
          </v-container>
        </v-card>
        </v-row>

      <v-container class="grey lighten-5">
        <v-row no-gutters>
          <v-col
              style="margin-right: 5px"
              cols="12"
              sm="6"
              md="5"
          >
            <v-card
            min-height="420px">
              <v-card-title>{{selectedStyle.styleNo}}</v-card-title>

              <v-card  v-for="group in selectedStyle.operations">
                <v-card-subtitle>{{"Member " + group.group}}</v-card-subtitle>
                <v-list>
                  <v-list-item v-for="op in group.opData">
                    <v-row  no-gutters>
                      <v-chip
                          style="width: 80%"
                          class="ma-2"
                          color="white"
                          label
                          small
                          text-color="white"
                      >{{op.name}} &nbsp;
                        <v-rating
                            v-model="op.priority"
                        >
                          <template v-slot:item="props">
                            <v-icon
                                :color="props.isFilled ? 'red' : 'grey lighten-1'"
                                small
                                @click="props.click"
                            >
                              {{ props.isFilled ? 'mdi-arrow-top-right-thick' : 'mdi-arrow-top-right-thick' }}
                            </v-icon>
                          </template>
                        </v-rating>
                      </v-chip>
                    </v-row>
                  </v-list-item>
                </v-list>
                <v-col>
                </v-col>
              </v-card>
            </v-card>
          </v-col>
          <v-col
              cols="6"
              md="6"
          >
            <v-card
                style="margin-bottom: 5px"
                v-for="position in line">
              <v-card-title>{{"Member " + position.group.group}}</v-card-title>
              <v-card-subtitle>{{position.assignee.assignee.firstName +" " + position.assignee.assignee.lastName}}</v-card-subtitle>

              <v-container>
                <v-row>
                <v-progress-circular
                    :rotate="360"
                    :size="100"
                    :width="15"
                    :value="position.assignee.value"
                    color="teal"
                >
                  {{ position.assignee.value + "%" }}
                </v-progress-circular>
                  <v-list>
                    <v-list-item v-for="skill in position.assignee.assignee.skills">
                      <v-row  no-gutters>
                        <v-chip
                            style="width: 90%"
                            class="ma-2"
                            color="white"
                            label
                            small
                            text-color="white"
                        >{{skill.name}} &nbsp;
                          <v-rating
                              v-model="skill.level"
                          >
                            <template v-slot:item="props">
                              <v-icon
                                  :color="props.isFilled ? 'green' : 'grey lighten-1'"
                                  small
                                  @click="props.click"
                              >
                                {{ props.isFilled ? 'mdi-star' : 'mdi-star' }}
                              </v-icon>
                            </template>
                          </v-rating>
                        </v-chip>
                      </v-row>
                    </v-list-item>
                  </v-list>
                </v-row>
              </v-container>
            </v-card>
          </v-col>
        </v-row>
      </v-container>

    </v-row>
  </v-container>
</template>


<script>
import {ipcRenderer} from "electron";

export default {
  name: "Styles",

  data () {
    return {
      styles: [],
      line: [],
      selectedStyle: null,
      lineStyle: null,
      show: false,
      selectedProfile: null
    }
  },
  mounted() {
    ipcRenderer.invoke('get_styles').then((data) => {
      this.styles = JSON.parse(data);
      this.selectedStyle = this.styles[0];
      this.onSelectStyle(this.styles[0]);
    });
  },
  methods: {
    onSelectStyle(style) {
      this.selectedStyle = style;
      this.getLine();
    },
    getLine() {
      ipcRenderer.invoke('get_line', JSON.stringify(this.selectedStyle)).then((data) => {
        this.line = JSON.parse(data);
      });
    },

  }
}
</script>

<style scoped>
.v-progress-circular {
  margin: 1rem;
}
</style>