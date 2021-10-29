<template>
    <div class="home-container">
        <div class="tools-container">
            <div class="tool">
                <label for="search">Search:</label>
                <input type="text" id="search" placeholder="by Name / ID" v-model="searchInput" />
            </div>
            <div class="tool">
                <label for="sort-options">Sort by:</label>
                <select name="sort-options" id="sort-options" v-model="sortOption">
                    <option value="id-asc">ID (ascending)</option>
                    <option value="id-desc">ID (descending)</option>
                </select>
            </div>
        </div>
        <div class="filter-container">
            <pokemon-type-filter @newPokemonList="filterPokemonsByTypes"></pokemon-type-filter>
        </div>
        <div class="initial-fetch-spinner" v-if="isFetchingData">
            <bouncing-circle-spinner :size="100" />
        </div>
        <div v-else-if="searchInput.length > 0 && (error && error.length > 0)">
            {{ error }}
        </div>
        <div v-else :class="pokemonList.length > 3 ? 'pokemon-list-container' : 'pokemon-list-container-less-items'">
            <pokemon-list-item
                v-for="pokemon in pokemonList"
                :key="pokemon.name"
                :pokemonDataUrl="pokemon.url"
                @pokemonNotFound="setError"
            >
            </pokemon-list-item>
        </div>
        <div class="button-container" v-if="showLoadMoreButton && !isFetchingData">
            <button class="button-load-more" @click="loadMorePokemon" :disabled="isLoadingMore">
                <span>Load More</span>
                <bouncing-circle-spinner v-if="isLoadingMore" />
                <span v-else>&#11167;</span>
            </button>
        </div>
    </div>
</template>

<script>
// const Pokedex = require("pokeapi-js-wrapper");
// const P = new Pokedex.Pokedex();
import axios from 'axios';
import PokemonListItem from '../components/pokemons/PokemonListItem.vue';
import PokemonTypeFilter from '../components/pokemons/PokemonTypeFilter.vue';
import BouncingCircleSpinner from '../components/spinners/BouncingCircleSpinner.vue';

export default {
    components: {
        PokemonListItem,
        PokemonTypeFilter,
        BouncingCircleSpinner
    },
    data() {
        return {
            pokemonList: [],
            limit: 20,
            totalCount: 898, // total is 898, after that is same pokemon different variation
            nextPageUrl: null,
            previousPageUrl: null,
            searchInput: '',
            searchTimeout: null,
            sortOption: "id-asc",
            isFetchingData: false,
            isLoadingMore: false,
            isSearching: false,
            error: null,
        }
    },
    created() {
        this.fetchPokemonList();
    },
    watch: {
        sortOption() {
            if (this.searchInput.length === 0) {
                this.fetchPokemonList();
            }
        },
        searchInput(value) {
            clearTimeout(this.searchTimeout);

            if (value && value.length > 0) {
                this.isSearching = true;
                this.searchTimeout = setTimeout(() => {
                    // this.searchPokemon().finally(() => {
                    //     this.isSearching = false;
                    // });
                    this.error = null;
                    this.pokemonList = [];
                    this.nextPageUrl = null;
                    this.previousPageUrl = null;
                    this.pokemonList.push({
                        name: value,
                        url: 'https://pokeapi.co/api/v2/pokemon/' + value
                    });
                }, 500);
            } else {
                this.error = null;
                this.fetchPokemonList();
                this.isSearching = false;
            }
        }
    },
    computed: {
        showLoadMoreButton() {
            if (this.sortOption === 'id-desc') {
                return this.previousPageUrl && this.previousPageUrl.length > 0;
            } else {
                return this.nextPageUrl && this.nextPageUrl.length > 0;
            }
        }
    },
    methods: {
        fetchPokemonList() {
            // P.getPokemonsList()
            //     .then((response) => {
            //         console.log(response);
            //     });
            // P.getPokemonByName(10003)
            //     .then((response) => {
            //         console.log(response);
            //     });
            this.isFetchingData = true;
            
            // setTimeout(() => {
            axios
                .get('https://pokeapi.co/api/v2/pokemon/',
                    {
                        params: {
                            limit: this.limit,
                            offset: this.sortOption === 'id-desc' ? this.totalCount - this.limit : null
                        }
                    }
                )
                .then((response) => {
                    this.pokemonList = this.sortOption === 'id-asc' ? response.data.results : response.data.results.reverse();
                    this.nextPageUrl = response.data.next;
                    this.previousPageUrl = response.data.previous;
                    // this.totalCount = response.data.count;
                })
                .finally(() => {
                    this.isFetchingData = false;
                });
            // }, 5000);
        },
        loadMorePokemon() {
            this.isLoadingMore = true;
            // setTimeout(() => {
            axios
                .get(this.sortOption === 'id-asc' ? this.nextPageUrl : this.previousPageUrl)
                .then((response) => {
                    this.pokemonList = this.pokemonList.concat(
                        this.sortOption === 'id-asc'
                        ? response.data.results
                        : response.data.results.reverse()
                    );
                    this.nextPageUrl = response.data.next;
                    this.previousPageUrl = response.data.previous;
                })
                .finally(() => {
                    this.isLoadingMore = false;
                });
            // }, 5000);
        },
        searchPokemon() {
            return axios
                .get('https://pokeapi.co/api/v2/pokemon/' + this.searchInput)
                .then((response) => {
                    this.pokemonList = response.data.results;
                    this.nextPageUrl = null;
                    this.previousPageUrl = null;
                });
        },
        setError() {
            this.error = "No results found."
        },
        filterPokemonsByTypes(newPokemonList) {
            if (!newPokemonList) {
                this.fetchPokemonList();
            } else {
                this.pokemonList = newPokemonList;
            }
        }
    },
}
</script>

<style scoped>
.home-container {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.tools-container {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    margin-bottom: 1rem;
    width: 80%;
}

.filter-container {
    display: flex;
    margin-bottom: 1rem;
    width: 80%;
}

.tool {
    display: flex;
    align-items: center;
    gap: 5px;
}

.pokemon-list-container {
    width: 80%;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1rem;
}

.pokemon-list-container-less-items {
    width: 80%;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 200px));
    gap: 1rem;
}

.button-container {
    display: flex;
    justify-content: center;
    margin: 1rem 0;
}

.button-load-more {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0.5rem 1rem;
    border-radius: 5px;
    background-color: #ffffff;
    color: #808080;
    border: none;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.26);
}

.button-load-more:hover {
    cursor: pointer;
    color: #000000;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.50);
}

.button-load-more:disabled {
    cursor: not-allowed;
}

.initial-fetch-spinner {
    padding-top: 2rem;
}
</style>