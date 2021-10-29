<template>
    <span class="pokemon-type-tag" :style="{ backgroundColor: pillColor, fontSize: fontSize + 'pt' }">{{ type }}</span>
</template>

<script>
export default {
    props: {
        type: {
            type: String,
            required: true
        },
        fontSize: {
            type: Number,
            requried: false,
            default: 8
        }
    },
    computed: {
        pillColor() {
            const t = this.type.toLowerCase();
            let color;

            switch (t) {
                case 'normal':
                    color = '#A8A878';
                    break;
                case 'fighting':
                    color = '#C03028';
                    break;
                case 'flying':
                    color = '#A890F0';
                    break;
                case 'poison':
                    color = '#A040A0';
                    break;
                case 'ground':
                    color = '#E0C068';
                    break;
                case 'rock':
                    color = '#B8A038';
                    break;
                case 'bug':
                    color = '#A8B820';
                    break;
                case 'ghost':
                    color = '#705898';
                    break;
                case 'steel':
                    color = '#B8B8D0';
                    break;
                case 'fire':
                    color = '#F08030';
                    break;
                case 'water':
                    color = '#6890F0';
                    break;
                case 'grass':
                    color = '#78C850';
                    break;
                case 'electric':
                    color = '#F8D030';
                    break;
                case 'psychic':
                    color = '#F85888';
                    break;
                case 'ice':
                    color = '#98D8D8';
                    break;
                case 'dragon':
                    color = '#7038F8';
                    break;
                case 'dark':
                    color = '#705848';
                    break;
                case 'fairy':
                    color = '#EE99AC';
                    break;
            }
            return color;
        }
    }
}
</script>

<style scoped>
.pokemon-type-tag {
    border-radius: 2px;
    padding: 0.25rem 0.75rem;
    color: #ffffff;
    text-align: center;
}
</style>