using IdentityServer4.Models;

namespace IdentityServer.Config;

/// Конфигурация IdentityServer: клиенты, ресурсы API, скоупы и identity-ресурсы.
public static class IdentityServerConfig
{
    /// Конфигурация клиента
    public static IEnumerable<Client> GetClients() =>
        new List<Client>
        {
            new Client
            {
                ClientId = "atoystore-client", // Уникальный идентификатор клиента
                AllowedGrantTypes = GrantTypes.Code, // Authorization Code Flow (PKCE)
                RequireClientSecret = false, // Без client secret (для SPA)
                RequirePkce = true, // Требует PKCE (повышенная безопасность)

                // URI, куда будет перенаправлён пользователь после авторизации
                RedirectUris = { "http://localhost:3000/callback" },

                // Разрешённые CORS-источники
                AllowedCorsOrigins = { "http://localhost:3000" },

                // URI, куда пользователь попадает после выхода из аккаунта
                PostLogoutRedirectUris = { "http://localhost:3000" },

                // Разрешённые области (scopes)
                AllowedScopes = { "openid", "profile", "atoystore-api" },

                // Разрешить выдачу refresh-токена
                AllowOfflineAccess = true
            }
        };

    /// Области доступа (scopes) — используются клиентом для запроса разрешений.
    public static IEnumerable<ApiScope> GetApiScopes() =>
        new List<ApiScope>
        {
            new ApiScope("atoystore-api", "AToyStore API")
        };

    /// Ресурсы API, к которым можно получить доступ.
    public static IEnumerable<ApiResource> GetApiResources() =>
        new List<ApiResource>
        {
            new ApiResource("atoystore-api", "AToyStore API")
            {
                Scopes = { "atoystore-api" }
            }
        };

    /// Identity-ресурсы (openid и profile обязательны для аутентификации).
    public static IEnumerable<IdentityResource> GetIdentityResources() =>
        new List<IdentityResource>
        {
            new IdentityResources.OpenId(),   // Обязателен для OpenID Connect
            new IdentityResources.Profile()   // Включает имя, фамилию и т.д.
        };
}
