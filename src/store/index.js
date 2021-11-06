import { createStore } from 'vuex';

const store = createStore({
    state: {
        favouritePokemonList: []
    },
    getters: {
        getFavouritePokemonList(state) {
            return [...state.favouritePokemonList];
        },
        getIsFavouritePokemon: (state) => (pokemonName) => {
            return (state.favouritePokemonList.map((pokemon) => pokemon.name).indexOf(pokemonName) !== -1);
        }
    },
    mutations: {
        setFavouritePokemonList(state, payload) {
            state.favouritePokemonList = payload;
        }
    },
    actions: {}
});

export default store;