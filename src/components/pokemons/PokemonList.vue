<template>
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
        <div class="filter">
            <label>Filter by Pokémon types:</label>
            <button
                @click="togglePokemonTypeFilter"
                class="button-toggle-type-filter"
            >{{ showPokemonTypeFilter ? '▲' : '▼' }}</button>
        </div>
        <pokemon-type-filter
            :style="{ display: showPokemonTypeFilter ? null : 'none' }"
            @filteredPokemonList="filterPokemonsByTypes"
            @onFetchData="setIsFetchingDataFromTypeFilter"
        ></pokemon-type-filter>
    </div>
    <div v-if="isFetchingDataFromTypeFilter">
        <bouncing-circle-spinner :size="80" :delay="200" />
    </div>
    <div v-else-if="error && error.length > 0" :class="isSpecialError ? 'special-error' : null">
        {{ error }}
    </div>
    <div v-else :class="filteredPokemonList.length > 3 ? 'pokemon-list-container' : 'pokemon-list-container-less-items'">
        <pokemon-list-item
            v-for="pokemon in filteredPokemonList"
            :key="pokemon.name"
            :pokemonDataUrl="pokemon.url"
            :isFavourite="isAllFavourite ? true : getIsFavourite(pokemon.name)"
            @onFavourite="setFavouriteList(pokemon.name, pokemon.url)"
            :canMarkAsFavourite="canFavourite"
        >
        </pokemon-list-item>
    </div>
    <div class="button-container" v-if="!isEndOfList && !isFetchingDataFromTypeFilter">
        <button class="button-load-more" @click="loadMorePokemon">
            <span>Load More</span>
            <img class="icon-down-arrow" src="../../assets/down-arrow.png" alt="down-arrow-icon">
        </button>
    </div>
</template>

<script>
import PokemonListItem from './PokemonListItem.vue';
import PokemonTypeFilter from './PokemonTypeFilter.vue';
import { isNumeric, getPokemonIdFromUrl, compareByUrlAsc, compareByUrlDesc } from '../../functions/common.js';

