import logging
from typing import Optional
from app.config import settings
from app.services.llm.base import BaseLLMProvider
from app.services.llm.gemini_provider import GeminiProvider
from app.services.llm.anthropic_provider import AnthropicProvider
from app.services.llm.mock_provider import MockLLMProvider

logger = logging.getLogger(__name__)


def get_llm_provider(force_provider: Optional[str] = None) -> BaseLLMProvider:
    """
    Returns the appropriate LLM provider based on configuration and available API keys.
    Supports Google Gemini (via google-genai) and Anthropic Claude.
    Falls back gracefully to MockLLMProvider if no key is configured.
    """
    provider_name = (force_provider or settings.LLM_PROVIDER).lower()

    if provider_name == "gemini":
        if settings.GEMINI_API_KEY:
            logger.info(f"Using Google Gemini LLM provider ({settings.GEMINI_MODEL}).")
            return GeminiProvider()
        else:
            logger.warning(
                "GEMINI_API_KEY is not set. Falling back to MockLLMProvider. "
                "Set GEMINI_API_KEY in your .env file to enable live Gemini intelligence."
            )
            return MockLLMProvider()

    if provider_name == "anthropic":
        if settings.ANTHROPIC_API_KEY:
            logger.info(f"Using Anthropic Claude LLM provider ({settings.ANTHROPIC_MODEL}).")
            return AnthropicProvider()
        else:
            logger.warning(
                "ANTHROPIC_API_KEY is not set. Falling back to MockLLMProvider. "
                "Set ANTHROPIC_API_KEY in your .env file to enable live Claude intelligence."
            )
            return MockLLMProvider()

    if provider_name == "mock":
        return MockLLMProvider()

    # Default fallback
    return MockLLMProvider()
