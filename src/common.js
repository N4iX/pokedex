const pokemonTotalCount = 898;

function capitalizeFirstLetter(string) {
    if (!string || string.length === 0) {
        return null;
    }
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function removeExtraPokemons(pokemonList) {
    return pokemonList.filter((pokemon) => getPokemonIdFromUrl(pokemon.url) <= pokemonTotalCount);
}

function getPokemonIdFromUrl(url) {
    const numStr = url.match(/pokemon\/(\d+)\//);
    return parseInt(numStr[1]);
}

function isNumeric(value) {
    return /^-?\d+$/.test(value);
}

function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}

function compareByIdAsc(a, b) {
    if (a.id < b.id) {
        return -1;
    }
    if (a.id > b.id) {
        return 1;
    }
    return 0;
}

function compareByIdDesc(a, b) {
    if (a.id < b.id) {
        return 1;
    }
    if (a.id > b.id) {
        return -1;
    }
    return 0;
}

function compareByUrlAsc(a, b) {
    if (getPokemonIdFromUrl(a.url) < getPokemonIdFromUrl(b.url)) {
        return -1;
    }
    if (getPokemonIdFromUrl(a.url) > getPokemonIdFromUrl(b.url)) {
        return 1;
    }
    return 0;
}

function compareByUrlDesc(a, b) {
    if (getPokemonIdFromUrl(a.url) < getPokemonIdFromUrl(b.url)) {
        return 1;
    }
    if (getPokemonIdFromUrl(a.url) > getPokemonIdFromUrl(b.url)) {
        return -1;
    }
    return 0;
}

export {
    capitalizeFirstLetter,
    removeExtraPokemons,
    getPokemonIdFromUrl,
    isNumeric,
    pokemonTotalCount,
    onlyUnique,
    compareByIdAsc,
    compareByIdDesc,
    compareByUrlAsc,
    compareByUrlDesc
};