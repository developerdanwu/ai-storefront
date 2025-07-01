export default {
  providers: [
    {
      type: "customJwt",
      applicationID: "convex-workos",
      issuer:
        "https://api.workos.com/user_management/client_01JZ1W1V23WK1AP2CRCEE72KAS",
      jwks: `https://api.workos.com/sso/jwks/${process.env.WORKOS_CLIENT_ID}`,
      algorithm: "RS256",
    },
  ],
};
