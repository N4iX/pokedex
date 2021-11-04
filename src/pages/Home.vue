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
            <div class="tool">
                <label>Filter by pokemon types:</label>
                <button
                    @click="togglePokemonTypeFilter"
                    class="button-toggle"
                >{{ showPokemonTypeFilter ? '▲' : '▼' }}</button>
            </div>
            <pokemon-type-filter
                :style="{ display: showPokemonTypeFilter ? null : 'none' }"
                @filteredPokemonList="filterPokemonsByTypes"
            ></pokemon-type-filter>
        </div>
        <div class="initial-fetch-spinner" v-if="isFetchingData">
            <bouncing-circle-spinner :size="100" />
        </div>
        <div v-else-if="error && error.length > 0">
            {{ error }}
        </div>
        <div v-else :class="filteredPokemonList.length > 3 ? 'pokemon-list-container' : 'pokemon-list-container-less-items'">
            <pokemon-list-item
                v-for="pokemon in filteredPokemonList"
                :key="pokemon.name"
                :pokemonDataUrl="pokemon.url"
                :isFavourite="getIsFavourite(pokemon.name)"
                @onFavourite="setFavouriteList(pokemon.name, pokemon.url)"
            >
            </pokemon-list-item>
        </div>
        <div class="button-container" v-if="!isEndOfList">
            <button class="button-load-more" @click="loadMorePokemon">
                <span>Load More</span>
                <span>&#11167;</span>
            </button>
        </div>
        <router-link to="/favourite" class="button-favourite-page">&#10084;</router-link>
    </div>
</template>

<script>
import axios from 'axios';
import PokemonListItem from '../components/pokemons/PokemonListItem.vue';
import PokemonTypeFilter from '../components/pokemons/PokemonTypeFilter.vue';
import BouncingCircleSpinner from '../components/spinners/BouncingCircleSpinner.vue';
import { isNumeric, getPokemonIdFromUrl, pokemonTotalCount } from '../common';

export default {
    components: {
        PokemonListItem,
        PokemonTypeFilter,
        BouncingCircleSpinner
    },
    data() {
        return {
            fullPokemonList: [],
            targetPokemonList: [],
            filteredPokemonList: [],
            listEndIndex: null,
            isEndOfList: false,
            limit: 4,
            totalCount: pokemonTotalCount, // total is 898, after that is same pokemon different variation
            searchInput: '',
            sortOption: "id-asc",
            showPokemonTypeFilter: false,
            isFetchingData: false,
            error: null,
        }
    },
    created() {
        this.fetchPokemonList();
    },
    watch: {
        sortOption() {
            this.resetListItemAmount();
            this.setFilteredPokemonList();
        },
        searchInput() {
            this.resetListItemAmount();
            this.setFilteredPokemonList(true);
        }
    },
    methods: {
        fetchPokemonList() {
            this.isFetchingData = true;
            
            // setTimeout(() => {
            axios
                .get('https://pokeapi.co/api/v2/pokemon/',
                    {
                        params: {
                            limit: this.totalCount
                        }
                    }
                )
                .catch((error) => {
                    this.error = error.message;
                    this.isEndOfList = true;
                })
                .then((response) => {
                    this.fullPokemonList = response.data.results;
                    this.targetPokemonList = response.data.results;
                    this.resetListItemAmount();
                    this.setFilteredPokemonList();
                })
                .finally(() => {
                    this.isFetchingData = false;
                });
            // }, 5000);
        },
        setFilteredPokemonList() {
            this.error = '';
            let pokemonList;

            if (this.searchInput && this.searchInput.length > 0) {
                if (isNumeric(this.searchInput)) {
                    pokemonList = this.targetPokemonList.filter((pokemon) => getPokemonIdFromUrl(pokemon.url) === parseInt(this.searchInput));
                } else {
                    pokemonList = this.targetPokemonList.filter((pokemon) => pokemon.name.includes(this.searchInput.toLowerCase()));
                }
            } else {
                pokemonList = JSON.parse(JSON.stringify(this.targetPokemonList));
            }

            if (this.listEndIndex > pokemonList.length) {
                this.listEndIndex = pokemonList.length;
                this.isEndOfList = true;
            } else if (this.listEndIndex === pokemonList.length) {
                this.isEndOfList = true;
            } else {
                this.isEndOfList = false;
            }

            if (this.sortOption === 'id-asc') {
                this.filteredPokemonList = pokemonList.slice(0, this.listEndIndex);
            } else if (this.sortOption === 'id-desc') {
                const reversedList = pokemonList.reverse();
                this.filteredPokemonList = reversedList.slice(0, this.listEndIndex);
            }

            if (this.filteredPokemonList.length === 0) {
                this.error = "No results found.";
            }
        },
        loadMorePokemon() {
            this.listEndIndex += this.limit;
            this.setFilteredPokemonList();
        },
        filterPokemonsByTypes(newPokemonList) {
            if (!newPokemonList) {
                this.targetPokemonList = this.fullPokemonList;
                this.resetListItemAmount();
                this.setFilteredPokemonList();
            } else {
                this.targetPokemonList = newPokemonList;
                this.resetListItemAmount();
                this.setFilteredPokemonList();
            }
        },
        resetListItemAmount() {
            this.listEndIndex = this.limit;
        },
        togglePokemonTypeFilter() {
            this.showPokemonTypeFilter = !this.showPokemonTypeFilter;
        },
        getIsFavourite(name) {
            return this.$store.getters.getIsFavouritePokemon(name);
        },
        setFavouriteList(pokemonName, pokemonUrl) {
            const list = this.$store.getters.getFavouritePokemonList;
            const index = list.map((pokemon) => pokemon.name).indexOf(pokemonName);
            if (index === -1) {
                list.push({ name: pokemonName, url: pokemonUrl });
            } else {
                list.splice(index, 1);
            }
            this.$store.commit('setFavouritePokemonList', list);
            console.log(this.$store.getters.getFavouritePokemonList)
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

.tools-container {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    margin-bottom: 1rem;
    width: 80%;
}

.filter-container {
    display: flex;
    flex-direction: column;
    margin-bottom: 1rem;
    width: 80%;
    text-align: left;
    gap: 0.25rem;
}

.tool {
    display: flex;
    align-items: center;
}

label {
    margin-right: 5px;
}

input,
select {
    font: inherit;
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

.button-toggle:hover,
.button-load-more:hover {
    cursor: pointer;
    color: #000000;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.50);
}

.initial-fetch-spinner {
    padding-top: 2rem;
}

.button-toggle {
    padding: 0.05rem 0.5rem;
    border-radius: 5px;
    background-color: #ffffff;
    color: #808080;
    border: none;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.26);
}
</style>