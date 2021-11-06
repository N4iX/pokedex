<template>
    <div class="evo-chain-item-container">
        <bouncing-circle-spinner v-if="isFetchingData" :size="50" :delay="200" />
        <router-link
            v-if="!isFetchingData && pokemon.id"
            :to="pokemonDetailsLink"
            class="pokemon-info"
        >
            <img :src="pokemon.imageUrl" :alt="pokemon.name">
            <div class="info-row">
                <span class="pokemon-name">{{ capitalizeFirstLetter(pokemon.name) }}</span>
                <span class="pokemon-id">#{{ pokemon.id }}</span>
            </div>
            <div class="pokemon-types">
                <pokemon-type-tag
                    v-for="type in pokemon.types"
                    :key="type.name"
                    :type="type.name"
                ></pokemon-type-tag>
            </div>
        </router-link>
        <div v-if="!isFetchingData && hasNext">
            <div :class="{
                'vertical-item-divider': (itemDividerType === 'vertical'),
                'horizontal-item-divider': (itemDividerType === 'horizontal')
            }">
                &#10095;
            </div>
        </div>
    </div>
</template>

<script>
import axios from 'axios';
import PokemonTypeTag from './PokemonTypeTag.vue';
import { capitalizeFirstLetter } from '../../functions/common.js';

export default {
    components: {
        PokemonTypeTag
    },
    props: {
        pokemonId: {
            type: Number,
            required: true
        },
        hasNext: {
            type: Boolean,
            required: false,
            default: false
        }
    },
    data() {
        return {
            pokemon: {
                id: null,
                name: null,
                imageUrl: null,
                types: []
            },
            itemDividerType: null,
            isFetchingData: false,
        }
    },
    computed: {
        pokemonDetailsLink() {
            return '/pokemon/' + this.pokemon.id;
        }
    },
    created() {
        this.isFetchingData = true;
        axios
            .get(`https://pokeapi.co/api/v2/pokemon/${this.pokemonId}/`)
            .then((response) => {
                this.pokemon = {
                    id: response.data.id,
                    name: response.data.name,
                    imageUrl: response.data.sprites.other['official-artwork']['front_default'],
                    types: response.data.types.map((t) => t.type)
                };
            })
            .finally(() => {
                this.isFetchingData = false;
            });
    },
    mounted() {
        if (this.hasNext) {
            this.onResize();
            this.$nextTick(() => {
                window.addEventListener('resize', this.onResize);
            });
        }
    },
    beforeUnmount() {
        if (this.hasNext) {
            window.removeEventListener('resize', this.onResize);
        }
    },
    methods: {
        capitalizeFirstLetter,
        onResize() {
            if (this.hasNext) {
                if ((window.innerWidth - 17) > 650) {
                    this.itemDividerType = 'horizontal';
                } else {
                    this.itemDividerType = 'vertical';
                }
            }
        }
    }
}
</script>

<style scoped>
a {
    text-decoration: none;
}

.evo-chain-item-container {
    display: flex;
    flex-direction: row;
    align-items: center;
}

@media screen and (max-width: 667px) {
    .evo-chain-item-container {
        flex-direction: column;
    }
}

.pokemon-info {
    display: flex;
    flex-direction: column;
    flex: 1;
    align-items: center;
    gap: 0.5rem;
    background-color: #424242;
    padding: 0.5rem;
    border-radius: 10px;
}

.pokemon-info:hover {
    background: #616161;
}

.pokemon-types {
    display: flex;
    gap: 0.25rem;
    flex-wrap: wrap;
}

.pokemon-name {
    color: #ffffff;
    font-weight: bold;
    margin-right: 0.25rem;
}

.pokemon-id {
    color: #bdbdbd;
}

img {
    border: 5px solid #ffffff;
    border-radius: 50%;
    width: 100%;
    max-width: 200px;
    min-width: 100px;
    padding: 0.5rem;
}

.horizontal-item-divider,
.vertical-item-divider {
    user-select: none;
    color: #ffffff;
    font-size: 40pt;
}

.horizontal-item-divider {
    margin-top: -4rem;
    margin: -4rem 0.25rem 0 0.25rem;
}

.vertical-item-divider {
    transform: rotate(90deg);
}
</style>