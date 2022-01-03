import cache from './cache'

export default function(_ctx) {

    return {
        httpEndpoint: `${process.env.NUXT_ENV_API_HOST}/graphql`,
        cache,
    }

}
