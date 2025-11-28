import Keycloak from 'keycloak-js';

const kc = Keycloak({
  url: "http://localhost:9090/",
  realm: "DRCCS",
  clientId: "react-frontend"
});

export default kc;