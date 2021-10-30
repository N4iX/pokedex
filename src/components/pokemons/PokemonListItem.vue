<template>
    <router-link :to="pokemonDetailsLink" class="pokemon-list-item" v-if="pokemon.id">
        <img :src="pokemon.imageUrl" :alt="pokemon.name">
        <div class="pokemon-list-item-info">
            <div class="pokemon-id">
                <span>#{{ pokemon.id }}</span>
                <span
                    @click.prevent="onFavourite"
                    class="favourite-icon"
                    :class="{ 'favourite-icon-active': isFavourite }"
                    title="Mark as favourite"
                >&#10084;</span>
            </div>
            <div class="pokemon-name">{{ capitalizeFirstLetter(pokemon.name) }}</div>
            <div class="pokemon-types">
                <pokemon-type-tag
                    v-for="type in pokemon.types"
                    :key="type.name"
                    :type="type.name"
                ></pokemon-type-tag>
            </div>
        </div>
    </router-link>
</template>

<script>
import axios from 'axios';
import { capitalizeFirstLetter } from '../../common.js';
import PokemonTypeTag from './PokemonTypeTag.vue';

export default {
    components: {
        PokemonTypeTag
    },
    props: {
        pokemonDataUrl: {
            type: String,
            required: true
        },
        isFavourite: {
            type: Boolean,
            required: false,
            default: false,
        }
    },
    emits: ['pokemonNotFound', 'onFavourite'],
    data() {
        return {
            pokemon: {
                id: null,
                imageUrl: null,
                name: null,
                types: []
            },
        }
    },
    computed: {
        pokemonDetailsLink() {
            return '/pokemon/' + this.pokemon.id;
        }
    },
    created() {
        axios
            .get(this.pokemonDataUrl)
            .then((response) => {
                this.pokemon.id = response.data.id;
                // this.pokemon.imageUrl = `https://cdn.traction.one/pokedex/pokemon/${response.data.id}.png`;
                this.pokemon.imageUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${response.data.id}.png`;
                this.pokemon.name = response.data.name;
                // this.pokemon.types = [ {name: 'fighting'},{name: 'fighting'},{name: 'fighting'}];
                this.pokemon.types = response.data.types.map((t) => t.type);
            })
            .catch((error) => {
                if (error.response.status === 404) {
                    this.$emit('pokemonNotFound');
                }
            });
    },
    methods: {
        capitalizeFirstLetter,
        onFavourite() {
            this.$emit('onFavourite', this.pokemon.name);
        }
    }
}
</script>

<style scoped>
a {
    text-decoration: none;
}

.pokemon-list-item {
    /* max-width: 200px; */
    background-color: #ffffff;
    border-radius: 5px;
}

.pokemon-list-item:hover {
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.26);
}

img {
    width: 100%;
    max-width: 400px;
    min-width: 150px;
    background: #eeeeee;
    padding: 0.5rem;
}

.pokemon-list-item-info {
    text-align: left;
    padding: 0.5rem 1rem;
    display: flex;
    flex-direction: column;
    gap: 5px;
}

.pokemon-id {
    font-size: 12pt;
    color: #919191;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.pokemon-name {
    font-size: 14pt;
    font-weight: bold;
    color: #313131;
}

.pokemon-types {
    /* display: grid;
    grid-template-columns: repeat(auto-fit, 1fr); */
    display: flex;
    gap: 0.25rem;
    flex-wrap: wrap;
}

.favourite-icon {
    font-size: 20pt;
    margin: -10px 0;
    color: #eeeeee;
}

.favourite-icon-active,
.favourite-icon:hover {
    color: #ff80ab;
}
</style>