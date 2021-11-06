<template>
    <div class="home-container">
        <div class="page-title">
            <h2>Home</h2>
        </div>
        <div class="initial-fetch-spinner" v-if="isFetchingData">
            <bouncing-circle-spinner :size="100" :delay="200" />
        </div>
        <pokemon-list
            v-else
            :fullPokemonList="fullPokemonList"
            :pageLimit="20"
        ></pokemon-list>
        <router-link to="/favourite" class="button-favourite-page">&#10084;</router-link>
    </div>
</template>

<script>
import axios from 'axios';
import PokemonList from '../components/pokemons/PokemonList.vue';
import { pokemonTotalCount } from '../functions/common.js';

export default {
    components: {
        PokemonList
    },
    data() {
        return {
            fullPokemonList: [],
            isFetchingData: false,
        }
    },
    created() {
        // fetch full pokemon list at the start
        this.fetchPokemonList();
    },
    methods: {
        fetchPokemonList() {
            this.isFetchingData = true;
            
            /* to test loading spinner */
            // setTimeout(() => {
            axios
                .get('https://pokeapi.co/api/v2/pokemon/',
                    {
                        params: {
                            limit: pokemonTotalCount
                        }
                    }
                )
                .catch((error) => {
                    console.log(error.message);
                })
                .then((response) => {
                    this.fullPokemonList = response.data.results;
                })
                .finally(() => {
                    this.isFetchingData = false;
                });
            // }, 5000);
        }
    },
}
</script>

<style scoped>
a {
    text-decoration: none;
}

.home-container {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.button-favourite-page {
    position: fixed;
    top: 50%;
    right: 0;
    padding: 0.5rem 0.5rem;
    font-size: 20pt;
    color: #ff80ab;
    background: #ffffff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.26);
    margin-right: -0.25rem;
}

.button-favourite-page:hover {
    cursor: pointer;
    color: #ffffff;
    background: #ff80ab;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
}

@media screen and (max-width: 700px) {
    .button-favourite-page {
        padding: 0.5rem 0.25rem;
        font-size: 16pt;
    }
}

.initial-fetch-spinner {
    padding-top: 2rem;
}

.page-title {
    background-color: #9e9e9e;
    color: #ffffff;
    width: 100%;
    margin-bottom: 2rem;
}
</style>