<template lang="pug">
div
  input(
    :class="[$style.url, { [$style.error]: urlError && !urlEmpty }, { [$style.correct]: !urlError && !urlEmpty }]"
    v-model="repoUrl"
    placeholder="Paste GitHub Repo URL and press Enter"
    @keyup="validate"
    @keydown.enter="load"
  )
  br
  button(
    :class="$style.load"
    @click="load"
    :disabled="urlError || urlEmpty || fetching"
  ) {{ !fetched && "validate repo" || "validate again" }}
  br
  repoInfo(
    :code="repoJson"
    v-show="Object.keys(repoJson).length > 0"
    :status="repoStatusMessage"
    :type="jsonStatus"
  )
  repoInfo(
    v-show="Object.keys(cogsJson).length > 0"
    :code="cogsJson"
    :status="cogsStatusMessage"
    :type="cogsStatus")
</template>

<script>
import Vue from 'vue';
import Component from 'vue-class-component';
import RepoInfo from '@/components/RepoInfo';
import * as github from '@/utils/github';

@Component({
  components: {
    RepoInfo,
  },
})
export default class Home extends Vue {
  // url input stuff
  urlError = false;
  urlEmpty = true;
  // repo stuff
  repoUrl = '';
  repoStatusMessage = '';
  repoJson = {};
  jsonStatus = 'default';
  // cogs stuff
  cogsJson = {};
  cogsStatusMessage = '';
  cogsStatus = 'default';
  fetching = false;
  fetched = false;

  validate(e) {
    if (!e.target.value || e.target.value.length === 0) {
      this.urlEmpty = true;
      return;
    }
    if (
      (e.target.value.startsWith('http') || e.target.value.startsWith('Http')) &&
      e.target.value.split('/').length >= 5 &&
      e.target.value.includes('github.com')
    ) {
      this.urlError = false;
      this.urlEmpty = false;
    } else {
      this.urlError = true;
      this.urlEmpty = false;
    }
  }

  async load() {
    if (this.urlError) return;
    this.fetching = true;
    const repoUrlArr = this.repoUrl.split('/');
    const endsWithSlash = this.repoUrl.endsWith('/');
    const shift = endsWithSlash ? 1 : 0;
    const username = repoUrlArr[repoUrlArr.length - 2 - shift];
    const repo = repoUrlArr[repoUrlArr.length - 1 - shift];
    const info = await github.repoInfo(username, repo);
    if (info === null) {
      this.repoStatusMessage = 'repo info.json is not valid!';
      this.jsonStatus = 'error';
      this.repoJson = {};
      return;
    }
    if (info === 'notFound') {
      this.repoStatusMessage = 'repo not found';
      this.jsonStatus = 'error';
      this.repoJson = {};
      return;
    }
    this.repoStatusMessage = 'repo info.json is valid';
    this.jsonStatus = 'success';
    this.repoJson = info;
    await this.loadCogsData(username, repo);
    this.fetching = false;
    this.fetched = true; // for custom button name
  }

  async loadCogsData(username, repo) {
    const cogsData = await github.parseCogs(username, repo);
    const broken = cogsData.broken.length > 0;
    const missing = cogsData.missing.length > 0;
    const cogsJson = {
      SUCCESSFULLY_LOADED: `${cogsData.cogs.length} cogs`,
      COGS_LIST: cogsData.cogs.map(c => c.name),
      BROKEN_COGS: broken ? cogsData.broken : undefined,
      COGS_WITHOUT_JSONS: missing ? cogsData.missing : undefined,
    };
    if (broken) {
      this.cogsStatus = 'error';
      this.cogsStatusMessage = `There are some broken ${missing && 'and missing'} cog info.jsons present, check lists below. Those cogs won't be parsed by cogs.red`;
    } else if (missing) {
      this.cogsStatus = 'warning';
      this.cogsStatusMessage = 'There are cogs that do not have info.json files, check the list below. Those cogs won\'t be parsed by cogs.red';
    } else {
      this.cogsStatus = 'success';
      this.cogsStatusMessage = 'All found info.jsons are fine, good work!';
    }
    this.cogsJson = cogsJson;
  }
}
</script>


<style lang="sass" module>
$lighter: #353740
$text: #fcfcfc
$blue: #3498db
$red: #e74c3c
$green: #2ecc71
$blue: #2980b9
$disabled: #7f8c8d

p
  font-weight: bold

.url
  min-width: 250px
  width: auto
  padding: 7px 15px
  margin: 10px 10px
  border-radius: 2px
  border: none
  background: $lighter
  color: $text
  outline: none !important
  position: relative
  left: 0
  transition: all 150ms ease-in-out

  &:focus
    border-left: 2px solid $blue
    left: 2px

  &.error
    border-left: 2px solid $red
  
  &.correct
    border-left: 2px solid $green

.load
  padding: 7px 15px
  margin: 5px auto
  background: $blue
  border: 2px solid transparent
  color: $text
  border-radius: 2px
  transition: background 150ms ease, opacity 150ms ease
  opacity: 1

  &:disabled
    background: transparent
    border: 2px solid $disabled
    opacity: .5


</style>