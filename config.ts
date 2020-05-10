interface Config {
    blockRegistry: { host: string };
}

interface AuthConfig {
    auth0Audience: string;
    auth0ClientId: string;
    loginUrl: string;
}

interface AuthConstants {
    grant_type: string;
    realm: string;
    scope: string;
}

const authConfig: AuthConfig = {
    auth0Audience:
        process.env.ELEMENT_AUTH0_AUDIENCE || "https://api.material.com/",
    auth0ClientId:
        process.env.ELEMENT_AUTH0_CLIENT_ID ||
        "wklYa7h557v4NT4XZsH3epPYzKEtkPrZ",
    loginUrl:
        process.env.ELEMENT_LOGIN_URL ||
        "https://material.auth0.com/oauth/token",
};

const config: Config = {
    blockRegistry: {
        host:
            process.env.ELEMENT_BLOCK_REGISTRY_URI ||
            "https://btr.v2-prod.volusion.com",
    },
};

const authInformation: AuthConfig & AuthConstants = Object.assign(
    {},
    {
        grant_type: "http://auth0.com/oauth/grant-type/password-realm",
        realm: "Username-Password-Authentication",
        scope: "openid profile",
    },
    authConfig
);

const activeConfig: Config & AuthConfig & AuthConstants = Object.assign(
    {},
    config,
    authInformation
);

export default activeConfig;
