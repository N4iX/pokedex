<template>
  <div class="page-content">
    <router-view></router-view>
  </div>
  <footer>
    <div class="created-by">
      <span>Created by <a href="https://github.com/N4iX" target="_blank">Chew Hao Xian</a></span>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'Pokedex',
  components: {
    
  },
  mounted() {
    if (localStorage.getItem('favPokemons')) {
      try {
        const favPokemons = JSON.parse(localStorage.getItem('favPokemons'));
        let transformedList = [];
        favPokemons.forEach((pokemon) => {
          transformedList.push({
            name: pokemon.name,
            url: `https://pokeapi.co/api/v2/pokemon/${pokemon.id}/`
          });
        });
        this.$store.commit('setFavouritePokemonList', transformedList);
      } catch(e) {
        localStorage.removeItem('favPokemons');
      }
    }
  }
}
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap');

* {
  box-sizing: border-box;
}

html {
  font-family: "Roboto", Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  /* margin-top: 60px; */
}

body {
  margin: 0;
  background-color: #e0e0e0;
  color: #313131;
}

.page-content {
  margin-bottom: 2rem;
  min-height: 100vh;
}

footer {
  background-color: #ffffff;
  padding: 1rem;
}

.created-by {
  display: flex;
  justify-content: flex-end;
}

.created-by a {
  font-weight: bold;
  text-decoration: none;
  color: black;
}
</style>
