<script>
import Vue from 'vue';
import Component from 'vue-class-component';
import { omit } from 'lodash';

@Component({
  props: {
    code: { type: Object, default: () => ({}) },
    type: { type: String, default: 'default' },
    status: { type: String },
  },
})
export default class RepoInfo extends Vue {
  get barStyle() {
    return this.$style[this.type];
  }

  render() {
    const code = omit(this.code, ['DISABLED']);
    const info = Object.keys(code).map((key) => {
      if (!code[key]) return null;
      return (
        <div>
          <b>{key}: </b>{Array.isArray(code[key]) ? code[key].join(', ') : code[key]}
        </div>
      );
    });
    return (
      <div class={[this.$style.repoInfo, this.barStyle]}>
        { this.status &&
          <div class={this.$style.statusLine}>{this.status}</div>
        }
        { Object.keys(this.code).length !== 0 &&
          <div class={this.$style.innerBlock}>
            {info}
          </div>
        }
      </div>
    );
  }
}
</script>

<style lang="sass" module>
$gray: #7f8c8d
$lighter: #353740

.repoInfo
  text-align: left
  background: $lighter
  border-radius: 2px
  margin: 10px auto
  width: auto
  max-width: 500px
  display: flex
  font-size: 12px
  flex-direction: column
  box-shadow: 0 0 8px rgba(0,0,0,.1)

  &.default
    border-left: 2px solid $gray
  
  &.success
    border-left: 2px solid #2ecc71
    background: #27ae60
    color: #fff

  &.error
    border-left: 2px solid #e74c3c
    background: #c0392b
    color: #fff

  &.warning
    border-left: 2px solid #f1c40f
    background: #8e750f
    color: #fff

.statusLine
  padding: 10px 15px
  background: rgba(255,255,255,.2)

.innerBlock
  padding: 15px
  line-height: 16px

  b
    opacity: .6
</style>