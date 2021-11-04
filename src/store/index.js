import { createStore } from 'vuex';
import axios from 'axios';
import { compareByUrl } from '../common.js';

const store = createStore({
    state: {
        pokemons: [],
        favouritePokemonList: [],
        isPokemonListFetched: false,
    },
    getters: {
        getFavouritePokemonList(state) {
            return [...state.favouritePokemonList];
        },
        getPokemons: (state) => (limit) => {
            return [...state.pokemons].slice(0, limit);
        },
        getIsPokemonListFetched(state) {
            return state.isPokemonListFetched;
        },
        getIsFavouritePokemon: (state) => (pokemonName) => {
            return (state.favouritePokemonList.map((pokemon) => pokemon.name).indexOf(pokemonName) !== -1);
        }
    },
    mutations: {
        setPokemons(state, payload) {
            state.pokemons = payload;
        },
        setIsPokemonListFetched(state, payload) {
            state.isPokemonListFetched = payload;
        },
        setFavouritePokemonList(state, payload) {
            payload.sort(compareByUrl);
            state.favouritePokemonList = payload;
        }
    },
    actions: {
        fetchPokemonList(context) {
            axios
                .get('https://pokeapi.co/api/v2/pokemon/',
                    {
                        params: {
                            limit: 1118
                        }
                    }
                )
                .then((response) => {
                    context.commit('setPokemons', response.data.results);
                    console.log(response.data.results);
                    context.commit('setIsPokemonListFetched', true);
                })
                .catch((error) => {
                    console.log(error);
                });
        }
    }
});

export default store;