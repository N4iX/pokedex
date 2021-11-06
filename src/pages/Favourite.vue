<template>
    <div class="favourite-container">
        <div class="page-title">
            <h2>Favourite Pokémons</h2>
        </div>
        <pokemon-list
            :fullPokemonList="favouritePokemonList"
            :isAllFavourite="true"
            :canFavourite="false"
            :pageLimit="20"
        ></pokemon-list>
        <router-link to="/home" class="button-home">&#10094;</router-link>
    </div>
</template>

<script>
import PokemonList from '../components/pokemons/PokemonList.vue';

export default {
    components: {
        PokemonList
    },
    data() {
        return {
            favouritePokemonList: []
        }
    },
    created() {
        // get the favourite pokemon list at the start
        this.getFavouritePokemonList();
    },
    methods: {
        getFavouritePokemonList() {
            // get favourite pokemon list from Vuex store getter
            const favourites = JSON.parse(JSON.stringify(this.$store.getters.getFavouritePokemonList));
            // favourite list is not empty
            this.favouritePokemonList = favourites;
        }
    },
}
</script>

<style scoped>
a {
    text-decoration: none;
}

.favourite-container {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.button-home {
    position: fixed;
    top: 50%;
    left: 0;
    padding: 0.3rem 0.5rem 0.5rem 0.3rem;
    font-size: 20pt;
    color: #424242;
    background: #ffffff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.26);
    margin-right: -0.25rem;
}

.button-home:hover {
    cursor: pointer;
    color: #ffffff;
    background: #424242;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
}

@media screen and (max-width: 700px) {
    .button-home {
        padding: 0.3rem 0.25rem 0.4rem 0.15rem;
        font-size: 16pt;
    }
}

.page-title {
    background-color: #9e9e9e;
    color: #ffffff;
    width: 100%;
    margin-bottom: 2rem;
}
</style>