<template>
  <div>
    <CCard title="">
      <v-row>
        <v-col cols="12" sm="4" class="text-center">
          <h1 class="my-4 text-h4">About</h1>
          <p class="my-4">
            Site created by <span class="text-blue">FastOwlDieDie</span> (Bogdan
            Tretyakov)
          </p>
          <div class="d-flex flex-wrap justify-center">
            <IconLink
              :icon="mdiGithub"
              link="https://github.com/BogdanTretyakov"
              class="mx-2"
              key="github"
            >
              GitHub
            </IconLink>
            <IconLink
              :icon="faTelegram"
              link="https://t.me/bogdan_tretyakov"
              class="mx-2"
              key="tg"
            >
              Telegram
            </IconLink>
            <IconLink
              :icon="mdiCurrencyUsd"
              link="https://boosty.to/fastowldiedie"
              class="mx-2"
              key="donation"
            >
              Donation
            </IconLink>
          </div>
          <p class="my-4">
            All data was parsed from original maps and game client, there are
            minimal manual patches
          </p>
          <h4 class="my-4">Special thanks to tools authors:</h4>
          <div class="d-flex flex-wrap justify-center">
            <v-btn
              v-for="(link, name) in libs"
              :key="link"
              rel="nofollow"
              target="_blank"
              :href="link"
              variant="text"
              size="small"
              class="my-1 mx-1"
            >
              {{ name }}
            </v-btn>
          </div>
          <p class="my-4">
            Special thanks to <span class="text-indigo">Nemidi</span> for
            concept
          </p>
        </v-col>
        <v-col cols="12" sm="8">
          <h2 class="my-4 text-h4 text-center">Survival Chaos Community</h2>
          <v-row>
            <v-col cols="12" md="6" class="text-center">
              <h3 class="text-h5">Map developers</h3>
              <v-row>
                <v-col cols="6">
                  <h4 class="text-h6 text-purple">Sur5al</h4>
                  <p>Original map creator</p>
                  <div class="d-flex flex-wrap justify-center">
                    <IconLink
                      :icon="mdiWeb"
                      link="https://www.w3sur5al.com/"
                      key="sur5al-web"
                    >
                      Website
                    </IconLink>
                    <IconLink
                      :icon="mdiCurrencyUsd"
                      link="https://www.patreon.com/c/sur5al/"
                      key="sur5al-patreon"
                    >
                      Donation
                    </IconLink>
                  </div>
                </v-col>
                <v-col cols="6">
                  <h4 class="text-h6 text-green">Stvel</h4>
                  <p>OZEdition creator</p>
                  <div class="d-flex flex-wrap justify-center">
                    <IconLink
                      :icon="faDiscord"
                      link="https://discord.gg/uSg93epmGC"
                      key="stvel-discord"
                    >
                      Discord
                    </IconLink>
                  </div>
                </v-col>
              </v-row>
            </v-col>
            <v-col cols="12" md="6" class="text-center">
              <h3 class="text-h5">Game platforms</h3>
              <v-row>
                <v-col cols="6">
                  <h4 class="text-h6 text-yellow">W3Champions</h4>
                  <p>Warcraft III Reforged</p>
                  <div class="d-flex flex-wrap justify-center">
                    <IconLink
                      :icon="mdiWeb"
                      link="https://w3champions.com/"
                      key="w3c-web"
                    >
                      Website
                    </IconLink>
                    <IconLink
                      :icon="faDiscord"
                      link="https://discord.gg/uJmQxG2"
                      key="w3c-discord"
                    >
                      Discord
                    </IconLink>
                  </div>
                </v-col>
                <v-col cols="6">
                  <h4 class="text-h6 text-blue">WC3.info</h4>
                  <p>OZ game reborn</p>
                  <div class="d-flex flex-wrap justify-center">
                    <IconLink
                      :icon="mdiWeb"
                      link="https://wc3.info/"
                      key="oz-web"
                    >
                      Website
                    </IconLink>
                  </div>
                </v-col>
              </v-row>
            </v-col>
            <v-col cols="12">
              <h3 class="text-h4 text-center">Content makers</h3>
            </v-col>
            <v-col v-for="maker in makers" :key="maker.name" cols="6" sm="4">
              <h4 class="text-h6 text-center">{{ maker.name }}</h4>
              <div class="d-flex flex-wrap justify-center">
                <IconLink
                  v-for="link in maker.links"
                  :icon="link.icon"
                  :link="link.link"
                  :key="link.link"
                >
                  {{ link.title }}
                </IconLink>
              </div>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </CCard>
  </div>
