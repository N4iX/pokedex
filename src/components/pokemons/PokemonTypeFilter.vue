<template>
    <div class="pokemon-type-filter-container">
        <pokemon-type-tag
            class="pokemon-type-tag-filter"
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
import { removeExtraPokemons } from '../../common.js';

export default {
    components: {
        PokemonTypeTag
    },
    emits: ['newPokemonList'],
    data() {
        return {
            pokemonTypes: null,
            filteredPokemonTypes: [],
        }
    },
    watch: {
        filteredPokemonTypes(value) {
            console.log(value);
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
        async setNewPokemonList() {
            if (this.filteredPokemonTypes.length === 0) {
                this.$emit('newPokemonList', null);
            }
            else if (this.filteredPokemonTypes.length === 1) {
                const response = await axios.get(this.filteredPokemonTypes[0].url);
                const finalPokemonList = removeExtraPokemons(response.data.pokemon.map((p) => p.pokemon));
                this.$emit('newPokemonList', finalPokemonList);
            } else {
                let newPokemonList = [];
                const pokemonTypes = JSON.parse(JSON.stringify(this.filteredPokemonTypes));
                for (var i = 0; i < pokemonTypes.length; i++) {
                    const response = await axios.get(pokemonTypes[i].url);
                    const pokemons = removeExtraPokemons(response.data.pokemon.map((p) => p.pokemon));
                    if (i === 0) {
                        newPokemonList = pokemons;
                    } else {
                        newPokemonList = newPokemonList.filter((pokemon) => pokemons.map((p) => p.name).includes(pokemon.name));
                    }
                }
                this.$emit('newPokemonList', newPokemonList);
            }
        },
        isTypeSelected(typeName) {
            return (this.filteredPokemonTypes.map((type) => type.name).indexOf(typeName) !== -1);
        },
        isTypeDisabled(typeName) {
            return this.filteredPokemonTypes.length >= 2 && !this.isTypeSelected(typeName);

        }
    },
    created() {
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
    /* display: flex;
    flex-wrap: wrap;
    gap: 1rem; */
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

.pokemon-type-tag-filter {

}
</style>