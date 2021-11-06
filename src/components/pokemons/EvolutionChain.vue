<template>
    <div class="evo-chain-container">
        <div class="info-text">
            <span class="info-title">Evolutions</span>
            <span v-if="!isFetchingData && chain && chain.length <= 1">This Pokémon does not evolve.</span>
        </div>
        <div class="evo-chain-items">
            <bouncing-circle-spinner v-if="isFetchingData" :size="80" :delay="200" />
            <evolution-chain-item
                v-for="(species, index) in chain"
                :key="species.name"
                :pokemonId="getPokemonIdFromSpeciesUrl(species.url)"
                :hasNext="index < (chain.length - 1)"
            ></evolution-chain-item>
        </div>
    </div>
</template>

<script>
import axios from 'axios';
import EvolutionChainItem from './EvolutionChainItem.vue';
import { getPokemonIdFromSpeciesUrl } from '../../functions/common.js';

export default {
    components: {
        EvolutionChainItem
    },
    props: {
        url: {
            type: String,
            required: false
        }
    },
    data() {
        return {
            chain: [],
            isFetchingData: false,
        }
    },
    created() {
        this.isFetchingData = true;
        
        axios
            .get(this.url)
            .then((response) => {
                let evoChain = response.data.chain;
                this.chain.push(evoChain.species);
                let hasNextEvolve = true;

                while (hasNextEvolve) {
                    const evoSpecies = this.extractNextEvolve(evoChain);
                    if (evoSpecies) {
                        this.chain.push(evoSpecies);
                        evoChain = evoChain['evolves_to'][0];
                    } else {
                        hasNextEvolve = false;
                    }
                }
            })
            .finally(() => {
                this.isFetchingData = false;
            });
        
    },
    methods: {
        getPokemonIdFromSpeciesUrl,
        extractNextEvolve(evolution) {
            const evolvesTo = evolution['evolves_to'];
            if (evolvesTo && evolvesTo.length > 0) {
                return evolvesTo[0].species;
            } else {
                return null;
            }
        }
    }
}
</script>

<style scoped>
.evo-chain-container {
    border-radius: 5px;
    background-color: #424242;
    display: flex;
    flex-direction: column;
    width: 100%;
    gap: 1rem;
    padding: 1rem;
}

.evo-chain-items {
    display: flex;
    flex-direction: row;
    justify-content: center;
}

@media screen and (max-width: 667px) {
    .evo-chain-items {
        flex-direction: column;
    }
}

.info-text {
    color: #ffffff;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
}

.info-title {
    font-size: 16pt;
}
</style>