export default {
    components: {
        PokemonListItem,
        PokemonTypeFilter
    },
    emits: ['onFavouriteChange'],
    props: {
        fullPokemonList: {
            type: Array,
            required: true
        },
        isAllFavourite: {
            type: Boolean,
            required: false,
            default: false
        },
        canFavourite: {
            type: Boolean,
            required: false,
            default: true
        },
        pageLimit: {
            type: Number,
            required: false,
            default: 20
        }
    },
    data() {
        return {
            targetPokemonList: [], // target pokemon list to be filtered, will point to 2 different list -> fullPokemonList & pokemon list after filtered by pokemon types (see method "filterPokemonsByTypes()"")
            filteredPokemonList: [], // the pokemon list to be displayed on the screen
            listEndIndex: null, // the end index of the filteredPokemonList
            isEndOfList: false, // for "load more" button
            searchInput: '',
            sortOption: "id-asc",
            showPokemonTypeFilter: false,
            error: null,
            isFetchingDataFromTypeFilter: false,
            isSpecialError: false
        }
    },
    created() {
        this.targetPokemonList = JSON.parse(JSON.stringify(this.fullPokemonList));
        if (this.targetPokemonList.length === 0) {
            this.isEndOfList = true; // this will hide the "load more" button
            this.error = this.isAllFavourite ? "No favourite Pokémon found." : "No Pokémon found.";
        } else {
            this.resetListItemAmount();
            this.setFilteredPokemonList();
        }
    },
    watch: {
        // when the sort option is changed, update the list
        sortOption() {
            this.resetListItemAmount();
            this.setFilteredPokemonList();
        },
        // when the search input is changed, update the list
        searchInput() {
            this.resetListItemAmount();
            this.setFilteredPokemonList();
        }
    },
    methods: {
        // combine all the filters (search input, pokemon type filter, sort option), and produce the final filtered list
        setFilteredPokemonList() {
            this.error = '';
            this.isSpecialError = false;
            let pokemonList;

            // filter the list based on search input, can be ID or name
            if (this.searchInput && this.searchInput.trim().length > 0) {
                const searchText = this.searchInput.trim();
                if (searchText.toLowerCase() === "foong shi wei") {
                    pokemonList = [];
                    this.isSpecialError = true;
                    this.error = "This is a lenglui, not a Pokemon. 😉";
                    return;
                } else if (isNumeric(searchText)) {
                    pokemonList = this.targetPokemonList.filter((pokemon) => getPokemonIdFromUrl(pokemon.url) === parseInt(searchText));
                } else {
                    pokemonList = this.targetPokemonList.filter((pokemon) => pokemon.name.includes(searchText.toLowerCase()));
                }
            } else {
                pokemonList = JSON.parse(JSON.stringify(this.targetPokemonList));
            }

            // set the "isEndOfList" status based on the listEndIndex, isEndOfList will determine the apperance of "load more" button
            if (this.listEndIndex > pokemonList.length) {
                this.listEndIndex = pokemonList.length;
                this.isEndOfList = true;
            } else if (this.listEndIndex === pokemonList.length) {
                this.isEndOfList = true;
            } else {
                this.isEndOfList = false;
            }
            
            // finally, sort the list based on the sortOption
            if (this.sortOption === 'id-asc') {
                this.filteredPokemonList = pokemonList.sort(compareByUrlAsc).slice(0, this.listEndIndex);
            } else if (this.sortOption === 'id-desc') {
                this.filteredPokemonList = pokemonList.sort(compareByUrlDesc).slice(0, this.listEndIndex);
            }

            // display this error when nothing matches the filters
            if (this.filteredPokemonList.length === 0) {
                this.error = "No results found.";
            }
        },
        // move forward the listEndIndex, then update the list
        loadMorePokemon() {
            this.listEndIndex += this.pageLimit;
            this.setFilteredPokemonList();
        },
        // assign the targetPokemonList based on the selected pokemon type(s)
        filterPokemonsByTypes(newPokemonList) {
            this.isFetchingDataFromTypeFilter = false;
            if (!newPokemonList) {
                this.targetPokemonList = this.fullPokemonList;
                this.resetListItemAmount();
                this.setFilteredPokemonList();
            } else {
                if (this.isAllFavourite) {
                    this.targetPokemonList = newPokemonList.filter((pokemon) => this.fullPokemonList.map((p) => p.name).includes(pokemon.name));
                } else {
                    this.targetPokemonList = newPokemonList;
                }
                this.resetListItemAmount();
                this.setFilteredPokemonList();
            }
        },
        resetListItemAmount() {
            this.listEndIndex = this.pageLimit;
        },
        togglePokemonTypeFilter() {
            this.showPokemonTypeFilter = !this.showPokemonTypeFilter;
        },
        getIsFavourite(name) {
            return this.$store.getters.getIsFavouritePokemon(name);
        },
        // update the favouritePokemonList in Vuex store
        setFavouriteList(pokemonName, pokemonUrl) {
            let list = this.$store.getters.getFavouritePokemonList;
            const index = list.map((pokemon) => pokemon.name).indexOf(pokemonName);
            if (index === -1) {
                list.push({ name: pokemonName, url: pokemonUrl });
                list.sort(compareByUrlAsc);
            } else {
                list.splice(index, 1);
            }

            let transformedList = [];
            if (list.length > 0) {
                list.forEach((pokemon) => {
                    transformedList.push({
                        id: getPokemonIdFromUrl(pokemon.url),
                        name: pokemon.name
                    });
                });
                const parsed = JSON.stringify(transformedList);
                localStorage.setItem('favPokemons', parsed);
            } else {
                localStorage.removeItem('favPokemons');
            }

            this.$store.commit('setFavouritePokemonList', list);
            if (this.isAllFavourite) {
                this.$emit('onFavouriteChange');
                const index = this.targetPokemonList.map((pokemon) => pokemon.name).indexOf(pokemonName);
                this.targetPokemonList.splice(index, 1);
                this.setFilteredPokemonList();
            }
        },
        setIsFetchingDataFromTypeFilter() {
            this.isFetchingDataFromTypeFilter = true;
        }
    },
}
</script>

<style scoped>
a {
    text-decoration: none;
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
    gap: 0.5rem;
    margin-bottom: 1.5rem;
}

.tool,
.filter {
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

@media(hover: hover) and (pointer: fine) {
    .button-toggle-type-filter:hover,
    .button-load-more:hover {
        cursor: pointer;
        color: #000000;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.50);
    }
}

.button-toggle-type-filter {
    padding: 0.05rem 0.5rem;
    border-radius: 5px;
    background-color: #ffffff;
    color: #808080;
    border: none;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.26);
}

@media(hover: hover) and (pointer: fine) {
    .button-load-more:hover .icon-down-arrow {
        opacity: 1;
    }
}

.icon-down-arrow {
    height: 16px;
    opacity: 0.5;
}

.special-error {
    background-color: #ffffff;
    padding: 8px;
    border-radius: 5px;
    font-size: 20px;
}
</style>