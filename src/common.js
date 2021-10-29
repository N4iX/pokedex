function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function removeExtraPokemons(pokemonList) {
    return pokemonList.filter((pokemon) => getPokemonIdFromUrl(pokemon.url) <= 898);
}

function getPokemonIdFromUrl(url) {
    const numStr = url.match(/pokemon\/(\d+)\//);
    return parseInt(numStr[1]);
}

export { capitalizeFirstLetter, removeExtraPokemons, getPokemonIdFromUrl };