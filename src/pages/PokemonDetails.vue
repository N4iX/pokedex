<template>
    <div class="nav-buttons-container">
        <router-link
            :class="{ 'disabled-link': !previousPokemonUrl || previousPokemonUrl.length === 0 }"
            class="button-previous"
            :to="previousPokemonUrl"
        >&#11164;
        </router-link>
        <router-link
            to="/home"
            class="button-home"
        >Home
        </router-link>
        <router-link
            :class="{ 'disabled-link': !nextPokemonUrl || nextPokemonUrl.length === 0 }"
            class="button-next"
            :to="nextPokemonUrl"
        >&#11166;
        </router-link>
    </div>
    <div class="pokemon-details-container" v-if="!isFetchingPokemonData && !isFetchingPokemonSpeciesData && pokemon.name && pokemon.name.length > 0">
        <div class="details-content">
            <div class="pokemon-id">
                {{ '#' + pokemon.id }}
            </div>
            <div class="pokemon-name">
                {{ capitalizeFirstLetter(pokemon.name) }}
            </div>
            <div class="info-containers">
                <div class="pokemon-image info-1">
                    <img :src="pokemon.imageUrl" :alt="capitalizeFirstLetter(pokemon.name)">
                </div>
                <div class="info-2">
                    <p class="pokemon-description">
                        {{ pokemon.description }}
                    </p>
                    <div class="info-col">
                        <span class="info-title">Type</span>
                        <div class="pokemon-type-tags">
                            <pokemon-type-tag
                                v-for="type in pokemon.types"
                                :key="type.name"
                                :type="type.name"
                                :fontSize="10"
                            ></pokemon-type-tag>
                        </div>
                    </div>
                    <div class="info-col">
                        <span class="info-title">Weakness</span>
                        <div class="pokemon-type-tags">
                            <pokemon-type-tag
                                v-for="type in pokemon.weaknesses"
                                :key="type.name"
                                :type="type.name"
                                :fontSize="10"
                            ></pokemon-type-tag>
                        </div>
                    </div>
                    <div class="info-col">
                        <span class="info-title">Category</span>
                        {{ pokemon.category }}
                    </div>
                    <div class="info-col">
                        <span class="info-title">Abilities</span>
                        <div
                            v-for="(ability, index) in pokemon.abilities"
                            :key="ability.name"
                            class="info-col"
                        >
                            <span
                                @click="loadAbilityDescription(index)"
                                class="ability-name"
                            >{{ capitalizeFirstLetter(ability.name) }}
                            </span>
                            <span
                                v-if="ability.description && ability.description.length > 0 && ability.show"
                                class="ability-description"
                            >{{ ability.description }}
                            </span>
                        </div>
                    </div>
                    <div class="info-col">
                        <span class="info-title">Height</span>
                        {{ getHeightInMeters }} m
                    </div>
                    <div class="info-col">
                        <span class="info-title">Weight</span>
                        {{ getWeightInKilograms }} kg
                    </div>
                    <div class="info-col">
                        <span class="info-title">Gender</span>
                        <div v-if="pokemon.genderRatio === -1">Unknown</div>
                        <div v-else>
                            <span class="color-male">&#9794; {{ getMalePercentage }}%, </span>
                            <span class="color-female">&#9792; {{ getFemalePercentage }}%</span>
                        </div>
                    </div>
                    <div class="info-col">
                        <span class="info-title">Stats</span>
                        <div class="info-row">
                            <div
                                v-for="s in pokemon.stats"
                                :key="s.stat.name"
                                class="stat-container"
                            >
                                <span class="stat-value">{{ s.base_stat }}</span>
                                <span class="stat-name">{{ transformStatName(s.stat.name) }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div>
                <evolution-chain
                    v-if="pokemon.evoChainUrl && pokemon.evoChainUrl.length > 0"
                    :url="pokemon.evoChainUrl"
                ></evolution-chain>
            </div>
        </div>
    </div>
</template>

<script>
import axios from 'axios';
import { capitalizeFirstLetter, pokemonTotalCount } from '../common.js';
import PokemonTypeTag from '../components/pokemons/PokemonTypeTag.vue';
import EvolutionChain from '../components/pokemons/EvolutionChain.vue';

export default {
    components: {
        PokemonTypeTag,
        EvolutionChain
    },
    props: {
        id: {
            type: String,
            required: true
        }
    },
    data() {
        return {
            pokemon: {
                id: null,
                imageUrl: null,
                name: null,
                description: null, // from species.flavor_text_entries
                types: [],
                weaknesses: [],
                height: null,
                weight: null,
                genderRatio: null,
                category: null,
                abilities: [],
                stats: [],
                evoChainUrl: null
            },
            isFetchingPokemonData: false,
            isFetchingPokemonSpeciesData: false,
        }
    },
    computed: {
        nextPokemonUrl() {
            const pokemonId = parseInt(this.pokemon.id);
            if (pokemonId < pokemonTotalCount) {
                return '/pokemon/' + (pokemonId + 1);
            } else {
                return '';
            }
        },
        previousPokemonUrl() {
            const pokemonId = parseInt(this.pokemon.id);
            if (pokemonId > 1) {
                return '/pokemon/' + (pokemonId - 1);
            } else {
                return '';
            }
        },
        getFemalePercentage() {
            return this.pokemon.genderRatio / 8 * 100;
        },
        getMalePercentage() {
            return (8 - this.pokemon.genderRatio) / 8 * 100;
        },
        getHeightInMeters() {
            return this.pokemon.height / 10;
        },
        getWeightInKilograms() {
            return this.pokemon.weight / 10;
        }
    },
    watch: {
        id() {
            this.pokemon = {
                id: null,
                imageUrl: null,
                name: null,
                description: null, // from species.flavor_text_entries
                types: [],
                weaknesses: [],
                height: null,
                weight: null,
                genderRatio: null,
                category: null,
                abilities: [],
                stats: [],
                evoChainUrl: null
            };
            this.fetchPokemonData();
        }
    },
    created() {
        this.fetchPokemonData();
    },
    updated() {
        // this.fetchPokemonData();
    },
    methods: {
        capitalizeFirstLetter,
        fetchPokemonData() {
            this.isFetchingPokemonData = true;

            axios
                .get(`https://pokeapi.co/api/v2/pokemon/${this.id}/`)
                .then((response) => {
                    this.pokemon.id = response.data.id;
                    this.pokemon.imageUrl = response.data.sprites.other['official-artwork']['front_default'];
                    this.pokemon.name = response.data.name;
                    this.pokemon.types = response.data.types.map((t) => t.type);
                    this.fetchPokemonTypeData(this.pokemon.types.map((type) => type.url));
                    this.pokemon.height = response.data.height;
                    this.pokemon.weight = response.data.weight;
                    this.fetchPokemonSpeciesData(response.data.species.url);
                    this.pokemon.abilities = response.data.abilities.map((a) => a.ability);
                    this.pokemon.stats = response.data.stats;
                })
                .catch((error) => {
                    console.log(error.message);
                })
                .finally(() => {
                    this.isFetchingPokemonData = false;
                });
        },
        fetchPokemonSpeciesData(url) {
            this.isFetchingPokemonSpeciesData = true;

            axios
                .get(url)
                .then((response) => {
                    this.pokemon.description = response.data['flavor_text_entries'].find((f) => f.language.name === "en")['flavor_text'].replace('\f', ' ');
                    this.pokemon.genderRatio = response.data['gender_rate'];
                    this.pokemon.category = response.data['genera'].find((g) => g.language.name === 'en').genus;
                    this.pokemon.evoChainUrl = response.data['evolution_chain'].url;
                })
                .catch((error) => {
                    console.log(error.message);
                })
                .finally(() => {
                    this.isFetchingPokemonSpeciesData = false;
                });
        },
        async fetchPokemonTypeData(urlArray) {
            this.pokemon.weaknesses = [];
            if (urlArray.length === 1) {
                const response = await axios.get(urlArray[0]);
                this.pokemon.weaknesses = await response.data['damage_relations']['double_damage_from'];
            } else if (urlArray.length > 1) {
                let strongAgainst = [];
                let tempArray = [];

                urlArray.forEach(async(url, index) => {
                    const response = await axios.get(url);
                    const halfDamageFrom = await response.data['damage_relations']['half_damage_from'];
                    const noDamageFrom = await response.data['damage_relations']['no_damage_from'];
                    tempArray = strongAgainst.concat([...halfDamageFrom, ...noDamageFrom]);
                    strongAgainst = this.getUniqueTypes(tempArray);
                    tempArray = [];
                    tempArray = this.pokemon.weaknesses.concat(response.data['damage_relations']['double_damage_from']);
                    this.pokemon.weaknesses = this.getUniqueTypes(tempArray);

                    if (index === (urlArray.length - 1)) {
                        strongAgainst.forEach((strongType) => {
                            const indexFound = this.pokemon.weaknesses.map((t) => t.name).indexOf(strongType.name);
                            if (indexFound !== -1) {
                                this.pokemon.weaknesses.splice(indexFound, 1);
                            }
                        })
                    }
                });
            }
        },
        getUniqueTypes(pokemonTypeArray) {
            return pokemonTypeArray.filter((type, index, array) => array.map((t) => t.name).indexOf(type.name) === index);
        },
        transformStatName(statName) {
            let transformedStatName;

            switch (statName) {
                case 'hp':
                    transformedStatName = 'HP';
                    break;
                case 'attack':
                    transformedStatName = 'Atk';
                    break;
                case 'defense':
                    transformedStatName = 'Def';
                    break;
                case 'special-attack':
                    transformedStatName = 'Sp. Atk';
                    break;
                case 'special-defense':
                    transformedStatName = 'Sp. Def';
                    break;
                case 'speed':
                    transformedStatName = 'Speed';
                    break;
                default:
                    transformedStatName = "Unknown"
            }
            return transformedStatName;
        },
        loadAbilityDescription(index) {
            if (!this.pokemon.abilities[index].description) {
                axios
                    .get(this.pokemon.abilities[index].url)
                    .then((response) => {
                        this.pokemon.abilities[index].description = response.data['effect_entries'].find((e) => e.language.name === "en").effect;
                        this.pokemon.abilities[index].show = true;
                    });
            } else {
                this.pokemon.abilities[index].show = !this.pokemon.abilities[index].show;
            }
        }
    }
}
</script>

<style scoped>
a {
    cursor: pointer;
    text-decoration: none;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0.5rem 1rem;
    background-color: #f5f5f5;
    color: #808080;
    border: 1px solid #808080;
    font: inherit;
}

a:hover,
a:active {
    color: #000000;
    background-color: #ffffff;
}

.disabled-link {
    cursor: default;
    background-color: #e0e0e0;
}

.disabled-link:hover {
    background-color: #e0e0e0;
    color: #808080;
}

.nav-buttons-container {
    display: flex;
    flex-direction: row;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    justify-content: space-between;
}

.button-previous,
.button-next {
    flex: 2;
}

.button-home {
    flex: 1;
}

.pokemon-details-container {
    display: flex;
    justify-content: center;
    margin-top: 60px;
}

.details-content {
    width: 80%;
    background-color: #ffffff;
    border-radius: 1rem;
    padding: 1rem;
    color: #000000;
}

.info-containers {
    display: flex;
    flex-direction: row;
    margin: 1rem 0;
    gap: 1rem;
}

.info-1,
.info-2 {
    width: 50%;
}

.info-2 {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

@media screen and (max-width: 800px) {
    .info-containers {
        flex-direction: column;
    }

    .info-1,
    .info-2 {
        width: 100%;
    }

    .details-content {
        width: 90%;
    }
}

img {
    width: 100%;
    max-width: 500px;
    min-width: 100px;
    background: #eeeeee;
    padding: 0.5rem;
    border-radius: 5px;
}

.pokemon-name {
    font-weight: bold;
    font-size: 18pt;
}

.pokemon-description {
    text-align: justify;
}

.info-col {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.1rem;
}

.info-row {
    display: flex;
    flex-direction: row;
    gap: 0.5rem;
    flex-wrap: wrap;
}

.stat-container {
    display: flex;
    align-items: center;
    flex-direction: column;
    border-radius: 5px;
    border: 1px solid #808080;
    padding: 0.25rem;
    width: 50px;
}

.stat-name {
    font-size: 8pt;
}

.ability-name {
    cursor: pointer;
}

.ability-description {
    border: 1px solid #808080;
    border-radius: 5px;
    font-size: 10pt;
    text-align: justify;
    padding: 0.25rem;
}

.pokemon-type-tags {
    margin: 0.25rem 0;
    display: flex;
    gap: 0.25rem;
    flex-wrap: wrap;
}

.info-title {
    font-weight: bold;
}

.color-male {
    color: #3355FF;
}

.color-female {
    color: #e91e63;
}
</style>