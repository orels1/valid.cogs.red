<script>
import Vue from 'vue';
import Component from 'vue-class-component';

@Component({
  props: {},
})
export default class Secret extends Vue {
  render() { // eslint-disable-line class-methods-use-this
    return (
      <div>
        <div class={this.$style.sign}>
          You get a 💰
        </div>
        <br />
        <router-link to="/">back to sexy land</router-link>
      </div>
    );
  }
}
</script>


<style lang="sass" module>
.sign
  font-size: 30px
</style>