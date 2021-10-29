import { createStore } from 'vuex';
import axios from 'axios';

const store = createStore({
    state: {
        pokemons: [],
        isPokemonListFetched: false,
    },
    getters: {
        getPokemons: (state) => (limit) => {
            return [...state.pokemons].slice(0, limit);
        },
        getisPokemonListFetched(state) {
            return state.isPokemonListFetched;
        }
    },
    mutations: {
        setPokemons(state, payload) {
            state.pokemons = payload;
        },
        setIsPokemonListFetched(state, payload) {
            state.isPokemonListFetched = payload;
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