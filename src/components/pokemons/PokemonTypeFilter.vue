<template>
    <div class="pokemon-type-filter-container">
        <pokemon-type-tag
            v-for="type in pokemonTypes"
            :key="type.name"
            :type="type.name"
            :selectable="true"
            :isDisabled="isTypeDisabled(type.name)"
            @typeClicked="setFilteredPokemonTypes(type.name, type.url)"
        ></pokemon-type-tag>
    </div>
</template>

<script>
import PokemonTypeTag from './PokemonTypeTag.vue';
import axios from 'axios';
import { removeExtraPokemons } from '../../functions/common.js';

export default {
    components: {
        PokemonTypeTag
    },
    emits: ['filteredPokemonList', 'onFetchData'],
    data() {
        return {
            pokemonTypes: null,
            filteredPokemonTypes: [],
        }
    },
    methods: {
        setFilteredPokemonTypes(typeName, url) {
            // check whether the type exists in the list
            const index = this.filteredPokemonTypes.map((type) => type.name).indexOf(typeName);
            // if not exist
            if (index === -1) {
                // add to the list
                this.filteredPokemonTypes.push({ name: typeName, url });
            } else {
                // remove from the list
                this.filteredPokemonTypes.splice(index, 1);
            }
            this.setNewPokemonList();
        },
        // this method will be called when a type is selected/deselected, emit an event and pass back the pokemon list filtered by the selected types
        async setNewPokemonList() {
            // no type is selected
            if (this.filteredPokemonTypes.length === 0) {
                // pass back nothing
                this.$emit('filteredPokemonList', null);
            }
            // 1 type is selected
            else if (this.filteredPokemonTypes.length === 1) {
                // tell the parent component, started to fetch data, can be used to display loading spinner
                this.$emit('onFetchData');
                // call API to get all pokemons with the selected type
                const response = await axios.get(this.filteredPokemonTypes[0].url);
                // remove pokemons with ID greater than 898
                const finalPokemonList = removeExtraPokemons(response.data.pokemon.map((p) => p.pokemon));
                // pass back the list
                this.$emit('filteredPokemonList', finalPokemonList);
            } else {
                let newPokemonList = [];
                const pokemonTypes = JSON.parse(JSON.stringify(this.filteredPokemonTypes));
                // tell the parent component, started to fetch data, can be used to display loading spinner
                this.$emit('onFetchData');
                // loop through the selected pokemon types
                for (var i = 0; i < pokemonTypes.length; i++) {
                    // call API to get all pokemons with the selected type
                    const response = await axios.get(pokemonTypes[i].url);
                    // remove pokemon with ID greater than 898
                    const pokemons = removeExtraPokemons(response.data.pokemon.map((p) => p.pokemon));

                    if (i === 0) {
                        newPokemonList = pokemons;
                    } else {
                        // compare 2 lists from different selected types, take only the intersection (pokemon with both selected types)
                        newPokemonList = newPokemonList.filter((pokemon) => pokemons.map((p) => p.name).includes(pokemon.name));
                    }
                }
                // pass back the list
                this.$emit('filteredPokemonList', newPokemonList);
            }
        },
        // to check whether the type name is selected, this method is used by "isTypeDisabled()"
        isTypeSelected(typeName) {
            return (this.filteredPokemonTypes.map((type) => type.name).indexOf(typeName) !== -1);
        },
        // to disable the selection of the other types, if two types are selected, because one pokemon can have at most two types
        isTypeDisabled(typeName) {
            return this.filteredPokemonTypes.length >= 2 && !this.isTypeSelected(typeName);
        }
    },
    created() {
        // fetch the pokemon type data at "created()"
        axios
            .get('https://pokeapi.co/api/v2/type/')
            .then((response) => {
                // total 18 pokemon types
                this.pokemonTypes = response.data.results.slice(0, 18);
            })
            .catch((error) => {
                console.log(error.response.data);
            });
    },
}
</script>

<style scoped>
.pokemon-type-filter-container {
    display: grid;
    grid-template-columns: repeat(9, 1fr);
    width: 100%;
    gap: 0.5rem;
}

@media (max-width: 750px) {
    .pokemon-type-filter-container {
        grid-template-columns: repeat(auto-fit, minmax(60px, 1fr));
    }
}
</style>