</template>

<script setup lang="ts">
import {
  mdiAlphaK,
  mdiCurrencyUsd,
  mdiGithub,
  mdiTwitch,
  mdiWeb,
  mdiYoutube,
} from '@mdi/js';
import {
  faDiscord,
  faTelegram,
  type IconDefinition,
} from '@fortawesome/free-brands-svg-icons';

interface ContentMaker {
  name: string;
  links: Array<{
    title: string;
    link: string;
    icon: string | IconDefinition;
  }>;
}

const libs = {
  'WC3 Map Deprotector': 'https://github.com/speige/WC3MapDeprotector',
  CascView: 'http://www.zezula.net/en/casc/main.html',
  'MPQ Editor': 'http://www.zezula.net/en/mpq/download.html',
  WC3MapTranslator: 'https://github.com/ChiefOfGxBxL/WC3MapTranslator',
  'war3-model': 'https://github.com/4eb0da/war3-model',
};

const makers: ContentMaker[] = [
  {
    name: 'Hoooooka',
    links: [
      {
        title: 'Twitch',
        link: 'https://www.twitch.tv/hoooooka',
        icon: mdiTwitch,
      },
      {
        title: 'Telegram',
        link: 'https://t.me/hoooookaa',
        icon: faTelegram,
      },
      {
        title: 'Discord',
        link: 'https://discord.com/invite/ukrjyBaYAx',
        icon: faDiscord,
      },
      {
        title: 'Youtube',
        link: 'https://www.youtube.com/@davayhookah',
        icon: mdiYoutube,
      },
    ],
  },
  {
    name: 'Snupild',
    links: [
      {
        title: 'Twitch',
        link: 'https://www.twitch.tv/snupild',
        icon: mdiTwitch,
      },
      {
        title: 'Discord',
        link: 'https://discord.gg/mv3RbaRYth',
        icon: faDiscord,
      },
      {
        title: 'Youtube',
        link: 'https://www.youtube.com/channel/UCvbfxjZXZLcIunuPQv4IBLw',
        icon: mdiYoutube,
      },
    ],
  },
  {
    name: 'Joe_Vega',
    links: [
      {
        title: 'Twitch',
        link: 'https://www.twitch.tv/joe_vega/',
        icon: mdiTwitch,
      },
      {
        title: 'Discord',
        link: 'https://discord.gg/sgXcA3paHn',
        icon: faDiscord,
      },
      {
        title: 'Telegram',
        link: 'https://t.me/JoeVegaAnnonce',
        icon: faTelegram,
      },
      {
        title: 'Youtube',
        link: 'https://www.youtube.com/@JoeVega',
        icon: mdiYoutube,
      },
    ],
  },
  {
    name: 'Valdrién',
    links: [
      {
        title: 'Youtube',
        link: 'https://www.youtube.com/@Valdrien',
        icon: mdiYoutube,
      },
      {
        title: 'Kick',
        link: 'https://kick.com/valdrien11',
        icon: mdiAlphaK,
      },
      {
        title: 'Discord',
        link: 'https://discord.gg/PvW9GNnkf8',
        icon: faDiscord,
      },
    ],
  },
];

useSeoMeta({
  title: `Survival Chaos database credits`,
  titleTemplate: '',
});
definePageMeta({
  name: 'CreditsPage',
});
</script>
