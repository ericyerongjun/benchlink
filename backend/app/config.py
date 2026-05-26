from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # DeepSeek
    deepseek_api_key: str
    deepseek_base_url: str = "https://api.deepseek.com/v1"
    deepseek_model: str = "deepseek-chat"

    # Database
    database_url: str = "sqlite+aiosqlite:///./benchlink.db"

    # App
    app_name: str = "Benchlink"
    app_version: str = "0.1.0"
    debug: bool = True
    log_level: str = "INFO"

    # CORS
    cors_origins: str = "http://localhost:5173,http://localhost:3000"

    # Agent
    agent_max_iterations: int = 10
    agent_context_window: int = 20

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


settings = Settings()
