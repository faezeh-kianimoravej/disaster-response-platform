--
-- PostgreSQL database dump
--

\restrict 8o2dj2mo7CVqGkvSBdDDwjG1GVWTjUqPUFMcVaAC5uQo7hbteU4UfqK3Hls4eyq

-- Dumped from database version 16.10 (Debian 16.10-1.pgdg13+1)
-- Dumped by pg_dump version 18.0

-- Started on 2025-11-28 13:36:46

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 250 (class 1259 OID 17351)
-- Name: admin_event_entity; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.admin_event_entity (
    id character varying(36) NOT NULL,
    admin_event_time bigint,
    realm_id character varying(255),
    operation_type character varying(255),
    auth_realm_id character varying(255),
    auth_client_id character varying(255),
    auth_user_id character varying(255),
    ip_address character varying(255),
    resource_path character varying(2550),
    representation text,
    error character varying(255),
    resource_type character varying(64),
    details_json text
);


ALTER TABLE public.admin_event_entity OWNER TO postgres;

--
-- TOC entry 277 (class 1259 OID 17794)
-- Name: associated_policy; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.associated_policy (
    policy_id character varying(36) NOT NULL,
    associated_policy_id character varying(36) NOT NULL
);


ALTER TABLE public.associated_policy OWNER TO postgres;

--
-- TOC entry 253 (class 1259 OID 17366)
-- Name: authentication_execution; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.authentication_execution (
    id character varying(36) NOT NULL,
    alias character varying(255),
    authenticator character varying(36),
    realm_id character varying(36),
    flow_id character varying(36),
    requirement integer,
    priority integer,
    authenticator_flow boolean DEFAULT false NOT NULL,
    auth_flow_id character varying(36),
    auth_config character varying(36)
);


ALTER TABLE public.authentication_execution OWNER TO postgres;

--
-- TOC entry 252 (class 1259 OID 17361)
-- Name: authentication_flow; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.authentication_flow (
    id character varying(36) NOT NULL,
    alias character varying(255),
    description character varying(255),
    realm_id character varying(36),
    provider_id character varying(36) DEFAULT 'basic-flow'::character varying NOT NULL,
    top_level boolean DEFAULT false NOT NULL,
    built_in boolean DEFAULT false NOT NULL
);


ALTER TABLE public.authentication_flow OWNER TO postgres;

--
-- TOC entry 251 (class 1259 OID 17356)
-- Name: authenticator_config; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.authenticator_config (
    id character varying(36) NOT NULL,
    alias character varying(255),
    realm_id character varying(36)
);


ALTER TABLE public.authenticator_config OWNER TO postgres;

--
-- TOC entry 254 (class 1259 OID 17371)
-- Name: authenticator_config_entry; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.authenticator_config_entry (
    authenticator_id character varying(36) NOT NULL,
    value text,
    name character varying(255) NOT NULL
);


ALTER TABLE public.authenticator_config_entry OWNER TO postgres;

--
-- TOC entry 278 (class 1259 OID 17809)
-- Name: broker_link; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.broker_link (
    identity_provider character varying(255) NOT NULL,
    storage_provider_id character varying(255),
    realm_id character varying(36) NOT NULL,
    broker_user_id character varying(255),
    broker_username character varying(255),
    token text,
    user_id character varying(255) NOT NULL
);


ALTER TABLE public.broker_link OWNER TO postgres;

--
-- TOC entry 217 (class 1259 OID 16732)
-- Name: client; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.client (
    id character varying(36) NOT NULL,
    enabled boolean DEFAULT false NOT NULL,
    full_scope_allowed boolean DEFAULT false NOT NULL,
    client_id character varying(255),
    not_before integer,
    public_client boolean DEFAULT false NOT NULL,
    secret character varying(255),
    base_url character varying(255),
    bearer_only boolean DEFAULT false NOT NULL,
    management_url character varying(255),
    surrogate_auth_required boolean DEFAULT false NOT NULL,
    realm_id character varying(36),
    protocol character varying(255),
    node_rereg_timeout integer DEFAULT 0,
    frontchannel_logout boolean DEFAULT false NOT NULL,
    consent_required boolean DEFAULT false NOT NULL,
    name character varying(255),
    service_accounts_enabled boolean DEFAULT false NOT NULL,
    client_authenticator_type character varying(255),
    root_url character varying(255),
    description character varying(255),
    registration_token character varying(255),
    standard_flow_enabled boolean DEFAULT true NOT NULL,
    implicit_flow_enabled boolean DEFAULT false NOT NULL,
    direct_access_grants_enabled boolean DEFAULT false NOT NULL,
    always_display_in_console boolean DEFAULT false NOT NULL
);


ALTER TABLE public.client OWNER TO postgres;

--
-- TOC entry 237 (class 1259 OID 17090)
-- Name: client_attributes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.client_attributes (
    client_id character varying(36) NOT NULL,
    name character varying(255) NOT NULL,
    value text
);


ALTER TABLE public.client_attributes OWNER TO postgres;

--
-- TOC entry 289 (class 1259 OID 18058)
-- Name: client_auth_flow_bindings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.client_auth_flow_bindings (
    client_id character varying(36) NOT NULL,
    flow_id character varying(36),
    binding_name character varying(255) NOT NULL
);


ALTER TABLE public.client_auth_flow_bindings OWNER TO postgres;

--
-- TOC entry 288 (class 1259 OID 17933)
-- Name: client_initial_access; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.client_initial_access (
    id character varying(36) NOT NULL,
    realm_id character varying(36) NOT NULL,
    "timestamp" integer,
    expiration integer,
    count integer,
    remaining_count integer
);


ALTER TABLE public.client_initial_access OWNER TO postgres;

--
-- TOC entry 238 (class 1259 OID 17100)
-- Name: client_node_registrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.client_node_registrations (
    client_id character varying(36) NOT NULL,
    value integer,
    name character varying(255) NOT NULL
);


ALTER TABLE public.client_node_registrations OWNER TO postgres;

--
-- TOC entry 266 (class 1259 OID 17599)
-- Name: client_scope; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.client_scope (
    id character varying(36) NOT NULL,
    name character varying(255),
    realm_id character varying(36),
    description character varying(255),
    protocol character varying(255)
);


ALTER TABLE public.client_scope OWNER TO postgres;

--
-- TOC entry 267 (class 1259 OID 17613)
-- Name: client_scope_attributes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.client_scope_attributes (
    scope_id character varying(36) NOT NULL,
    value character varying(2048),
    name character varying(255) NOT NULL
);


ALTER TABLE public.client_scope_attributes OWNER TO postgres;

--
-- TOC entry 290 (class 1259 OID 18099)
-- Name: client_scope_client; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.client_scope_client (
    client_id character varying(255) NOT NULL,
    scope_id character varying(255) NOT NULL,
    default_scope boolean DEFAULT false NOT NULL
);


ALTER TABLE public.client_scope_client OWNER TO postgres;

--
-- TOC entry 268 (class 1259 OID 17618)
-- Name: client_scope_role_mapping; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.client_scope_role_mapping (
    scope_id character varying(36) NOT NULL,
    role_id character varying(36) NOT NULL
);


ALTER TABLE public.client_scope_role_mapping OWNER TO postgres;

--
-- TOC entry 286 (class 1259 OID 17854)
-- Name: component; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.component (
    id character varying(36) NOT NULL,
    name character varying(255),
    parent_id character varying(36),
    provider_id character varying(36),
    provider_type character varying(255),
    realm_id character varying(36),
    sub_type character varying(255)
);


ALTER TABLE public.component OWNER TO postgres;

--
-- TOC entry 285 (class 1259 OID 17849)
-- Name: component_config; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.component_config (
    id character varying(36) NOT NULL,
    component_id character varying(36) NOT NULL,
    name character varying(255) NOT NULL,
    value text
);


ALTER TABLE public.component_config OWNER TO postgres;

--
-- TOC entry 218 (class 1259 OID 16751)
-- Name: composite_role; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.composite_role (
    composite character varying(36) NOT NULL,
    child_role character varying(36) NOT NULL
);


ALTER TABLE public.composite_role OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 16754)
-- Name: credential; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.credential (
    id character varying(36) NOT NULL,
    salt bytea,
    type character varying(255),
    user_id character varying(36),
    created_date bigint,
    user_label character varying(255),
    secret_data text,
    credential_data text,
    priority integer
);


ALTER TABLE public.credential OWNER TO postgres;

--
-- TOC entry 216 (class 1259 OID 16724)
-- Name: databasechangelog; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.databasechangelog (
    id character varying(255) NOT NULL,
    author character varying(255) NOT NULL,
    filename character varying(255) NOT NULL,
    dateexecuted timestamp without time zone NOT NULL,
    orderexecuted integer NOT NULL,
    exectype character varying(10) NOT NULL,
    md5sum character varying(35),
    description character varying(255),
    comments character varying(255),
    tag character varying(255),
    liquibase character varying(20),
    contexts character varying(255),
    labels character varying(255),
    deployment_id character varying(10)
);


ALTER TABLE public.databasechangelog OWNER TO postgres;

--
-- TOC entry 215 (class 1259 OID 16719)
-- Name: databasechangeloglock; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.databasechangeloglock (
    id integer NOT NULL,
    locked boolean NOT NULL,
    lockgranted timestamp without time zone,
    lockedby character varying(255)
);


ALTER TABLE public.databasechangeloglock OWNER TO postgres;

--
-- TOC entry 291 (class 1259 OID 18115)
-- Name: default_client_scope; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.default_client_scope (
    realm_id character varying(36) NOT NULL,
    scope_id character varying(36) NOT NULL,
    default_scope boolean DEFAULT false NOT NULL
);


ALTER TABLE public.default_client_scope OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 16759)
-- Name: event_entity; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.event_entity (
    id character varying(36) NOT NULL,
    client_id character varying(255),
    details_json character varying(2550),
    error character varying(255),
    ip_address character varying(255),
    realm_id character varying(255),
    session_id character varying(255),
    event_time bigint,
    type character varying(255),
    user_id character varying(255),
    details_json_long_value text
);


ALTER TABLE public.event_entity OWNER TO postgres;

--
-- TOC entry 279 (class 1259 OID 17814)
-- Name: fed_user_attribute; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.fed_user_attribute (
    id character varying(36) NOT NULL,
    name character varying(255) NOT NULL,
    user_id character varying(255) NOT NULL,
    realm_id character varying(36) NOT NULL,
    storage_provider_id character varying(36),
    value character varying(2024),
    long_value_hash bytea,
    long_value_hash_lower_case bytea,
    long_value text
);


ALTER TABLE public.fed_user_attribute OWNER TO postgres;

--
-- TOC entry 280 (class 1259 OID 17819)
-- Name: fed_user_consent; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.fed_user_consent (
    id character varying(36) NOT NULL,
    client_id character varying(255),
    user_id character varying(255) NOT NULL,
    realm_id character varying(36) NOT NULL,
    storage_provider_id character varying(36),
    created_date bigint,
    last_updated_date bigint,
    client_storage_provider character varying(36),
    external_client_id character varying(255)
);


ALTER TABLE public.fed_user_consent OWNER TO postgres;

--
-- TOC entry 293 (class 1259 OID 18141)
-- Name: fed_user_consent_cl_scope; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.fed_user_consent_cl_scope (
    user_consent_id character varying(36) NOT NULL,
    scope_id character varying(36) NOT NULL
);


ALTER TABLE public.fed_user_consent_cl_scope OWNER TO postgres;

--
-- TOC entry 281 (class 1259 OID 17828)
-- Name: fed_user_credential; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.fed_user_credential (
    id character varying(36) NOT NULL,
    salt bytea,
    type character varying(255),
    created_date bigint,
    user_id character varying(255) NOT NULL,
    realm_id character varying(36) NOT NULL,
    storage_provider_id character varying(36),
    user_label character varying(255),
    secret_data text,
    credential_data text,
    priority integer
);


ALTER TABLE public.fed_user_credential OWNER TO postgres;

--
-- TOC entry 282 (class 1259 OID 17837)
-- Name: fed_user_group_membership; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.fed_user_group_membership (
    group_id character varying(36) NOT NULL,
    user_id character varying(255) NOT NULL,
    realm_id character varying(36) NOT NULL,
    storage_provider_id character varying(36)
);


ALTER TABLE public.fed_user_group_membership OWNER TO postgres;

--
-- TOC entry 283 (class 1259 OID 17840)
-- Name: fed_user_required_action; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.fed_user_required_action (
    required_action character varying(255) DEFAULT ' '::character varying NOT NULL,
    user_id character varying(255) NOT NULL,
    realm_id character varying(36) NOT NULL,
    storage_provider_id character varying(36)
);


ALTER TABLE public.fed_user_required_action OWNER TO postgres;

--
-- TOC entry 284 (class 1259 OID 17846)
-- Name: fed_user_role_mapping; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.fed_user_role_mapping (
    role_id character varying(36) NOT NULL,
    user_id character varying(255) NOT NULL,
    realm_id character varying(36) NOT NULL,
    storage_provider_id character varying(36)
);


ALTER TABLE public.fed_user_role_mapping OWNER TO postgres;

--
-- TOC entry 241 (class 1259 OID 17136)
-- Name: federated_identity; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.federated_identity (
    identity_provider character varying(255) NOT NULL,
    realm_id character varying(36),
    federated_user_id character varying(255),
    federated_username character varying(255),
    token text,
    user_id character varying(36) NOT NULL
);


ALTER TABLE public.federated_identity OWNER TO postgres;

--
-- TOC entry 287 (class 1259 OID 17911)
-- Name: federated_user; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.federated_user (
    id character varying(255) NOT NULL,
    storage_provider_id character varying(255),
    realm_id character varying(36) NOT NULL
);


ALTER TABLE public.federated_user OWNER TO postgres;

--
-- TOC entry 263 (class 1259 OID 17538)
-- Name: group_attribute; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.group_attribute (
    id character varying(36) DEFAULT 'sybase-needs-something-here'::character varying NOT NULL,
    name character varying(255) NOT NULL,
    value character varying(255),
    group_id character varying(36) NOT NULL
);


ALTER TABLE public.group_attribute OWNER TO postgres;

--
-- TOC entry 262 (class 1259 OID 17535)
-- Name: group_role_mapping; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.group_role_mapping (
    role_id character varying(36) NOT NULL,
    group_id character varying(36) NOT NULL
);


ALTER TABLE public.group_role_mapping OWNER TO postgres;

--
-- TOC entry 242 (class 1259 OID 17141)
-- Name: identity_provider; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.identity_provider (
    internal_id character varying(36) NOT NULL,
    enabled boolean DEFAULT false NOT NULL,
    provider_alias character varying(255),
    provider_id character varying(255),
    store_token boolean DEFAULT false NOT NULL,
    authenticate_by_default boolean DEFAULT false NOT NULL,
    realm_id character varying(36),
    add_token_role boolean DEFAULT true NOT NULL,
    trust_email boolean DEFAULT false NOT NULL,
    first_broker_login_flow_id character varying(36),
    post_broker_login_flow_id character varying(36),
    provider_display_name character varying(255),
    link_only boolean DEFAULT false NOT NULL,
    organization_id character varying(255),
    hide_on_login boolean DEFAULT false
);


ALTER TABLE public.identity_provider OWNER TO postgres;

--
-- TOC entry 243 (class 1259 OID 17150)
-- Name: identity_provider_config; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.identity_provider_config (
    identity_provider_id character varying(36) NOT NULL,
    value text,
    name character varying(255) NOT NULL
);


ALTER TABLE public.identity_provider_config OWNER TO postgres;

--
-- TOC entry 247 (class 1259 OID 17254)
-- Name: identity_provider_mapper; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.identity_provider_mapper (
    id character varying(36) NOT NULL,
    name character varying(255) NOT NULL,
    idp_alias character varying(255) NOT NULL,
    idp_mapper_name character varying(255) NOT NULL,
    realm_id character varying(36) NOT NULL
);


ALTER TABLE public.identity_provider_mapper OWNER TO postgres;

--
-- TOC entry 248 (class 1259 OID 17259)
-- Name: idp_mapper_config; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.idp_mapper_config (
    idp_mapper_id character varying(36) NOT NULL,
    value text,
    name character varying(255) NOT NULL
);


ALTER TABLE public.idp_mapper_config OWNER TO postgres;

--
-- TOC entry 261 (class 1259 OID 17532)
-- Name: keycloak_group; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.keycloak_group (
    id character varying(36) NOT NULL,
    name character varying(255),
    parent_group character varying(36) NOT NULL,
    realm_id character varying(36),
    type integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.keycloak_group OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 16767)
-- Name: keycloak_role; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.keycloak_role (
    id character varying(36) NOT NULL,
    client_realm_constraint character varying(255),
    client_role boolean DEFAULT false NOT NULL,
    description character varying(255),
    name character varying(255),
    realm_id character varying(255),
    client character varying(36),
    realm character varying(36)
);


ALTER TABLE public.keycloak_role OWNER TO postgres;

--
-- TOC entry 246 (class 1259 OID 17251)
-- Name: migration_model; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.migration_model (
    id character varying(36) NOT NULL,
    version character varying(36),
    update_time bigint DEFAULT 0 NOT NULL
);


ALTER TABLE public.migration_model OWNER TO postgres;

--
-- TOC entry 260 (class 1259 OID 17523)
-- Name: offline_client_session; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.offline_client_session (
    user_session_id character varying(36) NOT NULL,
    client_id character varying(255) NOT NULL,
    offline_flag character varying(4) NOT NULL,
    "timestamp" integer,
    data text,
    client_storage_provider character varying(36) DEFAULT 'local'::character varying NOT NULL,
    external_client_id character varying(255) DEFAULT 'local'::character varying NOT NULL,
    version integer DEFAULT 0
);


ALTER TABLE public.offline_client_session OWNER TO postgres;

--
-- TOC entry 259 (class 1259 OID 17518)
-- Name: offline_user_session; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.offline_user_session (
    user_session_id character varying(36) NOT NULL,
    user_id character varying(255) NOT NULL,
    realm_id character varying(36) NOT NULL,
    created_on integer NOT NULL,
    offline_flag character varying(4) NOT NULL,
    data text,
    last_session_refresh integer DEFAULT 0 NOT NULL,
    broker_session_id character varying(1024),
    version integer DEFAULT 0
);


ALTER TABLE public.offline_user_session OWNER TO postgres;

--
-- TOC entry 299 (class 1259 OID 18303)
-- Name: org; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.org (
    id character varying(255) NOT NULL,
    enabled boolean NOT NULL,
    realm_id character varying(255) NOT NULL,
    group_id character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    description character varying(4000),
    alias character varying(255) NOT NULL,
    redirect_url character varying(2048)
);


ALTER TABLE public.org OWNER TO postgres;

--
-- TOC entry 300 (class 1259 OID 18314)
-- Name: org_domain; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.org_domain (
    id character varying(36) NOT NULL,
    name character varying(255) NOT NULL,
    verified boolean NOT NULL,
    org_id character varying(255) NOT NULL
);


ALTER TABLE public.org_domain OWNER TO postgres;

--
-- TOC entry 273 (class 1259 OID 17737)
-- Name: policy_config; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.policy_config (
    policy_id character varying(36) NOT NULL,
    name character varying(255) NOT NULL,
    value text
);


ALTER TABLE public.policy_config OWNER TO postgres;

--
-- TOC entry 239 (class 1259 OID 17125)
-- Name: protocol_mapper; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.protocol_mapper (
    id character varying(36) NOT NULL,
    name character varying(255) NOT NULL,
    protocol character varying(255) NOT NULL,
    protocol_mapper_name character varying(255) NOT NULL,
    client_id character varying(36),
    client_scope_id character varying(36)
);


ALTER TABLE public.protocol_mapper OWNER TO postgres;

--
-- TOC entry 240 (class 1259 OID 17131)
-- Name: protocol_mapper_config; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.protocol_mapper_config (
    protocol_mapper_id character varying(36) NOT NULL,
    value text,
    name character varying(255) NOT NULL
);


ALTER TABLE public.protocol_mapper_config OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 16773)
-- Name: realm; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.realm (
    id character varying(36) NOT NULL,
    access_code_lifespan integer,
    user_action_lifespan integer,
    access_token_lifespan integer,
    account_theme character varying(255),
    admin_theme character varying(255),
    email_theme character varying(255),
    enabled boolean DEFAULT false NOT NULL,
    events_enabled boolean DEFAULT false NOT NULL,
    events_expiration bigint,
    login_theme character varying(255),
    name character varying(255),
    not_before integer,
    password_policy character varying(2550),
    registration_allowed boolean DEFAULT false NOT NULL,
    remember_me boolean DEFAULT false NOT NULL,
    reset_password_allowed boolean DEFAULT false NOT NULL,
    social boolean DEFAULT false NOT NULL,
    ssl_required character varying(255),
    sso_idle_timeout integer,
    sso_max_lifespan integer,
    update_profile_on_soc_login boolean DEFAULT false NOT NULL,
    verify_email boolean DEFAULT false NOT NULL,
    master_admin_client character varying(36),
    login_lifespan integer,
    internationalization_enabled boolean DEFAULT false NOT NULL,
    default_locale character varying(255),
    reg_email_as_username boolean DEFAULT false NOT NULL,
    admin_events_enabled boolean DEFAULT false NOT NULL,
    admin_events_details_enabled boolean DEFAULT false NOT NULL,
    edit_username_allowed boolean DEFAULT false NOT NULL,
    otp_policy_counter integer DEFAULT 0,
    otp_policy_window integer DEFAULT 1,
    otp_policy_period integer DEFAULT 30,
    otp_policy_digits integer DEFAULT 6,
    otp_policy_alg character varying(36) DEFAULT 'HmacSHA1'::character varying,
    otp_policy_type character varying(36) DEFAULT 'totp'::character varying,
    browser_flow character varying(36),
    registration_flow character varying(36),
    direct_grant_flow character varying(36),
    reset_credentials_flow character varying(36),
    client_auth_flow character varying(36),
    offline_session_idle_timeout integer DEFAULT 0,
    revoke_refresh_token boolean DEFAULT false NOT NULL,
    access_token_life_implicit integer DEFAULT 0,
    login_with_email_allowed boolean DEFAULT true NOT NULL,
    duplicate_emails_allowed boolean DEFAULT false NOT NULL,
    docker_auth_flow character varying(36),
    refresh_token_max_reuse integer DEFAULT 0,
    allow_user_managed_access boolean DEFAULT false NOT NULL,
    sso_max_lifespan_remember_me integer DEFAULT 0 NOT NULL,
    sso_idle_timeout_remember_me integer DEFAULT 0 NOT NULL,
    default_role character varying(255)
);


ALTER TABLE public.realm OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 16790)
-- Name: realm_attribute; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.realm_attribute (
    name character varying(255) NOT NULL,
    realm_id character varying(36) NOT NULL,
    value text
);


ALTER TABLE public.realm_attribute OWNER TO postgres;

--
-- TOC entry 265 (class 1259 OID 17547)
-- Name: realm_default_groups; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.realm_default_groups (
    realm_id character varying(36) NOT NULL,
    group_id character varying(36) NOT NULL
);


ALTER TABLE public.realm_default_groups OWNER TO postgres;

--
-- TOC entry 245 (class 1259 OID 17243)
-- Name: realm_enabled_event_types; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.realm_enabled_event_types (
    realm_id character varying(36) NOT NULL,
    value character varying(255) NOT NULL
);


ALTER TABLE public.realm_enabled_event_types OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 16798)
-- Name: realm_events_listeners; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.realm_events_listeners (
    realm_id character varying(36) NOT NULL,
    value character varying(255) NOT NULL
);


ALTER TABLE public.realm_events_listeners OWNER TO postgres;

--
-- TOC entry 298 (class 1259 OID 18249)
-- Name: realm_localizations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.realm_localizations (
    realm_id character varying(255) NOT NULL,
    locale character varying(255) NOT NULL,
    texts text NOT NULL
);


ALTER TABLE public.realm_localizations OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 16801)
-- Name: realm_required_credential; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.realm_required_credential (
    type character varying(255) NOT NULL,
    form_label character varying(255),
    input boolean DEFAULT false NOT NULL,
    secret boolean DEFAULT false NOT NULL,
    realm_id character varying(36) NOT NULL
);


ALTER TABLE public.realm_required_credential OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 16808)
-- Name: realm_smtp_config; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.realm_smtp_config (
    realm_id character varying(36) NOT NULL,
    value character varying(255),
    name character varying(255) NOT NULL
);


ALTER TABLE public.realm_smtp_config OWNER TO postgres;

--
-- TOC entry 244 (class 1259 OID 17159)
-- Name: realm_supported_locales; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.realm_supported_locales (
    realm_id character varying(36) NOT NULL,
    value character varying(255) NOT NULL
);


ALTER TABLE public.realm_supported_locales OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 16818)
-- Name: redirect_uris; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.redirect_uris (
    client_id character varying(36) NOT NULL,
    value character varying(255) NOT NULL
);


ALTER TABLE public.redirect_uris OWNER TO postgres;

--
-- TOC entry 258 (class 1259 OID 17482)
-- Name: required_action_config; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.required_action_config (
    required_action_id character varying(36) NOT NULL,
    value text,
    name character varying(255) NOT NULL
);


ALTER TABLE public.required_action_config OWNER TO postgres;

--
-- TOC entry 257 (class 1259 OID 17475)
-- Name: required_action_provider; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.required_action_provider (
    id character varying(36) NOT NULL,
    alias character varying(255),
    name character varying(255),
    realm_id character varying(36),
    enabled boolean DEFAULT false NOT NULL,
    default_action boolean DEFAULT false NOT NULL,
    provider_id character varying(255),
    priority integer
);


ALTER TABLE public.required_action_provider OWNER TO postgres;

--
-- TOC entry 295 (class 1259 OID 18180)
-- Name: resource_attribute; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.resource_attribute (
    id character varying(36) DEFAULT 'sybase-needs-something-here'::character varying NOT NULL,
    name character varying(255) NOT NULL,
    value character varying(255),
    resource_id character varying(36) NOT NULL
);


ALTER TABLE public.resource_attribute OWNER TO postgres;

--
-- TOC entry 275 (class 1259 OID 17764)
-- Name: resource_policy; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.resource_policy (
    resource_id character varying(36) NOT NULL,
    policy_id character varying(36) NOT NULL
);


ALTER TABLE public.resource_policy OWNER TO postgres;

--
-- TOC entry 274 (class 1259 OID 17749)
-- Name: resource_scope; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.resource_scope (
    resource_id character varying(36) NOT NULL,
    scope_id character varying(36) NOT NULL
);


ALTER TABLE public.resource_scope OWNER TO postgres;

--
-- TOC entry 269 (class 1259 OID 17687)
-- Name: resource_server; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.resource_server (
    id character varying(36) NOT NULL,
    allow_rs_remote_mgmt boolean DEFAULT false NOT NULL,
    policy_enforce_mode smallint NOT NULL,
    decision_strategy smallint DEFAULT 1 NOT NULL
);


ALTER TABLE public.resource_server OWNER TO postgres;

--
-- TOC entry 294 (class 1259 OID 18156)
-- Name: resource_server_perm_ticket; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.resource_server_perm_ticket (
    id character varying(36) NOT NULL,
    owner character varying(255) NOT NULL,
    requester character varying(255) NOT NULL,
    created_timestamp bigint NOT NULL,
    granted_timestamp bigint,
    resource_id character varying(36) NOT NULL,
    scope_id character varying(36),
    resource_server_id character varying(36) NOT NULL,
    policy_id character varying(36)
);


ALTER TABLE public.resource_server_perm_ticket OWNER TO postgres;

--
-- TOC entry 272 (class 1259 OID 17723)
-- Name: resource_server_policy; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.resource_server_policy (
    id character varying(36) NOT NULL,
    name character varying(255) NOT NULL,
    description character varying(255),
    type character varying(255) NOT NULL,
    decision_strategy smallint,
    logic smallint,
    resource_server_id character varying(36) NOT NULL,
    owner character varying(255)
);


ALTER TABLE public.resource_server_policy OWNER TO postgres;

--
-- TOC entry 270 (class 1259 OID 17695)
-- Name: resource_server_resource; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.resource_server_resource (
    id character varying(36) NOT NULL,
    name character varying(255) NOT NULL,
    type character varying(255),
    icon_uri character varying(255),
    owner character varying(255) NOT NULL,
    resource_server_id character varying(36) NOT NULL,
    owner_managed_access boolean DEFAULT false NOT NULL,
    display_name character varying(255)
);


ALTER TABLE public.resource_server_resource OWNER TO postgres;

--
-- TOC entry 271 (class 1259 OID 17709)
-- Name: resource_server_scope; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.resource_server_scope (
    id character varying(36) NOT NULL,
    name character varying(255) NOT NULL,
    icon_uri character varying(255),
    resource_server_id character varying(36) NOT NULL,
    display_name character varying(255)
);


ALTER TABLE public.resource_server_scope OWNER TO postgres;

--
-- TOC entry 296 (class 1259 OID 18198)
-- Name: resource_uris; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.resource_uris (
    resource_id character varying(36) NOT NULL,
    value character varying(255) NOT NULL
);


ALTER TABLE public.resource_uris OWNER TO postgres;

--
-- TOC entry 301 (class 1259 OID 18331)
-- Name: revoked_token; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.revoked_token (
    id character varying(255) NOT NULL,
    expire bigint NOT NULL
);


ALTER TABLE public.revoked_token OWNER TO postgres;

--
-- TOC entry 297 (class 1259 OID 18208)
-- Name: role_attribute; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.role_attribute (
    id character varying(36) NOT NULL,
    role_id character varying(36) NOT NULL,
    name character varying(255) NOT NULL,
    value character varying(255)
);


ALTER TABLE public.role_attribute OWNER TO postgres;

--
-- TOC entry 228 (class 1259 OID 16821)
-- Name: scope_mapping; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.scope_mapping (
    client_id character varying(36) NOT NULL,
    role_id character varying(36) NOT NULL
);


ALTER TABLE public.scope_mapping OWNER TO postgres;

--
-- TOC entry 276 (class 1259 OID 17779)
-- Name: scope_policy; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.scope_policy (
    scope_id character varying(36) NOT NULL,
    policy_id character varying(36) NOT NULL
);


ALTER TABLE public.scope_policy OWNER TO postgres;

--
-- TOC entry 230 (class 1259 OID 16827)
-- Name: user_attribute; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_attribute (
    name character varying(255) NOT NULL,
    value character varying(255),
    user_id character varying(36) NOT NULL,
    id character varying(36) DEFAULT 'sybase-needs-something-here'::character varying NOT NULL,
    long_value_hash bytea,
    long_value_hash_lower_case bytea,
    long_value text
);


ALTER TABLE public.user_attribute OWNER TO postgres;

--
-- TOC entry 249 (class 1259 OID 17264)
-- Name: user_consent; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_consent (
    id character varying(36) NOT NULL,
    client_id character varying(255),
    user_id character varying(36) NOT NULL,
    created_date bigint,
    last_updated_date bigint,
    client_storage_provider character varying(36),
    external_client_id character varying(255)
);


ALTER TABLE public.user_consent OWNER TO postgres;

--
-- TOC entry 292 (class 1259 OID 18131)
-- Name: user_consent_client_scope; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_consent_client_scope (
    user_consent_id character varying(36) NOT NULL,
    scope_id character varying(36) NOT NULL
);


ALTER TABLE public.user_consent_client_scope OWNER TO postgres;

--
-- TOC entry 231 (class 1259 OID 16832)
-- Name: user_entity; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_entity (
    id character varying(36) NOT NULL,
    email character varying(255),
    email_constraint character varying(255),
    email_verified boolean DEFAULT false NOT NULL,
    enabled boolean DEFAULT false NOT NULL,
    federation_link character varying(255),
    first_name character varying(255),
    last_name character varying(255),
    realm_id character varying(255),
    username character varying(255),
    created_timestamp bigint,
    service_account_client_link character varying(255),
    not_before integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.user_entity OWNER TO postgres;

--
-- TOC entry 232 (class 1259 OID 16840)
-- Name: user_federation_config; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_federation_config (
    user_federation_provider_id character varying(36) NOT NULL,
    value character varying(255),
    name character varying(255) NOT NULL
);


ALTER TABLE public.user_federation_config OWNER TO postgres;

--
-- TOC entry 255 (class 1259 OID 17376)
-- Name: user_federation_mapper; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_federation_mapper (
    id character varying(36) NOT NULL,
    name character varying(255) NOT NULL,
    federation_provider_id character varying(36) NOT NULL,
    federation_mapper_type character varying(255) NOT NULL,
    realm_id character varying(36) NOT NULL
);


ALTER TABLE public.user_federation_mapper OWNER TO postgres;

--
-- TOC entry 256 (class 1259 OID 17381)
-- Name: user_federation_mapper_config; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_federation_mapper_config (
    user_federation_mapper_id character varying(36) NOT NULL,
    value character varying(255),
    name character varying(255) NOT NULL
);


ALTER TABLE public.user_federation_mapper_config OWNER TO postgres;

--
-- TOC entry 233 (class 1259 OID 16845)
-- Name: user_federation_provider; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_federation_provider (
    id character varying(36) NOT NULL,
    changed_sync_period integer,
    display_name character varying(255),
    full_sync_period integer,
    last_sync integer,
    priority integer,
    provider_name character varying(255),
    realm_id character varying(36)
);


ALTER TABLE public.user_federation_provider OWNER TO postgres;

--
-- TOC entry 264 (class 1259 OID 17544)
-- Name: user_group_membership; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_group_membership (
    group_id character varying(36) NOT NULL,
    user_id character varying(36) NOT NULL,
    membership_type character varying(255) NOT NULL
);


ALTER TABLE public.user_group_membership OWNER TO postgres;

--
-- TOC entry 234 (class 1259 OID 16850)
-- Name: user_required_action; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_required_action (
    user_id character varying(36) NOT NULL,
    required_action character varying(255) DEFAULT ' '::character varying NOT NULL
);


ALTER TABLE public.user_required_action OWNER TO postgres;

--
-- TOC entry 235 (class 1259 OID 16853)
-- Name: user_role_mapping; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_role_mapping (
    role_id character varying(255) NOT NULL,
    user_id character varying(36) NOT NULL
);


ALTER TABLE public.user_role_mapping OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 16824)
-- Name: username_login_failure; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.username_login_failure (
    realm_id character varying(36) NOT NULL,
    username character varying(255) NOT NULL,
    failed_login_not_before integer,
    last_failure bigint,
    last_ip_failure character varying(255),
    num_failures integer
);


ALTER TABLE public.username_login_failure OWNER TO postgres;

--
-- TOC entry 236 (class 1259 OID 16867)
-- Name: web_origins; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.web_origins (
    client_id character varying(36) NOT NULL,
    value character varying(255) NOT NULL
);


ALTER TABLE public.web_origins OWNER TO postgres;

--
-- TOC entry 4231 (class 0 OID 17351)
-- Dependencies: 250
-- Data for Name: admin_event_entity; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.admin_event_entity (id, admin_event_time, realm_id, operation_type, auth_realm_id, auth_client_id, auth_user_id, ip_address, resource_path, representation, error, resource_type, details_json) FROM stdin;
\.


--
-- TOC entry 4258 (class 0 OID 17794)
-- Dependencies: 277
-- Data for Name: associated_policy; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.associated_policy (policy_id, associated_policy_id) FROM stdin;
\.


--
-- TOC entry 4234 (class 0 OID 17366)
-- Dependencies: 253
-- Data for Name: authentication_execution; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.authentication_execution (id, alias, authenticator, realm_id, flow_id, requirement, priority, authenticator_flow, auth_flow_id, auth_config) FROM stdin;
123b2906-1347-49d0-b011-a4e670d429d3	\N	auth-cookie	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	fbd6bbff-cb8b-4845-b97f-ac27cbeb0b0d	2	10	f	\N	\N
dbd48c70-9e13-4691-b7a2-e3e5a956f7df	\N	auth-spnego	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	fbd6bbff-cb8b-4845-b97f-ac27cbeb0b0d	3	20	f	\N	\N
5fd58fb7-6de5-4e1c-8361-dbbe6a170f95	\N	identity-provider-redirector	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	fbd6bbff-cb8b-4845-b97f-ac27cbeb0b0d	2	25	f	\N	\N
e18a23b7-0274-427c-9743-5da21d71d30b	\N	\N	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	fbd6bbff-cb8b-4845-b97f-ac27cbeb0b0d	2	30	t	2469a84f-264c-4100-8ec6-921a164f45b6	\N
c4e7a057-c730-412f-a341-ec803266ecac	\N	auth-username-password-form	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	2469a84f-264c-4100-8ec6-921a164f45b6	0	10	f	\N	\N
be05c3e9-1818-449e-a7f1-1bf4ee6d216a	\N	\N	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	2469a84f-264c-4100-8ec6-921a164f45b6	1	20	t	a74fe8c2-3b39-45ef-a27e-2cd471c7d0f6	\N
3acb4318-0657-488e-871b-d666caf8f1a5	\N	conditional-user-configured	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	a74fe8c2-3b39-45ef-a27e-2cd471c7d0f6	0	10	f	\N	\N
3f7bcb2a-7778-4403-b9d0-9245a7aa5f45	\N	auth-otp-form	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	a74fe8c2-3b39-45ef-a27e-2cd471c7d0f6	0	20	f	\N	\N
068ed6c4-857f-42ba-a521-513dde08619d	\N	direct-grant-validate-username	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	ce21466a-5ba5-463d-80d2-256731a2af06	0	10	f	\N	\N
f08752ec-c0ae-4157-a0ac-0c2034cd9ee8	\N	direct-grant-validate-password	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	ce21466a-5ba5-463d-80d2-256731a2af06	0	20	f	\N	\N
73006343-b9c4-4bb4-8aeb-4689f21fc253	\N	\N	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	ce21466a-5ba5-463d-80d2-256731a2af06	1	30	t	475be45e-0b0c-4036-ae68-1bdda683bbe8	\N
edaeeb27-6eb4-467c-910d-645f8124228a	\N	conditional-user-configured	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	475be45e-0b0c-4036-ae68-1bdda683bbe8	0	10	f	\N	\N
5e6ea20e-ef50-44fb-b876-f7e375a86851	\N	direct-grant-validate-otp	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	475be45e-0b0c-4036-ae68-1bdda683bbe8	0	20	f	\N	\N
66fbba07-143f-4e8f-9e0f-e0fe5fc839d9	\N	registration-page-form	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	70ff9c56-bff4-47d7-9960-011348932622	0	10	t	e849fe07-7978-4c9b-84e9-637996b1fb0b	\N
2f0bc14a-1904-4c7e-94bb-c39c3670eea8	\N	registration-user-creation	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	e849fe07-7978-4c9b-84e9-637996b1fb0b	0	20	f	\N	\N
26cd4f28-d996-4206-9e44-9966a1efacb5	\N	registration-password-action	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	e849fe07-7978-4c9b-84e9-637996b1fb0b	0	50	f	\N	\N
d581fb8e-f13d-480b-9450-8f785e1521fb	\N	registration-recaptcha-action	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	e849fe07-7978-4c9b-84e9-637996b1fb0b	3	60	f	\N	\N
c4e8690e-bfad-4862-91b9-ebc317a8e573	\N	registration-terms-and-conditions	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	e849fe07-7978-4c9b-84e9-637996b1fb0b	3	70	f	\N	\N
497d2bed-c72a-46b3-9ce1-72f23323e18f	\N	reset-credentials-choose-user	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	3e0d6dab-3d16-4e66-b042-a3466ebaca2f	0	10	f	\N	\N
71773a09-6fa4-422f-8bfb-06e76ad79a35	\N	reset-credential-email	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	3e0d6dab-3d16-4e66-b042-a3466ebaca2f	0	20	f	\N	\N
524b685a-44e1-49c5-8689-3e752ae3752d	\N	reset-password	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	3e0d6dab-3d16-4e66-b042-a3466ebaca2f	0	30	f	\N	\N
0309f4af-c3d5-4175-9afb-f71337425648	\N	\N	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	3e0d6dab-3d16-4e66-b042-a3466ebaca2f	1	40	t	4b17e93e-9cde-4675-9c3b-5a0bdf5f16b8	\N
8e2a4c0e-6cc8-4eb6-982c-695f7d173b14	\N	conditional-user-configured	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	4b17e93e-9cde-4675-9c3b-5a0bdf5f16b8	0	10	f	\N	\N
69de7bbc-229b-4824-b06c-452a61d4af9b	\N	reset-otp	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	4b17e93e-9cde-4675-9c3b-5a0bdf5f16b8	0	20	f	\N	\N
7a0ad800-af9b-4b92-88ed-6284a740c488	\N	client-secret	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	96d200d2-864d-4ee9-8291-b838544fe5cf	2	10	f	\N	\N
75055787-d7bd-4ea2-9dd6-203fac5b1b2a	\N	client-jwt	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	96d200d2-864d-4ee9-8291-b838544fe5cf	2	20	f	\N	\N
cff2ff96-6c2a-487e-bc41-6ced1fa9a3a0	\N	client-secret-jwt	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	96d200d2-864d-4ee9-8291-b838544fe5cf	2	30	f	\N	\N
b460d584-8878-4227-8bd9-154ff9eaffaa	\N	client-x509	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	96d200d2-864d-4ee9-8291-b838544fe5cf	2	40	f	\N	\N
1058eee3-ad80-44d5-9ce0-6cf17b1417c5	\N	idp-review-profile	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	4c670a16-99e2-494b-8b91-fe3433e3b693	0	10	f	\N	71409ed1-c83e-4692-9f8c-e2a6bf6cdc93
b3bebd6e-d817-413f-aeb4-ccf7784f6c94	\N	\N	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	4c670a16-99e2-494b-8b91-fe3433e3b693	0	20	t	909ee491-6c5d-42f2-ade0-3d6ecc7d4576	\N
df8ddb51-11ec-43d7-bb0b-3aadc9df7e22	\N	idp-create-user-if-unique	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	909ee491-6c5d-42f2-ade0-3d6ecc7d4576	2	10	f	\N	5b450a47-fde6-4ee7-9dc3-95a4c0108ac0
f0df4516-824e-47dc-b200-ff6ae807d174	\N	\N	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	909ee491-6c5d-42f2-ade0-3d6ecc7d4576	2	20	t	f8c228bc-f889-4f53-b158-4bdb4de4be14	\N
816c48b3-fb4d-40c9-a9e0-9d810ee4fc5f	\N	idp-confirm-link	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	f8c228bc-f889-4f53-b158-4bdb4de4be14	0	10	f	\N	\N
3047f114-ec95-4c83-9f1a-8e89432aeb61	\N	\N	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	f8c228bc-f889-4f53-b158-4bdb4de4be14	0	20	t	9697259a-b246-48ad-bdff-5d77d2165884	\N
b1fb04d3-e224-4f29-b278-48af9eb2c8f4	\N	idp-email-verification	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	9697259a-b246-48ad-bdff-5d77d2165884	2	10	f	\N	\N
e29ef744-6d19-4d82-b9c6-0cde44231528	\N	\N	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	9697259a-b246-48ad-bdff-5d77d2165884	2	20	t	202a3867-cfcf-4427-9152-8333d5d4959d	\N
7d2b739b-2b90-4c5e-82ab-6b9332564535	\N	idp-username-password-form	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	202a3867-cfcf-4427-9152-8333d5d4959d	0	10	f	\N	\N
58bfc074-e61a-41dd-b29b-717b3775eca8	\N	\N	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	202a3867-cfcf-4427-9152-8333d5d4959d	1	20	t	6430b290-5576-4711-bfc7-147928548b23	\N
9d27b46b-1058-4bd8-ad5e-ff2cdde2280d	\N	conditional-user-configured	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	6430b290-5576-4711-bfc7-147928548b23	0	10	f	\N	\N
b5a8c9f3-5ee5-4c77-8446-4eee3edab34f	\N	auth-otp-form	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	6430b290-5576-4711-bfc7-147928548b23	0	20	f	\N	\N
8f3669b6-3a10-41d3-a63f-41048a742244	\N	http-basic-authenticator	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	5b20f95c-047b-429b-8fa8-5e0e2e5a78e2	0	10	f	\N	\N
1130cb5c-48c7-4ef2-ab3f-02597a34ec57	\N	docker-http-basic-authenticator	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	fc958837-0296-4e72-94a1-887982eace1e	0	10	f	\N	\N
ac9fbdde-4d34-488f-b29c-3a9d3b178746	\N	auth-cookie	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	bededb6e-f2cb-4b4e-872b-4327e77f4fb8	2	10	f	\N	\N
24b0256b-c09b-4a25-8cf8-cd2faffed5e7	\N	auth-spnego	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	bededb6e-f2cb-4b4e-872b-4327e77f4fb8	3	20	f	\N	\N
8a870fe6-bb46-4ab6-9bbb-b121ad71eed3	\N	identity-provider-redirector	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	bededb6e-f2cb-4b4e-872b-4327e77f4fb8	2	25	f	\N	\N
9182d442-8725-4ad5-9156-335af0ad72e9	\N	\N	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	bededb6e-f2cb-4b4e-872b-4327e77f4fb8	2	30	t	3a9f9e3d-8920-40b2-bdc2-8dd92099b4d7	\N
943420d2-fcd3-4028-af66-b45d722ee24d	\N	auth-username-password-form	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	3a9f9e3d-8920-40b2-bdc2-8dd92099b4d7	0	10	f	\N	\N
3a4a08fa-2bab-4fb0-8448-9b53c3f1e154	\N	\N	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	3a9f9e3d-8920-40b2-bdc2-8dd92099b4d7	1	20	t	3d8b60f2-c6e3-429b-b7c4-6acae88e9428	\N
bff49154-b396-45ec-9fab-e18eea48263f	\N	conditional-user-configured	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	3d8b60f2-c6e3-429b-b7c4-6acae88e9428	0	10	f	\N	\N
cb35b591-c9ab-4a9a-bdb5-ca76395ff890	\N	auth-otp-form	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	3d8b60f2-c6e3-429b-b7c4-6acae88e9428	0	20	f	\N	\N
9ad03476-da47-4f9a-9f31-e825ed0d90c8	\N	\N	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	bededb6e-f2cb-4b4e-872b-4327e77f4fb8	2	26	t	5598c64f-217c-4c6a-b2f1-d44628cb35d1	\N
7a6752e5-38dc-481f-8bf4-4b1c11445bfb	\N	\N	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	5598c64f-217c-4c6a-b2f1-d44628cb35d1	1	10	t	aa99b207-2daa-4b98-853d-b0398ac7b5e8	\N
5a5175ec-362a-4452-ba1d-809a700525ed	\N	conditional-user-configured	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	aa99b207-2daa-4b98-853d-b0398ac7b5e8	0	10	f	\N	\N
d6184dd7-7145-477b-a6b1-02cdf2b2743a	\N	organization	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	aa99b207-2daa-4b98-853d-b0398ac7b5e8	2	20	f	\N	\N
52500788-f837-4879-80d5-f7964bb11e13	\N	direct-grant-validate-username	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	43e421b4-e2c8-47c4-9671-b0f7a0b93391	0	10	f	\N	\N
29b43c8f-5807-4512-9276-065a4eb76f09	\N	direct-grant-validate-password	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	43e421b4-e2c8-47c4-9671-b0f7a0b93391	0	20	f	\N	\N
9b6c5542-da80-4375-926e-12df5655ed55	\N	\N	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	43e421b4-e2c8-47c4-9671-b0f7a0b93391	1	30	t	c41ab463-7118-459e-91fa-71888a7d6b8f	\N
0fa006e6-2130-4e6d-9e44-0863e6912381	\N	conditional-user-configured	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	c41ab463-7118-459e-91fa-71888a7d6b8f	0	10	f	\N	\N
f10b2368-28d9-41c5-9d74-72ffe3c0ca76	\N	direct-grant-validate-otp	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	c41ab463-7118-459e-91fa-71888a7d6b8f	0	20	f	\N	\N
9e613ce9-0601-4bf4-b036-3effaedb7984	\N	registration-page-form	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	cb02a013-ac6b-4b1e-8ec8-f19d9845d2bd	0	10	t	8228158a-31ad-4cb3-b1ee-bb9d8f2b8515	\N
49d51921-2b1b-4924-a146-b73f8b896520	\N	registration-user-creation	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	8228158a-31ad-4cb3-b1ee-bb9d8f2b8515	0	20	f	\N	\N
7eab5348-8968-42d5-925e-6916b937a35b	\N	registration-password-action	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	8228158a-31ad-4cb3-b1ee-bb9d8f2b8515	0	50	f	\N	\N
1ea1087f-cf49-44d9-aca9-7e6c513394b7	\N	registration-recaptcha-action	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	8228158a-31ad-4cb3-b1ee-bb9d8f2b8515	3	60	f	\N	\N
3a1c5b4b-dae7-4e37-acd2-3f1632858976	\N	registration-terms-and-conditions	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	8228158a-31ad-4cb3-b1ee-bb9d8f2b8515	3	70	f	\N	\N
772b735c-bab1-4450-ba2b-8821329f950c	\N	reset-credentials-choose-user	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	17d7e656-b44e-4d7a-837e-42c1d9213ba9	0	10	f	\N	\N
625a6015-a9f3-42b0-b2d2-93828784f16f	\N	reset-credential-email	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	17d7e656-b44e-4d7a-837e-42c1d9213ba9	0	20	f	\N	\N
648ffad5-930f-448c-9a4d-a505893054a1	\N	reset-password	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	17d7e656-b44e-4d7a-837e-42c1d9213ba9	0	30	f	\N	\N
1f269446-3061-4bc7-81eb-4654a37d0a73	\N	\N	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	17d7e656-b44e-4d7a-837e-42c1d9213ba9	1	40	t	4e9df8b1-107e-4a47-9d35-d81d64953dd7	\N
013f9aa7-2d89-47bc-bb81-28f960027b11	\N	conditional-user-configured	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	4e9df8b1-107e-4a47-9d35-d81d64953dd7	0	10	f	\N	\N
e7ae6855-9cf0-4cbb-9b32-a03c1d75c63e	\N	reset-otp	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	4e9df8b1-107e-4a47-9d35-d81d64953dd7	0	20	f	\N	\N
5b10c1fc-2228-4048-9818-7ce12c9ba446	\N	client-secret	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	e79eeecc-8fbc-4383-ac80-18693bdd99cc	2	10	f	\N	\N
171e8887-25b6-4896-b29e-a929f93863c4	\N	client-jwt	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	e79eeecc-8fbc-4383-ac80-18693bdd99cc	2	20	f	\N	\N
c581afba-753d-467f-b393-6ccf67a8d4fa	\N	client-secret-jwt	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	e79eeecc-8fbc-4383-ac80-18693bdd99cc	2	30	f	\N	\N
daff39e4-01f0-414e-ba97-672222cc20c0	\N	client-x509	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	e79eeecc-8fbc-4383-ac80-18693bdd99cc	2	40	f	\N	\N
7d273881-6cc8-4364-b797-3445e2d18771	\N	idp-review-profile	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	a052e707-9045-4763-bbc9-c3e783e7934d	0	10	f	\N	a4cab196-9b6a-41c5-80cf-9b3d299ca209
f0a9715b-e54c-475c-923b-da29e740c03f	\N	\N	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	a052e707-9045-4763-bbc9-c3e783e7934d	0	20	t	704d96c8-a2b7-4da5-aeb4-c1dbd2f0bda2	\N
767c2404-2fbf-4249-8ad5-42d0592425e1	\N	idp-create-user-if-unique	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	704d96c8-a2b7-4da5-aeb4-c1dbd2f0bda2	2	10	f	\N	e11901e5-f8ca-49dc-bc40-b217177a9229
8c91a943-028a-42f7-ae83-2ddaf5df0ebd	\N	\N	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	704d96c8-a2b7-4da5-aeb4-c1dbd2f0bda2	2	20	t	bdde8950-34a7-4ac2-aa61-8b81168ed7aa	\N
0be6e2ca-adb7-427a-9ea2-34c094308135	\N	idp-confirm-link	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	bdde8950-34a7-4ac2-aa61-8b81168ed7aa	0	10	f	\N	\N
7c3ae700-bc5d-4cca-9100-b00cc415b1bf	\N	\N	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	bdde8950-34a7-4ac2-aa61-8b81168ed7aa	0	20	t	9bc9ec67-b352-4256-935d-ba3da6f8e2a3	\N
8439b2c5-d0b6-4f37-a52d-5d4b211b691e	\N	idp-email-verification	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	9bc9ec67-b352-4256-935d-ba3da6f8e2a3	2	10	f	\N	\N
3bae0a6b-c730-4314-957e-fe9153bcf262	\N	\N	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	9bc9ec67-b352-4256-935d-ba3da6f8e2a3	2	20	t	f9e125e7-209f-4c05-8ed2-8d50bbb20212	\N
94633cd8-e98e-46b2-b1b7-2ccbbc3f1d9e	\N	idp-username-password-form	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	f9e125e7-209f-4c05-8ed2-8d50bbb20212	0	10	f	\N	\N
092608d4-d1bf-41ff-a73a-49447b25c324	\N	\N	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	f9e125e7-209f-4c05-8ed2-8d50bbb20212	1	20	t	d31b3725-5192-4242-9b13-14ecabc2725e	\N
069cd188-8219-4f6a-8ffa-2af35576db25	\N	conditional-user-configured	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	d31b3725-5192-4242-9b13-14ecabc2725e	0	10	f	\N	\N
39db4357-2df2-4c17-8767-37d5dd439c0a	\N	auth-otp-form	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	d31b3725-5192-4242-9b13-14ecabc2725e	0	20	f	\N	\N
de1b598d-ef41-41df-bd9d-6782aa6dc01d	\N	\N	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	a052e707-9045-4763-bbc9-c3e783e7934d	1	50	t	1cf5d6af-6897-4d73-bc71-1c1443be860d	\N
b8b1176e-8de5-4201-9315-2d384f6ec0e0	\N	conditional-user-configured	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	1cf5d6af-6897-4d73-bc71-1c1443be860d	0	10	f	\N	\N
caf063be-ceb1-4b06-b54a-1b8c596b8e5c	\N	idp-add-organization-member	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	1cf5d6af-6897-4d73-bc71-1c1443be860d	0	20	f	\N	\N
48962b8c-c737-45c6-b11b-af3607ae0158	\N	http-basic-authenticator	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	199377a3-7ade-4199-9b4f-a59886748d87	0	10	f	\N	\N
b62fe304-d33c-46a0-b60b-f82023dfee39	\N	docker-http-basic-authenticator	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	9d03fb60-6d18-4df1-ad44-c932dcb6a83d	0	10	f	\N	\N
\.


--
-- TOC entry 4233 (class 0 OID 17361)
-- Dependencies: 252
-- Data for Name: authentication_flow; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.authentication_flow (id, alias, description, realm_id, provider_id, top_level, built_in) FROM stdin;
fbd6bbff-cb8b-4845-b97f-ac27cbeb0b0d	browser	Browser based authentication	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	basic-flow	t	t
2469a84f-264c-4100-8ec6-921a164f45b6	forms	Username, password, otp and other auth forms.	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	basic-flow	f	t
a74fe8c2-3b39-45ef-a27e-2cd471c7d0f6	Browser - Conditional OTP	Flow to determine if the OTP is required for the authentication	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	basic-flow	f	t
ce21466a-5ba5-463d-80d2-256731a2af06	direct grant	OpenID Connect Resource Owner Grant	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	basic-flow	t	t
475be45e-0b0c-4036-ae68-1bdda683bbe8	Direct Grant - Conditional OTP	Flow to determine if the OTP is required for the authentication	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	basic-flow	f	t
70ff9c56-bff4-47d7-9960-011348932622	registration	Registration flow	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	basic-flow	t	t
e849fe07-7978-4c9b-84e9-637996b1fb0b	registration form	Registration form	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	form-flow	f	t
3e0d6dab-3d16-4e66-b042-a3466ebaca2f	reset credentials	Reset credentials for a user if they forgot their password or something	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	basic-flow	t	t
4b17e93e-9cde-4675-9c3b-5a0bdf5f16b8	Reset - Conditional OTP	Flow to determine if the OTP should be reset or not. Set to REQUIRED to force.	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	basic-flow	f	t
96d200d2-864d-4ee9-8291-b838544fe5cf	clients	Base authentication for clients	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	client-flow	t	t
4c670a16-99e2-494b-8b91-fe3433e3b693	first broker login	Actions taken after first broker login with identity provider account, which is not yet linked to any Keycloak account	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	basic-flow	t	t
909ee491-6c5d-42f2-ade0-3d6ecc7d4576	User creation or linking	Flow for the existing/non-existing user alternatives	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	basic-flow	f	t
f8c228bc-f889-4f53-b158-4bdb4de4be14	Handle Existing Account	Handle what to do if there is existing account with same email/username like authenticated identity provider	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	basic-flow	f	t
9697259a-b246-48ad-bdff-5d77d2165884	Account verification options	Method with which to verity the existing account	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	basic-flow	f	t
202a3867-cfcf-4427-9152-8333d5d4959d	Verify Existing Account by Re-authentication	Reauthentication of existing account	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	basic-flow	f	t
6430b290-5576-4711-bfc7-147928548b23	First broker login - Conditional OTP	Flow to determine if the OTP is required for the authentication	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	basic-flow	f	t
5b20f95c-047b-429b-8fa8-5e0e2e5a78e2	saml ecp	SAML ECP Profile Authentication Flow	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	basic-flow	t	t
fc958837-0296-4e72-94a1-887982eace1e	docker auth	Used by Docker clients to authenticate against the IDP	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	basic-flow	t	t
bededb6e-f2cb-4b4e-872b-4327e77f4fb8	browser	Browser based authentication	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	basic-flow	t	t
3a9f9e3d-8920-40b2-bdc2-8dd92099b4d7	forms	Username, password, otp and other auth forms.	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	basic-flow	f	t
3d8b60f2-c6e3-429b-b7c4-6acae88e9428	Browser - Conditional OTP	Flow to determine if the OTP is required for the authentication	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	basic-flow	f	t
5598c64f-217c-4c6a-b2f1-d44628cb35d1	Organization	\N	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	basic-flow	f	t
aa99b207-2daa-4b98-853d-b0398ac7b5e8	Browser - Conditional Organization	Flow to determine if the organization identity-first login is to be used	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	basic-flow	f	t
43e421b4-e2c8-47c4-9671-b0f7a0b93391	direct grant	OpenID Connect Resource Owner Grant	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	basic-flow	t	t
c41ab463-7118-459e-91fa-71888a7d6b8f	Direct Grant - Conditional OTP	Flow to determine if the OTP is required for the authentication	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	basic-flow	f	t
cb02a013-ac6b-4b1e-8ec8-f19d9845d2bd	registration	Registration flow	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	basic-flow	t	t
8228158a-31ad-4cb3-b1ee-bb9d8f2b8515	registration form	Registration form	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	form-flow	f	t
17d7e656-b44e-4d7a-837e-42c1d9213ba9	reset credentials	Reset credentials for a user if they forgot their password or something	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	basic-flow	t	t
4e9df8b1-107e-4a47-9d35-d81d64953dd7	Reset - Conditional OTP	Flow to determine if the OTP should be reset or not. Set to REQUIRED to force.	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	basic-flow	f	t
e79eeecc-8fbc-4383-ac80-18693bdd99cc	clients	Base authentication for clients	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	client-flow	t	t
a052e707-9045-4763-bbc9-c3e783e7934d	first broker login	Actions taken after first broker login with identity provider account, which is not yet linked to any Keycloak account	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	basic-flow	t	t
704d96c8-a2b7-4da5-aeb4-c1dbd2f0bda2	User creation or linking	Flow for the existing/non-existing user alternatives	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	basic-flow	f	t
bdde8950-34a7-4ac2-aa61-8b81168ed7aa	Handle Existing Account	Handle what to do if there is existing account with same email/username like authenticated identity provider	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	basic-flow	f	t
9bc9ec67-b352-4256-935d-ba3da6f8e2a3	Account verification options	Method with which to verity the existing account	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	basic-flow	f	t
f9e125e7-209f-4c05-8ed2-8d50bbb20212	Verify Existing Account by Re-authentication	Reauthentication of existing account	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	basic-flow	f	t
d31b3725-5192-4242-9b13-14ecabc2725e	First broker login - Conditional OTP	Flow to determine if the OTP is required for the authentication	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	basic-flow	f	t
1cf5d6af-6897-4d73-bc71-1c1443be860d	First Broker Login - Conditional Organization	Flow to determine if the authenticator that adds organization members is to be used	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	basic-flow	f	t
199377a3-7ade-4199-9b4f-a59886748d87	saml ecp	SAML ECP Profile Authentication Flow	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	basic-flow	t	t
9d03fb60-6d18-4df1-ad44-c932dcb6a83d	docker auth	Used by Docker clients to authenticate against the IDP	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	basic-flow	t	t
\.


--
-- TOC entry 4232 (class 0 OID 17356)
-- Dependencies: 251
-- Data for Name: authenticator_config; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.authenticator_config (id, alias, realm_id) FROM stdin;
71409ed1-c83e-4692-9f8c-e2a6bf6cdc93	review profile config	04b8d4e2-b556-4c37-b4fc-764558ddd1c4
5b450a47-fde6-4ee7-9dc3-95a4c0108ac0	create unique user config	04b8d4e2-b556-4c37-b4fc-764558ddd1c4
a4cab196-9b6a-41c5-80cf-9b3d299ca209	review profile config	9814c300-ac35-45b9-a56d-4d4d9ecf51bb
e11901e5-f8ca-49dc-bc40-b217177a9229	create unique user config	9814c300-ac35-45b9-a56d-4d4d9ecf51bb
\.


--
-- TOC entry 4235 (class 0 OID 17371)
-- Dependencies: 254
-- Data for Name: authenticator_config_entry; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.authenticator_config_entry (authenticator_id, value, name) FROM stdin;
5b450a47-fde6-4ee7-9dc3-95a4c0108ac0	false	require.password.update.after.registration
71409ed1-c83e-4692-9f8c-e2a6bf6cdc93	missing	update.profile.on.first.login
a4cab196-9b6a-41c5-80cf-9b3d299ca209	missing	update.profile.on.first.login
e11901e5-f8ca-49dc-bc40-b217177a9229	false	require.password.update.after.registration
\.


--
-- TOC entry 4259 (class 0 OID 17809)
-- Dependencies: 278
-- Data for Name: broker_link; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.broker_link (identity_provider, storage_provider_id, realm_id, broker_user_id, broker_username, token, user_id) FROM stdin;
\.


--
-- TOC entry 4198 (class 0 OID 16732)
-- Dependencies: 217
-- Data for Name: client; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.client (id, enabled, full_scope_allowed, client_id, not_before, public_client, secret, base_url, bearer_only, management_url, surrogate_auth_required, realm_id, protocol, node_rereg_timeout, frontchannel_logout, consent_required, name, service_accounts_enabled, client_authenticator_type, root_url, description, registration_token, standard_flow_enabled, implicit_flow_enabled, direct_access_grants_enabled, always_display_in_console) FROM stdin;
eb6585bb-4c5a-41c9-acd6-2bd25c7cd792	t	f	master-realm	0	f	\N	\N	t	\N	f	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	\N	0	f	f	master Realm	f	client-secret	\N	\N	\N	t	f	f	f
9c71c67c-24e8-45c3-aa0d-4df498facac4	t	f	account	0	t	\N	/realms/master/account/	f	\N	f	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	openid-connect	0	f	f	${client_account}	f	client-secret	${authBaseUrl}	\N	\N	t	f	f	f
84302485-9b73-4186-9e5b-0da15972c7e6	t	f	account-console	0	t	\N	/realms/master/account/	f	\N	f	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	openid-connect	0	f	f	${client_account-console}	f	client-secret	${authBaseUrl}	\N	\N	t	f	f	f
6237db72-2d96-45c5-9520-824673c2d8fd	t	f	broker	0	f	\N	\N	t	\N	f	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	openid-connect	0	f	f	${client_broker}	f	client-secret	\N	\N	\N	t	f	f	f
d455a894-4eb3-4584-9c3a-8c5ed7ed2aa3	t	t	security-admin-console	0	t	\N	/admin/master/console/	f	\N	f	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	openid-connect	0	f	f	${client_security-admin-console}	f	client-secret	${authAdminUrl}	\N	\N	t	f	f	f
29d55d02-1172-4f5a-96e3-bf0422545ef6	t	t	admin-cli	0	t	\N	\N	f	\N	f	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	openid-connect	0	f	f	${client_admin-cli}	f	client-secret	\N	\N	\N	f	f	t	f
df676d24-5570-4dcf-a156-0ce8477c5594	t	t	municipality-service	0	f	\N	\N	t	\N	f	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	openid-connect	-1	f	f	\N	f	client-secret	\N	\N	\N	t	f	f	f
88f5a74b-e757-46ba-8a61-ec7723ca586b	t	t	department-service	0	f	\N	\N	t	\N	f	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	openid-connect	-1	f	f	\N	f	client-secret	\N	\N	\N	t	f	f	f
517c9410-ea2c-4e84-b47d-99acef0f53b6	t	t	api-gateway	0	f	VT4ROeIa1OFWVsGmYp3s5XvCJZZgoXbk	\N	f	\N	f	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	openid-connect	-1	f	f	API Gateway	t	client-secret	\N	\N	\N	t	f	f	f
bff9dfc0-a310-4c60-bb35-70072c951ecb	t	t	resource-service	0	f	\N	\N	t	\N	f	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	openid-connect	-1	f	f	\N	f	client-secret	\N	\N	\N	t	f	f	f
14682d39-1ec0-4f59-a7b1-3a01115f491a	t	f	DRCCS-realm	0	f	\N	\N	t	\N	f	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	\N	0	f	f	DRCCS Realm	f	client-secret	\N	\N	\N	t	f	f	f
4767f32b-9c5b-480c-94a9-61f36da53679	t	f	realm-management	0	f	\N	\N	t	\N	f	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	openid-connect	0	f	f	${client_realm-management}	f	client-secret	\N	\N	\N	t	f	f	f
7bec06e5-f1db-4d81-99a4-df603a9d007c	t	f	account	0	t	\N	/realms/DRCCS/account/	f	\N	f	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	openid-connect	0	f	f	${client_account}	f	client-secret	${authBaseUrl}	\N	\N	t	f	f	f
d30bc5e2-7ce6-4932-bf87-1eb8d95b036b	t	f	account-console	0	t	\N	/realms/DRCCS/account/	f	\N	f	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	openid-connect	0	f	f	${client_account-console}	f	client-secret	${authBaseUrl}	\N	\N	t	f	f	f
787dddfe-83f2-4fff-9ca4-b67d233d47f7	t	f	broker	0	f	\N	\N	t	\N	f	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	openid-connect	0	f	f	${client_broker}	f	client-secret	\N	\N	\N	t	f	f	f
d7c11793-e6cd-405c-9da1-b8d8ba057a83	t	t	security-admin-console	0	t	\N	/admin/DRCCS/console/	f	\N	f	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	openid-connect	0	f	f	${client_security-admin-console}	f	client-secret	${authAdminUrl}	\N	\N	t	f	f	f
a053da91-5d95-4747-8e23-a96c8626ec18	t	t	admin-cli	0	t	\N	\N	f	\N	f	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	openid-connect	0	f	f	${client_admin-cli}	f	client-secret	\N	\N	\N	f	f	t	f
e3652182-d1bb-4f94-a8a0-edc307e0e6e4	t	t	react-frontend	0	t	\N	/	f		f	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	openid-connect	-1	f	f	React Frontend	f	client-secret	http://localhost:3000		\N	t	f	f	f
8f66f9f0-f9e8-49b0-98d0-8ebe38e1b66a	t	t	user-service	0	f	\N	\N	t	\N	f	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	openid-connect	-1	f	f	\N	f	client-secret	\N	\N	\N	t	f	f	f
cb500fc2-ccd9-407d-9e92-49b653c16206	t	t	region-service	0	f	\N	\N	t	\N	f	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	openid-connect	-1	f	f	\N	f	client-secret	\N	\N	\N	t	f	f	f
8fb0e441-0cff-4ef8-9c89-8039ae9bd22e	t	t	notification-service	0	f	\N	\N	t	\N	f	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	openid-connect	-1	f	f	\N	f	client-secret	\N	\N	\N	t	f	f	f
2785caf0-7d37-4658-bc97-1c0df62b5941	t	t	incident-service	0	f	\N	\N	t	\N	f	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	openid-connect	-1	f	f	\N	f	client-secret	\N	\N	\N	t	f	f	f
5328aadf-c3cb-4f1a-9914-614ab50d56da	t	t	location-service	0	f	\N	\N	t	\N	f	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	openid-connect	-1	f	f	\N	f	client-secret	\N	\N	\N	t	f	f	f
\.


--
-- TOC entry 4218 (class 0 OID 17090)
-- Dependencies: 237
-- Data for Name: client_attributes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.client_attributes (client_id, name, value) FROM stdin;
9c71c67c-24e8-45c3-aa0d-4df498facac4	post.logout.redirect.uris	+
84302485-9b73-4186-9e5b-0da15972c7e6	post.logout.redirect.uris	+
84302485-9b73-4186-9e5b-0da15972c7e6	pkce.code.challenge.method	S256
d455a894-4eb3-4584-9c3a-8c5ed7ed2aa3	post.logout.redirect.uris	+
d455a894-4eb3-4584-9c3a-8c5ed7ed2aa3	pkce.code.challenge.method	S256
d455a894-4eb3-4584-9c3a-8c5ed7ed2aa3	client.use.lightweight.access.token.enabled	true
29d55d02-1172-4f5a-96e3-bf0422545ef6	client.use.lightweight.access.token.enabled	true
7bec06e5-f1db-4d81-99a4-df603a9d007c	post.logout.redirect.uris	+
d30bc5e2-7ce6-4932-bf87-1eb8d95b036b	post.logout.redirect.uris	+
d30bc5e2-7ce6-4932-bf87-1eb8d95b036b	pkce.code.challenge.method	S256
d7c11793-e6cd-405c-9da1-b8d8ba057a83	post.logout.redirect.uris	+
d7c11793-e6cd-405c-9da1-b8d8ba057a83	pkce.code.challenge.method	S256
d7c11793-e6cd-405c-9da1-b8d8ba057a83	client.use.lightweight.access.token.enabled	true
a053da91-5d95-4747-8e23-a96c8626ec18	client.use.lightweight.access.token.enabled	true
e3652182-d1bb-4f94-a8a0-edc307e0e6e4	pkce.code.challenge.method	S256
e3652182-d1bb-4f94-a8a0-edc307e0e6e4	post.logout.redirect.uris	+
8f66f9f0-f9e8-49b0-98d0-8ebe38e1b66a	post.logout.redirect.uris	+
cb500fc2-ccd9-407d-9e92-49b653c16206	post.logout.redirect.uris	+
df676d24-5570-4dcf-a156-0ce8477c5594	post.logout.redirect.uris	+
88f5a74b-e757-46ba-8a61-ec7723ca586b	post.logout.redirect.uris	+
bff9dfc0-a310-4c60-bb35-70072c951ecb	post.logout.redirect.uris	+
8fb0e441-0cff-4ef8-9c89-8039ae9bd22e	post.logout.redirect.uris	+
2785caf0-7d37-4658-bc97-1c0df62b5941	post.logout.redirect.uris	+
5328aadf-c3cb-4f1a-9914-614ab50d56da	post.logout.redirect.uris	+
517c9410-ea2c-4e84-b47d-99acef0f53b6	client.secret.creation.time	1763111995
517c9410-ea2c-4e84-b47d-99acef0f53b6	realm_client	false
517c9410-ea2c-4e84-b47d-99acef0f53b6	post.logout.redirect.uris	+
e3652182-d1bb-4f94-a8a0-edc307e0e6e4	realm_client	false
e3652182-d1bb-4f94-a8a0-edc307e0e6e4	oauth2.device.authorization.grant.enabled	false
e3652182-d1bb-4f94-a8a0-edc307e0e6e4	oidc.ciba.grant.enabled	false
e3652182-d1bb-4f94-a8a0-edc307e0e6e4	display.on.consent.screen	false
e3652182-d1bb-4f94-a8a0-edc307e0e6e4	backchannel.logout.session.required	true
e3652182-d1bb-4f94-a8a0-edc307e0e6e4	backchannel.logout.revoke.offline.tokens	false
\.


--
-- TOC entry 4270 (class 0 OID 18058)
-- Dependencies: 289
-- Data for Name: client_auth_flow_bindings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.client_auth_flow_bindings (client_id, flow_id, binding_name) FROM stdin;
\.


--
-- TOC entry 4269 (class 0 OID 17933)
-- Dependencies: 288
-- Data for Name: client_initial_access; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.client_initial_access (id, realm_id, "timestamp", expiration, count, remaining_count) FROM stdin;
\.


--
-- TOC entry 4219 (class 0 OID 17100)
-- Dependencies: 238
-- Data for Name: client_node_registrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.client_node_registrations (client_id, value, name) FROM stdin;
\.


--
-- TOC entry 4247 (class 0 OID 17599)
-- Dependencies: 266
-- Data for Name: client_scope; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.client_scope (id, name, realm_id, description, protocol) FROM stdin;
047cffd4-87cf-42f6-899c-84886f43e2ca	offline_access	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	OpenID Connect built-in scope: offline_access	openid-connect
850c1e15-5b08-4c84-aaa5-a966412aba70	role_list	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	SAML role list	saml
677c1373-fc94-4ae0-a429-97ce419d8ad8	saml_organization	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	Organization Membership	saml
265c9db3-5d3a-4acc-b313-267642fa4808	profile	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	OpenID Connect built-in scope: profile	openid-connect
37c69ad2-2770-4c02-a255-620874a16cb7	email	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	OpenID Connect built-in scope: email	openid-connect
f16d8813-579a-485f-93aa-17fb63a17c43	address	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	OpenID Connect built-in scope: address	openid-connect
a2b9c7bd-ce04-4154-a469-b96edd622cd3	phone	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	OpenID Connect built-in scope: phone	openid-connect
5b313498-ab37-4f0c-89f7-fb1315ce4b2e	roles	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	OpenID Connect scope for add user roles to the access token	openid-connect
969ccb58-a5c6-4272-ba09-599950b83ab8	web-origins	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	OpenID Connect scope for add allowed web origins to the access token	openid-connect
1d4ffcd3-06e6-45a5-83c7-6cad6568290f	microprofile-jwt	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	Microprofile - JWT built-in scope	openid-connect
2e364754-a620-4504-acde-f0bda9d08edc	acr	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	OpenID Connect scope for add acr (authentication context class reference) to the token	openid-connect
7fac0628-df20-44eb-946c-86c154a953a5	basic	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	OpenID Connect scope for add all basic claims to the token	openid-connect
e67b0602-f276-4e56-9150-a8050ce08e18	organization	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	Additional claims about the organization a subject belongs to	openid-connect
17fd8ec4-54da-4835-a3d4-3ab304175b72	offline_access	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	OpenID Connect built-in scope: offline_access	openid-connect
7490d48d-17c7-4613-a1e2-f828a9c90d62	role_list	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	SAML role list	saml
9eb5290d-5db7-4af1-91ec-92318545760a	saml_organization	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	Organization Membership	saml
f08b7223-fef1-4af3-9ebf-40773e5a4779	profile	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	OpenID Connect built-in scope: profile	openid-connect
66b3a300-6971-4f0d-b936-e60cba2d2de7	email	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	OpenID Connect built-in scope: email	openid-connect
19f41a26-8106-4fa2-b275-07266c4afdf0	address	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	OpenID Connect built-in scope: address	openid-connect
19685f60-4055-4026-bea6-31ade7543fe4	phone	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	OpenID Connect built-in scope: phone	openid-connect
00c132f3-40a5-45a8-9b68-af411830420d	roles	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	OpenID Connect scope for add user roles to the access token	openid-connect
351fab28-c6c3-4368-a2d7-ec6cf6fd6fd7	web-origins	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	OpenID Connect scope for add allowed web origins to the access token	openid-connect
04659a0d-ee92-4eef-a78b-b2dd808f5983	microprofile-jwt	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	Microprofile - JWT built-in scope	openid-connect
50dbb826-9330-4c55-8952-d1b050f3940b	acr	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	OpenID Connect scope for add acr (authentication context class reference) to the token	openid-connect
779f0fe6-ab9c-4998-8bc7-b5575052f67d	basic	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	OpenID Connect scope for add all basic claims to the token	openid-connect
2c35d9a2-156f-49e0-8f7f-5a72ea2d9866	organization	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	Additional claims about the organization a subject belongs to	openid-connect
\.


--
-- TOC entry 4248 (class 0 OID 17613)
-- Dependencies: 267
-- Data for Name: client_scope_attributes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.client_scope_attributes (scope_id, value, name) FROM stdin;
047cffd4-87cf-42f6-899c-84886f43e2ca	true	display.on.consent.screen
047cffd4-87cf-42f6-899c-84886f43e2ca	${offlineAccessScopeConsentText}	consent.screen.text
850c1e15-5b08-4c84-aaa5-a966412aba70	true	display.on.consent.screen
850c1e15-5b08-4c84-aaa5-a966412aba70	${samlRoleListScopeConsentText}	consent.screen.text
677c1373-fc94-4ae0-a429-97ce419d8ad8	false	display.on.consent.screen
265c9db3-5d3a-4acc-b313-267642fa4808	true	display.on.consent.screen
265c9db3-5d3a-4acc-b313-267642fa4808	${profileScopeConsentText}	consent.screen.text
265c9db3-5d3a-4acc-b313-267642fa4808	true	include.in.token.scope
37c69ad2-2770-4c02-a255-620874a16cb7	true	display.on.consent.screen
37c69ad2-2770-4c02-a255-620874a16cb7	${emailScopeConsentText}	consent.screen.text
37c69ad2-2770-4c02-a255-620874a16cb7	true	include.in.token.scope
f16d8813-579a-485f-93aa-17fb63a17c43	true	display.on.consent.screen
f16d8813-579a-485f-93aa-17fb63a17c43	${addressScopeConsentText}	consent.screen.text
f16d8813-579a-485f-93aa-17fb63a17c43	true	include.in.token.scope
a2b9c7bd-ce04-4154-a469-b96edd622cd3	true	display.on.consent.screen
a2b9c7bd-ce04-4154-a469-b96edd622cd3	${phoneScopeConsentText}	consent.screen.text
a2b9c7bd-ce04-4154-a469-b96edd622cd3	true	include.in.token.scope
5b313498-ab37-4f0c-89f7-fb1315ce4b2e	true	display.on.consent.screen
5b313498-ab37-4f0c-89f7-fb1315ce4b2e	${rolesScopeConsentText}	consent.screen.text
5b313498-ab37-4f0c-89f7-fb1315ce4b2e	false	include.in.token.scope
969ccb58-a5c6-4272-ba09-599950b83ab8	false	display.on.consent.screen
969ccb58-a5c6-4272-ba09-599950b83ab8		consent.screen.text
969ccb58-a5c6-4272-ba09-599950b83ab8	false	include.in.token.scope
1d4ffcd3-06e6-45a5-83c7-6cad6568290f	false	display.on.consent.screen
1d4ffcd3-06e6-45a5-83c7-6cad6568290f	true	include.in.token.scope
2e364754-a620-4504-acde-f0bda9d08edc	false	display.on.consent.screen
2e364754-a620-4504-acde-f0bda9d08edc	false	include.in.token.scope
7fac0628-df20-44eb-946c-86c154a953a5	false	display.on.consent.screen
7fac0628-df20-44eb-946c-86c154a953a5	false	include.in.token.scope
e67b0602-f276-4e56-9150-a8050ce08e18	true	display.on.consent.screen
e67b0602-f276-4e56-9150-a8050ce08e18	${organizationScopeConsentText}	consent.screen.text
e67b0602-f276-4e56-9150-a8050ce08e18	true	include.in.token.scope
17fd8ec4-54da-4835-a3d4-3ab304175b72	true	display.on.consent.screen
17fd8ec4-54da-4835-a3d4-3ab304175b72	${offlineAccessScopeConsentText}	consent.screen.text
7490d48d-17c7-4613-a1e2-f828a9c90d62	true	display.on.consent.screen
7490d48d-17c7-4613-a1e2-f828a9c90d62	${samlRoleListScopeConsentText}	consent.screen.text
9eb5290d-5db7-4af1-91ec-92318545760a	false	display.on.consent.screen
f08b7223-fef1-4af3-9ebf-40773e5a4779	true	display.on.consent.screen
f08b7223-fef1-4af3-9ebf-40773e5a4779	${profileScopeConsentText}	consent.screen.text
f08b7223-fef1-4af3-9ebf-40773e5a4779	true	include.in.token.scope
66b3a300-6971-4f0d-b936-e60cba2d2de7	true	display.on.consent.screen
66b3a300-6971-4f0d-b936-e60cba2d2de7	${emailScopeConsentText}	consent.screen.text
66b3a300-6971-4f0d-b936-e60cba2d2de7	true	include.in.token.scope
19f41a26-8106-4fa2-b275-07266c4afdf0	true	display.on.consent.screen
19f41a26-8106-4fa2-b275-07266c4afdf0	${addressScopeConsentText}	consent.screen.text
19f41a26-8106-4fa2-b275-07266c4afdf0	true	include.in.token.scope
19685f60-4055-4026-bea6-31ade7543fe4	true	display.on.consent.screen
19685f60-4055-4026-bea6-31ade7543fe4	${phoneScopeConsentText}	consent.screen.text
19685f60-4055-4026-bea6-31ade7543fe4	true	include.in.token.scope
00c132f3-40a5-45a8-9b68-af411830420d	true	display.on.consent.screen
00c132f3-40a5-45a8-9b68-af411830420d	${rolesScopeConsentText}	consent.screen.text
00c132f3-40a5-45a8-9b68-af411830420d	false	include.in.token.scope
351fab28-c6c3-4368-a2d7-ec6cf6fd6fd7	false	display.on.consent.screen
351fab28-c6c3-4368-a2d7-ec6cf6fd6fd7		consent.screen.text
351fab28-c6c3-4368-a2d7-ec6cf6fd6fd7	false	include.in.token.scope
04659a0d-ee92-4eef-a78b-b2dd808f5983	false	display.on.consent.screen
04659a0d-ee92-4eef-a78b-b2dd808f5983	true	include.in.token.scope
50dbb826-9330-4c55-8952-d1b050f3940b	false	display.on.consent.screen
50dbb826-9330-4c55-8952-d1b050f3940b	false	include.in.token.scope
779f0fe6-ab9c-4998-8bc7-b5575052f67d	false	display.on.consent.screen
779f0fe6-ab9c-4998-8bc7-b5575052f67d	false	include.in.token.scope
2c35d9a2-156f-49e0-8f7f-5a72ea2d9866	true	display.on.consent.screen
2c35d9a2-156f-49e0-8f7f-5a72ea2d9866	${organizationScopeConsentText}	consent.screen.text
2c35d9a2-156f-49e0-8f7f-5a72ea2d9866	true	include.in.token.scope
\.


--
-- TOC entry 4271 (class 0 OID 18099)
-- Dependencies: 290
-- Data for Name: client_scope_client; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.client_scope_client (client_id, scope_id, default_scope) FROM stdin;
9c71c67c-24e8-45c3-aa0d-4df498facac4	37c69ad2-2770-4c02-a255-620874a16cb7	t
9c71c67c-24e8-45c3-aa0d-4df498facac4	265c9db3-5d3a-4acc-b313-267642fa4808	t
9c71c67c-24e8-45c3-aa0d-4df498facac4	969ccb58-a5c6-4272-ba09-599950b83ab8	t
9c71c67c-24e8-45c3-aa0d-4df498facac4	7fac0628-df20-44eb-946c-86c154a953a5	t
9c71c67c-24e8-45c3-aa0d-4df498facac4	2e364754-a620-4504-acde-f0bda9d08edc	t
9c71c67c-24e8-45c3-aa0d-4df498facac4	5b313498-ab37-4f0c-89f7-fb1315ce4b2e	t
9c71c67c-24e8-45c3-aa0d-4df498facac4	f16d8813-579a-485f-93aa-17fb63a17c43	f
9c71c67c-24e8-45c3-aa0d-4df498facac4	a2b9c7bd-ce04-4154-a469-b96edd622cd3	f
9c71c67c-24e8-45c3-aa0d-4df498facac4	e67b0602-f276-4e56-9150-a8050ce08e18	f
9c71c67c-24e8-45c3-aa0d-4df498facac4	1d4ffcd3-06e6-45a5-83c7-6cad6568290f	f
9c71c67c-24e8-45c3-aa0d-4df498facac4	047cffd4-87cf-42f6-899c-84886f43e2ca	f
84302485-9b73-4186-9e5b-0da15972c7e6	37c69ad2-2770-4c02-a255-620874a16cb7	t
84302485-9b73-4186-9e5b-0da15972c7e6	265c9db3-5d3a-4acc-b313-267642fa4808	t
84302485-9b73-4186-9e5b-0da15972c7e6	969ccb58-a5c6-4272-ba09-599950b83ab8	t
84302485-9b73-4186-9e5b-0da15972c7e6	7fac0628-df20-44eb-946c-86c154a953a5	t
84302485-9b73-4186-9e5b-0da15972c7e6	2e364754-a620-4504-acde-f0bda9d08edc	t
84302485-9b73-4186-9e5b-0da15972c7e6	5b313498-ab37-4f0c-89f7-fb1315ce4b2e	t
84302485-9b73-4186-9e5b-0da15972c7e6	f16d8813-579a-485f-93aa-17fb63a17c43	f
84302485-9b73-4186-9e5b-0da15972c7e6	a2b9c7bd-ce04-4154-a469-b96edd622cd3	f
84302485-9b73-4186-9e5b-0da15972c7e6	e67b0602-f276-4e56-9150-a8050ce08e18	f
84302485-9b73-4186-9e5b-0da15972c7e6	1d4ffcd3-06e6-45a5-83c7-6cad6568290f	f
84302485-9b73-4186-9e5b-0da15972c7e6	047cffd4-87cf-42f6-899c-84886f43e2ca	f
29d55d02-1172-4f5a-96e3-bf0422545ef6	37c69ad2-2770-4c02-a255-620874a16cb7	t
29d55d02-1172-4f5a-96e3-bf0422545ef6	265c9db3-5d3a-4acc-b313-267642fa4808	t
29d55d02-1172-4f5a-96e3-bf0422545ef6	969ccb58-a5c6-4272-ba09-599950b83ab8	t
29d55d02-1172-4f5a-96e3-bf0422545ef6	7fac0628-df20-44eb-946c-86c154a953a5	t
29d55d02-1172-4f5a-96e3-bf0422545ef6	2e364754-a620-4504-acde-f0bda9d08edc	t
29d55d02-1172-4f5a-96e3-bf0422545ef6	5b313498-ab37-4f0c-89f7-fb1315ce4b2e	t
29d55d02-1172-4f5a-96e3-bf0422545ef6	f16d8813-579a-485f-93aa-17fb63a17c43	f
29d55d02-1172-4f5a-96e3-bf0422545ef6	a2b9c7bd-ce04-4154-a469-b96edd622cd3	f
29d55d02-1172-4f5a-96e3-bf0422545ef6	e67b0602-f276-4e56-9150-a8050ce08e18	f
29d55d02-1172-4f5a-96e3-bf0422545ef6	1d4ffcd3-06e6-45a5-83c7-6cad6568290f	f
29d55d02-1172-4f5a-96e3-bf0422545ef6	047cffd4-87cf-42f6-899c-84886f43e2ca	f
6237db72-2d96-45c5-9520-824673c2d8fd	37c69ad2-2770-4c02-a255-620874a16cb7	t
6237db72-2d96-45c5-9520-824673c2d8fd	265c9db3-5d3a-4acc-b313-267642fa4808	t
6237db72-2d96-45c5-9520-824673c2d8fd	969ccb58-a5c6-4272-ba09-599950b83ab8	t
6237db72-2d96-45c5-9520-824673c2d8fd	7fac0628-df20-44eb-946c-86c154a953a5	t
6237db72-2d96-45c5-9520-824673c2d8fd	2e364754-a620-4504-acde-f0bda9d08edc	t
6237db72-2d96-45c5-9520-824673c2d8fd	5b313498-ab37-4f0c-89f7-fb1315ce4b2e	t
6237db72-2d96-45c5-9520-824673c2d8fd	f16d8813-579a-485f-93aa-17fb63a17c43	f
6237db72-2d96-45c5-9520-824673c2d8fd	a2b9c7bd-ce04-4154-a469-b96edd622cd3	f
6237db72-2d96-45c5-9520-824673c2d8fd	e67b0602-f276-4e56-9150-a8050ce08e18	f
6237db72-2d96-45c5-9520-824673c2d8fd	1d4ffcd3-06e6-45a5-83c7-6cad6568290f	f
6237db72-2d96-45c5-9520-824673c2d8fd	047cffd4-87cf-42f6-899c-84886f43e2ca	f
eb6585bb-4c5a-41c9-acd6-2bd25c7cd792	37c69ad2-2770-4c02-a255-620874a16cb7	t
eb6585bb-4c5a-41c9-acd6-2bd25c7cd792	265c9db3-5d3a-4acc-b313-267642fa4808	t
eb6585bb-4c5a-41c9-acd6-2bd25c7cd792	969ccb58-a5c6-4272-ba09-599950b83ab8	t
eb6585bb-4c5a-41c9-acd6-2bd25c7cd792	7fac0628-df20-44eb-946c-86c154a953a5	t
eb6585bb-4c5a-41c9-acd6-2bd25c7cd792	2e364754-a620-4504-acde-f0bda9d08edc	t
eb6585bb-4c5a-41c9-acd6-2bd25c7cd792	5b313498-ab37-4f0c-89f7-fb1315ce4b2e	t
eb6585bb-4c5a-41c9-acd6-2bd25c7cd792	f16d8813-579a-485f-93aa-17fb63a17c43	f
eb6585bb-4c5a-41c9-acd6-2bd25c7cd792	a2b9c7bd-ce04-4154-a469-b96edd622cd3	f
eb6585bb-4c5a-41c9-acd6-2bd25c7cd792	e67b0602-f276-4e56-9150-a8050ce08e18	f
eb6585bb-4c5a-41c9-acd6-2bd25c7cd792	1d4ffcd3-06e6-45a5-83c7-6cad6568290f	f
eb6585bb-4c5a-41c9-acd6-2bd25c7cd792	047cffd4-87cf-42f6-899c-84886f43e2ca	f
d455a894-4eb3-4584-9c3a-8c5ed7ed2aa3	37c69ad2-2770-4c02-a255-620874a16cb7	t
d455a894-4eb3-4584-9c3a-8c5ed7ed2aa3	265c9db3-5d3a-4acc-b313-267642fa4808	t
d455a894-4eb3-4584-9c3a-8c5ed7ed2aa3	969ccb58-a5c6-4272-ba09-599950b83ab8	t
d455a894-4eb3-4584-9c3a-8c5ed7ed2aa3	7fac0628-df20-44eb-946c-86c154a953a5	t
d455a894-4eb3-4584-9c3a-8c5ed7ed2aa3	2e364754-a620-4504-acde-f0bda9d08edc	t
d455a894-4eb3-4584-9c3a-8c5ed7ed2aa3	5b313498-ab37-4f0c-89f7-fb1315ce4b2e	t
d455a894-4eb3-4584-9c3a-8c5ed7ed2aa3	f16d8813-579a-485f-93aa-17fb63a17c43	f
d455a894-4eb3-4584-9c3a-8c5ed7ed2aa3	a2b9c7bd-ce04-4154-a469-b96edd622cd3	f
d455a894-4eb3-4584-9c3a-8c5ed7ed2aa3	e67b0602-f276-4e56-9150-a8050ce08e18	f
d455a894-4eb3-4584-9c3a-8c5ed7ed2aa3	1d4ffcd3-06e6-45a5-83c7-6cad6568290f	f
d455a894-4eb3-4584-9c3a-8c5ed7ed2aa3	047cffd4-87cf-42f6-899c-84886f43e2ca	f
7bec06e5-f1db-4d81-99a4-df603a9d007c	50dbb826-9330-4c55-8952-d1b050f3940b	t
7bec06e5-f1db-4d81-99a4-df603a9d007c	66b3a300-6971-4f0d-b936-e60cba2d2de7	t
7bec06e5-f1db-4d81-99a4-df603a9d007c	f08b7223-fef1-4af3-9ebf-40773e5a4779	t
7bec06e5-f1db-4d81-99a4-df603a9d007c	779f0fe6-ab9c-4998-8bc7-b5575052f67d	t
7bec06e5-f1db-4d81-99a4-df603a9d007c	00c132f3-40a5-45a8-9b68-af411830420d	t
7bec06e5-f1db-4d81-99a4-df603a9d007c	351fab28-c6c3-4368-a2d7-ec6cf6fd6fd7	t
7bec06e5-f1db-4d81-99a4-df603a9d007c	17fd8ec4-54da-4835-a3d4-3ab304175b72	f
7bec06e5-f1db-4d81-99a4-df603a9d007c	19685f60-4055-4026-bea6-31ade7543fe4	f
7bec06e5-f1db-4d81-99a4-df603a9d007c	04659a0d-ee92-4eef-a78b-b2dd808f5983	f
7bec06e5-f1db-4d81-99a4-df603a9d007c	2c35d9a2-156f-49e0-8f7f-5a72ea2d9866	f
7bec06e5-f1db-4d81-99a4-df603a9d007c	19f41a26-8106-4fa2-b275-07266c4afdf0	f
d30bc5e2-7ce6-4932-bf87-1eb8d95b036b	50dbb826-9330-4c55-8952-d1b050f3940b	t
d30bc5e2-7ce6-4932-bf87-1eb8d95b036b	66b3a300-6971-4f0d-b936-e60cba2d2de7	t
d30bc5e2-7ce6-4932-bf87-1eb8d95b036b	f08b7223-fef1-4af3-9ebf-40773e5a4779	t
d30bc5e2-7ce6-4932-bf87-1eb8d95b036b	779f0fe6-ab9c-4998-8bc7-b5575052f67d	t
d30bc5e2-7ce6-4932-bf87-1eb8d95b036b	00c132f3-40a5-45a8-9b68-af411830420d	t
d30bc5e2-7ce6-4932-bf87-1eb8d95b036b	351fab28-c6c3-4368-a2d7-ec6cf6fd6fd7	t
d30bc5e2-7ce6-4932-bf87-1eb8d95b036b	17fd8ec4-54da-4835-a3d4-3ab304175b72	f
d30bc5e2-7ce6-4932-bf87-1eb8d95b036b	19685f60-4055-4026-bea6-31ade7543fe4	f
d30bc5e2-7ce6-4932-bf87-1eb8d95b036b	04659a0d-ee92-4eef-a78b-b2dd808f5983	f
d30bc5e2-7ce6-4932-bf87-1eb8d95b036b	2c35d9a2-156f-49e0-8f7f-5a72ea2d9866	f
d30bc5e2-7ce6-4932-bf87-1eb8d95b036b	19f41a26-8106-4fa2-b275-07266c4afdf0	f
a053da91-5d95-4747-8e23-a96c8626ec18	50dbb826-9330-4c55-8952-d1b050f3940b	t
a053da91-5d95-4747-8e23-a96c8626ec18	66b3a300-6971-4f0d-b936-e60cba2d2de7	t
a053da91-5d95-4747-8e23-a96c8626ec18	f08b7223-fef1-4af3-9ebf-40773e5a4779	t
a053da91-5d95-4747-8e23-a96c8626ec18	779f0fe6-ab9c-4998-8bc7-b5575052f67d	t
a053da91-5d95-4747-8e23-a96c8626ec18	00c132f3-40a5-45a8-9b68-af411830420d	t
a053da91-5d95-4747-8e23-a96c8626ec18	351fab28-c6c3-4368-a2d7-ec6cf6fd6fd7	t
a053da91-5d95-4747-8e23-a96c8626ec18	17fd8ec4-54da-4835-a3d4-3ab304175b72	f
a053da91-5d95-4747-8e23-a96c8626ec18	19685f60-4055-4026-bea6-31ade7543fe4	f
a053da91-5d95-4747-8e23-a96c8626ec18	04659a0d-ee92-4eef-a78b-b2dd808f5983	f
a053da91-5d95-4747-8e23-a96c8626ec18	2c35d9a2-156f-49e0-8f7f-5a72ea2d9866	f
a053da91-5d95-4747-8e23-a96c8626ec18	19f41a26-8106-4fa2-b275-07266c4afdf0	f
787dddfe-83f2-4fff-9ca4-b67d233d47f7	50dbb826-9330-4c55-8952-d1b050f3940b	t
787dddfe-83f2-4fff-9ca4-b67d233d47f7	66b3a300-6971-4f0d-b936-e60cba2d2de7	t
787dddfe-83f2-4fff-9ca4-b67d233d47f7	f08b7223-fef1-4af3-9ebf-40773e5a4779	t
787dddfe-83f2-4fff-9ca4-b67d233d47f7	779f0fe6-ab9c-4998-8bc7-b5575052f67d	t
787dddfe-83f2-4fff-9ca4-b67d233d47f7	00c132f3-40a5-45a8-9b68-af411830420d	t
787dddfe-83f2-4fff-9ca4-b67d233d47f7	351fab28-c6c3-4368-a2d7-ec6cf6fd6fd7	t
787dddfe-83f2-4fff-9ca4-b67d233d47f7	17fd8ec4-54da-4835-a3d4-3ab304175b72	f
787dddfe-83f2-4fff-9ca4-b67d233d47f7	19685f60-4055-4026-bea6-31ade7543fe4	f
787dddfe-83f2-4fff-9ca4-b67d233d47f7	04659a0d-ee92-4eef-a78b-b2dd808f5983	f
787dddfe-83f2-4fff-9ca4-b67d233d47f7	2c35d9a2-156f-49e0-8f7f-5a72ea2d9866	f
787dddfe-83f2-4fff-9ca4-b67d233d47f7	19f41a26-8106-4fa2-b275-07266c4afdf0	f
4767f32b-9c5b-480c-94a9-61f36da53679	50dbb826-9330-4c55-8952-d1b050f3940b	t
4767f32b-9c5b-480c-94a9-61f36da53679	66b3a300-6971-4f0d-b936-e60cba2d2de7	t
4767f32b-9c5b-480c-94a9-61f36da53679	f08b7223-fef1-4af3-9ebf-40773e5a4779	t
4767f32b-9c5b-480c-94a9-61f36da53679	779f0fe6-ab9c-4998-8bc7-b5575052f67d	t
4767f32b-9c5b-480c-94a9-61f36da53679	00c132f3-40a5-45a8-9b68-af411830420d	t
4767f32b-9c5b-480c-94a9-61f36da53679	351fab28-c6c3-4368-a2d7-ec6cf6fd6fd7	t
4767f32b-9c5b-480c-94a9-61f36da53679	17fd8ec4-54da-4835-a3d4-3ab304175b72	f
4767f32b-9c5b-480c-94a9-61f36da53679	19685f60-4055-4026-bea6-31ade7543fe4	f
4767f32b-9c5b-480c-94a9-61f36da53679	04659a0d-ee92-4eef-a78b-b2dd808f5983	f
4767f32b-9c5b-480c-94a9-61f36da53679	2c35d9a2-156f-49e0-8f7f-5a72ea2d9866	f
4767f32b-9c5b-480c-94a9-61f36da53679	19f41a26-8106-4fa2-b275-07266c4afdf0	f
d7c11793-e6cd-405c-9da1-b8d8ba057a83	50dbb826-9330-4c55-8952-d1b050f3940b	t
d7c11793-e6cd-405c-9da1-b8d8ba057a83	66b3a300-6971-4f0d-b936-e60cba2d2de7	t
d7c11793-e6cd-405c-9da1-b8d8ba057a83	f08b7223-fef1-4af3-9ebf-40773e5a4779	t
d7c11793-e6cd-405c-9da1-b8d8ba057a83	779f0fe6-ab9c-4998-8bc7-b5575052f67d	t
d7c11793-e6cd-405c-9da1-b8d8ba057a83	00c132f3-40a5-45a8-9b68-af411830420d	t
d7c11793-e6cd-405c-9da1-b8d8ba057a83	351fab28-c6c3-4368-a2d7-ec6cf6fd6fd7	t
d7c11793-e6cd-405c-9da1-b8d8ba057a83	17fd8ec4-54da-4835-a3d4-3ab304175b72	f
d7c11793-e6cd-405c-9da1-b8d8ba057a83	19685f60-4055-4026-bea6-31ade7543fe4	f
d7c11793-e6cd-405c-9da1-b8d8ba057a83	04659a0d-ee92-4eef-a78b-b2dd808f5983	f
d7c11793-e6cd-405c-9da1-b8d8ba057a83	2c35d9a2-156f-49e0-8f7f-5a72ea2d9866	f
d7c11793-e6cd-405c-9da1-b8d8ba057a83	19f41a26-8106-4fa2-b275-07266c4afdf0	f
e3652182-d1bb-4f94-a8a0-edc307e0e6e4	50dbb826-9330-4c55-8952-d1b050f3940b	t
e3652182-d1bb-4f94-a8a0-edc307e0e6e4	66b3a300-6971-4f0d-b936-e60cba2d2de7	t
e3652182-d1bb-4f94-a8a0-edc307e0e6e4	f08b7223-fef1-4af3-9ebf-40773e5a4779	t
e3652182-d1bb-4f94-a8a0-edc307e0e6e4	779f0fe6-ab9c-4998-8bc7-b5575052f67d	t
e3652182-d1bb-4f94-a8a0-edc307e0e6e4	00c132f3-40a5-45a8-9b68-af411830420d	t
e3652182-d1bb-4f94-a8a0-edc307e0e6e4	351fab28-c6c3-4368-a2d7-ec6cf6fd6fd7	t
e3652182-d1bb-4f94-a8a0-edc307e0e6e4	17fd8ec4-54da-4835-a3d4-3ab304175b72	f
e3652182-d1bb-4f94-a8a0-edc307e0e6e4	19685f60-4055-4026-bea6-31ade7543fe4	f
e3652182-d1bb-4f94-a8a0-edc307e0e6e4	04659a0d-ee92-4eef-a78b-b2dd808f5983	f
e3652182-d1bb-4f94-a8a0-edc307e0e6e4	2c35d9a2-156f-49e0-8f7f-5a72ea2d9866	f
e3652182-d1bb-4f94-a8a0-edc307e0e6e4	19f41a26-8106-4fa2-b275-07266c4afdf0	f
8f66f9f0-f9e8-49b0-98d0-8ebe38e1b66a	50dbb826-9330-4c55-8952-d1b050f3940b	t
8f66f9f0-f9e8-49b0-98d0-8ebe38e1b66a	66b3a300-6971-4f0d-b936-e60cba2d2de7	t
8f66f9f0-f9e8-49b0-98d0-8ebe38e1b66a	f08b7223-fef1-4af3-9ebf-40773e5a4779	t
8f66f9f0-f9e8-49b0-98d0-8ebe38e1b66a	779f0fe6-ab9c-4998-8bc7-b5575052f67d	t
8f66f9f0-f9e8-49b0-98d0-8ebe38e1b66a	00c132f3-40a5-45a8-9b68-af411830420d	t
8f66f9f0-f9e8-49b0-98d0-8ebe38e1b66a	351fab28-c6c3-4368-a2d7-ec6cf6fd6fd7	t
8f66f9f0-f9e8-49b0-98d0-8ebe38e1b66a	17fd8ec4-54da-4835-a3d4-3ab304175b72	f
8f66f9f0-f9e8-49b0-98d0-8ebe38e1b66a	19685f60-4055-4026-bea6-31ade7543fe4	f
8f66f9f0-f9e8-49b0-98d0-8ebe38e1b66a	04659a0d-ee92-4eef-a78b-b2dd808f5983	f
8f66f9f0-f9e8-49b0-98d0-8ebe38e1b66a	2c35d9a2-156f-49e0-8f7f-5a72ea2d9866	f
8f66f9f0-f9e8-49b0-98d0-8ebe38e1b66a	19f41a26-8106-4fa2-b275-07266c4afdf0	f
cb500fc2-ccd9-407d-9e92-49b653c16206	50dbb826-9330-4c55-8952-d1b050f3940b	t
cb500fc2-ccd9-407d-9e92-49b653c16206	66b3a300-6971-4f0d-b936-e60cba2d2de7	t
cb500fc2-ccd9-407d-9e92-49b653c16206	f08b7223-fef1-4af3-9ebf-40773e5a4779	t
cb500fc2-ccd9-407d-9e92-49b653c16206	779f0fe6-ab9c-4998-8bc7-b5575052f67d	t
cb500fc2-ccd9-407d-9e92-49b653c16206	00c132f3-40a5-45a8-9b68-af411830420d	t
cb500fc2-ccd9-407d-9e92-49b653c16206	351fab28-c6c3-4368-a2d7-ec6cf6fd6fd7	t
cb500fc2-ccd9-407d-9e92-49b653c16206	17fd8ec4-54da-4835-a3d4-3ab304175b72	f
cb500fc2-ccd9-407d-9e92-49b653c16206	19685f60-4055-4026-bea6-31ade7543fe4	f
cb500fc2-ccd9-407d-9e92-49b653c16206	04659a0d-ee92-4eef-a78b-b2dd808f5983	f
cb500fc2-ccd9-407d-9e92-49b653c16206	2c35d9a2-156f-49e0-8f7f-5a72ea2d9866	f
cb500fc2-ccd9-407d-9e92-49b653c16206	19f41a26-8106-4fa2-b275-07266c4afdf0	f
df676d24-5570-4dcf-a156-0ce8477c5594	50dbb826-9330-4c55-8952-d1b050f3940b	t
df676d24-5570-4dcf-a156-0ce8477c5594	66b3a300-6971-4f0d-b936-e60cba2d2de7	t
df676d24-5570-4dcf-a156-0ce8477c5594	f08b7223-fef1-4af3-9ebf-40773e5a4779	t
df676d24-5570-4dcf-a156-0ce8477c5594	779f0fe6-ab9c-4998-8bc7-b5575052f67d	t
df676d24-5570-4dcf-a156-0ce8477c5594	00c132f3-40a5-45a8-9b68-af411830420d	t
df676d24-5570-4dcf-a156-0ce8477c5594	351fab28-c6c3-4368-a2d7-ec6cf6fd6fd7	t
df676d24-5570-4dcf-a156-0ce8477c5594	17fd8ec4-54da-4835-a3d4-3ab304175b72	f
df676d24-5570-4dcf-a156-0ce8477c5594	19685f60-4055-4026-bea6-31ade7543fe4	f
df676d24-5570-4dcf-a156-0ce8477c5594	04659a0d-ee92-4eef-a78b-b2dd808f5983	f
df676d24-5570-4dcf-a156-0ce8477c5594	2c35d9a2-156f-49e0-8f7f-5a72ea2d9866	f
df676d24-5570-4dcf-a156-0ce8477c5594	19f41a26-8106-4fa2-b275-07266c4afdf0	f
88f5a74b-e757-46ba-8a61-ec7723ca586b	50dbb826-9330-4c55-8952-d1b050f3940b	t
88f5a74b-e757-46ba-8a61-ec7723ca586b	66b3a300-6971-4f0d-b936-e60cba2d2de7	t
88f5a74b-e757-46ba-8a61-ec7723ca586b	f08b7223-fef1-4af3-9ebf-40773e5a4779	t
88f5a74b-e757-46ba-8a61-ec7723ca586b	779f0fe6-ab9c-4998-8bc7-b5575052f67d	t
88f5a74b-e757-46ba-8a61-ec7723ca586b	00c132f3-40a5-45a8-9b68-af411830420d	t
88f5a74b-e757-46ba-8a61-ec7723ca586b	351fab28-c6c3-4368-a2d7-ec6cf6fd6fd7	t
88f5a74b-e757-46ba-8a61-ec7723ca586b	17fd8ec4-54da-4835-a3d4-3ab304175b72	f
88f5a74b-e757-46ba-8a61-ec7723ca586b	19685f60-4055-4026-bea6-31ade7543fe4	f
88f5a74b-e757-46ba-8a61-ec7723ca586b	04659a0d-ee92-4eef-a78b-b2dd808f5983	f
88f5a74b-e757-46ba-8a61-ec7723ca586b	2c35d9a2-156f-49e0-8f7f-5a72ea2d9866	f
88f5a74b-e757-46ba-8a61-ec7723ca586b	19f41a26-8106-4fa2-b275-07266c4afdf0	f
bff9dfc0-a310-4c60-bb35-70072c951ecb	50dbb826-9330-4c55-8952-d1b050f3940b	t
bff9dfc0-a310-4c60-bb35-70072c951ecb	66b3a300-6971-4f0d-b936-e60cba2d2de7	t
bff9dfc0-a310-4c60-bb35-70072c951ecb	f08b7223-fef1-4af3-9ebf-40773e5a4779	t
bff9dfc0-a310-4c60-bb35-70072c951ecb	779f0fe6-ab9c-4998-8bc7-b5575052f67d	t
bff9dfc0-a310-4c60-bb35-70072c951ecb	00c132f3-40a5-45a8-9b68-af411830420d	t
bff9dfc0-a310-4c60-bb35-70072c951ecb	351fab28-c6c3-4368-a2d7-ec6cf6fd6fd7	t
bff9dfc0-a310-4c60-bb35-70072c951ecb	17fd8ec4-54da-4835-a3d4-3ab304175b72	f
bff9dfc0-a310-4c60-bb35-70072c951ecb	19685f60-4055-4026-bea6-31ade7543fe4	f
bff9dfc0-a310-4c60-bb35-70072c951ecb	04659a0d-ee92-4eef-a78b-b2dd808f5983	f
bff9dfc0-a310-4c60-bb35-70072c951ecb	2c35d9a2-156f-49e0-8f7f-5a72ea2d9866	f
bff9dfc0-a310-4c60-bb35-70072c951ecb	19f41a26-8106-4fa2-b275-07266c4afdf0	f
8fb0e441-0cff-4ef8-9c89-8039ae9bd22e	50dbb826-9330-4c55-8952-d1b050f3940b	t
8fb0e441-0cff-4ef8-9c89-8039ae9bd22e	66b3a300-6971-4f0d-b936-e60cba2d2de7	t
8fb0e441-0cff-4ef8-9c89-8039ae9bd22e	f08b7223-fef1-4af3-9ebf-40773e5a4779	t
8fb0e441-0cff-4ef8-9c89-8039ae9bd22e	779f0fe6-ab9c-4998-8bc7-b5575052f67d	t
8fb0e441-0cff-4ef8-9c89-8039ae9bd22e	00c132f3-40a5-45a8-9b68-af411830420d	t
8fb0e441-0cff-4ef8-9c89-8039ae9bd22e	351fab28-c6c3-4368-a2d7-ec6cf6fd6fd7	t
8fb0e441-0cff-4ef8-9c89-8039ae9bd22e	17fd8ec4-54da-4835-a3d4-3ab304175b72	f
8fb0e441-0cff-4ef8-9c89-8039ae9bd22e	19685f60-4055-4026-bea6-31ade7543fe4	f
8fb0e441-0cff-4ef8-9c89-8039ae9bd22e	04659a0d-ee92-4eef-a78b-b2dd808f5983	f
8fb0e441-0cff-4ef8-9c89-8039ae9bd22e	2c35d9a2-156f-49e0-8f7f-5a72ea2d9866	f
8fb0e441-0cff-4ef8-9c89-8039ae9bd22e	19f41a26-8106-4fa2-b275-07266c4afdf0	f
2785caf0-7d37-4658-bc97-1c0df62b5941	50dbb826-9330-4c55-8952-d1b050f3940b	t
2785caf0-7d37-4658-bc97-1c0df62b5941	66b3a300-6971-4f0d-b936-e60cba2d2de7	t
2785caf0-7d37-4658-bc97-1c0df62b5941	f08b7223-fef1-4af3-9ebf-40773e5a4779	t
2785caf0-7d37-4658-bc97-1c0df62b5941	779f0fe6-ab9c-4998-8bc7-b5575052f67d	t
2785caf0-7d37-4658-bc97-1c0df62b5941	00c132f3-40a5-45a8-9b68-af411830420d	t
2785caf0-7d37-4658-bc97-1c0df62b5941	351fab28-c6c3-4368-a2d7-ec6cf6fd6fd7	t
2785caf0-7d37-4658-bc97-1c0df62b5941	17fd8ec4-54da-4835-a3d4-3ab304175b72	f
2785caf0-7d37-4658-bc97-1c0df62b5941	19685f60-4055-4026-bea6-31ade7543fe4	f
2785caf0-7d37-4658-bc97-1c0df62b5941	04659a0d-ee92-4eef-a78b-b2dd808f5983	f
2785caf0-7d37-4658-bc97-1c0df62b5941	2c35d9a2-156f-49e0-8f7f-5a72ea2d9866	f
2785caf0-7d37-4658-bc97-1c0df62b5941	19f41a26-8106-4fa2-b275-07266c4afdf0	f
5328aadf-c3cb-4f1a-9914-614ab50d56da	50dbb826-9330-4c55-8952-d1b050f3940b	t
5328aadf-c3cb-4f1a-9914-614ab50d56da	66b3a300-6971-4f0d-b936-e60cba2d2de7	t
5328aadf-c3cb-4f1a-9914-614ab50d56da	f08b7223-fef1-4af3-9ebf-40773e5a4779	t
5328aadf-c3cb-4f1a-9914-614ab50d56da	779f0fe6-ab9c-4998-8bc7-b5575052f67d	t
5328aadf-c3cb-4f1a-9914-614ab50d56da	00c132f3-40a5-45a8-9b68-af411830420d	t
5328aadf-c3cb-4f1a-9914-614ab50d56da	351fab28-c6c3-4368-a2d7-ec6cf6fd6fd7	t
5328aadf-c3cb-4f1a-9914-614ab50d56da	17fd8ec4-54da-4835-a3d4-3ab304175b72	f
5328aadf-c3cb-4f1a-9914-614ab50d56da	19685f60-4055-4026-bea6-31ade7543fe4	f
5328aadf-c3cb-4f1a-9914-614ab50d56da	04659a0d-ee92-4eef-a78b-b2dd808f5983	f
5328aadf-c3cb-4f1a-9914-614ab50d56da	2c35d9a2-156f-49e0-8f7f-5a72ea2d9866	f
5328aadf-c3cb-4f1a-9914-614ab50d56da	19f41a26-8106-4fa2-b275-07266c4afdf0	f
517c9410-ea2c-4e84-b47d-99acef0f53b6	351fab28-c6c3-4368-a2d7-ec6cf6fd6fd7	t
517c9410-ea2c-4e84-b47d-99acef0f53b6	50dbb826-9330-4c55-8952-d1b050f3940b	t
517c9410-ea2c-4e84-b47d-99acef0f53b6	f08b7223-fef1-4af3-9ebf-40773e5a4779	t
517c9410-ea2c-4e84-b47d-99acef0f53b6	00c132f3-40a5-45a8-9b68-af411830420d	t
517c9410-ea2c-4e84-b47d-99acef0f53b6	779f0fe6-ab9c-4998-8bc7-b5575052f67d	t
517c9410-ea2c-4e84-b47d-99acef0f53b6	66b3a300-6971-4f0d-b936-e60cba2d2de7	t
517c9410-ea2c-4e84-b47d-99acef0f53b6	19f41a26-8106-4fa2-b275-07266c4afdf0	f
517c9410-ea2c-4e84-b47d-99acef0f53b6	19685f60-4055-4026-bea6-31ade7543fe4	f
517c9410-ea2c-4e84-b47d-99acef0f53b6	17fd8ec4-54da-4835-a3d4-3ab304175b72	f
517c9410-ea2c-4e84-b47d-99acef0f53b6	2c35d9a2-156f-49e0-8f7f-5a72ea2d9866	f
517c9410-ea2c-4e84-b47d-99acef0f53b6	04659a0d-ee92-4eef-a78b-b2dd808f5983	f
\.


--
-- TOC entry 4249 (class 0 OID 17618)
-- Dependencies: 268
-- Data for Name: client_scope_role_mapping; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.client_scope_role_mapping (scope_id, role_id) FROM stdin;
047cffd4-87cf-42f6-899c-84886f43e2ca	b00ff4eb-4f89-4525-a6a5-d8e353cd8080
17fd8ec4-54da-4835-a3d4-3ab304175b72	ba2ac172-b3a7-4c10-85eb-487dce1c544c
\.


--
-- TOC entry 4267 (class 0 OID 17854)
-- Dependencies: 286
-- Data for Name: component; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.component (id, name, parent_id, provider_id, provider_type, realm_id, sub_type) FROM stdin;
9049d3fb-d4a8-4c51-babf-1942bab55053	Trusted Hosts	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	trusted-hosts	org.keycloak.services.clientregistration.policy.ClientRegistrationPolicy	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	anonymous
6be038d1-159e-4b28-a07e-cd68d45743ae	Consent Required	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	consent-required	org.keycloak.services.clientregistration.policy.ClientRegistrationPolicy	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	anonymous
08f935b1-9975-47f6-8d40-38fb8884c019	Full Scope Disabled	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	scope	org.keycloak.services.clientregistration.policy.ClientRegistrationPolicy	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	anonymous
3081c1cd-59e7-4a3f-aef5-d8db9930a049	Max Clients Limit	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	max-clients	org.keycloak.services.clientregistration.policy.ClientRegistrationPolicy	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	anonymous
ee62e7cd-3f98-4fb9-b3eb-ad18c8047b8e	Allowed Protocol Mapper Types	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	allowed-protocol-mappers	org.keycloak.services.clientregistration.policy.ClientRegistrationPolicy	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	anonymous
64226866-6b57-454e-8fd5-2193dc649882	Allowed Client Scopes	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	allowed-client-templates	org.keycloak.services.clientregistration.policy.ClientRegistrationPolicy	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	anonymous
ff7d0c7d-73f5-4cc2-bb71-1c924d1c90c7	Allowed Protocol Mapper Types	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	allowed-protocol-mappers	org.keycloak.services.clientregistration.policy.ClientRegistrationPolicy	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	authenticated
ded740a3-2758-4e71-aad8-c5b797de6415	Allowed Client Scopes	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	allowed-client-templates	org.keycloak.services.clientregistration.policy.ClientRegistrationPolicy	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	authenticated
8c6ec8d0-d426-403e-ba41-fa53ca146978	rsa-generated	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	rsa-generated	org.keycloak.keys.KeyProvider	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	\N
b47967d7-b39a-4067-95f9-6e138b7bbf42	rsa-enc-generated	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	rsa-enc-generated	org.keycloak.keys.KeyProvider	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	\N
97bc5624-688e-4a21-b634-82dd7b2c24d0	hmac-generated-hs512	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	hmac-generated	org.keycloak.keys.KeyProvider	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	\N
bc201fdb-c78d-46cb-a3ba-74ccaf1cb98e	aes-generated	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	aes-generated	org.keycloak.keys.KeyProvider	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	\N
32cd8944-746e-4100-9e33-e0ff0b1ab18d	\N	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	declarative-user-profile	org.keycloak.userprofile.UserProfileProvider	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	\N
0d75e13d-cfc4-4eed-80a3-4ac807af6910	rsa-generated	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	rsa-generated	org.keycloak.keys.KeyProvider	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	\N
15ba53fc-2c8c-487a-8e12-c2aedfb660ff	rsa-enc-generated	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	rsa-enc-generated	org.keycloak.keys.KeyProvider	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	\N
d5081eeb-95ed-4c14-a31e-3fb037eff3c9	hmac-generated-hs512	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	hmac-generated	org.keycloak.keys.KeyProvider	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	\N
b2f3ee65-5d16-43bf-8295-4524f82b1673	aes-generated	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	aes-generated	org.keycloak.keys.KeyProvider	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	\N
a51a43b9-5440-4937-a603-da89b80c8b75	Trusted Hosts	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	trusted-hosts	org.keycloak.services.clientregistration.policy.ClientRegistrationPolicy	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	anonymous
eaa14e6c-5cf5-4304-8eeb-da5d811cf3ae	Consent Required	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	consent-required	org.keycloak.services.clientregistration.policy.ClientRegistrationPolicy	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	anonymous
952f4e35-81ab-4e02-96c0-e5f66a37f4bf	Full Scope Disabled	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	scope	org.keycloak.services.clientregistration.policy.ClientRegistrationPolicy	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	anonymous
ee167321-c260-4175-9cc9-9bcb727ca116	Max Clients Limit	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	max-clients	org.keycloak.services.clientregistration.policy.ClientRegistrationPolicy	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	anonymous
4659f96a-42d4-42ef-bdd2-8791df266278	Allowed Protocol Mapper Types	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	allowed-protocol-mappers	org.keycloak.services.clientregistration.policy.ClientRegistrationPolicy	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	anonymous
0f6821ab-dc7a-4cab-a1ce-4bf0561f12ce	Allowed Client Scopes	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	allowed-client-templates	org.keycloak.services.clientregistration.policy.ClientRegistrationPolicy	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	anonymous
e76dd028-5d0b-464c-b739-caf1a6e04a01	Allowed Protocol Mapper Types	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	allowed-protocol-mappers	org.keycloak.services.clientregistration.policy.ClientRegistrationPolicy	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	authenticated
97dfd37d-dc12-4c3b-99fb-8ab40b6471d1	Allowed Client Scopes	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	allowed-client-templates	org.keycloak.services.clientregistration.policy.ClientRegistrationPolicy	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	authenticated
\.


--
-- TOC entry 4266 (class 0 OID 17849)
-- Dependencies: 285
-- Data for Name: component_config; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.component_config (id, component_id, name, value) FROM stdin;
cd7615c0-bb6d-40f1-b3fc-7d15160e41c1	3081c1cd-59e7-4a3f-aef5-d8db9930a049	max-clients	200
6be79998-653e-4fcd-8dae-83c632a77cda	ee62e7cd-3f98-4fb9-b3eb-ad18c8047b8e	allowed-protocol-mapper-types	oidc-address-mapper
dd1ad6c4-92fd-4369-8133-cd460f46389d	ee62e7cd-3f98-4fb9-b3eb-ad18c8047b8e	allowed-protocol-mapper-types	saml-user-property-mapper
bd73f601-e555-4180-95ad-3e3d4dfa76b3	ee62e7cd-3f98-4fb9-b3eb-ad18c8047b8e	allowed-protocol-mapper-types	oidc-full-name-mapper
488c4f65-ae55-4ff1-a3c0-602da17a10aa	ee62e7cd-3f98-4fb9-b3eb-ad18c8047b8e	allowed-protocol-mapper-types	oidc-usermodel-attribute-mapper
d89792a1-3e7d-4736-897b-1f2f518b1990	ee62e7cd-3f98-4fb9-b3eb-ad18c8047b8e	allowed-protocol-mapper-types	oidc-usermodel-property-mapper
5b096170-3836-4fb1-a46b-26e2b9054d54	ee62e7cd-3f98-4fb9-b3eb-ad18c8047b8e	allowed-protocol-mapper-types	saml-user-attribute-mapper
2ba9b4d9-95a1-4ec3-add0-bd41065d1951	ee62e7cd-3f98-4fb9-b3eb-ad18c8047b8e	allowed-protocol-mapper-types	oidc-sha256-pairwise-sub-mapper
22832fe5-53ee-4128-9065-c30917573b19	ee62e7cd-3f98-4fb9-b3eb-ad18c8047b8e	allowed-protocol-mapper-types	saml-role-list-mapper
86ccd420-8ce2-4554-ac90-2fc145407d24	9049d3fb-d4a8-4c51-babf-1942bab55053	host-sending-registration-request-must-match	true
d330b8ab-1521-438c-896a-672e2c23d1dd	9049d3fb-d4a8-4c51-babf-1942bab55053	client-uris-must-match	true
87a6d4b7-94e1-41a0-9911-5593b82c6c4e	64226866-6b57-454e-8fd5-2193dc649882	allow-default-scopes	true
1710c8d8-d46c-4ff0-b1c6-71acc4eb34f8	ff7d0c7d-73f5-4cc2-bb71-1c924d1c90c7	allowed-protocol-mapper-types	saml-user-property-mapper
33044341-a12c-44ff-b722-c4d9577c6763	ff7d0c7d-73f5-4cc2-bb71-1c924d1c90c7	allowed-protocol-mapper-types	oidc-address-mapper
aeef0db1-35be-4870-9177-591f1bf9b2c1	ff7d0c7d-73f5-4cc2-bb71-1c924d1c90c7	allowed-protocol-mapper-types	oidc-usermodel-property-mapper
46ea94d6-e0f9-4179-a374-9c78a16a8ea6	ff7d0c7d-73f5-4cc2-bb71-1c924d1c90c7	allowed-protocol-mapper-types	saml-user-attribute-mapper
a2374cd4-2a5e-4a7a-8a71-2bb5f2f3357b	ff7d0c7d-73f5-4cc2-bb71-1c924d1c90c7	allowed-protocol-mapper-types	saml-role-list-mapper
d4d00d07-1dd5-4561-8afc-5f7561fdf02a	ff7d0c7d-73f5-4cc2-bb71-1c924d1c90c7	allowed-protocol-mapper-types	oidc-full-name-mapper
5c96409e-0551-4afc-8cb5-6eb2d78d95f8	ff7d0c7d-73f5-4cc2-bb71-1c924d1c90c7	allowed-protocol-mapper-types	oidc-sha256-pairwise-sub-mapper
06afe31a-5c95-4000-ba20-78a5a127245b	ff7d0c7d-73f5-4cc2-bb71-1c924d1c90c7	allowed-protocol-mapper-types	oidc-usermodel-attribute-mapper
72033406-6bb1-4d4d-9394-cbc3fbd92569	ded740a3-2758-4e71-aad8-c5b797de6415	allow-default-scopes	true
2660eed9-8616-48eb-b481-6f5e414129dc	32cd8944-746e-4100-9e33-e0ff0b1ab18d	kc.user.profile.config	{"attributes":[{"name":"username","displayName":"${username}","validations":{"length":{"min":3,"max":255},"username-prohibited-characters":{},"up-username-not-idn-homograph":{}},"permissions":{"view":["admin","user"],"edit":["admin","user"]},"multivalued":false},{"name":"email","displayName":"${email}","validations":{"email":{},"length":{"max":255}},"permissions":{"view":["admin","user"],"edit":["admin","user"]},"multivalued":false},{"name":"firstName","displayName":"${firstName}","validations":{"length":{"max":255},"person-name-prohibited-characters":{}},"permissions":{"view":["admin","user"],"edit":["admin","user"]},"multivalued":false},{"name":"lastName","displayName":"${lastName}","validations":{"length":{"max":255},"person-name-prohibited-characters":{}},"permissions":{"view":["admin","user"],"edit":["admin","user"]},"multivalued":false}],"groups":[{"name":"user-metadata","displayHeader":"User metadata","displayDescription":"Attributes, which refer to user metadata"}]}
843bb2d2-6a40-4c38-9421-2de61a219503	8c6ec8d0-d426-403e-ba41-fa53ca146978	keyUse	SIG
c2526223-0c77-4eaa-a2da-ec4af19312df	8c6ec8d0-d426-403e-ba41-fa53ca146978	priority	100
0b6b6f3d-53ef-4c0d-9f87-2cadcab25458	8c6ec8d0-d426-403e-ba41-fa53ca146978	privateKey	MIIEowIBAAKCAQEAvaubAi6CZY23jtpEoJfT4Z0dR6weaisfohQSZeeAVfTj4XZ6oGb+WE0Ipnuja7ZhCsP8taoLceJvgkMd/SAf0+gnJv9uZ4LibLIsgWyhLDNLxy4vLiWxU9MgdIUW5KtoBA+1bIj2BRxSkU326Dj7ZCHbrz33CDdFV1LZjLaLk1VlLuKT2E2KZZU9EP8nPK6RZykwdtcJmMR2zR6Ou+TLJ/j+d0qczVp8rKuiTf3kKG1WAtncWDMmaGCHbslPfX1hmQOIGWPa96cJijdjZ5MTTvCVFg1ltKME+koArxzAUl3kDonCAn0hs+Tw5uDCoi4JzQM51cd0yMecGEUZFjv1+wIDAQABAoIBAE+3xaHIHIREaScAdCGvTp2f5IOQQwRKdbQwjX8JKvZ1xCWqH2Y1g6dnUUBv7MLD18unjhpoiwDltApi3ULbcqUlCPeqGiQlbbdTt8L5/k/Oi4X+0lOqAfsCXLy8h1+67y/tzkn80rJZMhbiVulJsddnJ6di+uYYHOvT5Z3vx4A3hFv36jtWZhWj5QDyngTNFBAr4nPljWX0ha8CSunb7LzwjA0i74PMmgvavrreEPD2DfI7O9jxErozQLpq/c0/Rx5OkNRGtfkB6E1HWBCvrpQX7WRllPIP4IZ79zj62dT3xNwjm4JiELPKPNLPeBlbbv2j5LYUhyyfJ88Bi8KtSbkCgYEA+nekrEswkAsKxqiyZiZiai3QAAGH8d1ge6OT5W4WZn7K6RxQf1dVCFOG+2SQcT7GdrcGq/tIsWamnwII80mm6DRbelI2uk9GN/L/yPSNcerlbbk2tjGjHKKqlmxZxLDrzR7dqvVgQ0wBCmkADAbJMXO4aqtZWPrCfugYnkWeA0UCgYEAwdwp8twKT9kFge7s3DsLac2WGHkGxjXr/btTYc3/jWNOUvCIx4hBO/LdrbDPo/mQIYfyBnlKcoXSAfLpRRFbU6xVdTOrBStGPD7dEYNRB3x2k8XU9CjehLyDNfuzL2FzokyBJXKRmWGp9OMybQwrlQ92czZaGLVg+uRqf/+zCD8CgYEA6N1BodpKLTHG9Ao1ytkXGMa9IrRJsynyISFlSKLAesyZVH+5q5sDeLlHvwSxckg99nOV5WG8JQteEGmw7phkcHD1N9WmAjPgAfaPr0MHGomcgxX28w9VKjNmTHIyR7eBk/SFfQOjWw4XzZjvrT7F4Y9IPwxOBnclSx34fXYWQc0CgYATKwG60abzXjH9NvKUlAH85CcDJHRXBN3gqLUF5qhuAnOsH7xmfkJ0+v6QPftJ61Mk/Zwgp72EtVaeerY17hFppJCOlh1C1ZSMQGr7YFCSvOu8kMMNoTzfQwR2Qfzlom0cjxP17+4VjGKRpCVIQvvMMUs0+RrPdp+wLwWYwl+hYQKBgBrXk1mCfAH+KKNrGGGTgO53lTJRyfFQP+t6/AjSOO+DBuuJs/HGhAWHc77fyMzZ1SIPJfp2kd3WsqzoV7f92UZIrcigZcnBcZO86hqW455GmEtZ639IRuldffv2CnBBZ8UJWdJDLmISXHNdsTDZUlonDvI8oLPKZ5CEA/tgVvBn
eeceec34-5b22-403b-a8ff-0a608dd11604	8c6ec8d0-d426-403e-ba41-fa53ca146978	certificate	MIICmzCCAYMCBgGackjGJDANBgkqhkiG9w0BAQsFADARMQ8wDQYDVQQDDAZtYXN0ZXIwHhcNMjUxMTExMDkzNzQzWhcNMzUxMTExMDkzOTIzWjARMQ8wDQYDVQQDDAZtYXN0ZXIwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQC9q5sCLoJljbeO2kSgl9PhnR1HrB5qKx+iFBJl54BV9OPhdnqgZv5YTQime6NrtmEKw/y1qgtx4m+CQx39IB/T6Ccm/25nguJssiyBbKEsM0vHLi8uJbFT0yB0hRbkq2gED7VsiPYFHFKRTfboOPtkIduvPfcIN0VXUtmMtouTVWUu4pPYTYpllT0Q/yc8rpFnKTB21wmYxHbNHo675Msn+P53SpzNWnysq6JN/eQobVYC2dxYMyZoYIduyU99fWGZA4gZY9r3pwmKN2NnkxNO8JUWDWW0owT6SgCvHMBSXeQOicICfSGz5PDm4MKiLgnNAznVx3TIx5wYRRkWO/X7AgMBAAEwDQYJKoZIhvcNAQELBQADggEBAKmZXR3TsSxzWZzmmtaI+kHZ3gXdMmpjTzfUA2CNk51JNfrmCFacFITxJj4+zX0q8SfneqCSuHJtWagtgndAy6olI5IdeLeRUaUEce3KJD2S6Z1TC9mUVI60NGEYOv/1A1IKHLK2BWzd4f70HDYI+92ZKfEp+RGfX9qJ1sMW6gwMoaUitIU6gmoNkRwWbi/3GJhus74AiYyHsCOSFohlR1Am/QbC0p5pOYn8sa0p91BRHVTRlJ7P0eHMc5dQD51e7Muy8bGj9BFz2B5B4arpTZd2T2yPN4Ej7aBiY8bdv7VzIIV61vTE9tFasZHwBZaRMtpewdYbI/BiPq75rgTgzu0=
6f89f4ad-2a5a-4a48-be60-e0ae85f49a54	b47967d7-b39a-4067-95f9-6e138b7bbf42	keyUse	ENC
8c776c99-f59a-4650-a989-5b02dae669b1	b2f3ee65-5d16-43bf-8295-4524f82b1673	priority	100
6b831145-bc66-4d1c-a3aa-b305ec6d4a8e	b2f3ee65-5d16-43bf-8295-4524f82b1673	kid	78eb91fe-c4e3-4f30-9992-b911337ba2bd
2ba4fcd5-ab71-4941-9c96-016eed7f6e92	b2f3ee65-5d16-43bf-8295-4524f82b1673	secret	NmyfoPV5MhRoM5vzIfb6dA
fa99d171-5e20-4301-b9c3-756adfb28d14	15ba53fc-2c8c-487a-8e12-c2aedfb660ff	algorithm	RSA-OAEP
2fea3fa0-c521-440a-81d8-639281636f7e	b47967d7-b39a-4067-95f9-6e138b7bbf42	privateKey	MIIEpAIBAAKCAQEArTSDnnK01nkSEamD+jxIDyMZT1oLkjtbNvepaT3dHvEdGuKLlE9tRKzTuWGoBR8/exk9L20IuTdbYmtZAHwI5gW0wSn6ocWfmsOjD925UtnFzWkZJU02CBSbqmf0yxBBkpSmYbIrbo3fdFQre/KtZMm4wkUNGTZz7AhyyVmRVV5t0+nWtQORO2ujH4MG9xSNOYan6tckRMX7ZypePq2r3uWYU9+0XfzbYBtYRswXb10wCcj70ervg2DerhmD2oEhVbypTNXL764unGerhbDlPBI3CTHCEkSiDY4FAAgUyYdpbJvZQqh3RTPuZwGiyJ3ovWfbtkuESbzl5sww+UgzXQIDAQABAoIBACs0Q7aU30X2akrskWasfb8E3s3b5LIDy1NxQJlnXI5Yz41CwFVs4JE2WRPPZ8VrT37pw0jetkPZKproswk7Z07VUoqyaXnL3W2R6k1NXepsNvpvgl27HkSyu0es6bNzaR/io4QQGORZUEloq3YeCSFwbf1LkyJcYlsYmmVeSbHU1Fiz20h1amQ4SGpG8vErekXARZz8ApD4n3VawTe3TwElVbJ121pA3XEPW3tuBuPwaP/yxF7E3gSUJzXCqPm0876gwtP/b0lVyyqtmG9ZEmaVjwhxh+9jr0FfWqRhDyV7in204qvoKc9sW9l0xxLJI3G6146dFIq1oys7f3VBp7MCgYEA4gt2dyYO5AAE8Gs6c/fCjgnxtWCopG4eZ3FzZcJyG0uIuyqYiwgWBLsmJiVKj8lDLFRI1gz3sf3wTTiqCZ+cJNMMBKiwAMGGfig8HWIATN9Z4Hun/SRkOKiZclQMNHZ60XkSiuYtuMpaTHpkwkSQAIUSZDcDLTIGsAoyS9lBmOMCgYEAxCh5UwKJzODoZCE7QIXPBLfSeCtd7q/yvxxqMGg+Dx22aNvEvbQTrW/BqJHnmJPkbWRWyuj819mr7CeBjZh4pOppxmZdgdE8YD6J64Ep4IlB5omlSxy4piNeuygj4QlJxvNZsbH2J/6uJAeNu8LW3ej7EMri6J+M9tMr2Zpv9r8CgYAKgKfXb2A/vbR9Cy5jFv7mJJYjbENJqIgnHEFVWAx/Mio/MAJ4az7Cp4NlQFRPi/VgCOZ9c4rKrVbN77UOz2is2VV0nfXXgyZhlDL+1n/XEoWVhYlPnLI/Y64Fftw2T87zDqIK7Bjxvg0mAoXN9OuP6p7pIxk1r15aLY8asRR4KwKBgQCDj63HmfU4P0Q+G/e0j8pIHM4BoPxwIPwLZ5BlBRVSaBg2feeXYFauRT06xRjywYY8REbd8qPaVXi0e86tXCzWVw44beGbNu1qk6dHF6sxmH1llL4TAaFqdGCN4B8oSGV+FSr8PiKdsnezXImX+9bGoQL6wUiswo314a4QVT9w2wKBgQC7uBk+hu9WZrcIK6KUMTwbCpZHFHur6Pt856vEDHk6lrvRotXljXDv/Whoem2baNsAiPErF9D19WqDJy/d/3eQicwQbhyv9LPBKKr/gYpL4dZiqBFPfthFKCgfoQfvtdYVtVjw1bQEUJggATUMBzwWyY1uJPAZWav3RFaSAxPh3w==
70025e58-392c-4458-95d3-693dc23b24ac	b47967d7-b39a-4067-95f9-6e138b7bbf42	priority	100
05074446-4a19-494f-884e-e7b1bd80e1ea	b47967d7-b39a-4067-95f9-6e138b7bbf42	certificate	MIICmzCCAYMCBgGackjHzDANBgkqhkiG9w0BAQsFADARMQ8wDQYDVQQDDAZtYXN0ZXIwHhcNMjUxMTExMDkzNzQzWhcNMzUxMTExMDkzOTIzWjARMQ8wDQYDVQQDDAZtYXN0ZXIwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQCtNIOecrTWeRIRqYP6PEgPIxlPWguSO1s296lpPd0e8R0a4ouUT21ErNO5YagFHz97GT0vbQi5N1tia1kAfAjmBbTBKfqhxZ+aw6MP3blS2cXNaRklTTYIFJuqZ/TLEEGSlKZhsitujd90VCt78q1kybjCRQ0ZNnPsCHLJWZFVXm3T6da1A5E7a6Mfgwb3FI05hqfq1yRExftnKl4+rave5ZhT37Rd/NtgG1hGzBdvXTAJyPvR6u+DYN6uGYPagSFVvKlM1cvvri6cZ6uFsOU8EjcJMcISRKINjgUACBTJh2lsm9lCqHdFM+5nAaLInei9Z9u2S4RJvOXmzDD5SDNdAgMBAAEwDQYJKoZIhvcNAQELBQADggEBAHKvr2MVWoHLmNLUudUjfWXDg194IbGaaIctMFTWApv6yOASp/TM3H8h59iDmZDCsaL9dxGJ5P5GmMveW9mNir5xQD09/huRVL1SCjIj0TKR4RYTtjZy1OwYBCe+CjDG2rRhezSkEmby7Aa4zaWjgmgjbf+oulaKdF8vOSgiFqtX1+3CJmkKUe1jTniUJMKYqDUxe5BmKyKqVZG1ZAQ+H8/w5yCvRkti95z7V9Zj87DMFPqh3A2okTTw5tBjNJ/Sh71QA6eKTE6w4PwDIPPF1ATj80Ukju5Bu50nkwi5lFmRMoEpFZIQIr6984p0y1E15eeQ/bPmkG2NPi9i4shzFy4=
d2197bd1-6847-44ab-808d-02c047b0f21f	b47967d7-b39a-4067-95f9-6e138b7bbf42	algorithm	RSA-OAEP
a35c9e12-fdd8-4daf-b31d-b1b9504d1bbe	97bc5624-688e-4a21-b634-82dd7b2c24d0	priority	100
fcbecc0e-997d-4d46-8b3d-45e14ad035cf	97bc5624-688e-4a21-b634-82dd7b2c24d0	algorithm	HS512
41561aa2-2bed-4331-b098-d6ac870e9ef0	97bc5624-688e-4a21-b634-82dd7b2c24d0	kid	96357972-4ceb-4edd-87f8-4ff3ad712de6
c023643f-8a88-4608-a1be-9adcebfbf4a2	97bc5624-688e-4a21-b634-82dd7b2c24d0	secret	Cm2kJs6ZGUFXvGOCHmNLLfyQtfNgGGRyX8WWjnYx1wRcKGqsUTHp9jdFNwTAu02eO5qX5a6TEXoYzOvxKQkdGMa9ZH2RDKMGgWp6hGvqAR5mrG612P5GqbGyGJnawhIY_-Rd1YSo9mKHIyrss8EqHDs6J4Xr6U2TfpDyabxPXOY
3b9fbfea-1064-4dbe-84e6-897fa134637a	bc201fdb-c78d-46cb-a3ba-74ccaf1cb98e	kid	7d2367e4-3eef-4352-a6e6-1328526ddfbd
ecb818ad-79bf-40ab-874a-79416868d69f	bc201fdb-c78d-46cb-a3ba-74ccaf1cb98e	priority	100
71b08068-c13a-43e0-b994-08be8f3fc070	bc201fdb-c78d-46cb-a3ba-74ccaf1cb98e	secret	X_s-Iggs1ADiEKoDrOx1ng
7fb724a5-626b-4a7f-b4ab-222ae852f4a6	15ba53fc-2c8c-487a-8e12-c2aedfb660ff	certificate	MIICmTCCAYECBgGacw2RqTANBgkqhkiG9w0BAQsFADAQMQ4wDAYDVQQDDAVEUkNDUzAeFw0yNTExMTExMzEyNDBaFw0zNTExMTExMzE0MjBaMBAxDjAMBgNVBAMMBURSQ0NTMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAlOLq5IUUra7FAWf6ZNIPOIZRBSe2US0gUz4F5Bjn+rrEbsHRzPNaIL6GPtSiBk+/Kn8AoyzH9U2aBCxe7EyJrfJ1dcBB608uHddWSV7JT41DqZlGyMNOaNT/uQq10zTi8qaePdh+0zMsPtf+DmEHlE+UC6jeBOmsHDOIDNn9f+ANH01tA1/5bpovs3XZI0I2PpMvS/jyIbCM+eIxkBkaokIOEbPyZM/kdjokUPpt3mm/NophhOcLeVW317Gr9kCzhd+LuD6YAicp3P6JM/JMn110/Aa1qZV1wXya+Zp2yUCZbXxgtWbl30cdMsM+qpKDb9TUvz5cGA9TR9PArNOeiwIDAQABMA0GCSqGSIb3DQEBCwUAA4IBAQBTLd4KAIMxEbcaqaJm1F7kO9+CjoaGhILoG+WbLJJgE8hfajj1HQecuk2fkoZHq5pLr7vd2ODcWVmxpVi6j0viz6cG0fYmhV/m15fvG564iJJDVLbHRzmqDNWCwrN/KlZL1HNNqpVhqUr0gSEJavvuZv4JatB57T1fYRwinCoD3BIVqhORkJ6ARTRBJO79j6uQ4Nt1UUh5UBcIM3Wro5bfYw5Htpytleu9dLCW2l12GGaFHhGhqs8dVAFwVE21b28dfM2xEmiKq1QK3aqrfwfqky5VHFXDHGjuCgh2KyQ47rcCLkVyELygXKfHd1urkPTI7zKzoJsgnlpHM4MVLh3x
667992f8-4c06-48c9-ba95-3a496a3a060f	15ba53fc-2c8c-487a-8e12-c2aedfb660ff	keyUse	ENC
a6031bfe-ef22-45b4-9a30-9d131f454bfb	15ba53fc-2c8c-487a-8e12-c2aedfb660ff	privateKey	MIIEpAIBAAKCAQEAlOLq5IUUra7FAWf6ZNIPOIZRBSe2US0gUz4F5Bjn+rrEbsHRzPNaIL6GPtSiBk+/Kn8AoyzH9U2aBCxe7EyJrfJ1dcBB608uHddWSV7JT41DqZlGyMNOaNT/uQq10zTi8qaePdh+0zMsPtf+DmEHlE+UC6jeBOmsHDOIDNn9f+ANH01tA1/5bpovs3XZI0I2PpMvS/jyIbCM+eIxkBkaokIOEbPyZM/kdjokUPpt3mm/NophhOcLeVW317Gr9kCzhd+LuD6YAicp3P6JM/JMn110/Aa1qZV1wXya+Zp2yUCZbXxgtWbl30cdMsM+qpKDb9TUvz5cGA9TR9PArNOeiwIDAQABAoIBABPUBKRadN6MoAAH8PjsYMqOWMvu9gDpmZx8bhxqlLp3lSGK/n3lCuPBe+9yMgHVLQhj0ZnppNeudgyIPDwMFWntGGeOKzlDWkjvHLa4wOavUYuMtjiWiiK7+zKRkpWGPZNDTV+/LWTDM+lKqrMPiQrfbj//RVIyLJG06zGK9o/I+u+Wj1NA7f7E7t6eCyuv3X9meH6YeQ0l3tT1I5Of/pHsnFnLSbE1xI3laId2BzV5iDOiEEidZi4w8EcREnDxPl3Xd+qTilKwqCya5V/0YT2tSzsqIK9t5rc/v9tCEk2o72LppUR0D+cydo+OHFDOnaGBnmaPxzsA5szbOGObNEECgYEAyXL1VUZ6n06Ioz7nknw/a/p7HgZLVZQcMLLcJIAkDP/mnLy5y++3n7severqCyI+vpIogYxdKA8pE8ZV7U2bJzrI+l3aZF9j2wWdfRthkdmTMqpxu3pBhm43GC2i6D+lm37WAwXJcU/bUZK4YG9r8H75/OqlX4oRdTVU5ED9c18CgYEAvTQpMfcUttHYXS/lCwBSiQ4+UWq5Wq/eoHoPa9ZdLBUBn5qtjZH45C73E2zpPRa4VAZl+9C3cfmR0ZbVP2vD1nf4ISG9dWOOMZc6+fHMD2t+cQAAkUB/ojXAQfIob1ZbfTuVd1F7idFJmkpCXa0aawwYjtmUH6uNpzsHvbeFsFUCgYEAkHnMDb6gTwSp5jpFJr/JVI2uIthsyxGQLjT4wYzNTi1xnVOVBPgFf59Z6udBt3519YMpXc/nN8W3tiD2m1yfO8FjRnxtFrN7ECe0zXcHwOyEL0AilUyXFeyRwttoDJ0pDp4mqsBJuuSE7LoHVdJTXYYTkBpRRHXnE2KOYa1imI0CgYA8zLpAOCoL5bsllvJ/aocbS9xyxVzy63kbEJ5MBQLD26w94bLLv5C/ouf68hCxdM+fEL9NAHEyywQ02ceFLdgs3zh5TSJYyrky7mohT7ZHbj+fiGSmSJe7RJKXnn2n6ZRU1gTd5u1QCFUio6JX//xxUd3CaeDTnIlUp/+A06y+UQKBgQDBuXwQLlz6/Z8WEJ+4wAbATZ/CffLb2Sn5rv6ceNLDxCcMdjjyjeM5v2R4h8g5eMAye2i/2MSFCmegUmGVcxVGqb9+EXD9jfidYpRdiHWZn47XxVIBoN8ERBnxX6eVHSN4Bd/B3UUx4KIcJlnvd8Y/GZhmetIXrqcIc1lgxh2Hbw==
cc0493b8-e569-46ef-a69e-2c225026eb2f	15ba53fc-2c8c-487a-8e12-c2aedfb660ff	priority	100
1f920a92-6f80-4af2-818f-faa64c0d31cc	d5081eeb-95ed-4c14-a31e-3fb037eff3c9	secret	cYTLTaMoZ6da-jwe63Q_ygdmGKbsXl5TpXanRppirAR2U4xGa3jvGnR4U7P6CEBppFezn3UT8aCrbrTtYOUMUue5S6mSKMmOieDMU63RV2P57C1M2rgQX02r_q1tJkdz6IgG-X1YUHRHwBt4Y6jCRXCZQ-wLqRfCFZM6-A7Br_c
c12edfcc-1573-4087-b188-7dc7053cb9d1	d5081eeb-95ed-4c14-a31e-3fb037eff3c9	priority	100
169634a5-2e2e-4739-8f38-92e68cbfc2ef	d5081eeb-95ed-4c14-a31e-3fb037eff3c9	kid	5d0d0228-43d7-493e-8412-374f62e9d904
d3293fe3-1768-4171-ae29-03c5ce124268	d5081eeb-95ed-4c14-a31e-3fb037eff3c9	algorithm	HS512
434d287a-2c45-4bb2-91cd-2b43c48de88d	0d75e13d-cfc4-4eed-80a3-4ac807af6910	certificate	MIICmTCCAYECBgGacw2RCDANBgkqhkiG9w0BAQsFADAQMQ4wDAYDVQQDDAVEUkNDUzAeFw0yNTExMTExMzEyNDBaFw0zNTExMTExMzE0MjBaMBAxDjAMBgNVBAMMBURSQ0NTMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEApheR4m8jZC+n6PSE7Bi+mYV8XF9V1rkYiAbr5WMZ1YiGUaOSPOtOW1nl7oojlBlL1AV5CeoAcDOfBC9YLJsFuOzxOCP8JnjVl/CZoyJDfJwaDyDHLSHhNYWQPlEZTIoEFSa/NN913JZho3ZfLhVOwK0lZkXt5sF90GOvIYrAoZUmxBQ6Xqc5cP+ddN1TXgiUApC7CXNULqvb7DZVj2E81JOuNC9GUqdHvvbs7CF9SbcQaK/Y6hOX6q6itmV3sZwrWYCC0ocdBRjuk9j2yHXttsn51GQES7XWnAAUwLu6Y672VTt3sTpRC0z3WazJkFE8SuzdbrFf5apI8VkloaCcqQIDAQABMA0GCSqGSIb3DQEBCwUAA4IBAQA+Qxsyp7SS9BNmrSfqwFwmjpwrWBCMtCidXqj9BOzmuqj7dtRsne3zdwoaoHMewPqK6fHkSbOSEg2I6+QhiD2wHb5AlZwvJriyLYqYTlJOVOVPdZ5aao3jlJV7zGMYNblGyuChHA0BhUs+kX2hTM3OhiXp3xb3f1qUhB54iU5rv/NHS4p+Kij1IuO7LcooaWmCazFxKWizIIGTJvpSr15B7FaD8YRNQSqX+h4lltZQ8j+/aRBKTXfyelXnwLpl5tucgCpKWHV5t/55z2tncVHDIPOFxCqNh97xWA88f1rFrkDEx0iJUG/4/AG0g/cr2C1PyGqWNoITtYHvNSs4qBQn
1f3a6a32-2796-485b-bbbc-4266845a2d84	0d75e13d-cfc4-4eed-80a3-4ac807af6910	privateKey	MIIEowIBAAKCAQEApheR4m8jZC+n6PSE7Bi+mYV8XF9V1rkYiAbr5WMZ1YiGUaOSPOtOW1nl7oojlBlL1AV5CeoAcDOfBC9YLJsFuOzxOCP8JnjVl/CZoyJDfJwaDyDHLSHhNYWQPlEZTIoEFSa/NN913JZho3ZfLhVOwK0lZkXt5sF90GOvIYrAoZUmxBQ6Xqc5cP+ddN1TXgiUApC7CXNULqvb7DZVj2E81JOuNC9GUqdHvvbs7CF9SbcQaK/Y6hOX6q6itmV3sZwrWYCC0ocdBRjuk9j2yHXttsn51GQES7XWnAAUwLu6Y672VTt3sTpRC0z3WazJkFE8SuzdbrFf5apI8VkloaCcqQIDAQABAoIBACWF8alsXlyF/7M7esQ0GutoIt5jk2r9SjOBDM44A2AghefvwlwM9RjiSHYJs1wEEwOFcQDyYsL2hphVceAx7asHrL94McEnT2oSK0OVvBVs1t5QE2941f5XfGz3uXV3QNDefhgd2+zH9KsPVRV+LtqMw4RFjCez0w6/VpOHW1mlkX0QhghaqMnQmxmpFKGb9wQBGFobSNrdwN0Hamz5QuXpNEvLXNjsZBKAsgM1PF/OEyxf6nCZSMP9aqTxyCeAYNgZ0MrxLf7XfiUldoHnJUokP1QTacfxvCRYY0qsbzVQ12v/dkYEe4/KR9tEEfRXbjchArT+shIMib2JTo5B6GECgYEA0JXI/niWt67dIDxy7tM8BMbXvpjNwKdvzOj1pRI+5b5hxIND6uS3Ly8F5OUHm0yi/6VCHTHSjgGk+D+GdLyo+NGlSuUI6RjuUmYXNZoHJ3iQJ3Su7LgJ7++YZhhMyR61lBbIlgNnw3eIiSbJa8/cIssQEkvhBJ96JJyCpoKxqw0CgYEAy9j7v7RlEjpQDO7BfwTbsesLUPgAXkWFX8eG93EAdBRcRT5BjjBUFfQJ/VgRNdQXts/BTOoomeqXOlAz40sdllJq/TJgwi/HwwBtsfoVbqDSti9isGZGiz20E7f2/Ac/OUk4/S33CvYvtJzYJBlOOK50tXQxO569Bt4R8GE3YQ0CgYARHdmKmFa16BGZTZyY4JiyQ6b8qwlnX9Ya2Jsf2qlyrPbU63itU+t8Yb14FRtUsStHE0ajoq0GnjftbzkXZ0vubzXDOZxLlJIqDNqmuWcQ5CHgOwEHx+p42A6HgkL61hxMdLotJUZkkfCQYLByunH0IPnGppdmi7e4PWezRlJSGQKBgQC6eqAqymsflqq+efgXK6mTBFNQ2d70XqLZcN0eJYjlp+6VBZPQ8JMrlhlBYrwzwveCrGHH6/oCe+GmXdJp3sCNUI5BXEG5wx36XLz88KuEjajVM1oTxyxHmsXOuB9AhZyn2j1BFziFFZuknUr5ExFEtwtbJ5UWVmvUCXjdrwGLTQKBgGZrwZi8/xohEcskWo6RKDpqQWgmbUyU3nSgtPr697WwM38hkqV40XYH94dOCrPAF62xR/70c3ADENyo0q4IKeiz78Bc+2cJXswC8TIRyQIbikYRbvLi017YpInkDQq6ytg4SUEn/lZRtK5TD74tbJ1IEVKWO1pG1t2VsNUBWCrD
b4691d8f-494c-4d1e-ba85-66a4203b0aba	0d75e13d-cfc4-4eed-80a3-4ac807af6910	keyUse	SIG
ea4283a0-31cf-4543-a546-b3b17a0024c7	0d75e13d-cfc4-4eed-80a3-4ac807af6910	priority	100
73867d45-eb92-463b-a9ad-004cd1555bba	4659f96a-42d4-42ef-bdd2-8791df266278	allowed-protocol-mapper-types	oidc-sha256-pairwise-sub-mapper
f95e1e8b-9f97-4301-87b1-f7258c23fbeb	4659f96a-42d4-42ef-bdd2-8791df266278	allowed-protocol-mapper-types	saml-user-property-mapper
4335ce29-3713-491e-8403-be0cb2892a19	4659f96a-42d4-42ef-bdd2-8791df266278	allowed-protocol-mapper-types	oidc-address-mapper
50ff46db-a76d-4705-a30a-ed77efbcc59e	4659f96a-42d4-42ef-bdd2-8791df266278	allowed-protocol-mapper-types	oidc-full-name-mapper
2cbd6565-e4cf-4af6-af86-3cd91cf68375	4659f96a-42d4-42ef-bdd2-8791df266278	allowed-protocol-mapper-types	saml-user-attribute-mapper
52ca89b3-fc87-4fb0-9d2b-eb1d2729f7b4	4659f96a-42d4-42ef-bdd2-8791df266278	allowed-protocol-mapper-types	oidc-usermodel-property-mapper
7df50b00-7a11-4d03-be1c-0e8038dac648	4659f96a-42d4-42ef-bdd2-8791df266278	allowed-protocol-mapper-types	oidc-usermodel-attribute-mapper
8ee853e5-3e5e-48c2-a655-9516ae70d3fa	4659f96a-42d4-42ef-bdd2-8791df266278	allowed-protocol-mapper-types	saml-role-list-mapper
dc7c15de-f08b-4404-a80b-f32f5e264ee9	e76dd028-5d0b-464c-b739-caf1a6e04a01	allowed-protocol-mapper-types	saml-role-list-mapper
7da44cdd-c32f-466c-acbe-ff7fec723fca	e76dd028-5d0b-464c-b739-caf1a6e04a01	allowed-protocol-mapper-types	saml-user-attribute-mapper
39c91782-1f8b-4776-a7be-7bf111186d92	e76dd028-5d0b-464c-b739-caf1a6e04a01	allowed-protocol-mapper-types	oidc-usermodel-property-mapper
1d9ecb94-d67e-4ad6-90b3-9fc33b1cd3d1	e76dd028-5d0b-464c-b739-caf1a6e04a01	allowed-protocol-mapper-types	oidc-address-mapper
d8ff9f33-d208-46c4-8538-2f4ee96b015f	e76dd028-5d0b-464c-b739-caf1a6e04a01	allowed-protocol-mapper-types	oidc-sha256-pairwise-sub-mapper
2c71d8fd-37cd-428c-a528-b61e518f15ee	e76dd028-5d0b-464c-b739-caf1a6e04a01	allowed-protocol-mapper-types	saml-user-property-mapper
a3e2e0ff-21b6-4e55-82c6-a965c6e3d081	e76dd028-5d0b-464c-b739-caf1a6e04a01	allowed-protocol-mapper-types	oidc-usermodel-attribute-mapper
5a12b6fb-4001-4e38-bbf9-98fa6e8f830a	e76dd028-5d0b-464c-b739-caf1a6e04a01	allowed-protocol-mapper-types	oidc-full-name-mapper
102780aa-6611-4d98-b48f-897ca25bbf77	a51a43b9-5440-4937-a603-da89b80c8b75	host-sending-registration-request-must-match	true
caf91683-9b9a-4c3c-acf1-68e9aedf6a7f	a51a43b9-5440-4937-a603-da89b80c8b75	client-uris-must-match	true
91d312e7-79f0-4ed8-9a74-39344b3b42e1	ee167321-c260-4175-9cc9-9bcb727ca116	max-clients	200
b7c7ad9c-5b06-42de-8c71-8d4835afc844	97dfd37d-dc12-4c3b-99fb-8ab40b6471d1	allow-default-scopes	true
bdba7bd2-66f9-41e2-b646-9bee80f12dce	0f6821ab-dc7a-4cab-a1ce-4bf0561f12ce	allow-default-scopes	true
\.


--
-- TOC entry 4199 (class 0 OID 16751)
-- Dependencies: 218
-- Data for Name: composite_role; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.composite_role (composite, child_role) FROM stdin;
f5c39b89-0988-4502-b22b-79522131772f	e5dfb957-3b08-4cec-aba8-1157091ffe7d
f5c39b89-0988-4502-b22b-79522131772f	b9759962-c0b8-42ac-9b88-39561f2c4f9b
f5c39b89-0988-4502-b22b-79522131772f	db70e6c9-a228-4cf6-b966-8d0fa2ca5700
f5c39b89-0988-4502-b22b-79522131772f	048b8c05-b2bd-49c7-9eff-ea8f74a4b9d7
f5c39b89-0988-4502-b22b-79522131772f	93232036-41be-43b2-9b7a-e32755794e2c
f5c39b89-0988-4502-b22b-79522131772f	26b9c7e6-cdff-4265-bfc0-a163c5bb860f
f5c39b89-0988-4502-b22b-79522131772f	a645be1c-3418-409e-a193-9d0c2b34229f
f5c39b89-0988-4502-b22b-79522131772f	9168b0d5-71a5-4fc4-bb5a-79a1ccf3603d
f5c39b89-0988-4502-b22b-79522131772f	ba1a1ed9-962f-4a95-b501-8c5f323056ac
f5c39b89-0988-4502-b22b-79522131772f	39ea07db-e385-4c49-ae1d-abde15c050b5
f5c39b89-0988-4502-b22b-79522131772f	9dab48bf-2a33-4252-942a-786e4eb0d18d
f5c39b89-0988-4502-b22b-79522131772f	9585fce2-55af-416e-85dc-0e3155546b40
f5c39b89-0988-4502-b22b-79522131772f	68e3770d-e06c-480c-a30e-da7fafcacd55
f5c39b89-0988-4502-b22b-79522131772f	298001e2-eeaa-40b3-8f07-88d881da4fd6
f5c39b89-0988-4502-b22b-79522131772f	9bddb9d1-bbb9-4671-8d42-ef3fed8685bc
f5c39b89-0988-4502-b22b-79522131772f	3e90ce27-8b5d-4f18-8537-da763c9370a5
f5c39b89-0988-4502-b22b-79522131772f	2fee280b-9488-48d2-969a-23f14bfdc623
f5c39b89-0988-4502-b22b-79522131772f	981b5877-c629-4e2d-b118-a09ac929eea8
048b8c05-b2bd-49c7-9eff-ea8f74a4b9d7	9bddb9d1-bbb9-4671-8d42-ef3fed8685bc
048b8c05-b2bd-49c7-9eff-ea8f74a4b9d7	981b5877-c629-4e2d-b118-a09ac929eea8
2a61cf53-4e85-4ef6-a9df-4b44da0b27ff	9a71ab08-248a-4db0-a65a-394fb7595101
93232036-41be-43b2-9b7a-e32755794e2c	3e90ce27-8b5d-4f18-8537-da763c9370a5
2a61cf53-4e85-4ef6-a9df-4b44da0b27ff	f911ee86-369e-4fa9-a8b7-b243851bde1f
f911ee86-369e-4fa9-a8b7-b243851bde1f	b015d6de-abd7-4e30-81a2-956f37220ed1
6ddaffd5-4936-43fd-8c90-b026dbbc2273	864d4897-f6a2-4c80-81c9-5ff65daf6d1c
f5c39b89-0988-4502-b22b-79522131772f	ff9da473-bb7a-49f9-b345-ae96d43a58d0
2a61cf53-4e85-4ef6-a9df-4b44da0b27ff	b00ff4eb-4f89-4525-a6a5-d8e353cd8080
2a61cf53-4e85-4ef6-a9df-4b44da0b27ff	25288feb-c543-4f0e-bc97-c4a181327da4
f5c39b89-0988-4502-b22b-79522131772f	61bcd61b-8c35-4997-9d7c-c8591e829f0b
f5c39b89-0988-4502-b22b-79522131772f	5efdeaf2-2d2b-4638-a973-588add36c6bd
f5c39b89-0988-4502-b22b-79522131772f	aab30ef2-f569-40f4-8975-e5f1ca954cb3
f5c39b89-0988-4502-b22b-79522131772f	d46457d3-6d1c-4831-a001-38387c170ea0
f5c39b89-0988-4502-b22b-79522131772f	33dff824-0155-4c9a-ab3d-8bf7bbfbc799
f5c39b89-0988-4502-b22b-79522131772f	321a264d-2107-4a1a-aa74-e5ef2959c939
f5c39b89-0988-4502-b22b-79522131772f	2815b22a-8f93-43d4-b124-fa6ef1aaed13
f5c39b89-0988-4502-b22b-79522131772f	5e84fb77-3522-4f08-aab3-d64c88e8de95
f5c39b89-0988-4502-b22b-79522131772f	9645c82c-8dde-48fd-bc01-0b6c488277e8
f5c39b89-0988-4502-b22b-79522131772f	87eb561f-e681-4245-bd37-b47a6a5a32a2
f5c39b89-0988-4502-b22b-79522131772f	112c5ffa-7e05-4a83-a9fb-b7ac84a0d1b3
f5c39b89-0988-4502-b22b-79522131772f	e4de7610-bacc-46d4-9b37-4c6a23fecad0
f5c39b89-0988-4502-b22b-79522131772f	f3138338-dd78-4e8a-9acc-cd193bf36b81
f5c39b89-0988-4502-b22b-79522131772f	6a1dd0ab-c9b4-429e-ac5e-05f11520326a
f5c39b89-0988-4502-b22b-79522131772f	fe2d685e-219b-4d5a-a30c-0430d62e7400
f5c39b89-0988-4502-b22b-79522131772f	f5464500-0cb0-4360-b1d2-8648ee5c4fc9
f5c39b89-0988-4502-b22b-79522131772f	d5145076-cd93-4b65-8def-64c9664db73b
aab30ef2-f569-40f4-8975-e5f1ca954cb3	6a1dd0ab-c9b4-429e-ac5e-05f11520326a
aab30ef2-f569-40f4-8975-e5f1ca954cb3	d5145076-cd93-4b65-8def-64c9664db73b
d46457d3-6d1c-4831-a001-38387c170ea0	fe2d685e-219b-4d5a-a30c-0430d62e7400
d66b9468-3a46-4d37-816b-ac359d89387d	7ae3f438-b9dd-447d-b67e-6795a5d951a9
d66b9468-3a46-4d37-816b-ac359d89387d	84dbdab1-acd1-49e7-9774-98735925031f
d66b9468-3a46-4d37-816b-ac359d89387d	a9ceb5ec-0a1e-478b-aa6f-d22c0fb5508e
d66b9468-3a46-4d37-816b-ac359d89387d	a6f9ebb9-f200-4ab3-99a1-fcfba742be41
d66b9468-3a46-4d37-816b-ac359d89387d	55daf42a-48f7-42c8-aad9-4420d15ecaa5
d66b9468-3a46-4d37-816b-ac359d89387d	d5578c5b-5a02-4521-abb7-bd7e33c8aaca
d66b9468-3a46-4d37-816b-ac359d89387d	d53a73d8-282d-436a-8457-c2caaa7d1323
d66b9468-3a46-4d37-816b-ac359d89387d	ed396879-4d82-45f1-b4f0-ec2a425dea7e
d66b9468-3a46-4d37-816b-ac359d89387d	c3eac5b4-b0ee-472f-adef-469fc144242c
d66b9468-3a46-4d37-816b-ac359d89387d	29f2c36a-eb80-4cff-8b96-d4a235f87bb0
d66b9468-3a46-4d37-816b-ac359d89387d	71e115bc-55b0-4c0f-b7a5-ef50a1f03404
d66b9468-3a46-4d37-816b-ac359d89387d	e4afabb8-0632-46dd-a931-40c62b0d31f3
d66b9468-3a46-4d37-816b-ac359d89387d	07cfdb98-ac40-4a8f-9ed4-fc24be0ca96b
d66b9468-3a46-4d37-816b-ac359d89387d	5da5494b-a3f9-4d13-9fc5-1d52e0b0e23f
d66b9468-3a46-4d37-816b-ac359d89387d	6877b57e-19a2-4189-b2d7-170544d60491
d66b9468-3a46-4d37-816b-ac359d89387d	e78636f3-e550-460d-bda4-596e98fca01d
d66b9468-3a46-4d37-816b-ac359d89387d	246cd3d6-e845-42fc-8805-24c94e305a7b
a6f9ebb9-f200-4ab3-99a1-fcfba742be41	6877b57e-19a2-4189-b2d7-170544d60491
a9ceb5ec-0a1e-478b-aa6f-d22c0fb5508e	5da5494b-a3f9-4d13-9fc5-1d52e0b0e23f
a9ceb5ec-0a1e-478b-aa6f-d22c0fb5508e	246cd3d6-e845-42fc-8805-24c94e305a7b
e2d8533a-6b2d-4a20-a3c5-83d54ec60d99	de23d7a4-87cf-477f-bd26-5ffacafbc16e
e2d8533a-6b2d-4a20-a3c5-83d54ec60d99	1f1e6e4d-3fdf-4a51-8214-8a0d54aa92f7
1f1e6e4d-3fdf-4a51-8214-8a0d54aa92f7	bc7971d5-e20e-454d-a5e6-9163b7169a25
c5a582a3-357a-42b8-a901-761d1ecdf1fe	83341149-86e4-4694-92cf-b6074d45b51e
f5c39b89-0988-4502-b22b-79522131772f	29be8995-e805-4491-985a-e31e1c8616d1
d66b9468-3a46-4d37-816b-ac359d89387d	9e82eea4-0f78-480d-830c-249e1796b462
e2d8533a-6b2d-4a20-a3c5-83d54ec60d99	ba2ac172-b3a7-4c10-85eb-487dce1c544c
e2d8533a-6b2d-4a20-a3c5-83d54ec60d99	d938a9eb-3a85-4fa6-a512-b1c0bc6d7a79
\.


--
-- TOC entry 4200 (class 0 OID 16754)
-- Dependencies: 219
-- Data for Name: credential; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.credential (id, salt, type, user_id, created_date, user_label, secret_data, credential_data, priority) FROM stdin;
d5370e0b-8a77-438b-a4aa-f359adb06d76	\N	password	ce96cc82-1e5b-44ec-af73-3ad14d334038	1762854807457	My password	{"value":"Fo+LqKhYOmrQlqMmZp/SCfFvhvWvykXki0cea/V0YmY=","salt":"u5FrVNsXI75KsvWxvXdrZg==","additionalParameters":{}}	{"hashIterations":5,"algorithm":"argon2","additionalParameters":{"hashLength":["32"],"memory":["7168"],"type":["id"],"version":["1.3"],"parallelism":["1"]}}	10
12a0fd55-3d83-42ef-9035-013e360427ae	\N	password	db6362a2-7f07-4bc9-a44b-534132115d2e	1762866859995	\N	{"value":"SzmrzLuhyBBttNyLhqST3Zs4+5ZjbFeOoGkpeHoNoOA=","salt":"jBsibo/jTWKntW2oxmZ4wQ==","additionalParameters":{}}	{"hashIterations":5,"algorithm":"argon2","additionalParameters":{"hashLength":["32"],"memory":["7168"],"type":["id"],"version":["1.3"],"parallelism":["1"]}}	10
8d2163ee-8c96-4229-9562-0b9fe9883ba2	\N	password	f8972037-2d30-4100-9225-925db8c1645a	1762866860032	\N	{"value":"HdxPLACGZKEzKlmG9wELxeWIvfMFiTUrwIyrgu0EuvI=","salt":"bF/r4xxVz07P/F6pohSGxA==","additionalParameters":{}}	{"hashIterations":5,"algorithm":"argon2","additionalParameters":{"hashLength":["32"],"memory":["7168"],"type":["id"],"version":["1.3"],"parallelism":["1"]}}	10
31af85f4-16a7-4033-803b-7fdf167315dc	\N	password	d1c2d376-00ce-4a9e-b245-e735808dbfb5	1762866860069	\N	{"value":"sXt9KnrYwWH/+1kHApICQ6u3GcJqLkj56WlDC5kbqoI=","salt":"TUU+K6jfIZAVYt4Q/44VGQ==","additionalParameters":{}}	{"hashIterations":5,"algorithm":"argon2","additionalParameters":{"hashLength":["32"],"memory":["7168"],"type":["id"],"version":["1.3"],"parallelism":["1"]}}	10
\.


--
-- TOC entry 4197 (class 0 OID 16724)
-- Dependencies: 216
-- Data for Name: databasechangelog; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.databasechangelog (id, author, filename, dateexecuted, orderexecuted, exectype, md5sum, description, comments, tag, liquibase, contexts, labels, deployment_id) FROM stdin;
1.0.0.Final-KEYCLOAK-5461	sthorger@redhat.com	META-INF/jpa-changelog-1.0.0.Final.xml	2025-11-11 09:39:13.150995	1	EXECUTED	9:6f1016664e21e16d26517a4418f5e3df	createTable tableName=APPLICATION_DEFAULT_ROLES; createTable tableName=CLIENT; createTable tableName=CLIENT_SESSION; createTable tableName=CLIENT_SESSION_ROLE; createTable tableName=COMPOSITE_ROLE; createTable tableName=CREDENTIAL; createTable tab...		\N	4.29.1	\N	\N	2853952567
1.0.0.Final-KEYCLOAK-5461	sthorger@redhat.com	META-INF/db2-jpa-changelog-1.0.0.Final.xml	2025-11-11 09:39:13.175822	2	MARK_RAN	9:828775b1596a07d1200ba1d49e5e3941	createTable tableName=APPLICATION_DEFAULT_ROLES; createTable tableName=CLIENT; createTable tableName=CLIENT_SESSION; createTable tableName=CLIENT_SESSION_ROLE; createTable tableName=COMPOSITE_ROLE; createTable tableName=CREDENTIAL; createTable tab...		\N	4.29.1	\N	\N	2853952567
1.1.0.Beta1	sthorger@redhat.com	META-INF/jpa-changelog-1.1.0.Beta1.xml	2025-11-11 09:39:13.236758	3	EXECUTED	9:5f090e44a7d595883c1fb61f4b41fd38	delete tableName=CLIENT_SESSION_ROLE; delete tableName=CLIENT_SESSION; delete tableName=USER_SESSION; createTable tableName=CLIENT_ATTRIBUTES; createTable tableName=CLIENT_SESSION_NOTE; createTable tableName=APP_NODE_REGISTRATIONS; addColumn table...		\N	4.29.1	\N	\N	2853952567
1.1.0.Final	sthorger@redhat.com	META-INF/jpa-changelog-1.1.0.Final.xml	2025-11-11 09:39:13.243944	4	EXECUTED	9:c07e577387a3d2c04d1adc9aaad8730e	renameColumn newColumnName=EVENT_TIME, oldColumnName=TIME, tableName=EVENT_ENTITY		\N	4.29.1	\N	\N	2853952567
1.2.0.Beta1	psilva@redhat.com	META-INF/jpa-changelog-1.2.0.Beta1.xml	2025-11-11 09:39:13.380667	5	EXECUTED	9:b68ce996c655922dbcd2fe6b6ae72686	delete tableName=CLIENT_SESSION_ROLE; delete tableName=CLIENT_SESSION_NOTE; delete tableName=CLIENT_SESSION; delete tableName=USER_SESSION; createTable tableName=PROTOCOL_MAPPER; createTable tableName=PROTOCOL_MAPPER_CONFIG; createTable tableName=...		\N	4.29.1	\N	\N	2853952567
1.2.0.Beta1	psilva@redhat.com	META-INF/db2-jpa-changelog-1.2.0.Beta1.xml	2025-11-11 09:39:13.388832	6	MARK_RAN	9:543b5c9989f024fe35c6f6c5a97de88e	delete tableName=CLIENT_SESSION_ROLE; delete tableName=CLIENT_SESSION_NOTE; delete tableName=CLIENT_SESSION; delete tableName=USER_SESSION; createTable tableName=PROTOCOL_MAPPER; createTable tableName=PROTOCOL_MAPPER_CONFIG; createTable tableName=...		\N	4.29.1	\N	\N	2853952567
1.2.0.RC1	bburke@redhat.com	META-INF/jpa-changelog-1.2.0.CR1.xml	2025-11-11 09:39:13.51398	7	EXECUTED	9:765afebbe21cf5bbca048e632df38336	delete tableName=CLIENT_SESSION_ROLE; delete tableName=CLIENT_SESSION_NOTE; delete tableName=CLIENT_SESSION; delete tableName=USER_SESSION_NOTE; delete tableName=USER_SESSION; createTable tableName=MIGRATION_MODEL; createTable tableName=IDENTITY_P...		\N	4.29.1	\N	\N	2853952567
1.2.0.RC1	bburke@redhat.com	META-INF/db2-jpa-changelog-1.2.0.CR1.xml	2025-11-11 09:39:13.52146	8	MARK_RAN	9:db4a145ba11a6fdaefb397f6dbf829a1	delete tableName=CLIENT_SESSION_ROLE; delete tableName=CLIENT_SESSION_NOTE; delete tableName=CLIENT_SESSION; delete tableName=USER_SESSION_NOTE; delete tableName=USER_SESSION; createTable tableName=MIGRATION_MODEL; createTable tableName=IDENTITY_P...		\N	4.29.1	\N	\N	2853952567
1.2.0.Final	keycloak	META-INF/jpa-changelog-1.2.0.Final.xml	2025-11-11 09:39:13.53071	9	EXECUTED	9:9d05c7be10cdb873f8bcb41bc3a8ab23	update tableName=CLIENT; update tableName=CLIENT; update tableName=CLIENT		\N	4.29.1	\N	\N	2853952567
1.3.0	bburke@redhat.com	META-INF/jpa-changelog-1.3.0.xml	2025-11-11 09:39:13.666975	10	EXECUTED	9:18593702353128d53111f9b1ff0b82b8	delete tableName=CLIENT_SESSION_ROLE; delete tableName=CLIENT_SESSION_PROT_MAPPER; delete tableName=CLIENT_SESSION_NOTE; delete tableName=CLIENT_SESSION; delete tableName=USER_SESSION_NOTE; delete tableName=USER_SESSION; createTable tableName=ADMI...		\N	4.29.1	\N	\N	2853952567
1.4.0	bburke@redhat.com	META-INF/jpa-changelog-1.4.0.xml	2025-11-11 09:39:13.736306	11	EXECUTED	9:6122efe5f090e41a85c0f1c9e52cbb62	delete tableName=CLIENT_SESSION_AUTH_STATUS; delete tableName=CLIENT_SESSION_ROLE; delete tableName=CLIENT_SESSION_PROT_MAPPER; delete tableName=CLIENT_SESSION_NOTE; delete tableName=CLIENT_SESSION; delete tableName=USER_SESSION_NOTE; delete table...		\N	4.29.1	\N	\N	2853952567
1.4.0	bburke@redhat.com	META-INF/db2-jpa-changelog-1.4.0.xml	2025-11-11 09:39:13.741654	12	MARK_RAN	9:e1ff28bf7568451453f844c5d54bb0b5	delete tableName=CLIENT_SESSION_AUTH_STATUS; delete tableName=CLIENT_SESSION_ROLE; delete tableName=CLIENT_SESSION_PROT_MAPPER; delete tableName=CLIENT_SESSION_NOTE; delete tableName=CLIENT_SESSION; delete tableName=USER_SESSION_NOTE; delete table...		\N	4.29.1	\N	\N	2853952567
1.5.0	bburke@redhat.com	META-INF/jpa-changelog-1.5.0.xml	2025-11-11 09:39:13.765606	13	EXECUTED	9:7af32cd8957fbc069f796b61217483fd	delete tableName=CLIENT_SESSION_AUTH_STATUS; delete tableName=CLIENT_SESSION_ROLE; delete tableName=CLIENT_SESSION_PROT_MAPPER; delete tableName=CLIENT_SESSION_NOTE; delete tableName=CLIENT_SESSION; delete tableName=USER_SESSION_NOTE; delete table...		\N	4.29.1	\N	\N	2853952567
1.6.1_from15	mposolda@redhat.com	META-INF/jpa-changelog-1.6.1.xml	2025-11-11 09:39:13.79361	14	EXECUTED	9:6005e15e84714cd83226bf7879f54190	addColumn tableName=REALM; addColumn tableName=KEYCLOAK_ROLE; addColumn tableName=CLIENT; createTable tableName=OFFLINE_USER_SESSION; createTable tableName=OFFLINE_CLIENT_SESSION; addPrimaryKey constraintName=CONSTRAINT_OFFL_US_SES_PK2, tableName=...		\N	4.29.1	\N	\N	2853952567
1.6.1_from16-pre	mposolda@redhat.com	META-INF/jpa-changelog-1.6.1.xml	2025-11-11 09:39:13.796313	15	MARK_RAN	9:bf656f5a2b055d07f314431cae76f06c	delete tableName=OFFLINE_CLIENT_SESSION; delete tableName=OFFLINE_USER_SESSION		\N	4.29.1	\N	\N	2853952567
1.6.1_from16	mposolda@redhat.com	META-INF/jpa-changelog-1.6.1.xml	2025-11-11 09:39:13.800227	16	MARK_RAN	9:f8dadc9284440469dcf71e25ca6ab99b	dropPrimaryKey constraintName=CONSTRAINT_OFFLINE_US_SES_PK, tableName=OFFLINE_USER_SESSION; dropPrimaryKey constraintName=CONSTRAINT_OFFLINE_CL_SES_PK, tableName=OFFLINE_CLIENT_SESSION; addColumn tableName=OFFLINE_USER_SESSION; update tableName=OF...		\N	4.29.1	\N	\N	2853952567
1.6.1	mposolda@redhat.com	META-INF/jpa-changelog-1.6.1.xml	2025-11-11 09:39:13.804783	17	EXECUTED	9:d41d8cd98f00b204e9800998ecf8427e	empty		\N	4.29.1	\N	\N	2853952567
1.7.0	bburke@redhat.com	META-INF/jpa-changelog-1.7.0.xml	2025-11-11 09:39:13.86752	18	EXECUTED	9:3368ff0be4c2855ee2dd9ca813b38d8e	createTable tableName=KEYCLOAK_GROUP; createTable tableName=GROUP_ROLE_MAPPING; createTable tableName=GROUP_ATTRIBUTE; createTable tableName=USER_GROUP_MEMBERSHIP; createTable tableName=REALM_DEFAULT_GROUPS; addColumn tableName=IDENTITY_PROVIDER; ...		\N	4.29.1	\N	\N	2853952567
1.8.0	mposolda@redhat.com	META-INF/jpa-changelog-1.8.0.xml	2025-11-11 09:39:13.934735	19	EXECUTED	9:8ac2fb5dd030b24c0570a763ed75ed20	addColumn tableName=IDENTITY_PROVIDER; createTable tableName=CLIENT_TEMPLATE; createTable tableName=CLIENT_TEMPLATE_ATTRIBUTES; createTable tableName=TEMPLATE_SCOPE_MAPPING; dropNotNullConstraint columnName=CLIENT_ID, tableName=PROTOCOL_MAPPER; ad...		\N	4.29.1	\N	\N	2853952567
1.8.0-2	keycloak	META-INF/jpa-changelog-1.8.0.xml	2025-11-11 09:39:13.944403	20	EXECUTED	9:f91ddca9b19743db60e3057679810e6c	dropDefaultValue columnName=ALGORITHM, tableName=CREDENTIAL; update tableName=CREDENTIAL		\N	4.29.1	\N	\N	2853952567
1.8.0	mposolda@redhat.com	META-INF/db2-jpa-changelog-1.8.0.xml	2025-11-11 09:39:13.94949	21	MARK_RAN	9:831e82914316dc8a57dc09d755f23c51	addColumn tableName=IDENTITY_PROVIDER; createTable tableName=CLIENT_TEMPLATE; createTable tableName=CLIENT_TEMPLATE_ATTRIBUTES; createTable tableName=TEMPLATE_SCOPE_MAPPING; dropNotNullConstraint columnName=CLIENT_ID, tableName=PROTOCOL_MAPPER; ad...		\N	4.29.1	\N	\N	2853952567
1.8.0-2	keycloak	META-INF/db2-jpa-changelog-1.8.0.xml	2025-11-11 09:39:13.954439	22	MARK_RAN	9:f91ddca9b19743db60e3057679810e6c	dropDefaultValue columnName=ALGORITHM, tableName=CREDENTIAL; update tableName=CREDENTIAL		\N	4.29.1	\N	\N	2853952567
1.9.0	mposolda@redhat.com	META-INF/jpa-changelog-1.9.0.xml	2025-11-11 09:39:14.049693	23	EXECUTED	9:bc3d0f9e823a69dc21e23e94c7a94bb1	update tableName=REALM; update tableName=REALM; update tableName=REALM; update tableName=REALM; update tableName=CREDENTIAL; update tableName=CREDENTIAL; update tableName=CREDENTIAL; update tableName=REALM; update tableName=REALM; customChange; dr...		\N	4.29.1	\N	\N	2853952567
1.9.1	keycloak	META-INF/jpa-changelog-1.9.1.xml	2025-11-11 09:39:14.058537	24	EXECUTED	9:c9999da42f543575ab790e76439a2679	modifyDataType columnName=PRIVATE_KEY, tableName=REALM; modifyDataType columnName=PUBLIC_KEY, tableName=REALM; modifyDataType columnName=CERTIFICATE, tableName=REALM		\N	4.29.1	\N	\N	2853952567
1.9.1	keycloak	META-INF/db2-jpa-changelog-1.9.1.xml	2025-11-11 09:39:14.061301	25	MARK_RAN	9:0d6c65c6f58732d81569e77b10ba301d	modifyDataType columnName=PRIVATE_KEY, tableName=REALM; modifyDataType columnName=CERTIFICATE, tableName=REALM		\N	4.29.1	\N	\N	2853952567
1.9.2	keycloak	META-INF/jpa-changelog-1.9.2.xml	2025-11-11 09:39:14.47764	26	EXECUTED	9:fc576660fc016ae53d2d4778d84d86d0	createIndex indexName=IDX_USER_EMAIL, tableName=USER_ENTITY; createIndex indexName=IDX_USER_ROLE_MAPPING, tableName=USER_ROLE_MAPPING; createIndex indexName=IDX_USER_GROUP_MAPPING, tableName=USER_GROUP_MEMBERSHIP; createIndex indexName=IDX_USER_CO...		\N	4.29.1	\N	\N	2853952567
authz-2.0.0	psilva@redhat.com	META-INF/jpa-changelog-authz-2.0.0.xml	2025-11-11 09:39:14.580996	27	EXECUTED	9:43ed6b0da89ff77206289e87eaa9c024	createTable tableName=RESOURCE_SERVER; addPrimaryKey constraintName=CONSTRAINT_FARS, tableName=RESOURCE_SERVER; addUniqueConstraint constraintName=UK_AU8TT6T700S9V50BU18WS5HA6, tableName=RESOURCE_SERVER; createTable tableName=RESOURCE_SERVER_RESOU...		\N	4.29.1	\N	\N	2853952567
authz-2.5.1	psilva@redhat.com	META-INF/jpa-changelog-authz-2.5.1.xml	2025-11-11 09:39:14.586442	28	EXECUTED	9:44bae577f551b3738740281eceb4ea70	update tableName=RESOURCE_SERVER_POLICY		\N	4.29.1	\N	\N	2853952567
2.1.0-KEYCLOAK-5461	bburke@redhat.com	META-INF/jpa-changelog-2.1.0.xml	2025-11-11 09:39:14.675065	29	EXECUTED	9:bd88e1f833df0420b01e114533aee5e8	createTable tableName=BROKER_LINK; createTable tableName=FED_USER_ATTRIBUTE; createTable tableName=FED_USER_CONSENT; createTable tableName=FED_USER_CONSENT_ROLE; createTable tableName=FED_USER_CONSENT_PROT_MAPPER; createTable tableName=FED_USER_CR...		\N	4.29.1	\N	\N	2853952567
2.2.0	bburke@redhat.com	META-INF/jpa-changelog-2.2.0.xml	2025-11-11 09:39:14.693809	30	EXECUTED	9:a7022af5267f019d020edfe316ef4371	addColumn tableName=ADMIN_EVENT_ENTITY; createTable tableName=CREDENTIAL_ATTRIBUTE; createTable tableName=FED_CREDENTIAL_ATTRIBUTE; modifyDataType columnName=VALUE, tableName=CREDENTIAL; addForeignKeyConstraint baseTableName=FED_CREDENTIAL_ATTRIBU...		\N	4.29.1	\N	\N	2853952567
2.3.0	bburke@redhat.com	META-INF/jpa-changelog-2.3.0.xml	2025-11-11 09:39:14.720513	31	EXECUTED	9:fc155c394040654d6a79227e56f5e25a	createTable tableName=FEDERATED_USER; addPrimaryKey constraintName=CONSTR_FEDERATED_USER, tableName=FEDERATED_USER; dropDefaultValue columnName=TOTP, tableName=USER_ENTITY; dropColumn columnName=TOTP, tableName=USER_ENTITY; addColumn tableName=IDE...		\N	4.29.1	\N	\N	2853952567
2.4.0	bburke@redhat.com	META-INF/jpa-changelog-2.4.0.xml	2025-11-11 09:39:14.727439	32	EXECUTED	9:eac4ffb2a14795e5dc7b426063e54d88	customChange		\N	4.29.1	\N	\N	2853952567
2.5.0	bburke@redhat.com	META-INF/jpa-changelog-2.5.0.xml	2025-11-11 09:39:14.736175	33	EXECUTED	9:54937c05672568c4c64fc9524c1e9462	customChange; modifyDataType columnName=USER_ID, tableName=OFFLINE_USER_SESSION		\N	4.29.1	\N	\N	2853952567
2.5.0-unicode-oracle	hmlnarik@redhat.com	META-INF/jpa-changelog-2.5.0.xml	2025-11-11 09:39:14.739802	34	MARK_RAN	9:3a32bace77c84d7678d035a7f5a8084e	modifyDataType columnName=DESCRIPTION, tableName=AUTHENTICATION_FLOW; modifyDataType columnName=DESCRIPTION, tableName=CLIENT_TEMPLATE; modifyDataType columnName=DESCRIPTION, tableName=RESOURCE_SERVER_POLICY; modifyDataType columnName=DESCRIPTION,...		\N	4.29.1	\N	\N	2853952567
2.5.0-unicode-other-dbs	hmlnarik@redhat.com	META-INF/jpa-changelog-2.5.0.xml	2025-11-11 09:39:14.785032	35	EXECUTED	9:33d72168746f81f98ae3a1e8e0ca3554	modifyDataType columnName=DESCRIPTION, tableName=AUTHENTICATION_FLOW; modifyDataType columnName=DESCRIPTION, tableName=CLIENT_TEMPLATE; modifyDataType columnName=DESCRIPTION, tableName=RESOURCE_SERVER_POLICY; modifyDataType columnName=DESCRIPTION,...		\N	4.29.1	\N	\N	2853952567
2.5.0-duplicate-email-support	slawomir@dabek.name	META-INF/jpa-changelog-2.5.0.xml	2025-11-11 09:39:14.7922	36	EXECUTED	9:61b6d3d7a4c0e0024b0c839da283da0c	addColumn tableName=REALM		\N	4.29.1	\N	\N	2853952567
2.5.0-unique-group-names	hmlnarik@redhat.com	META-INF/jpa-changelog-2.5.0.xml	2025-11-11 09:39:14.80139	37	EXECUTED	9:8dcac7bdf7378e7d823cdfddebf72fda	addUniqueConstraint constraintName=SIBLING_NAMES, tableName=KEYCLOAK_GROUP		\N	4.29.1	\N	\N	2853952567
2.5.1	bburke@redhat.com	META-INF/jpa-changelog-2.5.1.xml	2025-11-11 09:39:14.806964	38	EXECUTED	9:a2b870802540cb3faa72098db5388af3	addColumn tableName=FED_USER_CONSENT		\N	4.29.1	\N	\N	2853952567
3.0.0	bburke@redhat.com	META-INF/jpa-changelog-3.0.0.xml	2025-11-11 09:39:14.812319	39	EXECUTED	9:132a67499ba24bcc54fb5cbdcfe7e4c0	addColumn tableName=IDENTITY_PROVIDER		\N	4.29.1	\N	\N	2853952567
3.2.0-fix	keycloak	META-INF/jpa-changelog-3.2.0.xml	2025-11-11 09:39:14.814612	40	MARK_RAN	9:938f894c032f5430f2b0fafb1a243462	addNotNullConstraint columnName=REALM_ID, tableName=CLIENT_INITIAL_ACCESS		\N	4.29.1	\N	\N	2853952567
3.2.0-fix-with-keycloak-5416	keycloak	META-INF/jpa-changelog-3.2.0.xml	2025-11-11 09:39:14.817664	41	MARK_RAN	9:845c332ff1874dc5d35974b0babf3006	dropIndex indexName=IDX_CLIENT_INIT_ACC_REALM, tableName=CLIENT_INITIAL_ACCESS; addNotNullConstraint columnName=REALM_ID, tableName=CLIENT_INITIAL_ACCESS; createIndex indexName=IDX_CLIENT_INIT_ACC_REALM, tableName=CLIENT_INITIAL_ACCESS		\N	4.29.1	\N	\N	2853952567
3.2.0-fix-offline-sessions	hmlnarik	META-INF/jpa-changelog-3.2.0.xml	2025-11-11 09:39:14.823835	42	EXECUTED	9:fc86359c079781adc577c5a217e4d04c	customChange		\N	4.29.1	\N	\N	2853952567
3.2.0-fixed	keycloak	META-INF/jpa-changelog-3.2.0.xml	2025-11-11 09:39:16.675949	43	EXECUTED	9:59a64800e3c0d09b825f8a3b444fa8f4	addColumn tableName=REALM; dropPrimaryKey constraintName=CONSTRAINT_OFFL_CL_SES_PK2, tableName=OFFLINE_CLIENT_SESSION; dropColumn columnName=CLIENT_SESSION_ID, tableName=OFFLINE_CLIENT_SESSION; addPrimaryKey constraintName=CONSTRAINT_OFFL_CL_SES_P...		\N	4.29.1	\N	\N	2853952567
3.3.0	keycloak	META-INF/jpa-changelog-3.3.0.xml	2025-11-11 09:39:16.683969	44	EXECUTED	9:d48d6da5c6ccf667807f633fe489ce88	addColumn tableName=USER_ENTITY		\N	4.29.1	\N	\N	2853952567
authz-3.4.0.CR1-resource-server-pk-change-part1	glavoie@gmail.com	META-INF/jpa-changelog-authz-3.4.0.CR1.xml	2025-11-11 09:39:16.693267	45	EXECUTED	9:dde36f7973e80d71fceee683bc5d2951	addColumn tableName=RESOURCE_SERVER_POLICY; addColumn tableName=RESOURCE_SERVER_RESOURCE; addColumn tableName=RESOURCE_SERVER_SCOPE		\N	4.29.1	\N	\N	2853952567
authz-3.4.0.CR1-resource-server-pk-change-part2-KEYCLOAK-6095	hmlnarik@redhat.com	META-INF/jpa-changelog-authz-3.4.0.CR1.xml	2025-11-11 09:39:16.700635	46	EXECUTED	9:b855e9b0a406b34fa323235a0cf4f640	customChange		\N	4.29.1	\N	\N	2853952567
authz-3.4.0.CR1-resource-server-pk-change-part3-fixed	glavoie@gmail.com	META-INF/jpa-changelog-authz-3.4.0.CR1.xml	2025-11-11 09:39:16.704047	47	MARK_RAN	9:51abbacd7b416c50c4421a8cabf7927e	dropIndex indexName=IDX_RES_SERV_POL_RES_SERV, tableName=RESOURCE_SERVER_POLICY; dropIndex indexName=IDX_RES_SRV_RES_RES_SRV, tableName=RESOURCE_SERVER_RESOURCE; dropIndex indexName=IDX_RES_SRV_SCOPE_RES_SRV, tableName=RESOURCE_SERVER_SCOPE		\N	4.29.1	\N	\N	2853952567
authz-3.4.0.CR1-resource-server-pk-change-part3-fixed-nodropindex	glavoie@gmail.com	META-INF/jpa-changelog-authz-3.4.0.CR1.xml	2025-11-11 09:39:16.903889	48	EXECUTED	9:bdc99e567b3398bac83263d375aad143	addNotNullConstraint columnName=RESOURCE_SERVER_CLIENT_ID, tableName=RESOURCE_SERVER_POLICY; addNotNullConstraint columnName=RESOURCE_SERVER_CLIENT_ID, tableName=RESOURCE_SERVER_RESOURCE; addNotNullConstraint columnName=RESOURCE_SERVER_CLIENT_ID, ...		\N	4.29.1	\N	\N	2853952567
authn-3.4.0.CR1-refresh-token-max-reuse	glavoie@gmail.com	META-INF/jpa-changelog-authz-3.4.0.CR1.xml	2025-11-11 09:39:16.911215	49	EXECUTED	9:d198654156881c46bfba39abd7769e69	addColumn tableName=REALM		\N	4.29.1	\N	\N	2853952567
3.4.0	keycloak	META-INF/jpa-changelog-3.4.0.xml	2025-11-11 09:39:16.981866	50	EXECUTED	9:cfdd8736332ccdd72c5256ccb42335db	addPrimaryKey constraintName=CONSTRAINT_REALM_DEFAULT_ROLES, tableName=REALM_DEFAULT_ROLES; addPrimaryKey constraintName=CONSTRAINT_COMPOSITE_ROLE, tableName=COMPOSITE_ROLE; addPrimaryKey constraintName=CONSTR_REALM_DEFAULT_GROUPS, tableName=REALM...		\N	4.29.1	\N	\N	2853952567
3.4.0-KEYCLOAK-5230	hmlnarik@redhat.com	META-INF/jpa-changelog-3.4.0.xml	2025-11-11 09:39:17.548904	51	EXECUTED	9:7c84de3d9bd84d7f077607c1a4dcb714	createIndex indexName=IDX_FU_ATTRIBUTE, tableName=FED_USER_ATTRIBUTE; createIndex indexName=IDX_FU_CONSENT, tableName=FED_USER_CONSENT; createIndex indexName=IDX_FU_CONSENT_RU, tableName=FED_USER_CONSENT; createIndex indexName=IDX_FU_CREDENTIAL, t...		\N	4.29.1	\N	\N	2853952567
3.4.1	psilva@redhat.com	META-INF/jpa-changelog-3.4.1.xml	2025-11-11 09:39:17.554811	52	EXECUTED	9:5a6bb36cbefb6a9d6928452c0852af2d	modifyDataType columnName=VALUE, tableName=CLIENT_ATTRIBUTES		\N	4.29.1	\N	\N	2853952567
3.4.2	keycloak	META-INF/jpa-changelog-3.4.2.xml	2025-11-11 09:39:17.559062	53	EXECUTED	9:8f23e334dbc59f82e0a328373ca6ced0	update tableName=REALM		\N	4.29.1	\N	\N	2853952567
3.4.2-KEYCLOAK-5172	mkanis@redhat.com	META-INF/jpa-changelog-3.4.2.xml	2025-11-11 09:39:17.563334	54	EXECUTED	9:9156214268f09d970cdf0e1564d866af	update tableName=CLIENT		\N	4.29.1	\N	\N	2853952567
4.0.0-KEYCLOAK-6335	bburke@redhat.com	META-INF/jpa-changelog-4.0.0.xml	2025-11-11 09:39:17.575023	55	EXECUTED	9:db806613b1ed154826c02610b7dbdf74	createTable tableName=CLIENT_AUTH_FLOW_BINDINGS; addPrimaryKey constraintName=C_CLI_FLOW_BIND, tableName=CLIENT_AUTH_FLOW_BINDINGS		\N	4.29.1	\N	\N	2853952567
4.0.0-CLEANUP-UNUSED-TABLE	bburke@redhat.com	META-INF/jpa-changelog-4.0.0.xml	2025-11-11 09:39:17.581982	56	EXECUTED	9:229a041fb72d5beac76bb94a5fa709de	dropTable tableName=CLIENT_IDENTITY_PROV_MAPPING		\N	4.29.1	\N	\N	2853952567
4.0.0-KEYCLOAK-6228	bburke@redhat.com	META-INF/jpa-changelog-4.0.0.xml	2025-11-11 09:39:17.669649	57	EXECUTED	9:079899dade9c1e683f26b2aa9ca6ff04	dropUniqueConstraint constraintName=UK_JKUWUVD56ONTGSUHOGM8UEWRT, tableName=USER_CONSENT; dropNotNullConstraint columnName=CLIENT_ID, tableName=USER_CONSENT; addColumn tableName=USER_CONSENT; addUniqueConstraint constraintName=UK_JKUWUVD56ONTGSUHO...		\N	4.29.1	\N	\N	2853952567
4.0.0-KEYCLOAK-5579-fixed	mposolda@redhat.com	META-INF/jpa-changelog-4.0.0.xml	2025-11-11 09:39:18.311786	58	EXECUTED	9:139b79bcbbfe903bb1c2d2a4dbf001d9	dropForeignKeyConstraint baseTableName=CLIENT_TEMPLATE_ATTRIBUTES, constraintName=FK_CL_TEMPL_ATTR_TEMPL; renameTable newTableName=CLIENT_SCOPE_ATTRIBUTES, oldTableName=CLIENT_TEMPLATE_ATTRIBUTES; renameColumn newColumnName=SCOPE_ID, oldColumnName...		\N	4.29.1	\N	\N	2853952567
authz-4.0.0.CR1	psilva@redhat.com	META-INF/jpa-changelog-authz-4.0.0.CR1.xml	2025-11-11 09:39:18.3534	59	EXECUTED	9:b55738ad889860c625ba2bf483495a04	createTable tableName=RESOURCE_SERVER_PERM_TICKET; addPrimaryKey constraintName=CONSTRAINT_FAPMT, tableName=RESOURCE_SERVER_PERM_TICKET; addForeignKeyConstraint baseTableName=RESOURCE_SERVER_PERM_TICKET, constraintName=FK_FRSRHO213XCX4WNKOG82SSPMT...		\N	4.29.1	\N	\N	2853952567
authz-4.0.0.Beta3	psilva@redhat.com	META-INF/jpa-changelog-authz-4.0.0.Beta3.xml	2025-11-11 09:39:18.362509	60	EXECUTED	9:e0057eac39aa8fc8e09ac6cfa4ae15fe	addColumn tableName=RESOURCE_SERVER_POLICY; addColumn tableName=RESOURCE_SERVER_PERM_TICKET; addForeignKeyConstraint baseTableName=RESOURCE_SERVER_PERM_TICKET, constraintName=FK_FRSRPO2128CX4WNKOG82SSRFY, referencedTableName=RESOURCE_SERVER_POLICY		\N	4.29.1	\N	\N	2853952567
authz-4.2.0.Final	mhajas@redhat.com	META-INF/jpa-changelog-authz-4.2.0.Final.xml	2025-11-11 09:39:18.373425	61	EXECUTED	9:42a33806f3a0443fe0e7feeec821326c	createTable tableName=RESOURCE_URIS; addForeignKeyConstraint baseTableName=RESOURCE_URIS, constraintName=FK_RESOURCE_SERVER_URIS, referencedTableName=RESOURCE_SERVER_RESOURCE; customChange; dropColumn columnName=URI, tableName=RESOURCE_SERVER_RESO...		\N	4.29.1	\N	\N	2853952567
authz-4.2.0.Final-KEYCLOAK-9944	hmlnarik@redhat.com	META-INF/jpa-changelog-authz-4.2.0.Final.xml	2025-11-11 09:39:18.381357	62	EXECUTED	9:9968206fca46eecc1f51db9c024bfe56	addPrimaryKey constraintName=CONSTRAINT_RESOUR_URIS_PK, tableName=RESOURCE_URIS		\N	4.29.1	\N	\N	2853952567
4.2.0-KEYCLOAK-6313	wadahiro@gmail.com	META-INF/jpa-changelog-4.2.0.xml	2025-11-11 09:39:18.386875	63	EXECUTED	9:92143a6daea0a3f3b8f598c97ce55c3d	addColumn tableName=REQUIRED_ACTION_PROVIDER		\N	4.29.1	\N	\N	2853952567
4.3.0-KEYCLOAK-7984	wadahiro@gmail.com	META-INF/jpa-changelog-4.3.0.xml	2025-11-11 09:39:18.390861	64	EXECUTED	9:82bab26a27195d889fb0429003b18f40	update tableName=REQUIRED_ACTION_PROVIDER		\N	4.29.1	\N	\N	2853952567
4.6.0-KEYCLOAK-7950	psilva@redhat.com	META-INF/jpa-changelog-4.6.0.xml	2025-11-11 09:39:18.395046	65	EXECUTED	9:e590c88ddc0b38b0ae4249bbfcb5abc3	update tableName=RESOURCE_SERVER_RESOURCE		\N	4.29.1	\N	\N	2853952567
4.6.0-KEYCLOAK-8377	keycloak	META-INF/jpa-changelog-4.6.0.xml	2025-11-11 09:39:18.463246	66	EXECUTED	9:5c1f475536118dbdc38d5d7977950cc0	createTable tableName=ROLE_ATTRIBUTE; addPrimaryKey constraintName=CONSTRAINT_ROLE_ATTRIBUTE_PK, tableName=ROLE_ATTRIBUTE; addForeignKeyConstraint baseTableName=ROLE_ATTRIBUTE, constraintName=FK_ROLE_ATTRIBUTE_ID, referencedTableName=KEYCLOAK_ROLE...		\N	4.29.1	\N	\N	2853952567
4.6.0-KEYCLOAK-8555	gideonray@gmail.com	META-INF/jpa-changelog-4.6.0.xml	2025-11-11 09:39:18.523675	67	EXECUTED	9:e7c9f5f9c4d67ccbbcc215440c718a17	createIndex indexName=IDX_COMPONENT_PROVIDER_TYPE, tableName=COMPONENT		\N	4.29.1	\N	\N	2853952567
4.7.0-KEYCLOAK-1267	sguilhen@redhat.com	META-INF/jpa-changelog-4.7.0.xml	2025-11-11 09:39:18.531378	68	EXECUTED	9:88e0bfdda924690d6f4e430c53447dd5	addColumn tableName=REALM		\N	4.29.1	\N	\N	2853952567
4.7.0-KEYCLOAK-7275	keycloak	META-INF/jpa-changelog-4.7.0.xml	2025-11-11 09:39:18.598913	69	EXECUTED	9:f53177f137e1c46b6a88c59ec1cb5218	renameColumn newColumnName=CREATED_ON, oldColumnName=LAST_SESSION_REFRESH, tableName=OFFLINE_USER_SESSION; addNotNullConstraint columnName=CREATED_ON, tableName=OFFLINE_USER_SESSION; addColumn tableName=OFFLINE_USER_SESSION; customChange; createIn...		\N	4.29.1	\N	\N	2853952567
4.8.0-KEYCLOAK-8835	sguilhen@redhat.com	META-INF/jpa-changelog-4.8.0.xml	2025-11-11 09:39:18.609077	70	EXECUTED	9:a74d33da4dc42a37ec27121580d1459f	addNotNullConstraint columnName=SSO_MAX_LIFESPAN_REMEMBER_ME, tableName=REALM; addNotNullConstraint columnName=SSO_IDLE_TIMEOUT_REMEMBER_ME, tableName=REALM		\N	4.29.1	\N	\N	2853952567
authz-7.0.0-KEYCLOAK-10443	psilva@redhat.com	META-INF/jpa-changelog-authz-7.0.0.xml	2025-11-11 09:39:18.617984	71	EXECUTED	9:fd4ade7b90c3b67fae0bfcfcb42dfb5f	addColumn tableName=RESOURCE_SERVER		\N	4.29.1	\N	\N	2853952567
8.0.0-adding-credential-columns	keycloak	META-INF/jpa-changelog-8.0.0.xml	2025-11-11 09:39:18.63106	72	EXECUTED	9:aa072ad090bbba210d8f18781b8cebf4	addColumn tableName=CREDENTIAL; addColumn tableName=FED_USER_CREDENTIAL		\N	4.29.1	\N	\N	2853952567
8.0.0-updating-credential-data-not-oracle-fixed	keycloak	META-INF/jpa-changelog-8.0.0.xml	2025-11-11 09:39:18.643518	73	EXECUTED	9:1ae6be29bab7c2aa376f6983b932be37	update tableName=CREDENTIAL; update tableName=CREDENTIAL; update tableName=CREDENTIAL; update tableName=FED_USER_CREDENTIAL; update tableName=FED_USER_CREDENTIAL; update tableName=FED_USER_CREDENTIAL		\N	4.29.1	\N	\N	2853952567
8.0.0-updating-credential-data-oracle-fixed	keycloak	META-INF/jpa-changelog-8.0.0.xml	2025-11-11 09:39:18.648275	74	MARK_RAN	9:14706f286953fc9a25286dbd8fb30d97	update tableName=CREDENTIAL; update tableName=CREDENTIAL; update tableName=CREDENTIAL; update tableName=FED_USER_CREDENTIAL; update tableName=FED_USER_CREDENTIAL; update tableName=FED_USER_CREDENTIAL		\N	4.29.1	\N	\N	2853952567
8.0.0-credential-cleanup-fixed	keycloak	META-INF/jpa-changelog-8.0.0.xml	2025-11-11 09:39:18.675732	75	EXECUTED	9:2b9cc12779be32c5b40e2e67711a218b	dropDefaultValue columnName=COUNTER, tableName=CREDENTIAL; dropDefaultValue columnName=DIGITS, tableName=CREDENTIAL; dropDefaultValue columnName=PERIOD, tableName=CREDENTIAL; dropDefaultValue columnName=ALGORITHM, tableName=CREDENTIAL; dropColumn ...		\N	4.29.1	\N	\N	2853952567
8.0.0-resource-tag-support	keycloak	META-INF/jpa-changelog-8.0.0.xml	2025-11-11 09:39:18.739055	76	EXECUTED	9:91fa186ce7a5af127a2d7a91ee083cc5	addColumn tableName=MIGRATION_MODEL; createIndex indexName=IDX_UPDATE_TIME, tableName=MIGRATION_MODEL		\N	4.29.1	\N	\N	2853952567
9.0.0-always-display-client	keycloak	META-INF/jpa-changelog-9.0.0.xml	2025-11-11 09:39:18.747383	77	EXECUTED	9:6335e5c94e83a2639ccd68dd24e2e5ad	addColumn tableName=CLIENT		\N	4.29.1	\N	\N	2853952567
9.0.0-drop-constraints-for-column-increase	keycloak	META-INF/jpa-changelog-9.0.0.xml	2025-11-11 09:39:18.751047	78	MARK_RAN	9:6bdb5658951e028bfe16fa0a8228b530	dropUniqueConstraint constraintName=UK_FRSR6T700S9V50BU18WS5PMT, tableName=RESOURCE_SERVER_PERM_TICKET; dropUniqueConstraint constraintName=UK_FRSR6T700S9V50BU18WS5HA6, tableName=RESOURCE_SERVER_RESOURCE; dropPrimaryKey constraintName=CONSTRAINT_O...		\N	4.29.1	\N	\N	2853952567
9.0.0-increase-column-size-federated-fk	keycloak	META-INF/jpa-changelog-9.0.0.xml	2025-11-11 09:39:18.77915	79	EXECUTED	9:d5bc15a64117ccad481ce8792d4c608f	modifyDataType columnName=CLIENT_ID, tableName=FED_USER_CONSENT; modifyDataType columnName=CLIENT_REALM_CONSTRAINT, tableName=KEYCLOAK_ROLE; modifyDataType columnName=OWNER, tableName=RESOURCE_SERVER_POLICY; modifyDataType columnName=CLIENT_ID, ta...		\N	4.29.1	\N	\N	2853952567
9.0.0-recreate-constraints-after-column-increase	keycloak	META-INF/jpa-changelog-9.0.0.xml	2025-11-11 09:39:18.783003	80	MARK_RAN	9:077cba51999515f4d3e7ad5619ab592c	addNotNullConstraint columnName=CLIENT_ID, tableName=OFFLINE_CLIENT_SESSION; addNotNullConstraint columnName=OWNER, tableName=RESOURCE_SERVER_PERM_TICKET; addNotNullConstraint columnName=REQUESTER, tableName=RESOURCE_SERVER_PERM_TICKET; addNotNull...		\N	4.29.1	\N	\N	2853952567
9.0.1-add-index-to-client.client_id	keycloak	META-INF/jpa-changelog-9.0.1.xml	2025-11-11 09:39:18.84287	81	EXECUTED	9:be969f08a163bf47c6b9e9ead8ac2afb	createIndex indexName=IDX_CLIENT_ID, tableName=CLIENT		\N	4.29.1	\N	\N	2853952567
9.0.1-KEYCLOAK-12579-drop-constraints	keycloak	META-INF/jpa-changelog-9.0.1.xml	2025-11-11 09:39:18.845273	82	MARK_RAN	9:6d3bb4408ba5a72f39bd8a0b301ec6e3	dropUniqueConstraint constraintName=SIBLING_NAMES, tableName=KEYCLOAK_GROUP		\N	4.29.1	\N	\N	2853952567
9.0.1-KEYCLOAK-12579-add-not-null-constraint	keycloak	META-INF/jpa-changelog-9.0.1.xml	2025-11-11 09:39:18.85269	83	EXECUTED	9:966bda61e46bebf3cc39518fbed52fa7	addNotNullConstraint columnName=PARENT_GROUP, tableName=KEYCLOAK_GROUP		\N	4.29.1	\N	\N	2853952567
9.0.1-KEYCLOAK-12579-recreate-constraints	keycloak	META-INF/jpa-changelog-9.0.1.xml	2025-11-11 09:39:18.856063	84	MARK_RAN	9:8dcac7bdf7378e7d823cdfddebf72fda	addUniqueConstraint constraintName=SIBLING_NAMES, tableName=KEYCLOAK_GROUP		\N	4.29.1	\N	\N	2853952567
9.0.1-add-index-to-events	keycloak	META-INF/jpa-changelog-9.0.1.xml	2025-11-11 09:39:18.914963	85	EXECUTED	9:7d93d602352a30c0c317e6a609b56599	createIndex indexName=IDX_EVENT_TIME, tableName=EVENT_ENTITY		\N	4.29.1	\N	\N	2853952567
map-remove-ri	keycloak	META-INF/jpa-changelog-11.0.0.xml	2025-11-11 09:39:18.922059	86	EXECUTED	9:71c5969e6cdd8d7b6f47cebc86d37627	dropForeignKeyConstraint baseTableName=REALM, constraintName=FK_TRAF444KK6QRKMS7N56AIWQ5Y; dropForeignKeyConstraint baseTableName=KEYCLOAK_ROLE, constraintName=FK_KJHO5LE2C0RAL09FL8CM9WFW9		\N	4.29.1	\N	\N	2853952567
map-remove-ri	keycloak	META-INF/jpa-changelog-12.0.0.xml	2025-11-11 09:39:18.932539	87	EXECUTED	9:a9ba7d47f065f041b7da856a81762021	dropForeignKeyConstraint baseTableName=REALM_DEFAULT_GROUPS, constraintName=FK_DEF_GROUPS_GROUP; dropForeignKeyConstraint baseTableName=REALM_DEFAULT_ROLES, constraintName=FK_H4WPD7W4HSOOLNI3H0SW7BTJE; dropForeignKeyConstraint baseTableName=CLIENT...		\N	4.29.1	\N	\N	2853952567
12.1.0-add-realm-localization-table	keycloak	META-INF/jpa-changelog-12.0.0.xml	2025-11-11 09:39:18.94853	88	EXECUTED	9:fffabce2bc01e1a8f5110d5278500065	createTable tableName=REALM_LOCALIZATIONS; addPrimaryKey tableName=REALM_LOCALIZATIONS		\N	4.29.1	\N	\N	2853952567
default-roles	keycloak	META-INF/jpa-changelog-13.0.0.xml	2025-11-11 09:39:18.957005	89	EXECUTED	9:fa8a5b5445e3857f4b010bafb5009957	addColumn tableName=REALM; customChange		\N	4.29.1	\N	\N	2853952567
default-roles-cleanup	keycloak	META-INF/jpa-changelog-13.0.0.xml	2025-11-11 09:39:18.966662	90	EXECUTED	9:67ac3241df9a8582d591c5ed87125f39	dropTable tableName=REALM_DEFAULT_ROLES; dropTable tableName=CLIENT_DEFAULT_ROLES		\N	4.29.1	\N	\N	2853952567
13.0.0-KEYCLOAK-16844	keycloak	META-INF/jpa-changelog-13.0.0.xml	2025-11-11 09:39:19.027524	91	EXECUTED	9:ad1194d66c937e3ffc82386c050ba089	createIndex indexName=IDX_OFFLINE_USS_PRELOAD, tableName=OFFLINE_USER_SESSION		\N	4.29.1	\N	\N	2853952567
map-remove-ri-13.0.0	keycloak	META-INF/jpa-changelog-13.0.0.xml	2025-11-11 09:39:19.038161	92	EXECUTED	9:d9be619d94af5a2f5d07b9f003543b91	dropForeignKeyConstraint baseTableName=DEFAULT_CLIENT_SCOPE, constraintName=FK_R_DEF_CLI_SCOPE_SCOPE; dropForeignKeyConstraint baseTableName=CLIENT_SCOPE_CLIENT, constraintName=FK_C_CLI_SCOPE_SCOPE; dropForeignKeyConstraint baseTableName=CLIENT_SC...		\N	4.29.1	\N	\N	2853952567
13.0.0-KEYCLOAK-17992-drop-constraints	keycloak	META-INF/jpa-changelog-13.0.0.xml	2025-11-11 09:39:19.041137	93	MARK_RAN	9:544d201116a0fcc5a5da0925fbbc3bde	dropPrimaryKey constraintName=C_CLI_SCOPE_BIND, tableName=CLIENT_SCOPE_CLIENT; dropIndex indexName=IDX_CLSCOPE_CL, tableName=CLIENT_SCOPE_CLIENT; dropIndex indexName=IDX_CL_CLSCOPE, tableName=CLIENT_SCOPE_CLIENT		\N	4.29.1	\N	\N	2853952567
13.0.0-increase-column-size-federated	keycloak	META-INF/jpa-changelog-13.0.0.xml	2025-11-11 09:39:19.054555	94	EXECUTED	9:43c0c1055b6761b4b3e89de76d612ccf	modifyDataType columnName=CLIENT_ID, tableName=CLIENT_SCOPE_CLIENT; modifyDataType columnName=SCOPE_ID, tableName=CLIENT_SCOPE_CLIENT		\N	4.29.1	\N	\N	2853952567
13.0.0-KEYCLOAK-17992-recreate-constraints	keycloak	META-INF/jpa-changelog-13.0.0.xml	2025-11-11 09:39:19.057705	95	MARK_RAN	9:8bd711fd0330f4fe980494ca43ab1139	addNotNullConstraint columnName=CLIENT_ID, tableName=CLIENT_SCOPE_CLIENT; addNotNullConstraint columnName=SCOPE_ID, tableName=CLIENT_SCOPE_CLIENT; addPrimaryKey constraintName=C_CLI_SCOPE_BIND, tableName=CLIENT_SCOPE_CLIENT; createIndex indexName=...		\N	4.29.1	\N	\N	2853952567
json-string-accomodation-fixed	keycloak	META-INF/jpa-changelog-13.0.0.xml	2025-11-11 09:39:19.067454	96	EXECUTED	9:e07d2bc0970c348bb06fb63b1f82ddbf	addColumn tableName=REALM_ATTRIBUTE; update tableName=REALM_ATTRIBUTE; dropColumn columnName=VALUE, tableName=REALM_ATTRIBUTE; renameColumn newColumnName=VALUE, oldColumnName=VALUE_NEW, tableName=REALM_ATTRIBUTE		\N	4.29.1	\N	\N	2853952567
14.0.0-KEYCLOAK-11019	keycloak	META-INF/jpa-changelog-14.0.0.xml	2025-11-11 09:39:19.241081	97	EXECUTED	9:24fb8611e97f29989bea412aa38d12b7	createIndex indexName=IDX_OFFLINE_CSS_PRELOAD, tableName=OFFLINE_CLIENT_SESSION; createIndex indexName=IDX_OFFLINE_USS_BY_USER, tableName=OFFLINE_USER_SESSION; createIndex indexName=IDX_OFFLINE_USS_BY_USERSESS, tableName=OFFLINE_USER_SESSION		\N	4.29.1	\N	\N	2853952567
14.0.0-KEYCLOAK-18286	keycloak	META-INF/jpa-changelog-14.0.0.xml	2025-11-11 09:39:19.243907	98	MARK_RAN	9:259f89014ce2506ee84740cbf7163aa7	createIndex indexName=IDX_CLIENT_ATT_BY_NAME_VALUE, tableName=CLIENT_ATTRIBUTES		\N	4.29.1	\N	\N	2853952567
14.0.0-KEYCLOAK-18286-revert	keycloak	META-INF/jpa-changelog-14.0.0.xml	2025-11-11 09:39:19.263252	99	MARK_RAN	9:04baaf56c116ed19951cbc2cca584022	dropIndex indexName=IDX_CLIENT_ATT_BY_NAME_VALUE, tableName=CLIENT_ATTRIBUTES		\N	4.29.1	\N	\N	2853952567
14.0.0-KEYCLOAK-18286-supported-dbs	keycloak	META-INF/jpa-changelog-14.0.0.xml	2025-11-11 09:39:19.330881	100	EXECUTED	9:60ca84a0f8c94ec8c3504a5a3bc88ee8	createIndex indexName=IDX_CLIENT_ATT_BY_NAME_VALUE, tableName=CLIENT_ATTRIBUTES		\N	4.29.1	\N	\N	2853952567
14.0.0-KEYCLOAK-18286-unsupported-dbs	keycloak	META-INF/jpa-changelog-14.0.0.xml	2025-11-11 09:39:19.334607	101	MARK_RAN	9:d3d977031d431db16e2c181ce49d73e9	createIndex indexName=IDX_CLIENT_ATT_BY_NAME_VALUE, tableName=CLIENT_ATTRIBUTES		\N	4.29.1	\N	\N	2853952567
KEYCLOAK-17267-add-index-to-user-attributes	keycloak	META-INF/jpa-changelog-14.0.0.xml	2025-11-11 09:39:19.405905	102	EXECUTED	9:0b305d8d1277f3a89a0a53a659ad274c	createIndex indexName=IDX_USER_ATTRIBUTE_NAME, tableName=USER_ATTRIBUTE		\N	4.29.1	\N	\N	2853952567
KEYCLOAK-18146-add-saml-art-binding-identifier	keycloak	META-INF/jpa-changelog-14.0.0.xml	2025-11-11 09:39:19.41328	103	EXECUTED	9:2c374ad2cdfe20e2905a84c8fac48460	customChange		\N	4.29.1	\N	\N	2853952567
15.0.0-KEYCLOAK-18467	keycloak	META-INF/jpa-changelog-15.0.0.xml	2025-11-11 09:39:19.424946	104	EXECUTED	9:47a760639ac597360a8219f5b768b4de	addColumn tableName=REALM_LOCALIZATIONS; update tableName=REALM_LOCALIZATIONS; dropColumn columnName=TEXTS, tableName=REALM_LOCALIZATIONS; renameColumn newColumnName=TEXTS, oldColumnName=TEXTS_NEW, tableName=REALM_LOCALIZATIONS; addNotNullConstrai...		\N	4.29.1	\N	\N	2853952567
17.0.0-9562	keycloak	META-INF/jpa-changelog-17.0.0.xml	2025-11-11 09:39:19.49501	105	EXECUTED	9:a6272f0576727dd8cad2522335f5d99e	createIndex indexName=IDX_USER_SERVICE_ACCOUNT, tableName=USER_ENTITY		\N	4.29.1	\N	\N	2853952567
18.0.0-10625-IDX_ADMIN_EVENT_TIME	keycloak	META-INF/jpa-changelog-18.0.0.xml	2025-11-11 09:39:19.557029	106	EXECUTED	9:015479dbd691d9cc8669282f4828c41d	createIndex indexName=IDX_ADMIN_EVENT_TIME, tableName=ADMIN_EVENT_ENTITY		\N	4.29.1	\N	\N	2853952567
18.0.15-30992-index-consent	keycloak	META-INF/jpa-changelog-18.0.15.xml	2025-11-11 09:39:19.623663	107	EXECUTED	9:80071ede7a05604b1f4906f3bf3b00f0	createIndex indexName=IDX_USCONSENT_SCOPE_ID, tableName=USER_CONSENT_CLIENT_SCOPE		\N	4.29.1	\N	\N	2853952567
19.0.0-10135	keycloak	META-INF/jpa-changelog-19.0.0.xml	2025-11-11 09:39:19.629993	108	EXECUTED	9:9518e495fdd22f78ad6425cc30630221	customChange		\N	4.29.1	\N	\N	2853952567
20.0.0-12964-supported-dbs	keycloak	META-INF/jpa-changelog-20.0.0.xml	2025-11-11 09:39:19.698759	109	EXECUTED	9:e5f243877199fd96bcc842f27a1656ac	createIndex indexName=IDX_GROUP_ATT_BY_NAME_VALUE, tableName=GROUP_ATTRIBUTE		\N	4.29.1	\N	\N	2853952567
20.0.0-12964-unsupported-dbs	keycloak	META-INF/jpa-changelog-20.0.0.xml	2025-11-11 09:39:19.702194	110	MARK_RAN	9:1a6fcaa85e20bdeae0a9ce49b41946a5	createIndex indexName=IDX_GROUP_ATT_BY_NAME_VALUE, tableName=GROUP_ATTRIBUTE		\N	4.29.1	\N	\N	2853952567
client-attributes-string-accomodation-fixed	keycloak	META-INF/jpa-changelog-20.0.0.xml	2025-11-11 09:39:19.713063	111	EXECUTED	9:3f332e13e90739ed0c35b0b25b7822ca	addColumn tableName=CLIENT_ATTRIBUTES; update tableName=CLIENT_ATTRIBUTES; dropColumn columnName=VALUE, tableName=CLIENT_ATTRIBUTES; renameColumn newColumnName=VALUE, oldColumnName=VALUE_NEW, tableName=CLIENT_ATTRIBUTES		\N	4.29.1	\N	\N	2853952567
21.0.2-17277	keycloak	META-INF/jpa-changelog-21.0.2.xml	2025-11-11 09:39:19.722296	112	EXECUTED	9:7ee1f7a3fb8f5588f171fb9a6ab623c0	customChange		\N	4.29.1	\N	\N	2853952567
21.1.0-19404	keycloak	META-INF/jpa-changelog-21.1.0.xml	2025-11-11 09:39:19.767228	113	EXECUTED	9:3d7e830b52f33676b9d64f7f2b2ea634	modifyDataType columnName=DECISION_STRATEGY, tableName=RESOURCE_SERVER_POLICY; modifyDataType columnName=LOGIC, tableName=RESOURCE_SERVER_POLICY; modifyDataType columnName=POLICY_ENFORCE_MODE, tableName=RESOURCE_SERVER		\N	4.29.1	\N	\N	2853952567
21.1.0-19404-2	keycloak	META-INF/jpa-changelog-21.1.0.xml	2025-11-11 09:39:19.771754	114	MARK_RAN	9:627d032e3ef2c06c0e1f73d2ae25c26c	addColumn tableName=RESOURCE_SERVER_POLICY; update tableName=RESOURCE_SERVER_POLICY; dropColumn columnName=DECISION_STRATEGY, tableName=RESOURCE_SERVER_POLICY; renameColumn newColumnName=DECISION_STRATEGY, oldColumnName=DECISION_STRATEGY_NEW, tabl...		\N	4.29.1	\N	\N	2853952567
22.0.0-17484-updated	keycloak	META-INF/jpa-changelog-22.0.0.xml	2025-11-11 09:39:19.777923	115	EXECUTED	9:90af0bfd30cafc17b9f4d6eccd92b8b3	customChange		\N	4.29.1	\N	\N	2853952567
22.0.5-24031	keycloak	META-INF/jpa-changelog-22.0.0.xml	2025-11-11 09:39:19.78297	116	MARK_RAN	9:a60d2d7b315ec2d3eba9e2f145f9df28	customChange		\N	4.29.1	\N	\N	2853952567
23.0.0-12062	keycloak	META-INF/jpa-changelog-23.0.0.xml	2025-11-11 09:39:19.793436	117	EXECUTED	9:2168fbe728fec46ae9baf15bf80927b8	addColumn tableName=COMPONENT_CONFIG; update tableName=COMPONENT_CONFIG; dropColumn columnName=VALUE, tableName=COMPONENT_CONFIG; renameColumn newColumnName=VALUE, oldColumnName=VALUE_NEW, tableName=COMPONENT_CONFIG		\N	4.29.1	\N	\N	2853952567
23.0.0-17258	keycloak	META-INF/jpa-changelog-23.0.0.xml	2025-11-11 09:39:19.800602	118	EXECUTED	9:36506d679a83bbfda85a27ea1864dca8	addColumn tableName=EVENT_ENTITY		\N	4.29.1	\N	\N	2853952567
24.0.0-9758	keycloak	META-INF/jpa-changelog-24.0.0.xml	2025-11-11 09:39:20.033157	119	EXECUTED	9:502c557a5189f600f0f445a9b49ebbce	addColumn tableName=USER_ATTRIBUTE; addColumn tableName=FED_USER_ATTRIBUTE; createIndex indexName=USER_ATTR_LONG_VALUES, tableName=USER_ATTRIBUTE; createIndex indexName=FED_USER_ATTR_LONG_VALUES, tableName=FED_USER_ATTRIBUTE; createIndex indexName...		\N	4.29.1	\N	\N	2853952567
24.0.0-9758-2	keycloak	META-INF/jpa-changelog-24.0.0.xml	2025-11-11 09:39:20.039632	120	EXECUTED	9:bf0fdee10afdf597a987adbf291db7b2	customChange		\N	4.29.1	\N	\N	2853952567
24.0.0-26618-drop-index-if-present	keycloak	META-INF/jpa-changelog-24.0.0.xml	2025-11-11 09:39:20.047248	121	MARK_RAN	9:04baaf56c116ed19951cbc2cca584022	dropIndex indexName=IDX_CLIENT_ATT_BY_NAME_VALUE, tableName=CLIENT_ATTRIBUTES		\N	4.29.1	\N	\N	2853952567
24.0.0-26618-reindex	keycloak	META-INF/jpa-changelog-24.0.0.xml	2025-11-11 09:39:20.11348	122	EXECUTED	9:08707c0f0db1cef6b352db03a60edc7f	createIndex indexName=IDX_CLIENT_ATT_BY_NAME_VALUE, tableName=CLIENT_ATTRIBUTES		\N	4.29.1	\N	\N	2853952567
24.0.2-27228	keycloak	META-INF/jpa-changelog-24.0.2.xml	2025-11-11 09:39:20.119223	123	EXECUTED	9:eaee11f6b8aa25d2cc6a84fb86fc6238	customChange		\N	4.29.1	\N	\N	2853952567
24.0.2-27967-drop-index-if-present	keycloak	META-INF/jpa-changelog-24.0.2.xml	2025-11-11 09:39:20.12194	124	MARK_RAN	9:04baaf56c116ed19951cbc2cca584022	dropIndex indexName=IDX_CLIENT_ATT_BY_NAME_VALUE, tableName=CLIENT_ATTRIBUTES		\N	4.29.1	\N	\N	2853952567
24.0.2-27967-reindex	keycloak	META-INF/jpa-changelog-24.0.2.xml	2025-11-11 09:39:20.125394	125	MARK_RAN	9:d3d977031d431db16e2c181ce49d73e9	createIndex indexName=IDX_CLIENT_ATT_BY_NAME_VALUE, tableName=CLIENT_ATTRIBUTES		\N	4.29.1	\N	\N	2853952567
25.0.0-28265-tables	keycloak	META-INF/jpa-changelog-25.0.0.xml	2025-11-11 09:39:20.135255	126	EXECUTED	9:deda2df035df23388af95bbd36c17cef	addColumn tableName=OFFLINE_USER_SESSION; addColumn tableName=OFFLINE_CLIENT_SESSION		\N	4.29.1	\N	\N	2853952567
25.0.0-28265-index-creation	keycloak	META-INF/jpa-changelog-25.0.0.xml	2025-11-11 09:39:20.200137	127	EXECUTED	9:3e96709818458ae49f3c679ae58d263a	createIndex indexName=IDX_OFFLINE_USS_BY_LAST_SESSION_REFRESH, tableName=OFFLINE_USER_SESSION		\N	4.29.1	\N	\N	2853952567
25.0.0-28265-index-cleanup-uss-createdon	keycloak	META-INF/jpa-changelog-25.0.0.xml	2025-11-11 09:39:20.281522	128	EXECUTED	9:78ab4fc129ed5e8265dbcc3485fba92f	dropIndex indexName=IDX_OFFLINE_USS_CREATEDON, tableName=OFFLINE_USER_SESSION		\N	4.29.1	\N	\N	2853952567
25.0.0-28265-index-cleanup-uss-preload	keycloak	META-INF/jpa-changelog-25.0.0.xml	2025-11-11 09:39:20.341716	129	EXECUTED	9:de5f7c1f7e10994ed8b62e621d20eaab	dropIndex indexName=IDX_OFFLINE_USS_PRELOAD, tableName=OFFLINE_USER_SESSION		\N	4.29.1	\N	\N	2853952567
25.0.0-28265-index-cleanup-uss-by-usersess	keycloak	META-INF/jpa-changelog-25.0.0.xml	2025-11-11 09:39:20.412265	130	EXECUTED	9:6eee220d024e38e89c799417ec33667f	dropIndex indexName=IDX_OFFLINE_USS_BY_USERSESS, tableName=OFFLINE_USER_SESSION		\N	4.29.1	\N	\N	2853952567
25.0.0-28265-index-cleanup-css-preload	keycloak	META-INF/jpa-changelog-25.0.0.xml	2025-11-11 09:39:20.474418	131	EXECUTED	9:5411d2fb2891d3e8d63ddb55dfa3c0c9	dropIndex indexName=IDX_OFFLINE_CSS_PRELOAD, tableName=OFFLINE_CLIENT_SESSION		\N	4.29.1	\N	\N	2853952567
25.0.0-28265-index-2-mysql	keycloak	META-INF/jpa-changelog-25.0.0.xml	2025-11-11 09:39:20.478218	132	MARK_RAN	9:b7ef76036d3126bb83c2423bf4d449d6	createIndex indexName=IDX_OFFLINE_USS_BY_BROKER_SESSION_ID, tableName=OFFLINE_USER_SESSION		\N	4.29.1	\N	\N	2853952567
25.0.0-28265-index-2-not-mysql	keycloak	META-INF/jpa-changelog-25.0.0.xml	2025-11-11 09:39:20.554177	133	EXECUTED	9:23396cf51ab8bc1ae6f0cac7f9f6fcf7	createIndex indexName=IDX_OFFLINE_USS_BY_BROKER_SESSION_ID, tableName=OFFLINE_USER_SESSION		\N	4.29.1	\N	\N	2853952567
25.0.0-org	keycloak	META-INF/jpa-changelog-25.0.0.xml	2025-11-11 09:39:20.589418	134	EXECUTED	9:5c859965c2c9b9c72136c360649af157	createTable tableName=ORG; addUniqueConstraint constraintName=UK_ORG_NAME, tableName=ORG; addUniqueConstraint constraintName=UK_ORG_GROUP, tableName=ORG; createTable tableName=ORG_DOMAIN		\N	4.29.1	\N	\N	2853952567
unique-consentuser	keycloak	META-INF/jpa-changelog-25.0.0.xml	2025-11-11 09:39:20.60872	135	EXECUTED	9:5857626a2ea8767e9a6c66bf3a2cb32f	customChange; dropUniqueConstraint constraintName=UK_JKUWUVD56ONTGSUHOGM8UEWRT, tableName=USER_CONSENT; addUniqueConstraint constraintName=UK_LOCAL_CONSENT, tableName=USER_CONSENT; addUniqueConstraint constraintName=UK_EXTERNAL_CONSENT, tableName=...		\N	4.29.1	\N	\N	2853952567
unique-consentuser-mysql	keycloak	META-INF/jpa-changelog-25.0.0.xml	2025-11-11 09:39:20.611848	136	MARK_RAN	9:b79478aad5adaa1bc428e31563f55e8e	customChange; dropUniqueConstraint constraintName=UK_JKUWUVD56ONTGSUHOGM8UEWRT, tableName=USER_CONSENT; addUniqueConstraint constraintName=UK_LOCAL_CONSENT, tableName=USER_CONSENT; addUniqueConstraint constraintName=UK_EXTERNAL_CONSENT, tableName=...		\N	4.29.1	\N	\N	2853952567
25.0.0-28861-index-creation	keycloak	META-INF/jpa-changelog-25.0.0.xml	2025-11-11 09:39:20.733566	137	EXECUTED	9:b9acb58ac958d9ada0fe12a5d4794ab1	createIndex indexName=IDX_PERM_TICKET_REQUESTER, tableName=RESOURCE_SERVER_PERM_TICKET; createIndex indexName=IDX_PERM_TICKET_OWNER, tableName=RESOURCE_SERVER_PERM_TICKET		\N	4.29.1	\N	\N	2853952567
26.0.0-org-alias	keycloak	META-INF/jpa-changelog-26.0.0.xml	2025-11-11 09:39:20.747097	138	EXECUTED	9:6ef7d63e4412b3c2d66ed179159886a4	addColumn tableName=ORG; update tableName=ORG; addNotNullConstraint columnName=ALIAS, tableName=ORG; addUniqueConstraint constraintName=UK_ORG_ALIAS, tableName=ORG		\N	4.29.1	\N	\N	2853952567
26.0.0-org-group	keycloak	META-INF/jpa-changelog-26.0.0.xml	2025-11-11 09:39:20.759387	139	EXECUTED	9:da8e8087d80ef2ace4f89d8c5b9ca223	addColumn tableName=KEYCLOAK_GROUP; update tableName=KEYCLOAK_GROUP; addNotNullConstraint columnName=TYPE, tableName=KEYCLOAK_GROUP; customChange		\N	4.29.1	\N	\N	2853952567
26.0.0-org-indexes	keycloak	META-INF/jpa-changelog-26.0.0.xml	2025-11-11 09:39:20.820202	140	EXECUTED	9:79b05dcd610a8c7f25ec05135eec0857	createIndex indexName=IDX_ORG_DOMAIN_ORG_ID, tableName=ORG_DOMAIN		\N	4.29.1	\N	\N	2853952567
26.0.0-org-group-membership	keycloak	META-INF/jpa-changelog-26.0.0.xml	2025-11-11 09:39:20.827217	141	EXECUTED	9:a6ace2ce583a421d89b01ba2a28dc2d4	addColumn tableName=USER_GROUP_MEMBERSHIP; update tableName=USER_GROUP_MEMBERSHIP; addNotNullConstraint columnName=MEMBERSHIP_TYPE, tableName=USER_GROUP_MEMBERSHIP		\N	4.29.1	\N	\N	2853952567
31296-persist-revoked-access-tokens	keycloak	META-INF/jpa-changelog-26.0.0.xml	2025-11-11 09:39:20.837269	142	EXECUTED	9:64ef94489d42a358e8304b0e245f0ed4	createTable tableName=REVOKED_TOKEN; addPrimaryKey constraintName=CONSTRAINT_RT, tableName=REVOKED_TOKEN		\N	4.29.1	\N	\N	2853952567
31725-index-persist-revoked-access-tokens	keycloak	META-INF/jpa-changelog-26.0.0.xml	2025-11-11 09:39:20.89978	143	EXECUTED	9:b994246ec2bf7c94da881e1d28782c7b	createIndex indexName=IDX_REV_TOKEN_ON_EXPIRE, tableName=REVOKED_TOKEN		\N	4.29.1	\N	\N	2853952567
26.0.0-idps-for-login	keycloak	META-INF/jpa-changelog-26.0.0.xml	2025-11-11 09:39:21.035809	144	EXECUTED	9:51f5fffadf986983d4bd59582c6c1604	addColumn tableName=IDENTITY_PROVIDER; createIndex indexName=IDX_IDP_REALM_ORG, tableName=IDENTITY_PROVIDER; createIndex indexName=IDX_IDP_FOR_LOGIN, tableName=IDENTITY_PROVIDER; customChange		\N	4.29.1	\N	\N	2853952567
26.0.0-32583-drop-redundant-index-on-client-session	keycloak	META-INF/jpa-changelog-26.0.0.xml	2025-11-11 09:39:21.095959	145	EXECUTED	9:24972d83bf27317a055d234187bb4af9	dropIndex indexName=IDX_US_SESS_ID_ON_CL_SESS, tableName=OFFLINE_CLIENT_SESSION		\N	4.29.1	\N	\N	2853952567
26.0.0.32582-remove-tables-user-session-user-session-note-and-client-session	keycloak	META-INF/jpa-changelog-26.0.0.xml	2025-11-11 09:39:21.111775	146	EXECUTED	9:febdc0f47f2ed241c59e60f58c3ceea5	dropTable tableName=CLIENT_SESSION_ROLE; dropTable tableName=CLIENT_SESSION_NOTE; dropTable tableName=CLIENT_SESSION_PROT_MAPPER; dropTable tableName=CLIENT_SESSION_AUTH_STATUS; dropTable tableName=CLIENT_USER_SESSION_NOTE; dropTable tableName=CLI...		\N	4.29.1	\N	\N	2853952567
26.0.0-33201-org-redirect-url	keycloak	META-INF/jpa-changelog-26.0.0.xml	2025-11-11 09:39:21.119006	147	EXECUTED	9:4d0e22b0ac68ebe9794fa9cb752ea660	addColumn tableName=ORG		\N	4.29.1	\N	\N	2853952567
26.0.6-34013	keycloak	META-INF/jpa-changelog-26.0.6.xml	2025-11-11 09:39:21.129908	148	EXECUTED	9:e6b686a15759aef99a6d758a5c4c6a26	addColumn tableName=ADMIN_EVENT_ENTITY		\N	4.29.1	\N	\N	2853952567
\.


--
-- TOC entry 4196 (class 0 OID 16719)
-- Dependencies: 215
-- Data for Name: databasechangeloglock; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.databasechangeloglock (id, locked, lockgranted, lockedby) FROM stdin;
1	f	\N	\N
1000	f	\N	\N
\.


--
-- TOC entry 4272 (class 0 OID 18115)
-- Dependencies: 291
-- Data for Name: default_client_scope; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.default_client_scope (realm_id, scope_id, default_scope) FROM stdin;
04b8d4e2-b556-4c37-b4fc-764558ddd1c4	047cffd4-87cf-42f6-899c-84886f43e2ca	f
04b8d4e2-b556-4c37-b4fc-764558ddd1c4	850c1e15-5b08-4c84-aaa5-a966412aba70	t
04b8d4e2-b556-4c37-b4fc-764558ddd1c4	677c1373-fc94-4ae0-a429-97ce419d8ad8	t
04b8d4e2-b556-4c37-b4fc-764558ddd1c4	265c9db3-5d3a-4acc-b313-267642fa4808	t
04b8d4e2-b556-4c37-b4fc-764558ddd1c4	37c69ad2-2770-4c02-a255-620874a16cb7	t
04b8d4e2-b556-4c37-b4fc-764558ddd1c4	f16d8813-579a-485f-93aa-17fb63a17c43	f
04b8d4e2-b556-4c37-b4fc-764558ddd1c4	a2b9c7bd-ce04-4154-a469-b96edd622cd3	f
04b8d4e2-b556-4c37-b4fc-764558ddd1c4	5b313498-ab37-4f0c-89f7-fb1315ce4b2e	t
04b8d4e2-b556-4c37-b4fc-764558ddd1c4	969ccb58-a5c6-4272-ba09-599950b83ab8	t
04b8d4e2-b556-4c37-b4fc-764558ddd1c4	1d4ffcd3-06e6-45a5-83c7-6cad6568290f	f
04b8d4e2-b556-4c37-b4fc-764558ddd1c4	2e364754-a620-4504-acde-f0bda9d08edc	t
04b8d4e2-b556-4c37-b4fc-764558ddd1c4	7fac0628-df20-44eb-946c-86c154a953a5	t
04b8d4e2-b556-4c37-b4fc-764558ddd1c4	e67b0602-f276-4e56-9150-a8050ce08e18	f
9814c300-ac35-45b9-a56d-4d4d9ecf51bb	17fd8ec4-54da-4835-a3d4-3ab304175b72	f
9814c300-ac35-45b9-a56d-4d4d9ecf51bb	7490d48d-17c7-4613-a1e2-f828a9c90d62	t
9814c300-ac35-45b9-a56d-4d4d9ecf51bb	9eb5290d-5db7-4af1-91ec-92318545760a	t
9814c300-ac35-45b9-a56d-4d4d9ecf51bb	f08b7223-fef1-4af3-9ebf-40773e5a4779	t
9814c300-ac35-45b9-a56d-4d4d9ecf51bb	66b3a300-6971-4f0d-b936-e60cba2d2de7	t
9814c300-ac35-45b9-a56d-4d4d9ecf51bb	19f41a26-8106-4fa2-b275-07266c4afdf0	f
9814c300-ac35-45b9-a56d-4d4d9ecf51bb	19685f60-4055-4026-bea6-31ade7543fe4	f
9814c300-ac35-45b9-a56d-4d4d9ecf51bb	00c132f3-40a5-45a8-9b68-af411830420d	t
9814c300-ac35-45b9-a56d-4d4d9ecf51bb	351fab28-c6c3-4368-a2d7-ec6cf6fd6fd7	t
9814c300-ac35-45b9-a56d-4d4d9ecf51bb	04659a0d-ee92-4eef-a78b-b2dd808f5983	f
9814c300-ac35-45b9-a56d-4d4d9ecf51bb	50dbb826-9330-4c55-8952-d1b050f3940b	t
9814c300-ac35-45b9-a56d-4d4d9ecf51bb	779f0fe6-ab9c-4998-8bc7-b5575052f67d	t
9814c300-ac35-45b9-a56d-4d4d9ecf51bb	2c35d9a2-156f-49e0-8f7f-5a72ea2d9866	f
\.


--
-- TOC entry 4201 (class 0 OID 16759)
-- Dependencies: 220
-- Data for Name: event_entity; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.event_entity (id, client_id, details_json, error, ip_address, realm_id, session_id, event_time, type, user_id, details_json_long_value) FROM stdin;
\.


--
-- TOC entry 4260 (class 0 OID 17814)
-- Dependencies: 279
-- Data for Name: fed_user_attribute; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.fed_user_attribute (id, name, user_id, realm_id, storage_provider_id, value, long_value_hash, long_value_hash_lower_case, long_value) FROM stdin;
\.


--
-- TOC entry 4261 (class 0 OID 17819)
-- Dependencies: 280
-- Data for Name: fed_user_consent; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.fed_user_consent (id, client_id, user_id, realm_id, storage_provider_id, created_date, last_updated_date, client_storage_provider, external_client_id) FROM stdin;
\.


--
-- TOC entry 4274 (class 0 OID 18141)
-- Dependencies: 293
-- Data for Name: fed_user_consent_cl_scope; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.fed_user_consent_cl_scope (user_consent_id, scope_id) FROM stdin;
\.


--
-- TOC entry 4262 (class 0 OID 17828)
-- Dependencies: 281
-- Data for Name: fed_user_credential; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.fed_user_credential (id, salt, type, created_date, user_id, realm_id, storage_provider_id, user_label, secret_data, credential_data, priority) FROM stdin;
\.


--
-- TOC entry 4263 (class 0 OID 17837)
-- Dependencies: 282
-- Data for Name: fed_user_group_membership; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.fed_user_group_membership (group_id, user_id, realm_id, storage_provider_id) FROM stdin;
\.


--
-- TOC entry 4264 (class 0 OID 17840)
-- Dependencies: 283
-- Data for Name: fed_user_required_action; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.fed_user_required_action (required_action, user_id, realm_id, storage_provider_id) FROM stdin;
\.


--
-- TOC entry 4265 (class 0 OID 17846)
-- Dependencies: 284
-- Data for Name: fed_user_role_mapping; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.fed_user_role_mapping (role_id, user_id, realm_id, storage_provider_id) FROM stdin;
\.


--
-- TOC entry 4222 (class 0 OID 17136)
-- Dependencies: 241
-- Data for Name: federated_identity; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.federated_identity (identity_provider, realm_id, federated_user_id, federated_username, token, user_id) FROM stdin;
\.


--
-- TOC entry 4268 (class 0 OID 17911)
-- Dependencies: 287
-- Data for Name: federated_user; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.federated_user (id, storage_provider_id, realm_id) FROM stdin;
\.


--
-- TOC entry 4244 (class 0 OID 17538)
-- Dependencies: 263
-- Data for Name: group_attribute; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.group_attribute (id, name, value, group_id) FROM stdin;
\.


--
-- TOC entry 4243 (class 0 OID 17535)
-- Dependencies: 262
-- Data for Name: group_role_mapping; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.group_role_mapping (role_id, group_id) FROM stdin;
\.


--
-- TOC entry 4223 (class 0 OID 17141)
-- Dependencies: 242
-- Data for Name: identity_provider; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.identity_provider (internal_id, enabled, provider_alias, provider_id, store_token, authenticate_by_default, realm_id, add_token_role, trust_email, first_broker_login_flow_id, post_broker_login_flow_id, provider_display_name, link_only, organization_id, hide_on_login) FROM stdin;
\.


--
-- TOC entry 4224 (class 0 OID 17150)
-- Dependencies: 243
-- Data for Name: identity_provider_config; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.identity_provider_config (identity_provider_id, value, name) FROM stdin;
\.


--
-- TOC entry 4228 (class 0 OID 17254)
-- Dependencies: 247
-- Data for Name: identity_provider_mapper; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.identity_provider_mapper (id, name, idp_alias, idp_mapper_name, realm_id) FROM stdin;
\.


--
-- TOC entry 4229 (class 0 OID 17259)
-- Dependencies: 248
-- Data for Name: idp_mapper_config; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.idp_mapper_config (idp_mapper_id, value, name) FROM stdin;
\.


--
-- TOC entry 4242 (class 0 OID 17532)
-- Dependencies: 261
-- Data for Name: keycloak_group; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.keycloak_group (id, name, parent_group, realm_id, type) FROM stdin;
\.


--
-- TOC entry 4202 (class 0 OID 16767)
-- Dependencies: 221
-- Data for Name: keycloak_role; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.keycloak_role (id, client_realm_constraint, client_role, description, name, realm_id, client, realm) FROM stdin;
2a61cf53-4e85-4ef6-a9df-4b44da0b27ff	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	f	${role_default-roles}	default-roles-master	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	\N	\N
e5dfb957-3b08-4cec-aba8-1157091ffe7d	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	f	${role_create-realm}	create-realm	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	\N	\N
f5c39b89-0988-4502-b22b-79522131772f	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	f	${role_admin}	admin	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	\N	\N
b9759962-c0b8-42ac-9b88-39561f2c4f9b	eb6585bb-4c5a-41c9-acd6-2bd25c7cd792	t	${role_create-client}	create-client	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	eb6585bb-4c5a-41c9-acd6-2bd25c7cd792	\N
db70e6c9-a228-4cf6-b966-8d0fa2ca5700	eb6585bb-4c5a-41c9-acd6-2bd25c7cd792	t	${role_view-realm}	view-realm	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	eb6585bb-4c5a-41c9-acd6-2bd25c7cd792	\N
048b8c05-b2bd-49c7-9eff-ea8f74a4b9d7	eb6585bb-4c5a-41c9-acd6-2bd25c7cd792	t	${role_view-users}	view-users	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	eb6585bb-4c5a-41c9-acd6-2bd25c7cd792	\N
93232036-41be-43b2-9b7a-e32755794e2c	eb6585bb-4c5a-41c9-acd6-2bd25c7cd792	t	${role_view-clients}	view-clients	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	eb6585bb-4c5a-41c9-acd6-2bd25c7cd792	\N
26b9c7e6-cdff-4265-bfc0-a163c5bb860f	eb6585bb-4c5a-41c9-acd6-2bd25c7cd792	t	${role_view-events}	view-events	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	eb6585bb-4c5a-41c9-acd6-2bd25c7cd792	\N
a645be1c-3418-409e-a193-9d0c2b34229f	eb6585bb-4c5a-41c9-acd6-2bd25c7cd792	t	${role_view-identity-providers}	view-identity-providers	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	eb6585bb-4c5a-41c9-acd6-2bd25c7cd792	\N
9168b0d5-71a5-4fc4-bb5a-79a1ccf3603d	eb6585bb-4c5a-41c9-acd6-2bd25c7cd792	t	${role_view-authorization}	view-authorization	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	eb6585bb-4c5a-41c9-acd6-2bd25c7cd792	\N
ba1a1ed9-962f-4a95-b501-8c5f323056ac	eb6585bb-4c5a-41c9-acd6-2bd25c7cd792	t	${role_manage-realm}	manage-realm	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	eb6585bb-4c5a-41c9-acd6-2bd25c7cd792	\N
39ea07db-e385-4c49-ae1d-abde15c050b5	eb6585bb-4c5a-41c9-acd6-2bd25c7cd792	t	${role_manage-users}	manage-users	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	eb6585bb-4c5a-41c9-acd6-2bd25c7cd792	\N
9dab48bf-2a33-4252-942a-786e4eb0d18d	eb6585bb-4c5a-41c9-acd6-2bd25c7cd792	t	${role_manage-clients}	manage-clients	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	eb6585bb-4c5a-41c9-acd6-2bd25c7cd792	\N
9585fce2-55af-416e-85dc-0e3155546b40	eb6585bb-4c5a-41c9-acd6-2bd25c7cd792	t	${role_manage-events}	manage-events	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	eb6585bb-4c5a-41c9-acd6-2bd25c7cd792	\N
68e3770d-e06c-480c-a30e-da7fafcacd55	eb6585bb-4c5a-41c9-acd6-2bd25c7cd792	t	${role_manage-identity-providers}	manage-identity-providers	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	eb6585bb-4c5a-41c9-acd6-2bd25c7cd792	\N
298001e2-eeaa-40b3-8f07-88d881da4fd6	eb6585bb-4c5a-41c9-acd6-2bd25c7cd792	t	${role_manage-authorization}	manage-authorization	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	eb6585bb-4c5a-41c9-acd6-2bd25c7cd792	\N
9bddb9d1-bbb9-4671-8d42-ef3fed8685bc	eb6585bb-4c5a-41c9-acd6-2bd25c7cd792	t	${role_query-users}	query-users	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	eb6585bb-4c5a-41c9-acd6-2bd25c7cd792	\N
3e90ce27-8b5d-4f18-8537-da763c9370a5	eb6585bb-4c5a-41c9-acd6-2bd25c7cd792	t	${role_query-clients}	query-clients	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	eb6585bb-4c5a-41c9-acd6-2bd25c7cd792	\N
2fee280b-9488-48d2-969a-23f14bfdc623	eb6585bb-4c5a-41c9-acd6-2bd25c7cd792	t	${role_query-realms}	query-realms	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	eb6585bb-4c5a-41c9-acd6-2bd25c7cd792	\N
e2d8533a-6b2d-4a20-a3c5-83d54ec60d99	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	f	${role_default-roles}	default-roles-drccs	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	\N	\N
61bcd61b-8c35-4997-9d7c-c8591e829f0b	14682d39-1ec0-4f59-a7b1-3a01115f491a	t	${role_create-client}	create-client	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	14682d39-1ec0-4f59-a7b1-3a01115f491a	\N
5efdeaf2-2d2b-4638-a973-588add36c6bd	14682d39-1ec0-4f59-a7b1-3a01115f491a	t	${role_view-realm}	view-realm	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	14682d39-1ec0-4f59-a7b1-3a01115f491a	\N
aab30ef2-f569-40f4-8975-e5f1ca954cb3	14682d39-1ec0-4f59-a7b1-3a01115f491a	t	${role_view-users}	view-users	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	14682d39-1ec0-4f59-a7b1-3a01115f491a	\N
d46457d3-6d1c-4831-a001-38387c170ea0	14682d39-1ec0-4f59-a7b1-3a01115f491a	t	${role_view-clients}	view-clients	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	14682d39-1ec0-4f59-a7b1-3a01115f491a	\N
33dff824-0155-4c9a-ab3d-8bf7bbfbc799	14682d39-1ec0-4f59-a7b1-3a01115f491a	t	${role_view-events}	view-events	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	14682d39-1ec0-4f59-a7b1-3a01115f491a	\N
321a264d-2107-4a1a-aa74-e5ef2959c939	14682d39-1ec0-4f59-a7b1-3a01115f491a	t	${role_view-identity-providers}	view-identity-providers	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	14682d39-1ec0-4f59-a7b1-3a01115f491a	\N
2815b22a-8f93-43d4-b124-fa6ef1aaed13	14682d39-1ec0-4f59-a7b1-3a01115f491a	t	${role_view-authorization}	view-authorization	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	14682d39-1ec0-4f59-a7b1-3a01115f491a	\N
5e84fb77-3522-4f08-aab3-d64c88e8de95	14682d39-1ec0-4f59-a7b1-3a01115f491a	t	${role_manage-realm}	manage-realm	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	14682d39-1ec0-4f59-a7b1-3a01115f491a	\N
981b5877-c629-4e2d-b118-a09ac929eea8	eb6585bb-4c5a-41c9-acd6-2bd25c7cd792	t	${role_query-groups}	query-groups	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	eb6585bb-4c5a-41c9-acd6-2bd25c7cd792	\N
9a71ab08-248a-4db0-a65a-394fb7595101	9c71c67c-24e8-45c3-aa0d-4df498facac4	t	${role_view-profile}	view-profile	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	9c71c67c-24e8-45c3-aa0d-4df498facac4	\N
f911ee86-369e-4fa9-a8b7-b243851bde1f	9c71c67c-24e8-45c3-aa0d-4df498facac4	t	${role_manage-account}	manage-account	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	9c71c67c-24e8-45c3-aa0d-4df498facac4	\N
b015d6de-abd7-4e30-81a2-956f37220ed1	9c71c67c-24e8-45c3-aa0d-4df498facac4	t	${role_manage-account-links}	manage-account-links	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	9c71c67c-24e8-45c3-aa0d-4df498facac4	\N
eb3f63c7-cb6f-4b55-8674-f8de34dd8b28	9c71c67c-24e8-45c3-aa0d-4df498facac4	t	${role_view-applications}	view-applications	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	9c71c67c-24e8-45c3-aa0d-4df498facac4	\N
864d4897-f6a2-4c80-81c9-5ff65daf6d1c	9c71c67c-24e8-45c3-aa0d-4df498facac4	t	${role_view-consent}	view-consent	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	9c71c67c-24e8-45c3-aa0d-4df498facac4	\N
6ddaffd5-4936-43fd-8c90-b026dbbc2273	9c71c67c-24e8-45c3-aa0d-4df498facac4	t	${role_manage-consent}	manage-consent	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	9c71c67c-24e8-45c3-aa0d-4df498facac4	\N
e478211a-d656-411e-b6e8-4a85fae15440	9c71c67c-24e8-45c3-aa0d-4df498facac4	t	${role_view-groups}	view-groups	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	9c71c67c-24e8-45c3-aa0d-4df498facac4	\N
f46fe20a-0292-4ab4-9ce5-788f01e4777a	9c71c67c-24e8-45c3-aa0d-4df498facac4	t	${role_delete-account}	delete-account	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	9c71c67c-24e8-45c3-aa0d-4df498facac4	\N
e1feb497-3564-4293-a44c-679b02ca5721	6237db72-2d96-45c5-9520-824673c2d8fd	t	${role_read-token}	read-token	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	6237db72-2d96-45c5-9520-824673c2d8fd	\N
ff9da473-bb7a-49f9-b345-ae96d43a58d0	eb6585bb-4c5a-41c9-acd6-2bd25c7cd792	t	${role_impersonation}	impersonation	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	eb6585bb-4c5a-41c9-acd6-2bd25c7cd792	\N
b00ff4eb-4f89-4525-a6a5-d8e353cd8080	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	f	${role_offline-access}	offline_access	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	\N	\N
25288feb-c543-4f0e-bc97-c4a181327da4	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	f	${role_uma_authorization}	uma_authorization	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	\N	\N
9645c82c-8dde-48fd-bc01-0b6c488277e8	14682d39-1ec0-4f59-a7b1-3a01115f491a	t	${role_manage-users}	manage-users	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	14682d39-1ec0-4f59-a7b1-3a01115f491a	\N
87eb561f-e681-4245-bd37-b47a6a5a32a2	14682d39-1ec0-4f59-a7b1-3a01115f491a	t	${role_manage-clients}	manage-clients	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	14682d39-1ec0-4f59-a7b1-3a01115f491a	\N
112c5ffa-7e05-4a83-a9fb-b7ac84a0d1b3	14682d39-1ec0-4f59-a7b1-3a01115f491a	t	${role_manage-events}	manage-events	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	14682d39-1ec0-4f59-a7b1-3a01115f491a	\N
e4de7610-bacc-46d4-9b37-4c6a23fecad0	14682d39-1ec0-4f59-a7b1-3a01115f491a	t	${role_manage-identity-providers}	manage-identity-providers	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	14682d39-1ec0-4f59-a7b1-3a01115f491a	\N
f3138338-dd78-4e8a-9acc-cd193bf36b81	14682d39-1ec0-4f59-a7b1-3a01115f491a	t	${role_manage-authorization}	manage-authorization	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	14682d39-1ec0-4f59-a7b1-3a01115f491a	\N
6a1dd0ab-c9b4-429e-ac5e-05f11520326a	14682d39-1ec0-4f59-a7b1-3a01115f491a	t	${role_query-users}	query-users	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	14682d39-1ec0-4f59-a7b1-3a01115f491a	\N
fe2d685e-219b-4d5a-a30c-0430d62e7400	14682d39-1ec0-4f59-a7b1-3a01115f491a	t	${role_query-clients}	query-clients	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	14682d39-1ec0-4f59-a7b1-3a01115f491a	\N
f5464500-0cb0-4360-b1d2-8648ee5c4fc9	14682d39-1ec0-4f59-a7b1-3a01115f491a	t	${role_query-realms}	query-realms	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	14682d39-1ec0-4f59-a7b1-3a01115f491a	\N
d5145076-cd93-4b65-8def-64c9664db73b	14682d39-1ec0-4f59-a7b1-3a01115f491a	t	${role_query-groups}	query-groups	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	14682d39-1ec0-4f59-a7b1-3a01115f491a	\N
d66b9468-3a46-4d37-816b-ac359d89387d	4767f32b-9c5b-480c-94a9-61f36da53679	t	${role_realm-admin}	realm-admin	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	4767f32b-9c5b-480c-94a9-61f36da53679	\N
7ae3f438-b9dd-447d-b67e-6795a5d951a9	4767f32b-9c5b-480c-94a9-61f36da53679	t	${role_create-client}	create-client	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	4767f32b-9c5b-480c-94a9-61f36da53679	\N
84dbdab1-acd1-49e7-9774-98735925031f	4767f32b-9c5b-480c-94a9-61f36da53679	t	${role_view-realm}	view-realm	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	4767f32b-9c5b-480c-94a9-61f36da53679	\N
a9ceb5ec-0a1e-478b-aa6f-d22c0fb5508e	4767f32b-9c5b-480c-94a9-61f36da53679	t	${role_view-users}	view-users	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	4767f32b-9c5b-480c-94a9-61f36da53679	\N
a6f9ebb9-f200-4ab3-99a1-fcfba742be41	4767f32b-9c5b-480c-94a9-61f36da53679	t	${role_view-clients}	view-clients	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	4767f32b-9c5b-480c-94a9-61f36da53679	\N
55daf42a-48f7-42c8-aad9-4420d15ecaa5	4767f32b-9c5b-480c-94a9-61f36da53679	t	${role_view-events}	view-events	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	4767f32b-9c5b-480c-94a9-61f36da53679	\N
d5578c5b-5a02-4521-abb7-bd7e33c8aaca	4767f32b-9c5b-480c-94a9-61f36da53679	t	${role_view-identity-providers}	view-identity-providers	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	4767f32b-9c5b-480c-94a9-61f36da53679	\N
d53a73d8-282d-436a-8457-c2caaa7d1323	4767f32b-9c5b-480c-94a9-61f36da53679	t	${role_view-authorization}	view-authorization	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	4767f32b-9c5b-480c-94a9-61f36da53679	\N
ed396879-4d82-45f1-b4f0-ec2a425dea7e	4767f32b-9c5b-480c-94a9-61f36da53679	t	${role_manage-realm}	manage-realm	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	4767f32b-9c5b-480c-94a9-61f36da53679	\N
c3eac5b4-b0ee-472f-adef-469fc144242c	4767f32b-9c5b-480c-94a9-61f36da53679	t	${role_manage-users}	manage-users	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	4767f32b-9c5b-480c-94a9-61f36da53679	\N
29f2c36a-eb80-4cff-8b96-d4a235f87bb0	4767f32b-9c5b-480c-94a9-61f36da53679	t	${role_manage-clients}	manage-clients	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	4767f32b-9c5b-480c-94a9-61f36da53679	\N
71e115bc-55b0-4c0f-b7a5-ef50a1f03404	4767f32b-9c5b-480c-94a9-61f36da53679	t	${role_manage-events}	manage-events	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	4767f32b-9c5b-480c-94a9-61f36da53679	\N
e4afabb8-0632-46dd-a931-40c62b0d31f3	4767f32b-9c5b-480c-94a9-61f36da53679	t	${role_manage-identity-providers}	manage-identity-providers	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	4767f32b-9c5b-480c-94a9-61f36da53679	\N
07cfdb98-ac40-4a8f-9ed4-fc24be0ca96b	4767f32b-9c5b-480c-94a9-61f36da53679	t	${role_manage-authorization}	manage-authorization	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	4767f32b-9c5b-480c-94a9-61f36da53679	\N
5da5494b-a3f9-4d13-9fc5-1d52e0b0e23f	4767f32b-9c5b-480c-94a9-61f36da53679	t	${role_query-users}	query-users	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	4767f32b-9c5b-480c-94a9-61f36da53679	\N
6877b57e-19a2-4189-b2d7-170544d60491	4767f32b-9c5b-480c-94a9-61f36da53679	t	${role_query-clients}	query-clients	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	4767f32b-9c5b-480c-94a9-61f36da53679	\N
e78636f3-e550-460d-bda4-596e98fca01d	4767f32b-9c5b-480c-94a9-61f36da53679	t	${role_query-realms}	query-realms	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	4767f32b-9c5b-480c-94a9-61f36da53679	\N
246cd3d6-e845-42fc-8805-24c94e305a7b	4767f32b-9c5b-480c-94a9-61f36da53679	t	${role_query-groups}	query-groups	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	4767f32b-9c5b-480c-94a9-61f36da53679	\N
de23d7a4-87cf-477f-bd26-5ffacafbc16e	7bec06e5-f1db-4d81-99a4-df603a9d007c	t	${role_view-profile}	view-profile	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	7bec06e5-f1db-4d81-99a4-df603a9d007c	\N
1f1e6e4d-3fdf-4a51-8214-8a0d54aa92f7	7bec06e5-f1db-4d81-99a4-df603a9d007c	t	${role_manage-account}	manage-account	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	7bec06e5-f1db-4d81-99a4-df603a9d007c	\N
bc7971d5-e20e-454d-a5e6-9163b7169a25	7bec06e5-f1db-4d81-99a4-df603a9d007c	t	${role_manage-account-links}	manage-account-links	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	7bec06e5-f1db-4d81-99a4-df603a9d007c	\N
4f4f3e11-0d06-481c-a050-bde8bb4db11a	7bec06e5-f1db-4d81-99a4-df603a9d007c	t	${role_view-applications}	view-applications	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	7bec06e5-f1db-4d81-99a4-df603a9d007c	\N
83341149-86e4-4694-92cf-b6074d45b51e	7bec06e5-f1db-4d81-99a4-df603a9d007c	t	${role_view-consent}	view-consent	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	7bec06e5-f1db-4d81-99a4-df603a9d007c	\N
c5a582a3-357a-42b8-a901-761d1ecdf1fe	7bec06e5-f1db-4d81-99a4-df603a9d007c	t	${role_manage-consent}	manage-consent	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	7bec06e5-f1db-4d81-99a4-df603a9d007c	\N
d137ea5a-4445-47bf-b99c-f317b8aba8fb	7bec06e5-f1db-4d81-99a4-df603a9d007c	t	${role_view-groups}	view-groups	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	7bec06e5-f1db-4d81-99a4-df603a9d007c	\N
3c0968b9-a5a2-4330-a1cd-94dd6ce7bb70	7bec06e5-f1db-4d81-99a4-df603a9d007c	t	${role_delete-account}	delete-account	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	7bec06e5-f1db-4d81-99a4-df603a9d007c	\N
29be8995-e805-4491-985a-e31e1c8616d1	14682d39-1ec0-4f59-a7b1-3a01115f491a	t	${role_impersonation}	impersonation	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	14682d39-1ec0-4f59-a7b1-3a01115f491a	\N
9e82eea4-0f78-480d-830c-249e1796b462	4767f32b-9c5b-480c-94a9-61f36da53679	t	${role_impersonation}	impersonation	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	4767f32b-9c5b-480c-94a9-61f36da53679	\N
61473053-6f2e-4497-9336-b1fb9554e152	787dddfe-83f2-4fff-9ca4-b67d233d47f7	t	${role_read-token}	read-token	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	787dddfe-83f2-4fff-9ca4-b67d233d47f7	\N
ba2ac172-b3a7-4c10-85eb-487dce1c544c	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	f	${role_offline-access}	offline_access	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	\N	\N
324165f4-160f-45ac-85f0-47bfaa59bd93	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	f	Citizen user	CITIZEN	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	\N	\N
1591a6c0-a279-4198-b9b7-314211d3d7b0	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	f	Emergency responder	RESPONDER	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	\N	\N
1d1f5ce0-07cb-4aa6-b96b-ec36a8dc5f5d	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	f	Officer on duty	OFFICER_ON_DUTY	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	\N	\N
7fb198e4-985f-4541-bd4e-a88cbb9714b7	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	f	Leader CoPI	LEADER_COPI	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	\N	\N
4552661e-5704-435e-9408-dc78ec7e7f63	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	f	Calamity coordinator	CALAMITY_COORDINATOR	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	\N	\N
68da369b-a2af-4b35-9666-7faf51b19da6	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	f	Operational leader	OPERATIONAL_LEADER	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	\N	\N
11544851-025e-470e-91f2-920778daeb0f	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	f	Mayor	MAYOR	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	\N	\N
1302d381-fd92-460e-be09-82a84322d9e9	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	f	Chair of Safety Region	CHAIR_SAFETY_REGION	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	\N	\N
cbcf4299-8aaa-47ef-a698-580d6cac3ac2	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	f	Department administrator	DEPARTMENT_ADMIN	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	\N	\N
fb45cc50-4b0f-4c1d-a755-2f1da9bf70a4	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	f	Municipality administrator	MUNICIPALITY_ADMIN	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	\N	\N
74d519ab-4f25-4ff3-b834-db040861e2f0	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	f	Region administrator	REGION_ADMIN	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	\N	\N
d938a9eb-3a85-4fa6-a512-b1c0bc6d7a79	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	f	${role_uma_authorization}	uma_authorization	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	\N	\N
\.


--
-- TOC entry 4227 (class 0 OID 17251)
-- Dependencies: 246
-- Data for Name: migration_model; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.migration_model (id, version, update_time) FROM stdin;
sfugp	26.0.8	1762853961
\.


--
-- TOC entry 4241 (class 0 OID 17523)
-- Dependencies: 260
-- Data for Name: offline_client_session; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.offline_client_session (user_session_id, client_id, offline_flag, "timestamp", data, client_storage_provider, external_client_id, version) FROM stdin;
43b436d1-e0a6-4953-acc2-281021d55183	e3652182-d1bb-4f94-a8a0-edc307e0e6e4	0	1764332699	{"authMethod":"openid-connect","redirectUri":"http://localhost:3000/","notes":{"clientId":"e3652182-d1bb-4f94-a8a0-edc307e0e6e4","iss":"http://localhost:9090/realms/DRCCS","startedAt":"1764331950","response_type":"code","level-of-authentication":"-1","code_challenge_method":"S256","nonce":"dbfeaa56-9fd6-47a9-b7f3-d69a4a5a71c2","response_mode":"fragment","scope":"openid","userSessionStartedAt":"1764331950","redirect_uri":"http://localhost:3000/","state":"7750406a-87d3-48a1-8745-f62ef5acd978","code_challenge":"0iFyX8xuPNfewgmL5nHq1zg4HZJEgHFsHRpDdLvWmp0"}}	local	local	4
\.


--
-- TOC entry 4240 (class 0 OID 17518)
-- Dependencies: 259
-- Data for Name: offline_user_session; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.offline_user_session (user_session_id, user_id, realm_id, created_on, offline_flag, data, last_session_refresh, broker_session_id, version) FROM stdin;
43b436d1-e0a6-4953-acc2-281021d55183	db6362a2-7f07-4bc9-a44b-534132115d2e	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	1764331950	0	{"ipAddress":"172.18.0.1","authMethod":"openid-connect","rememberMe":false,"started":0,"notes":{"KC_DEVICE_NOTE":"eyJpcEFkZHJlc3MiOiIxNzIuMTguMC4xIiwib3MiOiJXaW5kb3dzIiwib3NWZXJzaW9uIjoiMTAiLCJicm93c2VyIjoiRWRnZS8xNDIuMC4wIiwiZGV2aWNlIjoiT3RoZXIiLCJsYXN0QWNjZXNzIjowLCJtb2JpbGUiOmZhbHNlfQ==","AUTH_TIME":"1764331950","authenticators-completed":"{\\"943420d2-fcd3-4028-af66-b45d722ee24d\\":1764331950}"},"state":"LOGGED_IN"}	1764332699	\N	4
\.


--
-- TOC entry 4280 (class 0 OID 18303)
-- Dependencies: 299
-- Data for Name: org; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.org (id, enabled, realm_id, group_id, name, description, alias, redirect_url) FROM stdin;
\.


--
-- TOC entry 4281 (class 0 OID 18314)
-- Dependencies: 300
-- Data for Name: org_domain; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.org_domain (id, name, verified, org_id) FROM stdin;
\.


--
-- TOC entry 4254 (class 0 OID 17737)
-- Dependencies: 273
-- Data for Name: policy_config; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.policy_config (policy_id, name, value) FROM stdin;
\.


--
-- TOC entry 4220 (class 0 OID 17125)
-- Dependencies: 239
-- Data for Name: protocol_mapper; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.protocol_mapper (id, name, protocol, protocol_mapper_name, client_id, client_scope_id) FROM stdin;
4965293f-8eb9-4d93-8453-8f9078a9f16e	audience resolve	openid-connect	oidc-audience-resolve-mapper	84302485-9b73-4186-9e5b-0da15972c7e6	\N
265d2722-7e74-4913-b1db-8476ceb808d7	locale	openid-connect	oidc-usermodel-attribute-mapper	d455a894-4eb3-4584-9c3a-8c5ed7ed2aa3	\N
8d623fb8-e661-4282-a78d-3c7a2fac91dd	role list	saml	saml-role-list-mapper	\N	850c1e15-5b08-4c84-aaa5-a966412aba70
43db8a32-2b07-4242-9850-0346c304c58d	organization	saml	saml-organization-membership-mapper	\N	677c1373-fc94-4ae0-a429-97ce419d8ad8
e3aca09f-0526-4960-849f-15f177d9158e	full name	openid-connect	oidc-full-name-mapper	\N	265c9db3-5d3a-4acc-b313-267642fa4808
2aca7815-ceb9-4f95-97bc-3f31db98fc5e	family name	openid-connect	oidc-usermodel-attribute-mapper	\N	265c9db3-5d3a-4acc-b313-267642fa4808
901469ca-9a7b-4f1d-9d11-8f65921e15cc	given name	openid-connect	oidc-usermodel-attribute-mapper	\N	265c9db3-5d3a-4acc-b313-267642fa4808
e9592cff-6dc3-4bc0-a5c0-e6e8434de1e1	middle name	openid-connect	oidc-usermodel-attribute-mapper	\N	265c9db3-5d3a-4acc-b313-267642fa4808
ca5186ee-4083-4760-a4dd-04c62c8ee6ac	nickname	openid-connect	oidc-usermodel-attribute-mapper	\N	265c9db3-5d3a-4acc-b313-267642fa4808
0cda81df-f07d-4f40-a457-683d5974b0c6	username	openid-connect	oidc-usermodel-attribute-mapper	\N	265c9db3-5d3a-4acc-b313-267642fa4808
4c56f2c2-1a64-44f4-95a2-00504bdc237e	profile	openid-connect	oidc-usermodel-attribute-mapper	\N	265c9db3-5d3a-4acc-b313-267642fa4808
e50aed20-7b30-4a14-9fe7-5795cbb47ca0	picture	openid-connect	oidc-usermodel-attribute-mapper	\N	265c9db3-5d3a-4acc-b313-267642fa4808
c4e2d6dd-564e-4c9c-b745-93b743c833f6	website	openid-connect	oidc-usermodel-attribute-mapper	\N	265c9db3-5d3a-4acc-b313-267642fa4808
282ff0d0-0b99-4519-a04d-c98fb4805537	gender	openid-connect	oidc-usermodel-attribute-mapper	\N	265c9db3-5d3a-4acc-b313-267642fa4808
583b7b53-e333-4698-bc33-15e594829890	birthdate	openid-connect	oidc-usermodel-attribute-mapper	\N	265c9db3-5d3a-4acc-b313-267642fa4808
43061d28-29a7-4df5-bdac-d0cf3ead988c	zoneinfo	openid-connect	oidc-usermodel-attribute-mapper	\N	265c9db3-5d3a-4acc-b313-267642fa4808
077cb3a5-3b09-437d-ba83-878c0969238a	locale	openid-connect	oidc-usermodel-attribute-mapper	\N	265c9db3-5d3a-4acc-b313-267642fa4808
b1f5b02d-1789-4d6c-a276-945a8de30fc2	updated at	openid-connect	oidc-usermodel-attribute-mapper	\N	265c9db3-5d3a-4acc-b313-267642fa4808
a078f8ba-ab87-4afe-90a3-7be9c83a5f80	email	openid-connect	oidc-usermodel-attribute-mapper	\N	37c69ad2-2770-4c02-a255-620874a16cb7
26eb6433-b80e-4ec7-8a1f-20b029fdf7a2	email verified	openid-connect	oidc-usermodel-property-mapper	\N	37c69ad2-2770-4c02-a255-620874a16cb7
80d6d560-4d92-4c21-95e1-4e92efcc3be7	address	openid-connect	oidc-address-mapper	\N	f16d8813-579a-485f-93aa-17fb63a17c43
8b7aa81d-3b10-4a4e-9248-20a9e1cf6bae	phone number	openid-connect	oidc-usermodel-attribute-mapper	\N	a2b9c7bd-ce04-4154-a469-b96edd622cd3
f8c13d04-ec96-4608-b637-2036f937adec	phone number verified	openid-connect	oidc-usermodel-attribute-mapper	\N	a2b9c7bd-ce04-4154-a469-b96edd622cd3
b73b54d4-0ddd-4706-89e3-bb090edadef8	realm roles	openid-connect	oidc-usermodel-realm-role-mapper	\N	5b313498-ab37-4f0c-89f7-fb1315ce4b2e
b5b876a1-601f-4d1c-b484-9cf34f771a12	client roles	openid-connect	oidc-usermodel-client-role-mapper	\N	5b313498-ab37-4f0c-89f7-fb1315ce4b2e
7fb6224c-b522-45a0-ae62-45a3ded0dc90	audience resolve	openid-connect	oidc-audience-resolve-mapper	\N	5b313498-ab37-4f0c-89f7-fb1315ce4b2e
2b99065e-b17d-46b0-bc46-538e1eeb2bbb	allowed web origins	openid-connect	oidc-allowed-origins-mapper	\N	969ccb58-a5c6-4272-ba09-599950b83ab8
100f91ef-0567-4d25-b3d0-e46a6981bd84	upn	openid-connect	oidc-usermodel-attribute-mapper	\N	1d4ffcd3-06e6-45a5-83c7-6cad6568290f
db6ebdb9-980e-4e47-ad81-0741a0a11284	groups	openid-connect	oidc-usermodel-realm-role-mapper	\N	1d4ffcd3-06e6-45a5-83c7-6cad6568290f
a221614e-722b-47c7-a5e9-cad00a4c6c6a	acr loa level	openid-connect	oidc-acr-mapper	\N	2e364754-a620-4504-acde-f0bda9d08edc
fdbd2f35-31f7-472b-93f2-780bc10f53ad	auth_time	openid-connect	oidc-usersessionmodel-note-mapper	\N	7fac0628-df20-44eb-946c-86c154a953a5
f4c18d09-7601-4331-baa5-b913ebe3307d	sub	openid-connect	oidc-sub-mapper	\N	7fac0628-df20-44eb-946c-86c154a953a5
5fa29b39-5250-45ee-9c65-c09961df9025	organization	openid-connect	oidc-organization-membership-mapper	\N	e67b0602-f276-4e56-9150-a8050ce08e18
9f7d8a7a-0a4b-497e-a5bc-c03b579deb87	audience resolve	openid-connect	oidc-audience-resolve-mapper	d30bc5e2-7ce6-4932-bf87-1eb8d95b036b	\N
ac5ec6a8-b42e-415e-b4b6-bb78303abcae	role list	saml	saml-role-list-mapper	\N	7490d48d-17c7-4613-a1e2-f828a9c90d62
e8fb05e7-c868-49ee-899b-59d94c5ff4a7	organization	saml	saml-organization-membership-mapper	\N	9eb5290d-5db7-4af1-91ec-92318545760a
9a865530-0574-4242-8d1c-481287aa7abc	full name	openid-connect	oidc-full-name-mapper	\N	f08b7223-fef1-4af3-9ebf-40773e5a4779
ef62d7a8-e26e-45b7-bc5b-204fa761dd85	family name	openid-connect	oidc-usermodel-attribute-mapper	\N	f08b7223-fef1-4af3-9ebf-40773e5a4779
fef405bd-611c-4d66-b71b-b27d4929ea9e	given name	openid-connect	oidc-usermodel-attribute-mapper	\N	f08b7223-fef1-4af3-9ebf-40773e5a4779
f68dc807-15c5-40a4-8b29-7037084c0813	middle name	openid-connect	oidc-usermodel-attribute-mapper	\N	f08b7223-fef1-4af3-9ebf-40773e5a4779
095b7086-c0c8-49d1-b115-670464205836	nickname	openid-connect	oidc-usermodel-attribute-mapper	\N	f08b7223-fef1-4af3-9ebf-40773e5a4779
15c666ce-c0ff-416d-9da8-48f52a105de3	username	openid-connect	oidc-usermodel-attribute-mapper	\N	f08b7223-fef1-4af3-9ebf-40773e5a4779
178e70f6-239a-47a5-bd06-d6f9b0338aa9	profile	openid-connect	oidc-usermodel-attribute-mapper	\N	f08b7223-fef1-4af3-9ebf-40773e5a4779
99a56f12-ce5b-4eb4-8c20-3dffbe5ed693	picture	openid-connect	oidc-usermodel-attribute-mapper	\N	f08b7223-fef1-4af3-9ebf-40773e5a4779
5b542937-769e-43bb-a25a-3c1f9869b061	website	openid-connect	oidc-usermodel-attribute-mapper	\N	f08b7223-fef1-4af3-9ebf-40773e5a4779
b23506ff-ff6d-44ea-89f6-4d761dc4045f	gender	openid-connect	oidc-usermodel-attribute-mapper	\N	f08b7223-fef1-4af3-9ebf-40773e5a4779
41a1964f-b571-42d4-9f25-2b76f2978a09	birthdate	openid-connect	oidc-usermodel-attribute-mapper	\N	f08b7223-fef1-4af3-9ebf-40773e5a4779
d4258b59-f1e2-44ea-b4f8-10045563ef1f	zoneinfo	openid-connect	oidc-usermodel-attribute-mapper	\N	f08b7223-fef1-4af3-9ebf-40773e5a4779
00a56a61-fb37-4838-baf1-452f9f091238	locale	openid-connect	oidc-usermodel-attribute-mapper	\N	f08b7223-fef1-4af3-9ebf-40773e5a4779
bd63c727-2ee9-4f3e-af32-7602eb99203d	updated at	openid-connect	oidc-usermodel-attribute-mapper	\N	f08b7223-fef1-4af3-9ebf-40773e5a4779
ec53902f-b8d2-4b6d-9f1f-8d966a469890	email	openid-connect	oidc-usermodel-attribute-mapper	\N	66b3a300-6971-4f0d-b936-e60cba2d2de7
3f9519c7-3a25-4f06-9bf6-d31fbad7ff66	email verified	openid-connect	oidc-usermodel-property-mapper	\N	66b3a300-6971-4f0d-b936-e60cba2d2de7
96581325-0f74-4427-bac3-96f565399bc7	address	openid-connect	oidc-address-mapper	\N	19f41a26-8106-4fa2-b275-07266c4afdf0
a5aca9e8-164d-42ed-b2bf-e5c63f2a329f	phone number	openid-connect	oidc-usermodel-attribute-mapper	\N	19685f60-4055-4026-bea6-31ade7543fe4
3a47856a-ecfc-4a0f-b3b3-464f02dff762	phone number verified	openid-connect	oidc-usermodel-attribute-mapper	\N	19685f60-4055-4026-bea6-31ade7543fe4
9adbc60e-1a4f-4715-b309-a326e91f80d7	realm roles	openid-connect	oidc-usermodel-realm-role-mapper	\N	00c132f3-40a5-45a8-9b68-af411830420d
792685c7-17d8-4165-8fae-936bbaf12aed	client roles	openid-connect	oidc-usermodel-client-role-mapper	\N	00c132f3-40a5-45a8-9b68-af411830420d
abe81ecb-0766-4fe1-a07f-e5402b26d005	audience resolve	openid-connect	oidc-audience-resolve-mapper	\N	00c132f3-40a5-45a8-9b68-af411830420d
3578f321-2842-4f15-9f8a-679e184eb580	allowed web origins	openid-connect	oidc-allowed-origins-mapper	\N	351fab28-c6c3-4368-a2d7-ec6cf6fd6fd7
2a4e5325-ca80-41be-b9e2-2d62952bf389	upn	openid-connect	oidc-usermodel-attribute-mapper	\N	04659a0d-ee92-4eef-a78b-b2dd808f5983
87c730ea-692d-4f58-9ef8-d5f872a8b4b6	groups	openid-connect	oidc-usermodel-realm-role-mapper	\N	04659a0d-ee92-4eef-a78b-b2dd808f5983
9850e5e3-aa0b-41d9-a301-376b950c537b	acr loa level	openid-connect	oidc-acr-mapper	\N	50dbb826-9330-4c55-8952-d1b050f3940b
7a155db2-1cb8-456f-9d44-746f63f23c94	auth_time	openid-connect	oidc-usersessionmodel-note-mapper	\N	779f0fe6-ab9c-4998-8bc7-b5575052f67d
bab389f7-c59b-4dda-8da4-0eda1033429e	sub	openid-connect	oidc-sub-mapper	\N	779f0fe6-ab9c-4998-8bc7-b5575052f67d
7d568bf6-0948-44d4-8822-7acc33dfaf59	organization	openid-connect	oidc-organization-membership-mapper	\N	2c35d9a2-156f-49e0-8f7f-5a72ea2d9866
f223c3e4-b2b7-41a5-a123-0f98c377bbf9	realm roles	openid-connect	oidc-usermodel-realm-role-mapper	e3652182-d1bb-4f94-a8a0-edc307e0e6e4	\N
30eca891-d58f-4eed-988d-db6d725e0dbf	realm roles	openid-connect	oidc-usermodel-realm-role-mapper	8f66f9f0-f9e8-49b0-98d0-8ebe38e1b66a	\N
305cb20b-8754-413f-93e3-556ecdf8d2b6	locale	openid-connect	oidc-usermodel-attribute-mapper	d7c11793-e6cd-405c-9da1-b8d8ba057a83	\N
d0a16f88-8feb-4902-8693-dd05d6926ab5	realm roles	openid-connect	oidc-usermodel-realm-role-mapper	517c9410-ea2c-4e84-b47d-99acef0f53b6	\N
\.


--
-- TOC entry 4221 (class 0 OID 17131)
-- Dependencies: 240
-- Data for Name: protocol_mapper_config; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.protocol_mapper_config (protocol_mapper_id, value, name) FROM stdin;
265d2722-7e74-4913-b1db-8476ceb808d7	true	introspection.token.claim
265d2722-7e74-4913-b1db-8476ceb808d7	true	userinfo.token.claim
265d2722-7e74-4913-b1db-8476ceb808d7	locale	user.attribute
265d2722-7e74-4913-b1db-8476ceb808d7	true	id.token.claim
265d2722-7e74-4913-b1db-8476ceb808d7	true	access.token.claim
265d2722-7e74-4913-b1db-8476ceb808d7	locale	claim.name
265d2722-7e74-4913-b1db-8476ceb808d7	String	jsonType.label
8d623fb8-e661-4282-a78d-3c7a2fac91dd	false	single
8d623fb8-e661-4282-a78d-3c7a2fac91dd	Basic	attribute.nameformat
8d623fb8-e661-4282-a78d-3c7a2fac91dd	Role	attribute.name
077cb3a5-3b09-437d-ba83-878c0969238a	true	introspection.token.claim
077cb3a5-3b09-437d-ba83-878c0969238a	true	userinfo.token.claim
077cb3a5-3b09-437d-ba83-878c0969238a	locale	user.attribute
077cb3a5-3b09-437d-ba83-878c0969238a	true	id.token.claim
077cb3a5-3b09-437d-ba83-878c0969238a	true	access.token.claim
077cb3a5-3b09-437d-ba83-878c0969238a	locale	claim.name
077cb3a5-3b09-437d-ba83-878c0969238a	String	jsonType.label
0cda81df-f07d-4f40-a457-683d5974b0c6	true	introspection.token.claim
0cda81df-f07d-4f40-a457-683d5974b0c6	true	userinfo.token.claim
0cda81df-f07d-4f40-a457-683d5974b0c6	username	user.attribute
0cda81df-f07d-4f40-a457-683d5974b0c6	true	id.token.claim
0cda81df-f07d-4f40-a457-683d5974b0c6	true	access.token.claim
0cda81df-f07d-4f40-a457-683d5974b0c6	preferred_username	claim.name
0cda81df-f07d-4f40-a457-683d5974b0c6	String	jsonType.label
282ff0d0-0b99-4519-a04d-c98fb4805537	true	introspection.token.claim
282ff0d0-0b99-4519-a04d-c98fb4805537	true	userinfo.token.claim
282ff0d0-0b99-4519-a04d-c98fb4805537	gender	user.attribute
282ff0d0-0b99-4519-a04d-c98fb4805537	true	id.token.claim
282ff0d0-0b99-4519-a04d-c98fb4805537	true	access.token.claim
282ff0d0-0b99-4519-a04d-c98fb4805537	gender	claim.name
282ff0d0-0b99-4519-a04d-c98fb4805537	String	jsonType.label
2aca7815-ceb9-4f95-97bc-3f31db98fc5e	true	introspection.token.claim
2aca7815-ceb9-4f95-97bc-3f31db98fc5e	true	userinfo.token.claim
2aca7815-ceb9-4f95-97bc-3f31db98fc5e	lastName	user.attribute
2aca7815-ceb9-4f95-97bc-3f31db98fc5e	true	id.token.claim
2aca7815-ceb9-4f95-97bc-3f31db98fc5e	true	access.token.claim
2aca7815-ceb9-4f95-97bc-3f31db98fc5e	family_name	claim.name
2aca7815-ceb9-4f95-97bc-3f31db98fc5e	String	jsonType.label
43061d28-29a7-4df5-bdac-d0cf3ead988c	true	introspection.token.claim
43061d28-29a7-4df5-bdac-d0cf3ead988c	true	userinfo.token.claim
43061d28-29a7-4df5-bdac-d0cf3ead988c	zoneinfo	user.attribute
43061d28-29a7-4df5-bdac-d0cf3ead988c	true	id.token.claim
43061d28-29a7-4df5-bdac-d0cf3ead988c	true	access.token.claim
43061d28-29a7-4df5-bdac-d0cf3ead988c	zoneinfo	claim.name
43061d28-29a7-4df5-bdac-d0cf3ead988c	String	jsonType.label
4c56f2c2-1a64-44f4-95a2-00504bdc237e	true	introspection.token.claim
4c56f2c2-1a64-44f4-95a2-00504bdc237e	true	userinfo.token.claim
4c56f2c2-1a64-44f4-95a2-00504bdc237e	profile	user.attribute
4c56f2c2-1a64-44f4-95a2-00504bdc237e	true	id.token.claim
4c56f2c2-1a64-44f4-95a2-00504bdc237e	true	access.token.claim
4c56f2c2-1a64-44f4-95a2-00504bdc237e	profile	claim.name
4c56f2c2-1a64-44f4-95a2-00504bdc237e	String	jsonType.label
583b7b53-e333-4698-bc33-15e594829890	true	introspection.token.claim
583b7b53-e333-4698-bc33-15e594829890	true	userinfo.token.claim
583b7b53-e333-4698-bc33-15e594829890	birthdate	user.attribute
583b7b53-e333-4698-bc33-15e594829890	true	id.token.claim
583b7b53-e333-4698-bc33-15e594829890	true	access.token.claim
583b7b53-e333-4698-bc33-15e594829890	birthdate	claim.name
583b7b53-e333-4698-bc33-15e594829890	String	jsonType.label
901469ca-9a7b-4f1d-9d11-8f65921e15cc	true	introspection.token.claim
901469ca-9a7b-4f1d-9d11-8f65921e15cc	true	userinfo.token.claim
901469ca-9a7b-4f1d-9d11-8f65921e15cc	firstName	user.attribute
901469ca-9a7b-4f1d-9d11-8f65921e15cc	true	id.token.claim
901469ca-9a7b-4f1d-9d11-8f65921e15cc	true	access.token.claim
901469ca-9a7b-4f1d-9d11-8f65921e15cc	given_name	claim.name
901469ca-9a7b-4f1d-9d11-8f65921e15cc	String	jsonType.label
b1f5b02d-1789-4d6c-a276-945a8de30fc2	true	introspection.token.claim
b1f5b02d-1789-4d6c-a276-945a8de30fc2	true	userinfo.token.claim
b1f5b02d-1789-4d6c-a276-945a8de30fc2	updatedAt	user.attribute
b1f5b02d-1789-4d6c-a276-945a8de30fc2	true	id.token.claim
b1f5b02d-1789-4d6c-a276-945a8de30fc2	true	access.token.claim
b1f5b02d-1789-4d6c-a276-945a8de30fc2	updated_at	claim.name
b1f5b02d-1789-4d6c-a276-945a8de30fc2	long	jsonType.label
c4e2d6dd-564e-4c9c-b745-93b743c833f6	true	introspection.token.claim
c4e2d6dd-564e-4c9c-b745-93b743c833f6	true	userinfo.token.claim
c4e2d6dd-564e-4c9c-b745-93b743c833f6	website	user.attribute
c4e2d6dd-564e-4c9c-b745-93b743c833f6	true	id.token.claim
c4e2d6dd-564e-4c9c-b745-93b743c833f6	true	access.token.claim
c4e2d6dd-564e-4c9c-b745-93b743c833f6	website	claim.name
c4e2d6dd-564e-4c9c-b745-93b743c833f6	String	jsonType.label
ca5186ee-4083-4760-a4dd-04c62c8ee6ac	true	introspection.token.claim
ca5186ee-4083-4760-a4dd-04c62c8ee6ac	true	userinfo.token.claim
ca5186ee-4083-4760-a4dd-04c62c8ee6ac	nickname	user.attribute
ca5186ee-4083-4760-a4dd-04c62c8ee6ac	true	id.token.claim
ca5186ee-4083-4760-a4dd-04c62c8ee6ac	true	access.token.claim
ca5186ee-4083-4760-a4dd-04c62c8ee6ac	nickname	claim.name
ca5186ee-4083-4760-a4dd-04c62c8ee6ac	String	jsonType.label
e3aca09f-0526-4960-849f-15f177d9158e	true	introspection.token.claim
e3aca09f-0526-4960-849f-15f177d9158e	true	userinfo.token.claim
e3aca09f-0526-4960-849f-15f177d9158e	true	id.token.claim
e3aca09f-0526-4960-849f-15f177d9158e	true	access.token.claim
e50aed20-7b30-4a14-9fe7-5795cbb47ca0	true	introspection.token.claim
e50aed20-7b30-4a14-9fe7-5795cbb47ca0	true	userinfo.token.claim
e50aed20-7b30-4a14-9fe7-5795cbb47ca0	picture	user.attribute
e50aed20-7b30-4a14-9fe7-5795cbb47ca0	true	id.token.claim
e50aed20-7b30-4a14-9fe7-5795cbb47ca0	true	access.token.claim
e50aed20-7b30-4a14-9fe7-5795cbb47ca0	picture	claim.name
e50aed20-7b30-4a14-9fe7-5795cbb47ca0	String	jsonType.label
e9592cff-6dc3-4bc0-a5c0-e6e8434de1e1	true	introspection.token.claim
e9592cff-6dc3-4bc0-a5c0-e6e8434de1e1	true	userinfo.token.claim
e9592cff-6dc3-4bc0-a5c0-e6e8434de1e1	middleName	user.attribute
e9592cff-6dc3-4bc0-a5c0-e6e8434de1e1	true	id.token.claim
e9592cff-6dc3-4bc0-a5c0-e6e8434de1e1	true	access.token.claim
e9592cff-6dc3-4bc0-a5c0-e6e8434de1e1	middle_name	claim.name
e9592cff-6dc3-4bc0-a5c0-e6e8434de1e1	String	jsonType.label
26eb6433-b80e-4ec7-8a1f-20b029fdf7a2	true	introspection.token.claim
26eb6433-b80e-4ec7-8a1f-20b029fdf7a2	true	userinfo.token.claim
26eb6433-b80e-4ec7-8a1f-20b029fdf7a2	emailVerified	user.attribute
26eb6433-b80e-4ec7-8a1f-20b029fdf7a2	true	id.token.claim
26eb6433-b80e-4ec7-8a1f-20b029fdf7a2	true	access.token.claim
26eb6433-b80e-4ec7-8a1f-20b029fdf7a2	email_verified	claim.name
26eb6433-b80e-4ec7-8a1f-20b029fdf7a2	boolean	jsonType.label
a078f8ba-ab87-4afe-90a3-7be9c83a5f80	true	introspection.token.claim
a078f8ba-ab87-4afe-90a3-7be9c83a5f80	true	userinfo.token.claim
a078f8ba-ab87-4afe-90a3-7be9c83a5f80	email	user.attribute
a078f8ba-ab87-4afe-90a3-7be9c83a5f80	true	id.token.claim
a078f8ba-ab87-4afe-90a3-7be9c83a5f80	true	access.token.claim
a078f8ba-ab87-4afe-90a3-7be9c83a5f80	email	claim.name
a078f8ba-ab87-4afe-90a3-7be9c83a5f80	String	jsonType.label
80d6d560-4d92-4c21-95e1-4e92efcc3be7	formatted	user.attribute.formatted
80d6d560-4d92-4c21-95e1-4e92efcc3be7	country	user.attribute.country
80d6d560-4d92-4c21-95e1-4e92efcc3be7	true	introspection.token.claim
80d6d560-4d92-4c21-95e1-4e92efcc3be7	postal_code	user.attribute.postal_code
80d6d560-4d92-4c21-95e1-4e92efcc3be7	true	userinfo.token.claim
80d6d560-4d92-4c21-95e1-4e92efcc3be7	street	user.attribute.street
80d6d560-4d92-4c21-95e1-4e92efcc3be7	true	id.token.claim
80d6d560-4d92-4c21-95e1-4e92efcc3be7	region	user.attribute.region
80d6d560-4d92-4c21-95e1-4e92efcc3be7	true	access.token.claim
80d6d560-4d92-4c21-95e1-4e92efcc3be7	locality	user.attribute.locality
8b7aa81d-3b10-4a4e-9248-20a9e1cf6bae	true	introspection.token.claim
8b7aa81d-3b10-4a4e-9248-20a9e1cf6bae	true	userinfo.token.claim
8b7aa81d-3b10-4a4e-9248-20a9e1cf6bae	phoneNumber	user.attribute
8b7aa81d-3b10-4a4e-9248-20a9e1cf6bae	true	id.token.claim
8b7aa81d-3b10-4a4e-9248-20a9e1cf6bae	true	access.token.claim
8b7aa81d-3b10-4a4e-9248-20a9e1cf6bae	phone_number	claim.name
8b7aa81d-3b10-4a4e-9248-20a9e1cf6bae	String	jsonType.label
f8c13d04-ec96-4608-b637-2036f937adec	true	introspection.token.claim
f8c13d04-ec96-4608-b637-2036f937adec	true	userinfo.token.claim
f8c13d04-ec96-4608-b637-2036f937adec	phoneNumberVerified	user.attribute
f8c13d04-ec96-4608-b637-2036f937adec	true	id.token.claim
f8c13d04-ec96-4608-b637-2036f937adec	true	access.token.claim
f8c13d04-ec96-4608-b637-2036f937adec	phone_number_verified	claim.name
f8c13d04-ec96-4608-b637-2036f937adec	boolean	jsonType.label
7fb6224c-b522-45a0-ae62-45a3ded0dc90	true	introspection.token.claim
7fb6224c-b522-45a0-ae62-45a3ded0dc90	true	access.token.claim
b5b876a1-601f-4d1c-b484-9cf34f771a12	true	introspection.token.claim
b5b876a1-601f-4d1c-b484-9cf34f771a12	true	multivalued
b5b876a1-601f-4d1c-b484-9cf34f771a12	foo	user.attribute
b5b876a1-601f-4d1c-b484-9cf34f771a12	true	access.token.claim
b5b876a1-601f-4d1c-b484-9cf34f771a12	resource_access.${client_id}.roles	claim.name
b5b876a1-601f-4d1c-b484-9cf34f771a12	String	jsonType.label
b73b54d4-0ddd-4706-89e3-bb090edadef8	true	introspection.token.claim
b73b54d4-0ddd-4706-89e3-bb090edadef8	true	multivalued
b73b54d4-0ddd-4706-89e3-bb090edadef8	foo	user.attribute
b73b54d4-0ddd-4706-89e3-bb090edadef8	true	access.token.claim
b73b54d4-0ddd-4706-89e3-bb090edadef8	realm_access.roles	claim.name
b73b54d4-0ddd-4706-89e3-bb090edadef8	String	jsonType.label
2b99065e-b17d-46b0-bc46-538e1eeb2bbb	true	introspection.token.claim
2b99065e-b17d-46b0-bc46-538e1eeb2bbb	true	access.token.claim
100f91ef-0567-4d25-b3d0-e46a6981bd84	true	introspection.token.claim
100f91ef-0567-4d25-b3d0-e46a6981bd84	true	userinfo.token.claim
100f91ef-0567-4d25-b3d0-e46a6981bd84	username	user.attribute
100f91ef-0567-4d25-b3d0-e46a6981bd84	true	id.token.claim
100f91ef-0567-4d25-b3d0-e46a6981bd84	true	access.token.claim
100f91ef-0567-4d25-b3d0-e46a6981bd84	upn	claim.name
100f91ef-0567-4d25-b3d0-e46a6981bd84	String	jsonType.label
db6ebdb9-980e-4e47-ad81-0741a0a11284	true	introspection.token.claim
db6ebdb9-980e-4e47-ad81-0741a0a11284	true	multivalued
db6ebdb9-980e-4e47-ad81-0741a0a11284	foo	user.attribute
db6ebdb9-980e-4e47-ad81-0741a0a11284	true	id.token.claim
db6ebdb9-980e-4e47-ad81-0741a0a11284	true	access.token.claim
db6ebdb9-980e-4e47-ad81-0741a0a11284	groups	claim.name
db6ebdb9-980e-4e47-ad81-0741a0a11284	String	jsonType.label
a221614e-722b-47c7-a5e9-cad00a4c6c6a	true	introspection.token.claim
a221614e-722b-47c7-a5e9-cad00a4c6c6a	true	id.token.claim
a221614e-722b-47c7-a5e9-cad00a4c6c6a	true	access.token.claim
f4c18d09-7601-4331-baa5-b913ebe3307d	true	introspection.token.claim
f4c18d09-7601-4331-baa5-b913ebe3307d	true	access.token.claim
fdbd2f35-31f7-472b-93f2-780bc10f53ad	AUTH_TIME	user.session.note
fdbd2f35-31f7-472b-93f2-780bc10f53ad	true	introspection.token.claim
fdbd2f35-31f7-472b-93f2-780bc10f53ad	true	id.token.claim
fdbd2f35-31f7-472b-93f2-780bc10f53ad	true	access.token.claim
fdbd2f35-31f7-472b-93f2-780bc10f53ad	auth_time	claim.name
fdbd2f35-31f7-472b-93f2-780bc10f53ad	long	jsonType.label
5fa29b39-5250-45ee-9c65-c09961df9025	true	introspection.token.claim
5fa29b39-5250-45ee-9c65-c09961df9025	true	multivalued
5fa29b39-5250-45ee-9c65-c09961df9025	true	id.token.claim
5fa29b39-5250-45ee-9c65-c09961df9025	true	access.token.claim
5fa29b39-5250-45ee-9c65-c09961df9025	organization	claim.name
5fa29b39-5250-45ee-9c65-c09961df9025	String	jsonType.label
ac5ec6a8-b42e-415e-b4b6-bb78303abcae	false	single
ac5ec6a8-b42e-415e-b4b6-bb78303abcae	Basic	attribute.nameformat
ac5ec6a8-b42e-415e-b4b6-bb78303abcae	Role	attribute.name
00a56a61-fb37-4838-baf1-452f9f091238	true	introspection.token.claim
00a56a61-fb37-4838-baf1-452f9f091238	true	userinfo.token.claim
00a56a61-fb37-4838-baf1-452f9f091238	locale	user.attribute
00a56a61-fb37-4838-baf1-452f9f091238	true	id.token.claim
00a56a61-fb37-4838-baf1-452f9f091238	true	access.token.claim
00a56a61-fb37-4838-baf1-452f9f091238	locale	claim.name
00a56a61-fb37-4838-baf1-452f9f091238	String	jsonType.label
095b7086-c0c8-49d1-b115-670464205836	true	introspection.token.claim
095b7086-c0c8-49d1-b115-670464205836	true	userinfo.token.claim
095b7086-c0c8-49d1-b115-670464205836	nickname	user.attribute
095b7086-c0c8-49d1-b115-670464205836	true	id.token.claim
095b7086-c0c8-49d1-b115-670464205836	true	access.token.claim
095b7086-c0c8-49d1-b115-670464205836	nickname	claim.name
095b7086-c0c8-49d1-b115-670464205836	String	jsonType.label
15c666ce-c0ff-416d-9da8-48f52a105de3	true	introspection.token.claim
15c666ce-c0ff-416d-9da8-48f52a105de3	true	userinfo.token.claim
15c666ce-c0ff-416d-9da8-48f52a105de3	username	user.attribute
15c666ce-c0ff-416d-9da8-48f52a105de3	true	id.token.claim
15c666ce-c0ff-416d-9da8-48f52a105de3	true	access.token.claim
15c666ce-c0ff-416d-9da8-48f52a105de3	preferred_username	claim.name
15c666ce-c0ff-416d-9da8-48f52a105de3	String	jsonType.label
178e70f6-239a-47a5-bd06-d6f9b0338aa9	true	introspection.token.claim
178e70f6-239a-47a5-bd06-d6f9b0338aa9	true	userinfo.token.claim
178e70f6-239a-47a5-bd06-d6f9b0338aa9	profile	user.attribute
178e70f6-239a-47a5-bd06-d6f9b0338aa9	true	id.token.claim
178e70f6-239a-47a5-bd06-d6f9b0338aa9	true	access.token.claim
178e70f6-239a-47a5-bd06-d6f9b0338aa9	profile	claim.name
178e70f6-239a-47a5-bd06-d6f9b0338aa9	String	jsonType.label
41a1964f-b571-42d4-9f25-2b76f2978a09	true	introspection.token.claim
41a1964f-b571-42d4-9f25-2b76f2978a09	true	userinfo.token.claim
41a1964f-b571-42d4-9f25-2b76f2978a09	birthdate	user.attribute
41a1964f-b571-42d4-9f25-2b76f2978a09	true	id.token.claim
41a1964f-b571-42d4-9f25-2b76f2978a09	true	access.token.claim
41a1964f-b571-42d4-9f25-2b76f2978a09	birthdate	claim.name
41a1964f-b571-42d4-9f25-2b76f2978a09	String	jsonType.label
5b542937-769e-43bb-a25a-3c1f9869b061	true	introspection.token.claim
5b542937-769e-43bb-a25a-3c1f9869b061	true	userinfo.token.claim
5b542937-769e-43bb-a25a-3c1f9869b061	website	user.attribute
5b542937-769e-43bb-a25a-3c1f9869b061	true	id.token.claim
5b542937-769e-43bb-a25a-3c1f9869b061	true	access.token.claim
5b542937-769e-43bb-a25a-3c1f9869b061	website	claim.name
5b542937-769e-43bb-a25a-3c1f9869b061	String	jsonType.label
99a56f12-ce5b-4eb4-8c20-3dffbe5ed693	true	introspection.token.claim
99a56f12-ce5b-4eb4-8c20-3dffbe5ed693	true	userinfo.token.claim
99a56f12-ce5b-4eb4-8c20-3dffbe5ed693	picture	user.attribute
99a56f12-ce5b-4eb4-8c20-3dffbe5ed693	true	id.token.claim
99a56f12-ce5b-4eb4-8c20-3dffbe5ed693	true	access.token.claim
99a56f12-ce5b-4eb4-8c20-3dffbe5ed693	picture	claim.name
99a56f12-ce5b-4eb4-8c20-3dffbe5ed693	String	jsonType.label
9a865530-0574-4242-8d1c-481287aa7abc	true	introspection.token.claim
9a865530-0574-4242-8d1c-481287aa7abc	true	userinfo.token.claim
9a865530-0574-4242-8d1c-481287aa7abc	true	id.token.claim
9a865530-0574-4242-8d1c-481287aa7abc	true	access.token.claim
b23506ff-ff6d-44ea-89f6-4d761dc4045f	true	introspection.token.claim
b23506ff-ff6d-44ea-89f6-4d761dc4045f	true	userinfo.token.claim
b23506ff-ff6d-44ea-89f6-4d761dc4045f	gender	user.attribute
b23506ff-ff6d-44ea-89f6-4d761dc4045f	true	id.token.claim
b23506ff-ff6d-44ea-89f6-4d761dc4045f	true	access.token.claim
b23506ff-ff6d-44ea-89f6-4d761dc4045f	gender	claim.name
b23506ff-ff6d-44ea-89f6-4d761dc4045f	String	jsonType.label
bd63c727-2ee9-4f3e-af32-7602eb99203d	true	introspection.token.claim
bd63c727-2ee9-4f3e-af32-7602eb99203d	true	userinfo.token.claim
bd63c727-2ee9-4f3e-af32-7602eb99203d	updatedAt	user.attribute
bd63c727-2ee9-4f3e-af32-7602eb99203d	true	id.token.claim
bd63c727-2ee9-4f3e-af32-7602eb99203d	true	access.token.claim
bd63c727-2ee9-4f3e-af32-7602eb99203d	updated_at	claim.name
bd63c727-2ee9-4f3e-af32-7602eb99203d	long	jsonType.label
d4258b59-f1e2-44ea-b4f8-10045563ef1f	true	introspection.token.claim
d4258b59-f1e2-44ea-b4f8-10045563ef1f	true	userinfo.token.claim
d4258b59-f1e2-44ea-b4f8-10045563ef1f	zoneinfo	user.attribute
d4258b59-f1e2-44ea-b4f8-10045563ef1f	true	id.token.claim
d4258b59-f1e2-44ea-b4f8-10045563ef1f	true	access.token.claim
d4258b59-f1e2-44ea-b4f8-10045563ef1f	zoneinfo	claim.name
d4258b59-f1e2-44ea-b4f8-10045563ef1f	String	jsonType.label
ef62d7a8-e26e-45b7-bc5b-204fa761dd85	true	introspection.token.claim
ef62d7a8-e26e-45b7-bc5b-204fa761dd85	true	userinfo.token.claim
ef62d7a8-e26e-45b7-bc5b-204fa761dd85	lastName	user.attribute
ef62d7a8-e26e-45b7-bc5b-204fa761dd85	true	id.token.claim
ef62d7a8-e26e-45b7-bc5b-204fa761dd85	true	access.token.claim
ef62d7a8-e26e-45b7-bc5b-204fa761dd85	family_name	claim.name
ef62d7a8-e26e-45b7-bc5b-204fa761dd85	String	jsonType.label
f68dc807-15c5-40a4-8b29-7037084c0813	true	introspection.token.claim
f68dc807-15c5-40a4-8b29-7037084c0813	true	userinfo.token.claim
f68dc807-15c5-40a4-8b29-7037084c0813	middleName	user.attribute
f68dc807-15c5-40a4-8b29-7037084c0813	true	id.token.claim
f68dc807-15c5-40a4-8b29-7037084c0813	true	access.token.claim
f68dc807-15c5-40a4-8b29-7037084c0813	middle_name	claim.name
f68dc807-15c5-40a4-8b29-7037084c0813	String	jsonType.label
fef405bd-611c-4d66-b71b-b27d4929ea9e	true	introspection.token.claim
fef405bd-611c-4d66-b71b-b27d4929ea9e	true	userinfo.token.claim
fef405bd-611c-4d66-b71b-b27d4929ea9e	firstName	user.attribute
fef405bd-611c-4d66-b71b-b27d4929ea9e	true	id.token.claim
fef405bd-611c-4d66-b71b-b27d4929ea9e	true	access.token.claim
fef405bd-611c-4d66-b71b-b27d4929ea9e	given_name	claim.name
fef405bd-611c-4d66-b71b-b27d4929ea9e	String	jsonType.label
3f9519c7-3a25-4f06-9bf6-d31fbad7ff66	true	introspection.token.claim
3f9519c7-3a25-4f06-9bf6-d31fbad7ff66	true	userinfo.token.claim
3f9519c7-3a25-4f06-9bf6-d31fbad7ff66	emailVerified	user.attribute
3f9519c7-3a25-4f06-9bf6-d31fbad7ff66	true	id.token.claim
3f9519c7-3a25-4f06-9bf6-d31fbad7ff66	true	access.token.claim
3f9519c7-3a25-4f06-9bf6-d31fbad7ff66	email_verified	claim.name
3f9519c7-3a25-4f06-9bf6-d31fbad7ff66	boolean	jsonType.label
ec53902f-b8d2-4b6d-9f1f-8d966a469890	true	introspection.token.claim
ec53902f-b8d2-4b6d-9f1f-8d966a469890	true	userinfo.token.claim
ec53902f-b8d2-4b6d-9f1f-8d966a469890	email	user.attribute
ec53902f-b8d2-4b6d-9f1f-8d966a469890	true	id.token.claim
ec53902f-b8d2-4b6d-9f1f-8d966a469890	true	access.token.claim
ec53902f-b8d2-4b6d-9f1f-8d966a469890	email	claim.name
ec53902f-b8d2-4b6d-9f1f-8d966a469890	String	jsonType.label
96581325-0f74-4427-bac3-96f565399bc7	formatted	user.attribute.formatted
96581325-0f74-4427-bac3-96f565399bc7	country	user.attribute.country
96581325-0f74-4427-bac3-96f565399bc7	true	introspection.token.claim
96581325-0f74-4427-bac3-96f565399bc7	postal_code	user.attribute.postal_code
96581325-0f74-4427-bac3-96f565399bc7	true	userinfo.token.claim
96581325-0f74-4427-bac3-96f565399bc7	street	user.attribute.street
96581325-0f74-4427-bac3-96f565399bc7	true	id.token.claim
96581325-0f74-4427-bac3-96f565399bc7	region	user.attribute.region
96581325-0f74-4427-bac3-96f565399bc7	true	access.token.claim
96581325-0f74-4427-bac3-96f565399bc7	locality	user.attribute.locality
3a47856a-ecfc-4a0f-b3b3-464f02dff762	true	introspection.token.claim
3a47856a-ecfc-4a0f-b3b3-464f02dff762	true	userinfo.token.claim
3a47856a-ecfc-4a0f-b3b3-464f02dff762	phoneNumberVerified	user.attribute
3a47856a-ecfc-4a0f-b3b3-464f02dff762	true	id.token.claim
3a47856a-ecfc-4a0f-b3b3-464f02dff762	true	access.token.claim
3a47856a-ecfc-4a0f-b3b3-464f02dff762	phone_number_verified	claim.name
3a47856a-ecfc-4a0f-b3b3-464f02dff762	boolean	jsonType.label
a5aca9e8-164d-42ed-b2bf-e5c63f2a329f	true	introspection.token.claim
a5aca9e8-164d-42ed-b2bf-e5c63f2a329f	true	userinfo.token.claim
a5aca9e8-164d-42ed-b2bf-e5c63f2a329f	phoneNumber	user.attribute
a5aca9e8-164d-42ed-b2bf-e5c63f2a329f	true	id.token.claim
a5aca9e8-164d-42ed-b2bf-e5c63f2a329f	true	access.token.claim
a5aca9e8-164d-42ed-b2bf-e5c63f2a329f	phone_number	claim.name
a5aca9e8-164d-42ed-b2bf-e5c63f2a329f	String	jsonType.label
792685c7-17d8-4165-8fae-936bbaf12aed	true	introspection.token.claim
792685c7-17d8-4165-8fae-936bbaf12aed	true	multivalued
792685c7-17d8-4165-8fae-936bbaf12aed	foo	user.attribute
792685c7-17d8-4165-8fae-936bbaf12aed	true	access.token.claim
792685c7-17d8-4165-8fae-936bbaf12aed	resource_access.${client_id}.roles	claim.name
792685c7-17d8-4165-8fae-936bbaf12aed	String	jsonType.label
9adbc60e-1a4f-4715-b309-a326e91f80d7	true	introspection.token.claim
9adbc60e-1a4f-4715-b309-a326e91f80d7	true	multivalued
9adbc60e-1a4f-4715-b309-a326e91f80d7	foo	user.attribute
9adbc60e-1a4f-4715-b309-a326e91f80d7	true	access.token.claim
9adbc60e-1a4f-4715-b309-a326e91f80d7	realm_access.roles	claim.name
9adbc60e-1a4f-4715-b309-a326e91f80d7	String	jsonType.label
abe81ecb-0766-4fe1-a07f-e5402b26d005	true	introspection.token.claim
abe81ecb-0766-4fe1-a07f-e5402b26d005	true	access.token.claim
3578f321-2842-4f15-9f8a-679e184eb580	true	introspection.token.claim
3578f321-2842-4f15-9f8a-679e184eb580	true	access.token.claim
2a4e5325-ca80-41be-b9e2-2d62952bf389	true	introspection.token.claim
2a4e5325-ca80-41be-b9e2-2d62952bf389	true	userinfo.token.claim
2a4e5325-ca80-41be-b9e2-2d62952bf389	username	user.attribute
2a4e5325-ca80-41be-b9e2-2d62952bf389	true	id.token.claim
2a4e5325-ca80-41be-b9e2-2d62952bf389	true	access.token.claim
2a4e5325-ca80-41be-b9e2-2d62952bf389	upn	claim.name
2a4e5325-ca80-41be-b9e2-2d62952bf389	String	jsonType.label
87c730ea-692d-4f58-9ef8-d5f872a8b4b6	true	introspection.token.claim
87c730ea-692d-4f58-9ef8-d5f872a8b4b6	true	multivalued
87c730ea-692d-4f58-9ef8-d5f872a8b4b6	foo	user.attribute
87c730ea-692d-4f58-9ef8-d5f872a8b4b6	true	id.token.claim
87c730ea-692d-4f58-9ef8-d5f872a8b4b6	true	access.token.claim
87c730ea-692d-4f58-9ef8-d5f872a8b4b6	groups	claim.name
87c730ea-692d-4f58-9ef8-d5f872a8b4b6	String	jsonType.label
9850e5e3-aa0b-41d9-a301-376b950c537b	true	introspection.token.claim
9850e5e3-aa0b-41d9-a301-376b950c537b	true	id.token.claim
9850e5e3-aa0b-41d9-a301-376b950c537b	true	access.token.claim
7a155db2-1cb8-456f-9d44-746f63f23c94	AUTH_TIME	user.session.note
7a155db2-1cb8-456f-9d44-746f63f23c94	true	introspection.token.claim
7a155db2-1cb8-456f-9d44-746f63f23c94	true	id.token.claim
7a155db2-1cb8-456f-9d44-746f63f23c94	true	access.token.claim
7a155db2-1cb8-456f-9d44-746f63f23c94	auth_time	claim.name
7a155db2-1cb8-456f-9d44-746f63f23c94	long	jsonType.label
bab389f7-c59b-4dda-8da4-0eda1033429e	true	introspection.token.claim
bab389f7-c59b-4dda-8da4-0eda1033429e	true	access.token.claim
7d568bf6-0948-44d4-8822-7acc33dfaf59	true	introspection.token.claim
7d568bf6-0948-44d4-8822-7acc33dfaf59	true	multivalued
7d568bf6-0948-44d4-8822-7acc33dfaf59	true	id.token.claim
7d568bf6-0948-44d4-8822-7acc33dfaf59	true	access.token.claim
7d568bf6-0948-44d4-8822-7acc33dfaf59	organization	claim.name
7d568bf6-0948-44d4-8822-7acc33dfaf59	String	jsonType.label
f223c3e4-b2b7-41a5-a123-0f98c377bbf9	true	id.token.claim
f223c3e4-b2b7-41a5-a123-0f98c377bbf9	true	access.token.claim
f223c3e4-b2b7-41a5-a123-0f98c377bbf9	realm_access.roles	claim.name
f223c3e4-b2b7-41a5-a123-0f98c377bbf9	String	jsonType.label
f223c3e4-b2b7-41a5-a123-0f98c377bbf9	true	multivalued
f223c3e4-b2b7-41a5-a123-0f98c377bbf9	true	userinfo.token.claim
30eca891-d58f-4eed-988d-db6d725e0dbf	true	id.token.claim
30eca891-d58f-4eed-988d-db6d725e0dbf	true	access.token.claim
30eca891-d58f-4eed-988d-db6d725e0dbf	realm_access.roles	claim.name
30eca891-d58f-4eed-988d-db6d725e0dbf	String	jsonType.label
30eca891-d58f-4eed-988d-db6d725e0dbf	true	multivalued
30eca891-d58f-4eed-988d-db6d725e0dbf	true	userinfo.token.claim
305cb20b-8754-413f-93e3-556ecdf8d2b6	true	introspection.token.claim
305cb20b-8754-413f-93e3-556ecdf8d2b6	true	userinfo.token.claim
305cb20b-8754-413f-93e3-556ecdf8d2b6	locale	user.attribute
305cb20b-8754-413f-93e3-556ecdf8d2b6	true	id.token.claim
305cb20b-8754-413f-93e3-556ecdf8d2b6	true	access.token.claim
305cb20b-8754-413f-93e3-556ecdf8d2b6	locale	claim.name
305cb20b-8754-413f-93e3-556ecdf8d2b6	String	jsonType.label
d0a16f88-8feb-4902-8693-dd05d6926ab5	true	id.token.claim
d0a16f88-8feb-4902-8693-dd05d6926ab5	true	access.token.claim
d0a16f88-8feb-4902-8693-dd05d6926ab5	realm_access.roles	claim.name
d0a16f88-8feb-4902-8693-dd05d6926ab5	String	jsonType.label
d0a16f88-8feb-4902-8693-dd05d6926ab5	true	multivalued
d0a16f88-8feb-4902-8693-dd05d6926ab5	true	userinfo.token.claim
\.


--
-- TOC entry 4203 (class 0 OID 16773)
-- Dependencies: 222
-- Data for Name: realm; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.realm (id, access_code_lifespan, user_action_lifespan, access_token_lifespan, account_theme, admin_theme, email_theme, enabled, events_enabled, events_expiration, login_theme, name, not_before, password_policy, registration_allowed, remember_me, reset_password_allowed, social, ssl_required, sso_idle_timeout, sso_max_lifespan, update_profile_on_soc_login, verify_email, master_admin_client, login_lifespan, internationalization_enabled, default_locale, reg_email_as_username, admin_events_enabled, admin_events_details_enabled, edit_username_allowed, otp_policy_counter, otp_policy_window, otp_policy_period, otp_policy_digits, otp_policy_alg, otp_policy_type, browser_flow, registration_flow, direct_grant_flow, reset_credentials_flow, client_auth_flow, offline_session_idle_timeout, revoke_refresh_token, access_token_life_implicit, login_with_email_allowed, duplicate_emails_allowed, docker_auth_flow, refresh_token_max_reuse, allow_user_managed_access, sso_max_lifespan_remember_me, sso_idle_timeout_remember_me, default_role) FROM stdin;
04b8d4e2-b556-4c37-b4fc-764558ddd1c4	60	300	60	\N	\N	\N	t	f	0	\N	master	0	\N	f	f	f	f	EXTERNAL	1800	36000	f	f	eb6585bb-4c5a-41c9-acd6-2bd25c7cd792	1800	f	\N	f	f	f	f	0	1	30	6	HmacSHA1	totp	fbd6bbff-cb8b-4845-b97f-ac27cbeb0b0d	70ff9c56-bff4-47d7-9960-011348932622	ce21466a-5ba5-463d-80d2-256731a2af06	3e0d6dab-3d16-4e66-b042-a3466ebaca2f	96d200d2-864d-4ee9-8291-b838544fe5cf	2592000	f	900	t	f	fc958837-0296-4e72-94a1-887982eace1e	0	f	0	0	2a61cf53-4e85-4ef6-a9df-4b44da0b27ff
9814c300-ac35-45b9-a56d-4d4d9ecf51bb	60	300	300	\N	\N	\N	t	f	0	\N	DRCCS	0	\N	f	f	f	f	EXTERNAL	1800	36000	f	f	14682d39-1ec0-4f59-a7b1-3a01115f491a	1800	f	\N	f	f	f	f	0	1	30	6	HmacSHA1	totp	bededb6e-f2cb-4b4e-872b-4327e77f4fb8	cb02a013-ac6b-4b1e-8ec8-f19d9845d2bd	43e421b4-e2c8-47c4-9671-b0f7a0b93391	17d7e656-b44e-4d7a-837e-42c1d9213ba9	e79eeecc-8fbc-4383-ac80-18693bdd99cc	2592000	f	900	t	f	9d03fb60-6d18-4df1-ad44-c932dcb6a83d	0	f	0	0	e2d8533a-6b2d-4a20-a3c5-83d54ec60d99
\.


--
-- TOC entry 4204 (class 0 OID 16790)
-- Dependencies: 223
-- Data for Name: realm_attribute; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.realm_attribute (name, realm_id, value) FROM stdin;
_browser_header.contentSecurityPolicyReportOnly	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	
_browser_header.xContentTypeOptions	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	nosniff
_browser_header.referrerPolicy	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	no-referrer
_browser_header.xRobotsTag	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	none
_browser_header.xFrameOptions	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	SAMEORIGIN
_browser_header.contentSecurityPolicy	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	frame-src 'self'; frame-ancestors 'self'; object-src 'none';
_browser_header.xXSSProtection	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	1; mode=block
_browser_header.strictTransportSecurity	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	max-age=31536000; includeSubDomains
bruteForceProtected	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	false
permanentLockout	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	false
maxTemporaryLockouts	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	0
bruteForceStrategy	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	MULTIPLE
maxFailureWaitSeconds	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	900
minimumQuickLoginWaitSeconds	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	60
waitIncrementSeconds	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	60
quickLoginCheckMilliSeconds	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	1000
maxDeltaTimeSeconds	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	43200
failureFactor	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	30
realmReusableOtpCode	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	false
firstBrokerLoginFlowId	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	4c670a16-99e2-494b-8b91-fe3433e3b693
displayName	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	Keycloak
displayNameHtml	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	<div class="kc-logo-text"><span>Keycloak</span></div>
defaultSignatureAlgorithm	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	RS256
offlineSessionMaxLifespanEnabled	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	false
offlineSessionMaxLifespan	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	5184000
_browser_header.contentSecurityPolicyReportOnly	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	
_browser_header.xContentTypeOptions	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	nosniff
_browser_header.referrerPolicy	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	no-referrer
_browser_header.xRobotsTag	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	none
_browser_header.xFrameOptions	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	SAMEORIGIN
_browser_header.contentSecurityPolicy	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	frame-src 'self'; frame-ancestors 'self'; object-src 'none';
_browser_header.xXSSProtection	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	1; mode=block
_browser_header.strictTransportSecurity	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	max-age=31536000; includeSubDomains
bruteForceProtected	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	false
permanentLockout	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	false
maxTemporaryLockouts	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	0
bruteForceStrategy	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	MULTIPLE
maxFailureWaitSeconds	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	900
minimumQuickLoginWaitSeconds	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	60
waitIncrementSeconds	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	60
quickLoginCheckMilliSeconds	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	1000
maxDeltaTimeSeconds	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	43200
failureFactor	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	30
realmReusableOtpCode	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	false
defaultSignatureAlgorithm	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	RS256
offlineSessionMaxLifespanEnabled	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	false
offlineSessionMaxLifespan	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	5184000
actionTokenGeneratedByAdminLifespan	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	43200
actionTokenGeneratedByUserLifespan	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	300
oauth2DeviceCodeLifespan	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	600
oauth2DevicePollingInterval	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	5
webAuthnPolicyRpEntityName	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	keycloak
webAuthnPolicySignatureAlgorithms	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	ES256,RS256
webAuthnPolicyRpId	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	
webAuthnPolicyAttestationConveyancePreference	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	not specified
webAuthnPolicyAuthenticatorAttachment	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	not specified
webAuthnPolicyRequireResidentKey	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	not specified
webAuthnPolicyUserVerificationRequirement	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	not specified
webAuthnPolicyCreateTimeout	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	0
webAuthnPolicyAvoidSameAuthenticatorRegister	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	false
webAuthnPolicyRpEntityNamePasswordless	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	keycloak
webAuthnPolicySignatureAlgorithmsPasswordless	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	ES256,RS256
webAuthnPolicyRpIdPasswordless	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	
webAuthnPolicyAttestationConveyancePreferencePasswordless	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	not specified
webAuthnPolicyAuthenticatorAttachmentPasswordless	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	not specified
webAuthnPolicyRequireResidentKeyPasswordless	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	not specified
webAuthnPolicyUserVerificationRequirementPasswordless	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	not specified
webAuthnPolicyCreateTimeoutPasswordless	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	0
webAuthnPolicyAvoidSameAuthenticatorRegisterPasswordless	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	false
cibaBackchannelTokenDeliveryMode	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	poll
cibaExpiresIn	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	120
cibaInterval	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	5
cibaAuthRequestedUserHint	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	login_hint
parRequestUriLifespan	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	60
firstBrokerLoginFlowId	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	a052e707-9045-4763-bbc9-c3e783e7934d
\.


--
-- TOC entry 4246 (class 0 OID 17547)
-- Dependencies: 265
-- Data for Name: realm_default_groups; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.realm_default_groups (realm_id, group_id) FROM stdin;
\.


--
-- TOC entry 4226 (class 0 OID 17243)
-- Dependencies: 245
-- Data for Name: realm_enabled_event_types; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.realm_enabled_event_types (realm_id, value) FROM stdin;
\.


--
-- TOC entry 4205 (class 0 OID 16798)
-- Dependencies: 224
-- Data for Name: realm_events_listeners; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.realm_events_listeners (realm_id, value) FROM stdin;
04b8d4e2-b556-4c37-b4fc-764558ddd1c4	jboss-logging
9814c300-ac35-45b9-a56d-4d4d9ecf51bb	jboss-logging
\.


--
-- TOC entry 4279 (class 0 OID 18249)
-- Dependencies: 298
-- Data for Name: realm_localizations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.realm_localizations (realm_id, locale, texts) FROM stdin;
\.


--
-- TOC entry 4206 (class 0 OID 16801)
-- Dependencies: 225
-- Data for Name: realm_required_credential; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.realm_required_credential (type, form_label, input, secret, realm_id) FROM stdin;
password	password	t	t	04b8d4e2-b556-4c37-b4fc-764558ddd1c4
password	password	t	t	9814c300-ac35-45b9-a56d-4d4d9ecf51bb
\.


--
-- TOC entry 4207 (class 0 OID 16808)
-- Dependencies: 226
-- Data for Name: realm_smtp_config; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.realm_smtp_config (realm_id, value, name) FROM stdin;
\.


--
-- TOC entry 4225 (class 0 OID 17159)
-- Dependencies: 244
-- Data for Name: realm_supported_locales; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.realm_supported_locales (realm_id, value) FROM stdin;
\.


--
-- TOC entry 4208 (class 0 OID 16818)
-- Dependencies: 227
-- Data for Name: redirect_uris; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.redirect_uris (client_id, value) FROM stdin;
9c71c67c-24e8-45c3-aa0d-4df498facac4	/realms/master/account/*
84302485-9b73-4186-9e5b-0da15972c7e6	/realms/master/account/*
d455a894-4eb3-4584-9c3a-8c5ed7ed2aa3	/admin/master/console/*
7bec06e5-f1db-4d81-99a4-df603a9d007c	/realms/DRCCS/account/*
d30bc5e2-7ce6-4932-bf87-1eb8d95b036b	/realms/DRCCS/account/*
d7c11793-e6cd-405c-9da1-b8d8ba057a83	/admin/DRCCS/console/*
e3652182-d1bb-4f94-a8a0-edc307e0e6e4	http://127.0.0.1:3000/*
e3652182-d1bb-4f94-a8a0-edc307e0e6e4	http://localhost:3000/*
\.


--
-- TOC entry 4239 (class 0 OID 17482)
-- Dependencies: 258
-- Data for Name: required_action_config; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.required_action_config (required_action_id, value, name) FROM stdin;
\.


--
-- TOC entry 4238 (class 0 OID 17475)
-- Dependencies: 257
-- Data for Name: required_action_provider; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.required_action_provider (id, alias, name, realm_id, enabled, default_action, provider_id, priority) FROM stdin;
6f113a4f-947d-435d-aaa7-5dffd205ca5f	VERIFY_EMAIL	Verify Email	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	t	f	VERIFY_EMAIL	50
9ed63d97-d186-47ab-99b3-c016e5df0b68	UPDATE_PROFILE	Update Profile	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	t	f	UPDATE_PROFILE	40
4d65111e-4945-4b62-accf-9ffe852e5fc0	CONFIGURE_TOTP	Configure OTP	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	t	f	CONFIGURE_TOTP	10
ba6e135f-59bf-4e32-a7c9-e1ad6c3b4398	UPDATE_PASSWORD	Update Password	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	t	f	UPDATE_PASSWORD	30
b4644def-fa06-477a-b4f1-1c16c443d219	TERMS_AND_CONDITIONS	Terms and Conditions	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	f	f	TERMS_AND_CONDITIONS	20
d5993f7f-fd4b-48b1-a8a2-194d915fbf23	delete_account	Delete Account	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	f	f	delete_account	60
56c64b49-a309-4ba4-96ca-e2129a26c0d5	delete_credential	Delete Credential	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	t	f	delete_credential	100
26531668-1512-478c-963e-6a73283dde6b	update_user_locale	Update User Locale	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	t	f	update_user_locale	1000
b4f0cef6-3456-4ef9-beba-eea02bd78216	webauthn-register	Webauthn Register	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	t	f	webauthn-register	70
439372e4-7697-4917-b798-8c8590b96a65	webauthn-register-passwordless	Webauthn Register Passwordless	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	t	f	webauthn-register-passwordless	80
969833c1-d27a-416c-829c-1d62dbb9d765	VERIFY_PROFILE	Verify Profile	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	t	f	VERIFY_PROFILE	90
0e9d31f0-380b-4eb5-b166-648397625c73	VERIFY_EMAIL	Verify Email	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	t	f	VERIFY_EMAIL	50
836ee59e-cd52-428a-a9b6-bd3cda1c470f	UPDATE_PROFILE	Update Profile	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	t	f	UPDATE_PROFILE	40
6ac142d2-78ff-43d8-bbee-868b736c5cae	CONFIGURE_TOTP	Configure OTP	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	t	f	CONFIGURE_TOTP	10
90a676a1-3993-4047-8593-0091ca6769c1	UPDATE_PASSWORD	Update Password	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	t	f	UPDATE_PASSWORD	30
d037b98d-3642-400f-8a4c-eb31cdd3cf4e	TERMS_AND_CONDITIONS	Terms and Conditions	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	f	f	TERMS_AND_CONDITIONS	20
4e028101-f890-4420-93c7-81fc2c26b9ee	delete_account	Delete Account	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	f	f	delete_account	60
80d98f26-49aa-460a-aa64-d0713e36b72e	delete_credential	Delete Credential	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	t	f	delete_credential	100
91602299-0c78-4a93-89e3-be48debf9f48	update_user_locale	Update User Locale	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	t	f	update_user_locale	1000
8e5571ce-d965-433e-a9a4-baf97f3a2fbc	webauthn-register	Webauthn Register	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	t	f	webauthn-register	70
d2095f33-c031-467a-bb06-7409cad3a5ff	webauthn-register-passwordless	Webauthn Register Passwordless	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	t	f	webauthn-register-passwordless	80
346a3d1b-efbd-4533-9190-32341cde0b21	VERIFY_PROFILE	Verify Profile	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	t	f	VERIFY_PROFILE	90
\.


--
-- TOC entry 4276 (class 0 OID 18180)
-- Dependencies: 295
-- Data for Name: resource_attribute; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.resource_attribute (id, name, value, resource_id) FROM stdin;
\.


--
-- TOC entry 4256 (class 0 OID 17764)
-- Dependencies: 275
-- Data for Name: resource_policy; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.resource_policy (resource_id, policy_id) FROM stdin;
\.


--
-- TOC entry 4255 (class 0 OID 17749)
-- Dependencies: 274
-- Data for Name: resource_scope; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.resource_scope (resource_id, scope_id) FROM stdin;
\.


--
-- TOC entry 4250 (class 0 OID 17687)
-- Dependencies: 269
-- Data for Name: resource_server; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.resource_server (id, allow_rs_remote_mgmt, policy_enforce_mode, decision_strategy) FROM stdin;
\.


--
-- TOC entry 4275 (class 0 OID 18156)
-- Dependencies: 294
-- Data for Name: resource_server_perm_ticket; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.resource_server_perm_ticket (id, owner, requester, created_timestamp, granted_timestamp, resource_id, scope_id, resource_server_id, policy_id) FROM stdin;
\.


--
-- TOC entry 4253 (class 0 OID 17723)
-- Dependencies: 272
-- Data for Name: resource_server_policy; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.resource_server_policy (id, name, description, type, decision_strategy, logic, resource_server_id, owner) FROM stdin;
\.


--
-- TOC entry 4251 (class 0 OID 17695)
-- Dependencies: 270
-- Data for Name: resource_server_resource; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.resource_server_resource (id, name, type, icon_uri, owner, resource_server_id, owner_managed_access, display_name) FROM stdin;
\.


--
-- TOC entry 4252 (class 0 OID 17709)
-- Dependencies: 271
-- Data for Name: resource_server_scope; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.resource_server_scope (id, name, icon_uri, resource_server_id, display_name) FROM stdin;
\.


--
-- TOC entry 4277 (class 0 OID 18198)
-- Dependencies: 296
-- Data for Name: resource_uris; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.resource_uris (resource_id, value) FROM stdin;
\.


--
-- TOC entry 4282 (class 0 OID 18331)
-- Dependencies: 301
-- Data for Name: revoked_token; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.revoked_token (id, expire) FROM stdin;
\.


--
-- TOC entry 4278 (class 0 OID 18208)
-- Dependencies: 297
-- Data for Name: role_attribute; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.role_attribute (id, role_id, name, value) FROM stdin;
\.


--
-- TOC entry 4209 (class 0 OID 16821)
-- Dependencies: 228
-- Data for Name: scope_mapping; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.scope_mapping (client_id, role_id) FROM stdin;
84302485-9b73-4186-9e5b-0da15972c7e6	f911ee86-369e-4fa9-a8b7-b243851bde1f
84302485-9b73-4186-9e5b-0da15972c7e6	e478211a-d656-411e-b6e8-4a85fae15440
d30bc5e2-7ce6-4932-bf87-1eb8d95b036b	1f1e6e4d-3fdf-4a51-8214-8a0d54aa92f7
d30bc5e2-7ce6-4932-bf87-1eb8d95b036b	d137ea5a-4445-47bf-b99c-f317b8aba8fb
\.


--
-- TOC entry 4257 (class 0 OID 17779)
-- Dependencies: 276
-- Data for Name: scope_policy; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.scope_policy (scope_id, policy_id) FROM stdin;
\.


--
-- TOC entry 4211 (class 0 OID 16827)
-- Dependencies: 230
-- Data for Name: user_attribute; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_attribute (name, value, user_id, id, long_value_hash, long_value_hash_lower_case, long_value) FROM stdin;
\.


--
-- TOC entry 4230 (class 0 OID 17264)
-- Dependencies: 249
-- Data for Name: user_consent; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_consent (id, client_id, user_id, created_date, last_updated_date, client_storage_provider, external_client_id) FROM stdin;
\.


--
-- TOC entry 4273 (class 0 OID 18131)
-- Dependencies: 292
-- Data for Name: user_consent_client_scope; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_consent_client_scope (user_consent_id, scope_id) FROM stdin;
\.


--
-- TOC entry 4212 (class 0 OID 16832)
-- Dependencies: 231
-- Data for Name: user_entity; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_entity (id, email, email_constraint, email_verified, enabled, federation_link, first_name, last_name, realm_id, username, created_timestamp, service_account_client_link, not_before) FROM stdin;
ce96cc82-1e5b-44ec-af73-3ad14d334038	\N	9278db43-f75e-4b02-b246-1b412859c223	f	t	\N	\N	\N	04b8d4e2-b556-4c37-b4fc-764558ddd1c4	disaster-admin	1762854754681	\N	0
db6362a2-7f07-4bc9-a44b-534132115d2e	region.admin@disaster.nl	region.admin@disaster.nl	t	t	\N	Furqan	Malik	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	region.admin@disaster.nl	\N	\N	0
d1c2d376-00ce-4a9e-b245-e735808dbfb5	dept.fire.deventer@disaster.nl	dept.fire.deventer@disaster.nl	t	t	\N	Ben	Vos	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	dept.fire.deventer@disaster.nl	\N	\N	0
f8972037-2d30-4100-9225-925db8c1645a	municipality.deventer@disaster.nl	municipality.deventer@disaster.nl	t	t	\N	Faezeh	Kiyani	9814c300-ac35-45b9-a56d-4d4d9ecf51bb	municipality.deventer@disaster.nl	\N	\N	0
\.


--
-- TOC entry 4213 (class 0 OID 16840)
-- Dependencies: 232
-- Data for Name: user_federation_config; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_federation_config (user_federation_provider_id, value, name) FROM stdin;
\.


--
-- TOC entry 4236 (class 0 OID 17376)
-- Dependencies: 255
-- Data for Name: user_federation_mapper; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_federation_mapper (id, name, federation_provider_id, federation_mapper_type, realm_id) FROM stdin;
\.


--
-- TOC entry 4237 (class 0 OID 17381)
-- Dependencies: 256
-- Data for Name: user_federation_mapper_config; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_federation_mapper_config (user_federation_mapper_id, value, name) FROM stdin;
\.


--
-- TOC entry 4214 (class 0 OID 16845)
-- Dependencies: 233
-- Data for Name: user_federation_provider; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_federation_provider (id, changed_sync_period, display_name, full_sync_period, last_sync, priority, provider_name, realm_id) FROM stdin;
\.


--
-- TOC entry 4245 (class 0 OID 17544)
-- Dependencies: 264
-- Data for Name: user_group_membership; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_group_membership (group_id, user_id, membership_type) FROM stdin;
\.


--
-- TOC entry 4215 (class 0 OID 16850)
-- Dependencies: 234
-- Data for Name: user_required_action; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_required_action (user_id, required_action) FROM stdin;
\.


--
-- TOC entry 4216 (class 0 OID 16853)
-- Dependencies: 235
-- Data for Name: user_role_mapping; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_role_mapping (role_id, user_id) FROM stdin;
2a61cf53-4e85-4ef6-a9df-4b44da0b27ff	ce96cc82-1e5b-44ec-af73-3ad14d334038
f5c39b89-0988-4502-b22b-79522131772f	ce96cc82-1e5b-44ec-af73-3ad14d334038
74d519ab-4f25-4ff3-b834-db040861e2f0	db6362a2-7f07-4bc9-a44b-534132115d2e
fb45cc50-4b0f-4c1d-a755-2f1da9bf70a4	f8972037-2d30-4100-9225-925db8c1645a
cbcf4299-8aaa-47ef-a698-580d6cac3ac2	d1c2d376-00ce-4a9e-b245-e735808dbfb5
\.


--
-- TOC entry 4210 (class 0 OID 16824)
-- Dependencies: 229
-- Data for Name: username_login_failure; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.username_login_failure (realm_id, username, failed_login_not_before, last_failure, last_ip_failure, num_failures) FROM stdin;
\.


--
-- TOC entry 4217 (class 0 OID 16867)
-- Dependencies: 236
-- Data for Name: web_origins; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.web_origins (client_id, value) FROM stdin;
d455a894-4eb3-4584-9c3a-8c5ed7ed2aa3	+
d7c11793-e6cd-405c-9da1-b8d8ba057a83	+
e3652182-d1bb-4f94-a8a0-edc307e0e6e4	*
\.


--
-- TOC entry 3732 (class 2606 OID 17923)
-- Name: username_login_failure CONSTRAINT_17-2; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.username_login_failure
    ADD CONSTRAINT "CONSTRAINT_17-2" PRIMARY KEY (realm_id, username);


--
-- TOC entry 3981 (class 2606 OID 18320)
-- Name: org_domain ORG_DOMAIN_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.org_domain
    ADD CONSTRAINT "ORG_DOMAIN_pkey" PRIMARY KEY (id, name);


--
-- TOC entry 3973 (class 2606 OID 18309)
-- Name: org ORG_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.org
    ADD CONSTRAINT "ORG_pkey" PRIMARY KEY (id);


--
-- TOC entry 3705 (class 2606 OID 18232)
-- Name: keycloak_role UK_J3RWUVD56ONTGSUHOGM184WW2-2; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.keycloak_role
    ADD CONSTRAINT "UK_J3RWUVD56ONTGSUHOGM184WW2-2" UNIQUE (name, client_realm_constraint);


--
-- TOC entry 3942 (class 2606 OID 18062)
-- Name: client_auth_flow_bindings c_cli_flow_bind; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.client_auth_flow_bindings
    ADD CONSTRAINT c_cli_flow_bind PRIMARY KEY (client_id, binding_name);


--
-- TOC entry 3944 (class 2606 OID 18261)
-- Name: client_scope_client c_cli_scope_bind; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.client_scope_client
    ADD CONSTRAINT c_cli_scope_bind PRIMARY KEY (client_id, scope_id);


--
-- TOC entry 3939 (class 2606 OID 17937)
-- Name: client_initial_access cnstr_client_init_acc_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.client_initial_access
    ADD CONSTRAINT cnstr_client_init_acc_pk PRIMARY KEY (id);


--
-- TOC entry 3854 (class 2606 OID 17585)
-- Name: realm_default_groups con_group_id_def_groups; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.realm_default_groups
    ADD CONSTRAINT con_group_id_def_groups UNIQUE (group_id);


--
-- TOC entry 3902 (class 2606 OID 17860)
-- Name: broker_link constr_broker_link_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.broker_link
    ADD CONSTRAINT constr_broker_link_pk PRIMARY KEY (identity_provider, user_id);


--
-- TOC entry 3930 (class 2606 OID 17880)
-- Name: component_config constr_component_config_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.component_config
    ADD CONSTRAINT constr_component_config_pk PRIMARY KEY (id);


--
-- TOC entry 3933 (class 2606 OID 17878)
-- Name: component constr_component_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.component
    ADD CONSTRAINT constr_component_pk PRIMARY KEY (id);


--
-- TOC entry 3922 (class 2606 OID 17876)
-- Name: fed_user_required_action constr_fed_required_action; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fed_user_required_action
    ADD CONSTRAINT constr_fed_required_action PRIMARY KEY (required_action, user_id);


--
-- TOC entry 3904 (class 2606 OID 17862)
-- Name: fed_user_attribute constr_fed_user_attr_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fed_user_attribute
    ADD CONSTRAINT constr_fed_user_attr_pk PRIMARY KEY (id);


--
-- TOC entry 3909 (class 2606 OID 17864)
-- Name: fed_user_consent constr_fed_user_consent_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fed_user_consent
    ADD CONSTRAINT constr_fed_user_consent_pk PRIMARY KEY (id);


--
-- TOC entry 3914 (class 2606 OID 17870)
-- Name: fed_user_credential constr_fed_user_cred_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fed_user_credential
    ADD CONSTRAINT constr_fed_user_cred_pk PRIMARY KEY (id);


--
-- TOC entry 3918 (class 2606 OID 17872)
-- Name: fed_user_group_membership constr_fed_user_group; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fed_user_group_membership
    ADD CONSTRAINT constr_fed_user_group PRIMARY KEY (group_id, user_id);


--
-- TOC entry 3926 (class 2606 OID 17874)
-- Name: fed_user_role_mapping constr_fed_user_role; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fed_user_role_mapping
    ADD CONSTRAINT constr_fed_user_role PRIMARY KEY (role_id, user_id);


--
-- TOC entry 3937 (class 2606 OID 17917)
-- Name: federated_user constr_federated_user; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.federated_user
    ADD CONSTRAINT constr_federated_user PRIMARY KEY (id);


--
-- TOC entry 3856 (class 2606 OID 18021)
-- Name: realm_default_groups constr_realm_default_groups; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.realm_default_groups
    ADD CONSTRAINT constr_realm_default_groups PRIMARY KEY (realm_id, group_id);


--
-- TOC entry 3789 (class 2606 OID 18038)
-- Name: realm_enabled_event_types constr_realm_enabl_event_types; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.realm_enabled_event_types
    ADD CONSTRAINT constr_realm_enabl_event_types PRIMARY KEY (realm_id, value);


--
-- TOC entry 3719 (class 2606 OID 18040)
-- Name: realm_events_listeners constr_realm_events_listeners; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.realm_events_listeners
    ADD CONSTRAINT constr_realm_events_listeners PRIMARY KEY (realm_id, value);


--
-- TOC entry 3786 (class 2606 OID 18042)
-- Name: realm_supported_locales constr_realm_supported_locales; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.realm_supported_locales
    ADD CONSTRAINT constr_realm_supported_locales PRIMARY KEY (realm_id, value);


--
-- TOC entry 3777 (class 2606 OID 17171)
-- Name: identity_provider constraint_2b; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.identity_provider
    ADD CONSTRAINT constraint_2b PRIMARY KEY (internal_id);


--
-- TOC entry 3762 (class 2606 OID 17105)
-- Name: client_attributes constraint_3c; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.client_attributes
    ADD CONSTRAINT constraint_3c PRIMARY KEY (client_id, name);


--
-- TOC entry 3702 (class 2606 OID 16879)
-- Name: event_entity constraint_4; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.event_entity
    ADD CONSTRAINT constraint_4 PRIMARY KEY (id);


--
-- TOC entry 3773 (class 2606 OID 17173)
-- Name: federated_identity constraint_40; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.federated_identity
    ADD CONSTRAINT constraint_40 PRIMARY KEY (identity_provider, user_id);


--
-- TOC entry 3711 (class 2606 OID 16881)
-- Name: realm constraint_4a; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.realm
    ADD CONSTRAINT constraint_4a PRIMARY KEY (id);


--
-- TOC entry 3750 (class 2606 OID 16887)
-- Name: user_federation_provider constraint_5c; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_federation_provider
    ADD CONSTRAINT constraint_5c PRIMARY KEY (id);


--
-- TOC entry 3690 (class 2606 OID 16891)
-- Name: client constraint_7; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.client
    ADD CONSTRAINT constraint_7 PRIMARY KEY (id);


--
-- TOC entry 3729 (class 2606 OID 16895)
-- Name: scope_mapping constraint_81; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.scope_mapping
    ADD CONSTRAINT constraint_81 PRIMARY KEY (client_id, role_id);


--
-- TOC entry 3765 (class 2606 OID 17109)
-- Name: client_node_registrations constraint_84; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.client_node_registrations
    ADD CONSTRAINT constraint_84 PRIMARY KEY (client_id, name);


--
-- TOC entry 3716 (class 2606 OID 16897)
-- Name: realm_attribute constraint_9; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.realm_attribute
    ADD CONSTRAINT constraint_9 PRIMARY KEY (name, realm_id);


--
-- TOC entry 3722 (class 2606 OID 16899)
-- Name: realm_required_credential constraint_92; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.realm_required_credential
    ADD CONSTRAINT constraint_92 PRIMARY KEY (realm_id, type);


--
-- TOC entry 3707 (class 2606 OID 16901)
-- Name: keycloak_role constraint_a; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.keycloak_role
    ADD CONSTRAINT constraint_a PRIMARY KEY (id);


--
-- TOC entry 3807 (class 2606 OID 18025)
-- Name: admin_event_entity constraint_admin_event_entity; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_event_entity
    ADD CONSTRAINT constraint_admin_event_entity PRIMARY KEY (id);


--
-- TOC entry 3820 (class 2606 OID 17402)
-- Name: authenticator_config_entry constraint_auth_cfg_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.authenticator_config_entry
    ADD CONSTRAINT constraint_auth_cfg_pk PRIMARY KEY (authenticator_id, name);


--
-- TOC entry 3816 (class 2606 OID 17400)
-- Name: authentication_execution constraint_auth_exec_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.authentication_execution
    ADD CONSTRAINT constraint_auth_exec_pk PRIMARY KEY (id);


--
-- TOC entry 3813 (class 2606 OID 17398)
-- Name: authentication_flow constraint_auth_flow_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.authentication_flow
    ADD CONSTRAINT constraint_auth_flow_pk PRIMARY KEY (id);


--
-- TOC entry 3810 (class 2606 OID 17396)
-- Name: authenticator_config constraint_auth_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.authenticator_config
    ADD CONSTRAINT constraint_auth_pk PRIMARY KEY (id);


--
-- TOC entry 3756 (class 2606 OID 16903)
-- Name: user_role_mapping constraint_c; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_role_mapping
    ADD CONSTRAINT constraint_c PRIMARY KEY (role_id, user_id);


--
-- TOC entry 3695 (class 2606 OID 18019)
-- Name: composite_role constraint_composite_role; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.composite_role
    ADD CONSTRAINT constraint_composite_role PRIMARY KEY (composite, child_role);


--
-- TOC entry 3784 (class 2606 OID 17175)
-- Name: identity_provider_config constraint_d; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.identity_provider_config
    ADD CONSTRAINT constraint_d PRIMARY KEY (identity_provider_id, name);


--
-- TOC entry 3888 (class 2606 OID 17743)
-- Name: policy_config constraint_dpc; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.policy_config
    ADD CONSTRAINT constraint_dpc PRIMARY KEY (policy_id, name);


--
-- TOC entry 3724 (class 2606 OID 16905)
-- Name: realm_smtp_config constraint_e; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.realm_smtp_config
    ADD CONSTRAINT constraint_e PRIMARY KEY (realm_id, name);


--
-- TOC entry 3699 (class 2606 OID 16907)
-- Name: credential constraint_f; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.credential
    ADD CONSTRAINT constraint_f PRIMARY KEY (id);


--
-- TOC entry 3748 (class 2606 OID 16909)
-- Name: user_federation_config constraint_f9; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_federation_config
    ADD CONSTRAINT constraint_f9 PRIMARY KEY (user_federation_provider_id, name);


--
-- TOC entry 3958 (class 2606 OID 18160)
-- Name: resource_server_perm_ticket constraint_fapmt; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resource_server_perm_ticket
    ADD CONSTRAINT constraint_fapmt PRIMARY KEY (id);


--
-- TOC entry 3873 (class 2606 OID 17701)
-- Name: resource_server_resource constraint_farsr; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resource_server_resource
    ADD CONSTRAINT constraint_farsr PRIMARY KEY (id);


--
-- TOC entry 3883 (class 2606 OID 17729)
-- Name: resource_server_policy constraint_farsrp; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resource_server_policy
    ADD CONSTRAINT constraint_farsrp PRIMARY KEY (id);


--
-- TOC entry 3899 (class 2606 OID 17798)
-- Name: associated_policy constraint_farsrpap; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.associated_policy
    ADD CONSTRAINT constraint_farsrpap PRIMARY KEY (policy_id, associated_policy_id);


--
-- TOC entry 3893 (class 2606 OID 17768)
-- Name: resource_policy constraint_farsrpp; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resource_policy
    ADD CONSTRAINT constraint_farsrpp PRIMARY KEY (resource_id, policy_id);


--
-- TOC entry 3878 (class 2606 OID 17715)
-- Name: resource_server_scope constraint_farsrs; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resource_server_scope
    ADD CONSTRAINT constraint_farsrs PRIMARY KEY (id);


--
-- TOC entry 3890 (class 2606 OID 17753)
-- Name: resource_scope constraint_farsrsp; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resource_scope
    ADD CONSTRAINT constraint_farsrsp PRIMARY KEY (resource_id, scope_id);


--
-- TOC entry 3896 (class 2606 OID 17783)
-- Name: scope_policy constraint_farsrsps; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.scope_policy
    ADD CONSTRAINT constraint_farsrsps PRIMARY KEY (scope_id, policy_id);


--
-- TOC entry 3740 (class 2606 OID 16911)
-- Name: user_entity constraint_fb; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_entity
    ADD CONSTRAINT constraint_fb PRIMARY KEY (id);


--
-- TOC entry 3826 (class 2606 OID 17410)
-- Name: user_federation_mapper_config constraint_fedmapper_cfg_pm; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_federation_mapper_config
    ADD CONSTRAINT constraint_fedmapper_cfg_pm PRIMARY KEY (user_federation_mapper_id, name);


--
-- TOC entry 3822 (class 2606 OID 17408)
-- Name: user_federation_mapper constraint_fedmapperpm; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_federation_mapper
    ADD CONSTRAINT constraint_fedmapperpm PRIMARY KEY (id);


--
-- TOC entry 3956 (class 2606 OID 18145)
-- Name: fed_user_consent_cl_scope constraint_fgrntcsnt_clsc_pm; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fed_user_consent_cl_scope
    ADD CONSTRAINT constraint_fgrntcsnt_clsc_pm PRIMARY KEY (user_consent_id, scope_id);


--
-- TOC entry 3952 (class 2606 OID 18135)
-- Name: user_consent_client_scope constraint_grntcsnt_clsc_pm; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_consent_client_scope
    ADD CONSTRAINT constraint_grntcsnt_clsc_pm PRIMARY KEY (user_consent_id, scope_id);


--
-- TOC entry 3800 (class 2606 OID 17283)
-- Name: user_consent constraint_grntcsnt_pm; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_consent
    ADD CONSTRAINT constraint_grntcsnt_pm PRIMARY KEY (id);


--
-- TOC entry 3840 (class 2606 OID 17552)
-- Name: keycloak_group constraint_group; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.keycloak_group
    ADD CONSTRAINT constraint_group PRIMARY KEY (id);


--
-- TOC entry 3847 (class 2606 OID 17559)
-- Name: group_attribute constraint_group_attribute_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.group_attribute
    ADD CONSTRAINT constraint_group_attribute_pk PRIMARY KEY (id);


--
-- TOC entry 3844 (class 2606 OID 17573)
-- Name: group_role_mapping constraint_group_role; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.group_role_mapping
    ADD CONSTRAINT constraint_group_role PRIMARY KEY (role_id, group_id);


--
-- TOC entry 3795 (class 2606 OID 17279)
-- Name: identity_provider_mapper constraint_idpm; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.identity_provider_mapper
    ADD CONSTRAINT constraint_idpm PRIMARY KEY (id);


--
-- TOC entry 3798 (class 2606 OID 17459)
-- Name: idp_mapper_config constraint_idpmconfig; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.idp_mapper_config
    ADD CONSTRAINT constraint_idpmconfig PRIMARY KEY (idp_mapper_id, name);


--
-- TOC entry 3792 (class 2606 OID 17277)
-- Name: migration_model constraint_migmod; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.migration_model
    ADD CONSTRAINT constraint_migmod PRIMARY KEY (id);


--
-- TOC entry 3838 (class 2606 OID 18238)
-- Name: offline_client_session constraint_offl_cl_ses_pk3; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.offline_client_session
    ADD CONSTRAINT constraint_offl_cl_ses_pk3 PRIMARY KEY (user_session_id, client_id, client_storage_provider, external_client_id, offline_flag);


--
-- TOC entry 3833 (class 2606 OID 17529)
-- Name: offline_user_session constraint_offl_us_ses_pk2; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.offline_user_session
    ADD CONSTRAINT constraint_offl_us_ses_pk2 PRIMARY KEY (user_session_id, offline_flag);


--
-- TOC entry 3767 (class 2606 OID 17169)
-- Name: protocol_mapper constraint_pcm; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.protocol_mapper
    ADD CONSTRAINT constraint_pcm PRIMARY KEY (id);


--
-- TOC entry 3771 (class 2606 OID 17452)
-- Name: protocol_mapper_config constraint_pmconfig; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.protocol_mapper_config
    ADD CONSTRAINT constraint_pmconfig PRIMARY KEY (protocol_mapper_id, name);


--
-- TOC entry 3726 (class 2606 OID 18044)
-- Name: redirect_uris constraint_redirect_uris; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.redirect_uris
    ADD CONSTRAINT constraint_redirect_uris PRIMARY KEY (client_id, value);


--
-- TOC entry 3831 (class 2606 OID 17492)
-- Name: required_action_config constraint_req_act_cfg_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.required_action_config
    ADD CONSTRAINT constraint_req_act_cfg_pk PRIMARY KEY (required_action_id, name);


--
-- TOC entry 3828 (class 2606 OID 17490)
-- Name: required_action_provider constraint_req_act_prv_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.required_action_provider
    ADD CONSTRAINT constraint_req_act_prv_pk PRIMARY KEY (id);


--
-- TOC entry 3753 (class 2606 OID 17404)
-- Name: user_required_action constraint_required_action; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_required_action
    ADD CONSTRAINT constraint_required_action PRIMARY KEY (required_action, user_id);


--
-- TOC entry 3966 (class 2606 OID 18207)
-- Name: resource_uris constraint_resour_uris_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resource_uris
    ADD CONSTRAINT constraint_resour_uris_pk PRIMARY KEY (resource_id, value);


--
-- TOC entry 3968 (class 2606 OID 18214)
-- Name: role_attribute constraint_role_attribute_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_attribute
    ADD CONSTRAINT constraint_role_attribute_pk PRIMARY KEY (id);


--
-- TOC entry 3984 (class 2606 OID 18335)
-- Name: revoked_token constraint_rt; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.revoked_token
    ADD CONSTRAINT constraint_rt PRIMARY KEY (id);


--
-- TOC entry 3734 (class 2606 OID 17488)
-- Name: user_attribute constraint_user_attribute_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_attribute
    ADD CONSTRAINT constraint_user_attribute_pk PRIMARY KEY (id);


--
-- TOC entry 3851 (class 2606 OID 17566)
-- Name: user_group_membership constraint_user_group; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_group_membership
    ADD CONSTRAINT constraint_user_group PRIMARY KEY (group_id, user_id);


--
-- TOC entry 3759 (class 2606 OID 18046)
-- Name: web_origins constraint_web_origins; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.web_origins
    ADD CONSTRAINT constraint_web_origins PRIMARY KEY (client_id, value);


--
-- TOC entry 3688 (class 2606 OID 16723)
-- Name: databasechangeloglock databasechangeloglock_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.databasechangeloglock
    ADD CONSTRAINT databasechangeloglock_pkey PRIMARY KEY (id);


--
-- TOC entry 3865 (class 2606 OID 17669)
-- Name: client_scope_attributes pk_cl_tmpl_attr; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.client_scope_attributes
    ADD CONSTRAINT pk_cl_tmpl_attr PRIMARY KEY (scope_id, name);


--
-- TOC entry 3860 (class 2606 OID 17628)
-- Name: client_scope pk_cli_template; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.client_scope
    ADD CONSTRAINT pk_cli_template PRIMARY KEY (id);


--
-- TOC entry 3871 (class 2606 OID 17999)
-- Name: resource_server pk_resource_server; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resource_server
    ADD CONSTRAINT pk_resource_server PRIMARY KEY (id);


--
-- TOC entry 3869 (class 2606 OID 17657)
-- Name: client_scope_role_mapping pk_template_scope; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.client_scope_role_mapping
    ADD CONSTRAINT pk_template_scope PRIMARY KEY (scope_id, role_id);


--
-- TOC entry 3950 (class 2606 OID 18120)
-- Name: default_client_scope r_def_cli_scope_bind; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.default_client_scope
    ADD CONSTRAINT r_def_cli_scope_bind PRIMARY KEY (realm_id, scope_id);


--
-- TOC entry 3971 (class 2606 OID 18255)
-- Name: realm_localizations realm_localizations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.realm_localizations
    ADD CONSTRAINT realm_localizations_pkey PRIMARY KEY (realm_id, locale);


--
-- TOC entry 3964 (class 2606 OID 18187)
-- Name: resource_attribute res_attr_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resource_attribute
    ADD CONSTRAINT res_attr_pk PRIMARY KEY (id);


--
-- TOC entry 3842 (class 2606 OID 17929)
-- Name: keycloak_group sibling_names; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.keycloak_group
    ADD CONSTRAINT sibling_names UNIQUE (realm_id, parent_group, name);


--
-- TOC entry 3782 (class 2606 OID 17226)
-- Name: identity_provider uk_2daelwnibji49avxsrtuf6xj33; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.identity_provider
    ADD CONSTRAINT uk_2daelwnibji49avxsrtuf6xj33 UNIQUE (provider_alias, realm_id);


--
-- TOC entry 3693 (class 2606 OID 16915)
-- Name: client uk_b71cjlbenv945rb6gcon438at; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.client
    ADD CONSTRAINT uk_b71cjlbenv945rb6gcon438at UNIQUE (realm_id, client_id);


--
-- TOC entry 3862 (class 2606 OID 18073)
-- Name: client_scope uk_cli_scope; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.client_scope
    ADD CONSTRAINT uk_cli_scope UNIQUE (realm_id, name);


--
-- TOC entry 3744 (class 2606 OID 16919)
-- Name: user_entity uk_dykn684sl8up1crfei6eckhd7; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_entity
    ADD CONSTRAINT uk_dykn684sl8up1crfei6eckhd7 UNIQUE (realm_id, email_constraint);


--
-- TOC entry 3803 (class 2606 OID 18324)
-- Name: user_consent uk_external_consent; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_consent
    ADD CONSTRAINT uk_external_consent UNIQUE (client_storage_provider, external_client_id, user_id);


--
-- TOC entry 3876 (class 2606 OID 18246)
-- Name: resource_server_resource uk_frsr6t700s9v50bu18ws5ha6; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resource_server_resource
    ADD CONSTRAINT uk_frsr6t700s9v50bu18ws5ha6 UNIQUE (name, owner, resource_server_id);


--
-- TOC entry 3962 (class 2606 OID 18242)
-- Name: resource_server_perm_ticket uk_frsr6t700s9v50bu18ws5pmt; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resource_server_perm_ticket
    ADD CONSTRAINT uk_frsr6t700s9v50bu18ws5pmt UNIQUE (owner, requester, resource_server_id, resource_id, scope_id);


--
-- TOC entry 3886 (class 2606 OID 17990)
-- Name: resource_server_policy uk_frsrpt700s9v50bu18ws5ha6; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resource_server_policy
    ADD CONSTRAINT uk_frsrpt700s9v50bu18ws5ha6 UNIQUE (name, resource_server_id);


--
-- TOC entry 3881 (class 2606 OID 17994)
-- Name: resource_server_scope uk_frsrst700s9v50bu18ws5ha6; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resource_server_scope
    ADD CONSTRAINT uk_frsrst700s9v50bu18ws5ha6 UNIQUE (name, resource_server_id);


--
-- TOC entry 3805 (class 2606 OID 18322)
-- Name: user_consent uk_local_consent; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_consent
    ADD CONSTRAINT uk_local_consent UNIQUE (client_id, user_id);


--
-- TOC entry 3975 (class 2606 OID 18328)
-- Name: org uk_org_alias; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.org
    ADD CONSTRAINT uk_org_alias UNIQUE (realm_id, alias);


--
-- TOC entry 3977 (class 2606 OID 18313)
-- Name: org uk_org_group; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.org
    ADD CONSTRAINT uk_org_group UNIQUE (group_id);


--
-- TOC entry 3979 (class 2606 OID 18311)
-- Name: org uk_org_name; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.org
    ADD CONSTRAINT uk_org_name UNIQUE (realm_id, name);


--
-- TOC entry 3714 (class 2606 OID 16927)
-- Name: realm uk_orvsdmla56612eaefiq6wl5oi; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.realm
    ADD CONSTRAINT uk_orvsdmla56612eaefiq6wl5oi UNIQUE (name);


--
-- TOC entry 3746 (class 2606 OID 17919)
-- Name: user_entity uk_ru8tt6t700s9v50bu18ws5ha6; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_entity
    ADD CONSTRAINT uk_ru8tt6t700s9v50bu18ws5ha6 UNIQUE (realm_id, username);


--
-- TOC entry 3905 (class 1259 OID 18295)
-- Name: fed_user_attr_long_values; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX fed_user_attr_long_values ON public.fed_user_attribute USING btree (long_value_hash, name);


--
-- TOC entry 3906 (class 1259 OID 18297)
-- Name: fed_user_attr_long_values_lower_case; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX fed_user_attr_long_values_lower_case ON public.fed_user_attribute USING btree (long_value_hash_lower_case, name);


--
-- TOC entry 3808 (class 1259 OID 18271)
-- Name: idx_admin_event_time; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_admin_event_time ON public.admin_event_entity USING btree (realm_id, admin_event_time);


--
-- TOC entry 3900 (class 1259 OID 17943)
-- Name: idx_assoc_pol_assoc_pol_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_assoc_pol_assoc_pol_id ON public.associated_policy USING btree (associated_policy_id);


--
-- TOC entry 3811 (class 1259 OID 17947)
-- Name: idx_auth_config_realm; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_auth_config_realm ON public.authenticator_config USING btree (realm_id);


--
-- TOC entry 3817 (class 1259 OID 17945)
-- Name: idx_auth_exec_flow; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_auth_exec_flow ON public.authentication_execution USING btree (flow_id);


--
-- TOC entry 3818 (class 1259 OID 17944)
-- Name: idx_auth_exec_realm_flow; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_auth_exec_realm_flow ON public.authentication_execution USING btree (realm_id, flow_id);


--
-- TOC entry 3814 (class 1259 OID 17946)
-- Name: idx_auth_flow_realm; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_auth_flow_realm ON public.authentication_flow USING btree (realm_id);


--
-- TOC entry 3945 (class 1259 OID 18262)
-- Name: idx_cl_clscope; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_cl_clscope ON public.client_scope_client USING btree (scope_id);


--
-- TOC entry 3763 (class 1259 OID 18298)
-- Name: idx_client_att_by_name_value; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_client_att_by_name_value ON public.client_attributes USING btree (name, substr(value, 1, 255));


--
-- TOC entry 3691 (class 1259 OID 18247)
-- Name: idx_client_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_client_id ON public.client USING btree (client_id);


--
-- TOC entry 3940 (class 1259 OID 17987)
-- Name: idx_client_init_acc_realm; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_client_init_acc_realm ON public.client_initial_access USING btree (realm_id);


--
-- TOC entry 3863 (class 1259 OID 18150)
-- Name: idx_clscope_attrs; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_clscope_attrs ON public.client_scope_attributes USING btree (scope_id);


--
-- TOC entry 3946 (class 1259 OID 18259)
-- Name: idx_clscope_cl; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_clscope_cl ON public.client_scope_client USING btree (client_id);


--
-- TOC entry 3768 (class 1259 OID 18147)
-- Name: idx_clscope_protmap; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_clscope_protmap ON public.protocol_mapper USING btree (client_scope_id);


--
-- TOC entry 3866 (class 1259 OID 18148)
-- Name: idx_clscope_role; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_clscope_role ON public.client_scope_role_mapping USING btree (scope_id);


--
-- TOC entry 3931 (class 1259 OID 17953)
-- Name: idx_compo_config_compo; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_compo_config_compo ON public.component_config USING btree (component_id);


--
-- TOC entry 3934 (class 1259 OID 18221)
-- Name: idx_component_provider_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_component_provider_type ON public.component USING btree (provider_type);


--
-- TOC entry 3935 (class 1259 OID 17952)
-- Name: idx_component_realm; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_component_realm ON public.component USING btree (realm_id);


--
-- TOC entry 3696 (class 1259 OID 17954)
-- Name: idx_composite; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_composite ON public.composite_role USING btree (composite);


--
-- TOC entry 3697 (class 1259 OID 17955)
-- Name: idx_composite_child; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_composite_child ON public.composite_role USING btree (child_role);


--
-- TOC entry 3947 (class 1259 OID 18153)
-- Name: idx_defcls_realm; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_defcls_realm ON public.default_client_scope USING btree (realm_id);


--
-- TOC entry 3948 (class 1259 OID 18154)
-- Name: idx_defcls_scope; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_defcls_scope ON public.default_client_scope USING btree (scope_id);


--
-- TOC entry 3703 (class 1259 OID 18248)
-- Name: idx_event_time; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_event_time ON public.event_entity USING btree (realm_id, event_time);


--
-- TOC entry 3774 (class 1259 OID 17686)
-- Name: idx_fedidentity_feduser; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_fedidentity_feduser ON public.federated_identity USING btree (federated_user_id);


--
-- TOC entry 3775 (class 1259 OID 17685)
-- Name: idx_fedidentity_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_fedidentity_user ON public.federated_identity USING btree (user_id);


--
-- TOC entry 3907 (class 1259 OID 18047)
-- Name: idx_fu_attribute; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_fu_attribute ON public.fed_user_attribute USING btree (user_id, realm_id, name);


--
-- TOC entry 3910 (class 1259 OID 18067)
-- Name: idx_fu_cnsnt_ext; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_fu_cnsnt_ext ON public.fed_user_consent USING btree (user_id, client_storage_provider, external_client_id);


--
-- TOC entry 3911 (class 1259 OID 18230)
-- Name: idx_fu_consent; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_fu_consent ON public.fed_user_consent USING btree (user_id, client_id);


--
-- TOC entry 3912 (class 1259 OID 18049)
-- Name: idx_fu_consent_ru; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_fu_consent_ru ON public.fed_user_consent USING btree (realm_id, user_id);


--
-- TOC entry 3915 (class 1259 OID 18050)
-- Name: idx_fu_credential; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_fu_credential ON public.fed_user_credential USING btree (user_id, type);


--
-- TOC entry 3916 (class 1259 OID 18051)
-- Name: idx_fu_credential_ru; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_fu_credential_ru ON public.fed_user_credential USING btree (realm_id, user_id);


--
-- TOC entry 3919 (class 1259 OID 18052)
-- Name: idx_fu_group_membership; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_fu_group_membership ON public.fed_user_group_membership USING btree (user_id, group_id);


--
-- TOC entry 3920 (class 1259 OID 18053)
-- Name: idx_fu_group_membership_ru; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_fu_group_membership_ru ON public.fed_user_group_membership USING btree (realm_id, user_id);


--
-- TOC entry 3923 (class 1259 OID 18054)
-- Name: idx_fu_required_action; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_fu_required_action ON public.fed_user_required_action USING btree (user_id, required_action);


--
-- TOC entry 3924 (class 1259 OID 18055)
-- Name: idx_fu_required_action_ru; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_fu_required_action_ru ON public.fed_user_required_action USING btree (realm_id, user_id);


--
-- TOC entry 3927 (class 1259 OID 18056)
-- Name: idx_fu_role_mapping; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_fu_role_mapping ON public.fed_user_role_mapping USING btree (user_id, role_id);


--
-- TOC entry 3928 (class 1259 OID 18057)
-- Name: idx_fu_role_mapping_ru; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_fu_role_mapping_ru ON public.fed_user_role_mapping USING btree (realm_id, user_id);


--
-- TOC entry 3848 (class 1259 OID 18273)
-- Name: idx_group_att_by_name_value; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_group_att_by_name_value ON public.group_attribute USING btree (name, ((value)::character varying(250)));


--
-- TOC entry 3849 (class 1259 OID 17958)
-- Name: idx_group_attr_group; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_group_attr_group ON public.group_attribute USING btree (group_id);


--
-- TOC entry 3845 (class 1259 OID 17959)
-- Name: idx_group_role_mapp_group; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_group_role_mapp_group ON public.group_role_mapping USING btree (group_id);


--
-- TOC entry 3796 (class 1259 OID 17961)
-- Name: idx_id_prov_mapp_realm; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_id_prov_mapp_realm ON public.identity_provider_mapper USING btree (realm_id);


--
-- TOC entry 3778 (class 1259 OID 17960)
-- Name: idx_ident_prov_realm; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ident_prov_realm ON public.identity_provider USING btree (realm_id);


--
-- TOC entry 3779 (class 1259 OID 18339)
-- Name: idx_idp_for_login; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_idp_for_login ON public.identity_provider USING btree (realm_id, enabled, link_only, hide_on_login, organization_id);


--
-- TOC entry 3780 (class 1259 OID 18338)
-- Name: idx_idp_realm_org; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_idp_realm_org ON public.identity_provider USING btree (realm_id, organization_id);


--
-- TOC entry 3708 (class 1259 OID 17962)
-- Name: idx_keycloak_role_client; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_keycloak_role_client ON public.keycloak_role USING btree (client);


--
-- TOC entry 3709 (class 1259 OID 17963)
-- Name: idx_keycloak_role_realm; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_keycloak_role_realm ON public.keycloak_role USING btree (realm);


--
-- TOC entry 3834 (class 1259 OID 18302)
-- Name: idx_offline_uss_by_broker_session_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_offline_uss_by_broker_session_id ON public.offline_user_session USING btree (broker_session_id, realm_id);


--
-- TOC entry 3835 (class 1259 OID 18301)
-- Name: idx_offline_uss_by_last_session_refresh; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_offline_uss_by_last_session_refresh ON public.offline_user_session USING btree (realm_id, offline_flag, last_session_refresh);


--
-- TOC entry 3836 (class 1259 OID 18266)
-- Name: idx_offline_uss_by_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_offline_uss_by_user ON public.offline_user_session USING btree (user_id, realm_id, offline_flag);


--
-- TOC entry 3982 (class 1259 OID 18330)
-- Name: idx_org_domain_org_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_org_domain_org_id ON public.org_domain USING btree (org_id);


--
-- TOC entry 3959 (class 1259 OID 18326)
-- Name: idx_perm_ticket_owner; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_perm_ticket_owner ON public.resource_server_perm_ticket USING btree (owner);


--
-- TOC entry 3960 (class 1259 OID 18325)
-- Name: idx_perm_ticket_requester; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_perm_ticket_requester ON public.resource_server_perm_ticket USING btree (requester);


--
-- TOC entry 3769 (class 1259 OID 17964)
-- Name: idx_protocol_mapper_client; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_protocol_mapper_client ON public.protocol_mapper USING btree (client_id);


--
-- TOC entry 3717 (class 1259 OID 17967)
-- Name: idx_realm_attr_realm; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_realm_attr_realm ON public.realm_attribute USING btree (realm_id);


--
-- TOC entry 3858 (class 1259 OID 18146)
-- Name: idx_realm_clscope; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_realm_clscope ON public.client_scope USING btree (realm_id);


--
-- TOC entry 3857 (class 1259 OID 17968)
-- Name: idx_realm_def_grp_realm; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_realm_def_grp_realm ON public.realm_default_groups USING btree (realm_id);


--
-- TOC entry 3720 (class 1259 OID 17971)
-- Name: idx_realm_evt_list_realm; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_realm_evt_list_realm ON public.realm_events_listeners USING btree (realm_id);


--
-- TOC entry 3790 (class 1259 OID 17970)
-- Name: idx_realm_evt_types_realm; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_realm_evt_types_realm ON public.realm_enabled_event_types USING btree (realm_id);


--
-- TOC entry 3712 (class 1259 OID 17966)
-- Name: idx_realm_master_adm_cli; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_realm_master_adm_cli ON public.realm USING btree (master_admin_client);


--
-- TOC entry 3787 (class 1259 OID 17972)
-- Name: idx_realm_supp_local_realm; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_realm_supp_local_realm ON public.realm_supported_locales USING btree (realm_id);


--
-- TOC entry 3727 (class 1259 OID 17973)
-- Name: idx_redir_uri_client; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_redir_uri_client ON public.redirect_uris USING btree (client_id);


--
-- TOC entry 3829 (class 1259 OID 17974)
-- Name: idx_req_act_prov_realm; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_req_act_prov_realm ON public.required_action_provider USING btree (realm_id);


--
-- TOC entry 3894 (class 1259 OID 17975)
-- Name: idx_res_policy_policy; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_res_policy_policy ON public.resource_policy USING btree (policy_id);


--
-- TOC entry 3891 (class 1259 OID 17976)
-- Name: idx_res_scope_scope; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_res_scope_scope ON public.resource_scope USING btree (scope_id);


--
-- TOC entry 3884 (class 1259 OID 17995)
-- Name: idx_res_serv_pol_res_serv; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_res_serv_pol_res_serv ON public.resource_server_policy USING btree (resource_server_id);


--
-- TOC entry 3874 (class 1259 OID 17996)
-- Name: idx_res_srv_res_res_srv; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_res_srv_res_res_srv ON public.resource_server_resource USING btree (resource_server_id);


--
-- TOC entry 3879 (class 1259 OID 17997)
-- Name: idx_res_srv_scope_res_srv; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_res_srv_scope_res_srv ON public.resource_server_scope USING btree (resource_server_id);


--
-- TOC entry 3985 (class 1259 OID 18336)
-- Name: idx_rev_token_on_expire; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_rev_token_on_expire ON public.revoked_token USING btree (expire);


--
-- TOC entry 3969 (class 1259 OID 18220)
-- Name: idx_role_attribute; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_role_attribute ON public.role_attribute USING btree (role_id);


--
-- TOC entry 3867 (class 1259 OID 18149)
-- Name: idx_role_clscope; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_role_clscope ON public.client_scope_role_mapping USING btree (role_id);


--
-- TOC entry 3730 (class 1259 OID 17980)
-- Name: idx_scope_mapping_role; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_scope_mapping_role ON public.scope_mapping USING btree (role_id);


--
-- TOC entry 3897 (class 1259 OID 17981)
-- Name: idx_scope_policy_policy; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_scope_policy_policy ON public.scope_policy USING btree (policy_id);


--
-- TOC entry 3793 (class 1259 OID 18228)
-- Name: idx_update_time; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_update_time ON public.migration_model USING btree (update_time);


--
-- TOC entry 3953 (class 1259 OID 18155)
-- Name: idx_usconsent_clscope; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_usconsent_clscope ON public.user_consent_client_scope USING btree (user_consent_id);


--
-- TOC entry 3954 (class 1259 OID 18272)
-- Name: idx_usconsent_scope_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_usconsent_scope_id ON public.user_consent_client_scope USING btree (scope_id);


--
-- TOC entry 3735 (class 1259 OID 17682)
-- Name: idx_user_attribute; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_attribute ON public.user_attribute USING btree (user_id);


--
-- TOC entry 3736 (class 1259 OID 18269)
-- Name: idx_user_attribute_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_attribute_name ON public.user_attribute USING btree (name, value);


--
-- TOC entry 3801 (class 1259 OID 17679)
-- Name: idx_user_consent; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_consent ON public.user_consent USING btree (user_id);


--
-- TOC entry 3700 (class 1259 OID 17683)
-- Name: idx_user_credential; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_credential ON public.credential USING btree (user_id);


--
-- TOC entry 3741 (class 1259 OID 17676)
-- Name: idx_user_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_email ON public.user_entity USING btree (email);


--
-- TOC entry 3852 (class 1259 OID 17678)
-- Name: idx_user_group_mapping; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_group_mapping ON public.user_group_membership USING btree (user_id);


--
-- TOC entry 3754 (class 1259 OID 17684)
-- Name: idx_user_reqactions; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_reqactions ON public.user_required_action USING btree (user_id);


--
-- TOC entry 3757 (class 1259 OID 17677)
-- Name: idx_user_role_mapping; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_role_mapping ON public.user_role_mapping USING btree (user_id);


--
-- TOC entry 3742 (class 1259 OID 18270)
-- Name: idx_user_service_account; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_service_account ON public.user_entity USING btree (realm_id, service_account_client_link);


--
-- TOC entry 3823 (class 1259 OID 17983)
-- Name: idx_usr_fed_map_fed_prv; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_usr_fed_map_fed_prv ON public.user_federation_mapper USING btree (federation_provider_id);


--
-- TOC entry 3824 (class 1259 OID 17984)
-- Name: idx_usr_fed_map_realm; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_usr_fed_map_realm ON public.user_federation_mapper USING btree (realm_id);


--
-- TOC entry 3751 (class 1259 OID 17985)
-- Name: idx_usr_fed_prv_realm; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_usr_fed_prv_realm ON public.user_federation_provider USING btree (realm_id);


--
-- TOC entry 3760 (class 1259 OID 17986)
-- Name: idx_web_orig_client; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_web_orig_client ON public.web_origins USING btree (client_id);


--
-- TOC entry 3737 (class 1259 OID 18294)
-- Name: user_attr_long_values; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX user_attr_long_values ON public.user_attribute USING btree (long_value_hash, name);


--
-- TOC entry 3738 (class 1259 OID 18296)
-- Name: user_attr_long_values_lower_case; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX user_attr_long_values_lower_case ON public.user_attribute USING btree (long_value_hash_lower_case, name);


--
-- TOC entry 4008 (class 2606 OID 17180)
-- Name: identity_provider fk2b4ebc52ae5c3b34; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.identity_provider
    ADD CONSTRAINT fk2b4ebc52ae5c3b34 FOREIGN KEY (realm_id) REFERENCES public.realm(id);


--
-- TOC entry 4002 (class 2606 OID 17110)
-- Name: client_attributes fk3c47c64beacca966; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.client_attributes
    ADD CONSTRAINT fk3c47c64beacca966 FOREIGN KEY (client_id) REFERENCES public.client(id);


--
-- TOC entry 4007 (class 2606 OID 17190)
-- Name: federated_identity fk404288b92ef007a6; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.federated_identity
    ADD CONSTRAINT fk404288b92ef007a6 FOREIGN KEY (user_id) REFERENCES public.user_entity(id);


--
-- TOC entry 4003 (class 2606 OID 17337)
-- Name: client_node_registrations fk4129723ba992f594; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.client_node_registrations
    ADD CONSTRAINT fk4129723ba992f594 FOREIGN KEY (client_id) REFERENCES public.client(id);


--
-- TOC entry 3994 (class 2606 OID 16935)
-- Name: redirect_uris fk_1burs8pb4ouj97h5wuppahv9f; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.redirect_uris
    ADD CONSTRAINT fk_1burs8pb4ouj97h5wuppahv9f FOREIGN KEY (client_id) REFERENCES public.client(id);


--
-- TOC entry 3998 (class 2606 OID 16940)
-- Name: user_federation_provider fk_1fj32f6ptolw2qy60cd8n01e8; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_federation_provider
    ADD CONSTRAINT fk_1fj32f6ptolw2qy60cd8n01e8 FOREIGN KEY (realm_id) REFERENCES public.realm(id);


--
-- TOC entry 3992 (class 2606 OID 16950)
-- Name: realm_required_credential fk_5hg65lybevavkqfki3kponh9v; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.realm_required_credential
    ADD CONSTRAINT fk_5hg65lybevavkqfki3kponh9v FOREIGN KEY (realm_id) REFERENCES public.realm(id);


--
-- TOC entry 4050 (class 2606 OID 18188)
-- Name: resource_attribute fk_5hrm2vlf9ql5fu022kqepovbr; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resource_attribute
    ADD CONSTRAINT fk_5hrm2vlf9ql5fu022kqepovbr FOREIGN KEY (resource_id) REFERENCES public.resource_server_resource(id);


--
-- TOC entry 3996 (class 2606 OID 16955)
-- Name: user_attribute fk_5hrm2vlf9ql5fu043kqepovbr; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_attribute
    ADD CONSTRAINT fk_5hrm2vlf9ql5fu043kqepovbr FOREIGN KEY (user_id) REFERENCES public.user_entity(id);


--
-- TOC entry 3999 (class 2606 OID 16965)
-- Name: user_required_action fk_6qj3w1jw9cvafhe19bwsiuvmd; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_required_action
    ADD CONSTRAINT fk_6qj3w1jw9cvafhe19bwsiuvmd FOREIGN KEY (user_id) REFERENCES public.user_entity(id);


--
-- TOC entry 3989 (class 2606 OID 16970)
-- Name: keycloak_role fk_6vyqfe4cn4wlq8r6kt5vdsj5c; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.keycloak_role
    ADD CONSTRAINT fk_6vyqfe4cn4wlq8r6kt5vdsj5c FOREIGN KEY (realm) REFERENCES public.realm(id);


--
-- TOC entry 3993 (class 2606 OID 16975)
-- Name: realm_smtp_config fk_70ej8xdxgxd0b9hh6180irr0o; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.realm_smtp_config
    ADD CONSTRAINT fk_70ej8xdxgxd0b9hh6180irr0o FOREIGN KEY (realm_id) REFERENCES public.realm(id);


--
-- TOC entry 3990 (class 2606 OID 16990)
-- Name: realm_attribute fk_8shxd6l3e9atqukacxgpffptw; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.realm_attribute
    ADD CONSTRAINT fk_8shxd6l3e9atqukacxgpffptw FOREIGN KEY (realm_id) REFERENCES public.realm(id);


--
-- TOC entry 3986 (class 2606 OID 16995)
-- Name: composite_role fk_a63wvekftu8jo1pnj81e7mce2; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.composite_role
    ADD CONSTRAINT fk_a63wvekftu8jo1pnj81e7mce2 FOREIGN KEY (composite) REFERENCES public.keycloak_role(id);


--
-- TOC entry 4017 (class 2606 OID 17431)
-- Name: authentication_execution fk_auth_exec_flow; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.authentication_execution
    ADD CONSTRAINT fk_auth_exec_flow FOREIGN KEY (flow_id) REFERENCES public.authentication_flow(id);


--
-- TOC entry 4018 (class 2606 OID 17426)
-- Name: authentication_execution fk_auth_exec_realm; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.authentication_execution
    ADD CONSTRAINT fk_auth_exec_realm FOREIGN KEY (realm_id) REFERENCES public.realm(id);


--
-- TOC entry 4016 (class 2606 OID 17421)
-- Name: authentication_flow fk_auth_flow_realm; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.authentication_flow
    ADD CONSTRAINT fk_auth_flow_realm FOREIGN KEY (realm_id) REFERENCES public.realm(id);


--
-- TOC entry 4015 (class 2606 OID 17416)
-- Name: authenticator_config fk_auth_realm; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.authenticator_config
    ADD CONSTRAINT fk_auth_realm FOREIGN KEY (realm_id) REFERENCES public.realm(id);


--
-- TOC entry 4000 (class 2606 OID 17005)
-- Name: user_role_mapping fk_c4fqv34p1mbylloxang7b1q3l; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_role_mapping
    ADD CONSTRAINT fk_c4fqv34p1mbylloxang7b1q3l FOREIGN KEY (user_id) REFERENCES public.user_entity(id);


--
-- TOC entry 4027 (class 2606 OID 18094)
-- Name: client_scope_attributes fk_cl_scope_attr_scope; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.client_scope_attributes
    ADD CONSTRAINT fk_cl_scope_attr_scope FOREIGN KEY (scope_id) REFERENCES public.client_scope(id);


--
-- TOC entry 4028 (class 2606 OID 18084)
-- Name: client_scope_role_mapping fk_cl_scope_rm_scope; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.client_scope_role_mapping
    ADD CONSTRAINT fk_cl_scope_rm_scope FOREIGN KEY (scope_id) REFERENCES public.client_scope(id);


--
-- TOC entry 4004 (class 2606 OID 18079)
-- Name: protocol_mapper fk_cli_scope_mapper; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.protocol_mapper
    ADD CONSTRAINT fk_cli_scope_mapper FOREIGN KEY (client_scope_id) REFERENCES public.client_scope(id);


--
-- TOC entry 4043 (class 2606 OID 17938)
-- Name: client_initial_access fk_client_init_acc_realm; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.client_initial_access
    ADD CONSTRAINT fk_client_init_acc_realm FOREIGN KEY (realm_id) REFERENCES public.realm(id);


--
-- TOC entry 4041 (class 2606 OID 17886)
-- Name: component_config fk_component_config; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.component_config
    ADD CONSTRAINT fk_component_config FOREIGN KEY (component_id) REFERENCES public.component(id);


--
-- TOC entry 4042 (class 2606 OID 17881)
-- Name: component fk_component_realm; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.component
    ADD CONSTRAINT fk_component_realm FOREIGN KEY (realm_id) REFERENCES public.realm(id);


--
-- TOC entry 4026 (class 2606 OID 17586)
-- Name: realm_default_groups fk_def_groups_realm; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.realm_default_groups
    ADD CONSTRAINT fk_def_groups_realm FOREIGN KEY (realm_id) REFERENCES public.realm(id);


--
-- TOC entry 4021 (class 2606 OID 17446)
-- Name: user_federation_mapper_config fk_fedmapper_cfg; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_federation_mapper_config
    ADD CONSTRAINT fk_fedmapper_cfg FOREIGN KEY (user_federation_mapper_id) REFERENCES public.user_federation_mapper(id);


--
-- TOC entry 4019 (class 2606 OID 17441)
-- Name: user_federation_mapper fk_fedmapperpm_fedprv; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_federation_mapper
    ADD CONSTRAINT fk_fedmapperpm_fedprv FOREIGN KEY (federation_provider_id) REFERENCES public.user_federation_provider(id);


--
-- TOC entry 4020 (class 2606 OID 17436)
-- Name: user_federation_mapper fk_fedmapperpm_realm; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_federation_mapper
    ADD CONSTRAINT fk_fedmapperpm_realm FOREIGN KEY (realm_id) REFERENCES public.realm(id);


--
-- TOC entry 4039 (class 2606 OID 17804)
-- Name: associated_policy fk_frsr5s213xcx4wnkog82ssrfy; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.associated_policy
    ADD CONSTRAINT fk_frsr5s213xcx4wnkog82ssrfy FOREIGN KEY (associated_policy_id) REFERENCES public.resource_server_policy(id);


--
-- TOC entry 4037 (class 2606 OID 17789)
-- Name: scope_policy fk_frsrasp13xcx4wnkog82ssrfy; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.scope_policy
    ADD CONSTRAINT fk_frsrasp13xcx4wnkog82ssrfy FOREIGN KEY (policy_id) REFERENCES public.resource_server_policy(id);


--
-- TOC entry 4046 (class 2606 OID 18161)
-- Name: resource_server_perm_ticket fk_frsrho213xcx4wnkog82sspmt; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resource_server_perm_ticket
    ADD CONSTRAINT fk_frsrho213xcx4wnkog82sspmt FOREIGN KEY (resource_server_id) REFERENCES public.resource_server(id);


--
-- TOC entry 4029 (class 2606 OID 18005)
-- Name: resource_server_resource fk_frsrho213xcx4wnkog82ssrfy; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resource_server_resource
    ADD CONSTRAINT fk_frsrho213xcx4wnkog82ssrfy FOREIGN KEY (resource_server_id) REFERENCES public.resource_server(id);


--
-- TOC entry 4047 (class 2606 OID 18166)
-- Name: resource_server_perm_ticket fk_frsrho213xcx4wnkog83sspmt; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resource_server_perm_ticket
    ADD CONSTRAINT fk_frsrho213xcx4wnkog83sspmt FOREIGN KEY (resource_id) REFERENCES public.resource_server_resource(id);


--
-- TOC entry 4048 (class 2606 OID 18171)
-- Name: resource_server_perm_ticket fk_frsrho213xcx4wnkog84sspmt; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resource_server_perm_ticket
    ADD CONSTRAINT fk_frsrho213xcx4wnkog84sspmt FOREIGN KEY (scope_id) REFERENCES public.resource_server_scope(id);


--
-- TOC entry 4040 (class 2606 OID 17799)
-- Name: associated_policy fk_frsrpas14xcx4wnkog82ssrfy; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.associated_policy
    ADD CONSTRAINT fk_frsrpas14xcx4wnkog82ssrfy FOREIGN KEY (policy_id) REFERENCES public.resource_server_policy(id);


--
-- TOC entry 4038 (class 2606 OID 17784)
-- Name: scope_policy fk_frsrpass3xcx4wnkog82ssrfy; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.scope_policy
    ADD CONSTRAINT fk_frsrpass3xcx4wnkog82ssrfy FOREIGN KEY (scope_id) REFERENCES public.resource_server_scope(id);


--
-- TOC entry 4049 (class 2606 OID 18193)
-- Name: resource_server_perm_ticket fk_frsrpo2128cx4wnkog82ssrfy; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resource_server_perm_ticket
    ADD CONSTRAINT fk_frsrpo2128cx4wnkog82ssrfy FOREIGN KEY (policy_id) REFERENCES public.resource_server_policy(id);


--
-- TOC entry 4031 (class 2606 OID 18000)
-- Name: resource_server_policy fk_frsrpo213xcx4wnkog82ssrfy; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resource_server_policy
    ADD CONSTRAINT fk_frsrpo213xcx4wnkog82ssrfy FOREIGN KEY (resource_server_id) REFERENCES public.resource_server(id);


--
-- TOC entry 4033 (class 2606 OID 17754)
-- Name: resource_scope fk_frsrpos13xcx4wnkog82ssrfy; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resource_scope
    ADD CONSTRAINT fk_frsrpos13xcx4wnkog82ssrfy FOREIGN KEY (resource_id) REFERENCES public.resource_server_resource(id);


--
-- TOC entry 4035 (class 2606 OID 17769)
-- Name: resource_policy fk_frsrpos53xcx4wnkog82ssrfy; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resource_policy
    ADD CONSTRAINT fk_frsrpos53xcx4wnkog82ssrfy FOREIGN KEY (resource_id) REFERENCES public.resource_server_resource(id);


--
-- TOC entry 4036 (class 2606 OID 17774)
-- Name: resource_policy fk_frsrpp213xcx4wnkog82ssrfy; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resource_policy
    ADD CONSTRAINT fk_frsrpp213xcx4wnkog82ssrfy FOREIGN KEY (policy_id) REFERENCES public.resource_server_policy(id);


--
-- TOC entry 4034 (class 2606 OID 17759)
-- Name: resource_scope fk_frsrps213xcx4wnkog82ssrfy; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resource_scope
    ADD CONSTRAINT fk_frsrps213xcx4wnkog82ssrfy FOREIGN KEY (scope_id) REFERENCES public.resource_server_scope(id);


--
-- TOC entry 4030 (class 2606 OID 18010)
-- Name: resource_server_scope fk_frsrso213xcx4wnkog82ssrfy; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resource_server_scope
    ADD CONSTRAINT fk_frsrso213xcx4wnkog82ssrfy FOREIGN KEY (resource_server_id) REFERENCES public.resource_server(id);


--
-- TOC entry 3987 (class 2606 OID 17020)
-- Name: composite_role fk_gr7thllb9lu8q4vqa4524jjy8; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.composite_role
    ADD CONSTRAINT fk_gr7thllb9lu8q4vqa4524jjy8 FOREIGN KEY (child_role) REFERENCES public.keycloak_role(id);


--
-- TOC entry 4045 (class 2606 OID 18136)
-- Name: user_consent_client_scope fk_grntcsnt_clsc_usc; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_consent_client_scope
    ADD CONSTRAINT fk_grntcsnt_clsc_usc FOREIGN KEY (user_consent_id) REFERENCES public.user_consent(id);


--
-- TOC entry 4014 (class 2606 OID 17300)
-- Name: user_consent fk_grntcsnt_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_consent
    ADD CONSTRAINT fk_grntcsnt_user FOREIGN KEY (user_id) REFERENCES public.user_entity(id);


--
-- TOC entry 4024 (class 2606 OID 17560)
-- Name: group_attribute fk_group_attribute_group; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.group_attribute
    ADD CONSTRAINT fk_group_attribute_group FOREIGN KEY (group_id) REFERENCES public.keycloak_group(id);


--
-- TOC entry 4023 (class 2606 OID 17574)
-- Name: group_role_mapping fk_group_role_group; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.group_role_mapping
    ADD CONSTRAINT fk_group_role_group FOREIGN KEY (group_id) REFERENCES public.keycloak_group(id);


--
-- TOC entry 4011 (class 2606 OID 17246)
-- Name: realm_enabled_event_types fk_h846o4h0w8epx5nwedrf5y69j; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.realm_enabled_event_types
    ADD CONSTRAINT fk_h846o4h0w8epx5nwedrf5y69j FOREIGN KEY (realm_id) REFERENCES public.realm(id);


--
-- TOC entry 3991 (class 2606 OID 17030)
-- Name: realm_events_listeners fk_h846o4h0w8epx5nxev9f5y69j; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.realm_events_listeners
    ADD CONSTRAINT fk_h846o4h0w8epx5nxev9f5y69j FOREIGN KEY (realm_id) REFERENCES public.realm(id);


--
-- TOC entry 4012 (class 2606 OID 17290)
-- Name: identity_provider_mapper fk_idpm_realm; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.identity_provider_mapper
    ADD CONSTRAINT fk_idpm_realm FOREIGN KEY (realm_id) REFERENCES public.realm(id);


--
-- TOC entry 4013 (class 2606 OID 17460)
-- Name: idp_mapper_config fk_idpmconfig; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.idp_mapper_config
    ADD CONSTRAINT fk_idpmconfig FOREIGN KEY (idp_mapper_id) REFERENCES public.identity_provider_mapper(id);


--
-- TOC entry 4001 (class 2606 OID 17040)
-- Name: web_origins fk_lojpho213xcx4wnkog82ssrfy; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.web_origins
    ADD CONSTRAINT fk_lojpho213xcx4wnkog82ssrfy FOREIGN KEY (client_id) REFERENCES public.client(id);


--
-- TOC entry 3995 (class 2606 OID 17050)
-- Name: scope_mapping fk_ouse064plmlr732lxjcn1q5f1; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.scope_mapping
    ADD CONSTRAINT fk_ouse064plmlr732lxjcn1q5f1 FOREIGN KEY (client_id) REFERENCES public.client(id);


--
-- TOC entry 4005 (class 2606 OID 17185)
-- Name: protocol_mapper fk_pcm_realm; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.protocol_mapper
    ADD CONSTRAINT fk_pcm_realm FOREIGN KEY (client_id) REFERENCES public.client(id);


--
-- TOC entry 3988 (class 2606 OID 17065)
-- Name: credential fk_pfyr0glasqyl0dei3kl69r6v0; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.credential
    ADD CONSTRAINT fk_pfyr0glasqyl0dei3kl69r6v0 FOREIGN KEY (user_id) REFERENCES public.user_entity(id);


--
-- TOC entry 4006 (class 2606 OID 17453)
-- Name: protocol_mapper_config fk_pmconfig; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.protocol_mapper_config
    ADD CONSTRAINT fk_pmconfig FOREIGN KEY (protocol_mapper_id) REFERENCES public.protocol_mapper(id);


--
-- TOC entry 4044 (class 2606 OID 18121)
-- Name: default_client_scope fk_r_def_cli_scope_realm; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.default_client_scope
    ADD CONSTRAINT fk_r_def_cli_scope_realm FOREIGN KEY (realm_id) REFERENCES public.realm(id);


--
-- TOC entry 4022 (class 2606 OID 17495)
-- Name: required_action_provider fk_req_act_realm; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.required_action_provider
    ADD CONSTRAINT fk_req_act_realm FOREIGN KEY (realm_id) REFERENCES public.realm(id);


--
-- TOC entry 4051 (class 2606 OID 18201)
-- Name: resource_uris fk_resource_server_uris; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resource_uris
    ADD CONSTRAINT fk_resource_server_uris FOREIGN KEY (resource_id) REFERENCES public.resource_server_resource(id);


--
-- TOC entry 4052 (class 2606 OID 18215)
-- Name: role_attribute fk_role_attribute_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_attribute
    ADD CONSTRAINT fk_role_attribute_id FOREIGN KEY (role_id) REFERENCES public.keycloak_role(id);


--
-- TOC entry 4010 (class 2606 OID 17215)
-- Name: realm_supported_locales fk_supported_locales_realm; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.realm_supported_locales
    ADD CONSTRAINT fk_supported_locales_realm FOREIGN KEY (realm_id) REFERENCES public.realm(id);


--
-- TOC entry 3997 (class 2606 OID 17085)
-- Name: user_federation_config fk_t13hpu1j94r2ebpekr39x5eu5; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_federation_config
    ADD CONSTRAINT fk_t13hpu1j94r2ebpekr39x5eu5 FOREIGN KEY (user_federation_provider_id) REFERENCES public.user_federation_provider(id);


--
-- TOC entry 4025 (class 2606 OID 17567)
-- Name: user_group_membership fk_user_group_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_group_membership
    ADD CONSTRAINT fk_user_group_user FOREIGN KEY (user_id) REFERENCES public.user_entity(id);


--
-- TOC entry 4032 (class 2606 OID 17744)
-- Name: policy_config fkdc34197cf864c4e43; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.policy_config
    ADD CONSTRAINT fkdc34197cf864c4e43 FOREIGN KEY (policy_id) REFERENCES public.resource_server_policy(id);


--
-- TOC entry 4009 (class 2606 OID 17195)
-- Name: identity_provider_config fkdc4897cf864c4e43; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.identity_provider_config
    ADD CONSTRAINT fkdc4897cf864c4e43 FOREIGN KEY (identity_provider_id) REFERENCES public.identity_provider(internal_id);


-- Completed on 2025-11-28 13:36:46

--
-- PostgreSQL database dump complete
--

\unrestrict 8o2dj2mo7CVqGkvSBdDDwjG1GVWTjUqPUFMcVaAC5uQo7hbteU4UfqK3Hls4eyq

