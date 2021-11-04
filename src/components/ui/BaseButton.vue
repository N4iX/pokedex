<template>
    <button v-if="!isLink">
        <slot></slot>
    </button>
    <router-link v-else :to="to">
        <slot></slot>
    </router-link>
</template>

<script>
export default {
    props: {
        isLink: {
            type: Boolean,
            required: false,
            default: false
        },
        to: {
            type: String,
            required: false,
            default: '/'
        }
    },
}
</script>

<style scoped>
button,
a {
    cursor: pointer;
    text-decoration: none;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0.5rem 1rem;
    border-radius: 5px;
    background-color: #ffffff;
    color: #808080;
    border: none;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.26);
    font: inherit;
}

a:hover,
a:active,
button:hover,
button:active {
    color: #000000;
}

a:hover,
button:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.50);
}
</style>