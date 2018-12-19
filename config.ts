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

const devAuthConfig: AuthConfig = {
    auth0Audience: "https://sandbox.api.material.com",
    auth0ClientId: "ffh6DBHImNf7ZoTlL0sRmQU3EQ2iDuUx",
    loginUrl: "https://materialsandbox.auth0.com/oauth/token",
};

const prodAuthConfig: AuthConfig = {
    auth0Audience: "https://api.material.com/",
    auth0ClientId: "wklYa7h557v4NT4XZsH3epPYzKEtkPrZ",
    loginUrl: "https://material.auth0.com/oauth/token",
};

const config: Config = {
    blockRegistry: {
        host:
            process.env.BLOCK_REGISTRY_URI ||
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
    process.env.VOL_CLI_DEV ? devAuthConfig : prodAuthConfig
);

const activeConfig: Config & AuthConfig & AuthConstants = Object.assign(
    {},
    config,
    authInformation
);

export default activeConfig;
